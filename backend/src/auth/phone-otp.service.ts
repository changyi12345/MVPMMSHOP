import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { createHash, randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../sms/sms.service';
import { SettingsService } from '../settings/settings.service';

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

@Injectable()
export class PhoneOtpService {
  constructor(
    private prisma: PrismaService,
    private sms: SmsService,
    private settings: SettingsService,
  ) {}

  async sendOtp(phoneRaw: string, userId?: number) {
    await this.settings.assertFeatureEnabled('smsOtpEnabled');

    const phone = this.sms.normalizePhone(phoneRaw);
    if (phone.length < 10) {
      throw new BadRequestException('Enter a valid phone number');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { phone } });
    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Phone number already in use');
    }

    const recent = await this.prisma.phoneOtp.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    });
    if (recent && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_MS) {
      throw new HttpException('Please wait before requesting another code', HttpStatus.TOO_MANY_REQUESTS);
    }

    await this.prisma.phoneOtp.deleteMany({ where: { phone } });

    const code = String(randomInt(100000, 999999));
    const codeHash = createHash('sha256').update(code).digest('hex');

    await this.prisma.phoneOtp.create({
      data: {
        phone,
        userId: userId ?? null,
        codeHash,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    await this.sms.sendSms(phone, `Your MVPMMSHOP verification code is: ${code}. Valid 10 minutes.`);

    const devHint =
      process.env.NODE_ENV !== 'production' ? { devCode: code } : {};

    return { message: 'Verification code sent', phone, ...devHint };
  }

  async verifyOtp(phoneRaw: string, code: string, userId?: number) {
    await this.settings.assertFeatureEnabled('smsOtpEnabled');

    const phone = this.sms.normalizePhone(phoneRaw);
    const normalizedCode = code.replace(/\D/g, '').trim();
    if (normalizedCode.length !== 6) {
      throw new BadRequestException('Enter a 6-digit code');
    }

    const otp = await this.prisma.phoneOtp.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException('Code expired. Request a new one.');
    }
    if (otp.userId != null && userId != null && otp.userId !== userId) {
      throw new BadRequestException('Invalid verification session');
    }

    const hash = createHash('sha256').update(normalizedCode).digest('hex');
    if (hash !== otp.codeHash) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.phoneOtp.deleteMany({ where: { phone } });

    if (userId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { phone, phoneVerified: true },
      });
    }

    return { verified: true, phone };
  }

  async verifyOtpForRegister(phoneRaw: string, code: string) {
    return this.verifyOtp(phoneRaw, code);
  }

  async notifyOrderStatus(phone: string | null | undefined, message: string) {
    const flags = await this.settings.getFeatureFlags();
    if (!flags.smsOrderAlertsEnabled || !phone) return;
    const normalized = this.sms.normalizePhone(phone);
    await this.sms.sendSms(normalized, message);
  }
}
