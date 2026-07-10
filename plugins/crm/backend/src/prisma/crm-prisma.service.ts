import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client-crm';

@Injectable()
export class CrmPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CrmPrismaService.name);

  constructor() {
    super({
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
