import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  isConfigured(): boolean {
    return Boolean(
      process.env.TWILIO_ACCOUNT_SID?.trim() &&
        process.env.TWILIO_AUTH_TOKEN?.trim() &&
        process.env.TWILIO_FROM_NUMBER?.trim(),
    );
  }

  normalizePhone(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('959') && digits.length >= 11) return `+${digits}`;
    if (digits.startsWith('09') && digits.length >= 9) return `+95${digits.slice(1)}`;
    if (digits.startsWith('9') && digits.length === 9) return `+95${digits}`;
    if (digits.startsWith('95') && digits.length >= 10) return `+${digits}`;
    return raw.trim().startsWith('+') ? raw.trim() : `+${digits}`;
  }

  async sendSms(to: string, body: string): Promise<boolean> {
    const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const token = process.env.TWILIO_AUTH_TOKEN?.trim();
    const from = process.env.TWILIO_FROM_NUMBER?.trim();

    if (!sid || !token || !from) {
      this.logger.warn(`SMS not sent (Twilio not configured) → ${to}: ${body}`);
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log(`[DEV SMS] To: ${to}\n${body}`);
      }
      return false;
    }

    try {
      const auth = Buffer.from(`${sid}:${token}`).toString('base64');
      const params = new URLSearchParams({ To: to, From: from, Body: body });
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });
      if (!res.ok) {
        const errText = await res.text();
        this.logger.error(`Twilio SMS failed → ${to}: ${errText}`);
        return false;
      }
      this.logger.log(`SMS sent → ${to}`);
      return true;
    } catch (err) {
      this.logger.error(`SMS failed → ${to}`, err);
      return false;
    }
  }
}
