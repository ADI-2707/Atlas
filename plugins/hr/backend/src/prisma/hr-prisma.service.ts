import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client-hr';

@Injectable()
export class HrPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HrPrismaService.name);

  constructor() {
    super({
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
