import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client-inventory';

declare const process: any;

@Injectable()
export class InventoryPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InventoryPrismaService.name);

  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    const urlWithSchema = dbUrl ? dbUrl.replace(/schema=[^&]*/, 'schema=atlas_inventory') : dbUrl;
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
      this.logger.log('Connected to inventory database successfully');
    } catch (error) {
      this.logger.error('Failed to connect to inventory database', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
