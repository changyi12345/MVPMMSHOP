import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to MVPMMSHOP API!';
  }

  getHealth() {
    return {
      ok: true,
      service: 'mvpmms-api',
      env: process.env.NODE_ENV ?? 'development',
      time: new Date().toISOString(),
    };
  }
}
