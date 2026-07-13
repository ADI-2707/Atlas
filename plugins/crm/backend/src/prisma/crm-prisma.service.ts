import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client-crm';

declare const process: any;

@Injectable()
export class CrmPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CrmPrismaService.name);

  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    const urlWithSchema = dbUrl ? dbUrl.replace(/schema=[^&]*/, 'schema=atlas_crm') : dbUrl;
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
      this.logger.log('Connected to CRM database successfully');
    } catch (error) {
      this.logger.error('Failed to connect to CRM database', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
