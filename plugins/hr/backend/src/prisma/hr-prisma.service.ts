import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client-hr';

declare const process: any;

@Injectable()
export class HrPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HrPrismaService.name);

  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    const urlWithSchema = dbUrl ? dbUrl.replace(/schema=[^&]*/, 'schema=atlas_hr') : dbUrl;
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
      this.logger.log('Connected to HR database successfully');
    } catch (error) {
      this.logger.error('Failed to connect to HR database', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
