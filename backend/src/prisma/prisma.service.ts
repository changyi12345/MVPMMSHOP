import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool | null;

  constructor() {
    const connectionString = process.env.DATABASE_URL?.trim();
    const pool = connectionString ? new Pool({ connectionString }) : null;
    super(pool ? { adapter: new PrismaPg(pool) } : {});
    this.pool = pool;
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      this.logger.warn(
        'Database connection failed — auth/orders unavailable, games API still works',
      );
      this.logger.warn(err instanceof Error ? err.message : String(err));
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool?.end();
  }
}
