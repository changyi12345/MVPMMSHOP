import { Body, Controller, Get, Patch, Post, Put, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, ResendVerificationDto } from './dto/forgot-password.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PhoneOtpService } from './phone-otp.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private phoneOtp: PhoneOtpService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('admin-2fa/verify')
  verifyAdmin2FA(@Body() body: { twoFactorToken: string; code: string }) {
    return this.authService.verifyAdmin2FA(body.twoFactorToken, body.code);
  }

  @Post('google')
  googleLogin(@Body() dto: GoogleAuthDto) {
    return this.authService.googleLogin(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Post('phone/send-otp')
  sendPhoneOtp(@Body() body: { phone: string }, @Request() req?: { user?: { id: number } }) {
    return this.phoneOtp.sendOtp(body.phone, req?.user?.id);
  }

  @Post('phone/verify-otp')
  verifyPhoneOtp(@Body() body: { phone: string; code: string }, @Request() req?: { user?: { id: number } }) {
    return this.phoneOtp.verifyOtp(body.phone, body.code, req?.user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('phone/send-otp/me')
  sendMyPhoneOtp(@Request() req: { user: { id: number } }, @Body() body: { phone: string }) {
    return this.phoneOtp.sendOtp(body.phone, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('phone/verify-otp/me')
  verifyMyPhoneOtp(
    @Request() req: { user: { id: number } },
    @Body() body: { phone: string; code: string },
  ) {
    return this.phoneOtp.verifyOtp(body.phone, body.code, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Request() req: { user: { id: number } }) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Request() req: { user: { id: number } }, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  changePassword(@Request() req: { user: { id: number } }, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto.currentPassword, dto.newPassword);
  }
}
