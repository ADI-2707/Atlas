import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client-pm';

declare const process: any;

@Injectable()
export class PmPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PmPrismaService.name);

  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    const urlWithSchema = dbUrl ? dbUrl.replace(/schema=[^&]*/, 'schema=atlas_pm') : dbUrl;
    super({
      datasources: {
        db: {
          url: urlWithSchema,
        },
      },
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to PM database successfully');
    } catch (error) {
      this.logger.error('Failed to connect to PM database', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
