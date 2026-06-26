import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TopUpWalletDto } from './dto/topup-wallet.dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get()
  getWallet(@Req() req: { user: { id: number } }) {
    return this.walletService.getWallet(req.user.id);
  }

  @Post('topup')
  requestTopUp(@Req() req: { user: { id: number } }, @Body() dto: TopUpWalletDto) {
    return this.walletService.requestTopUp(req.user.id, dto);
  }
}
