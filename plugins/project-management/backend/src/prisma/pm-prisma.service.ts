import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client-pm';

@Injectable()
export class PmPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PmPrismaService.name);

  constructor() {
    super({
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
