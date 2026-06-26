import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TopUpWalletDto } from './dto/topup-wallet.dto';
import { SettingsService } from '../settings/settings.service';

function toMmkInt(value: number): number {
  if (!Number.isFinite(value)) {
    throw new BadRequestException('Invalid amount');
  }
  return Math.round(value);
}

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private settings: SettingsService,
  ) {}

  async getWallet(userId: number) {
    await this.settings.assertFeatureEnabled('walletEnabled');
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });
    if (!user) throw new BadRequestException('User not found');

    const transactions = await this.prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      balance: toMmkInt(Number(user.walletBalance)),
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: toMmkInt(Number(t.amount)),
        balanceBefore: toMmkInt(Number(t.balanceBefore)),
        balanceAfter: toMmkInt(Number(t.balanceAfter)),
        status: t.status,
        description: t.description,
        reference: t.reference,
        proofImageUrl: t.proofImageUrl,
        createdAt: t.createdAt.toISOString(),
      })),
    };
  }

  async requestTopUp(userId: number, dto: TopUpWalletDto) {
    await this.settings.assertFeatureEnabled('walletEnabled');
    await this.settings.assertFeatureEnabled('walletTopupEnabled');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const balance = toMmkInt(Number(user.walletBalance));
    const amount = toMmkInt(dto.amount);
    const txn = await this.prisma.walletTransaction.create({
      data: {
        userId,
        type: 'topup',
        amount,
        balanceBefore: balance,
        balanceAfter: balance,
        status: 'PENDING',
        description: `Top-up via ${dto.paymentMethod}`,
        reference: dto.reference ?? null,
        proofImageUrl: dto.proofImageUrl ?? null,
      },
    });

    return {
      id: txn.id,
      status: txn.status,
      amount: toMmkInt(Number(txn.amount)),
      message: 'Top-up request submitted. Awaiting payment verification.',
    };
  }

  async spend(userId: number, amount: number, description: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const balance = Number(user.walletBalance);
    if (balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const newBalance = balance - amount;

    const [updatedUser, txn] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { walletBalance: newBalance },
      }),
      this.prisma.walletTransaction.create({
        data: {
          userId,
          type: 'spend',
          amount,
          balanceBefore: balance,
          balanceAfter: newBalance,
          status: 'COMPLETED',
          description,
        },
      }),
    ]);

    return {
      balance: Number(updatedUser.walletBalance),
      transactionId: txn.id,
    };
  }
}
