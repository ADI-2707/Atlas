import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client-hr';
import { tenantStorage } from '@atlas/plugin-sdk';

declare const process: any;

@Injectable()
export class HrPrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HrPrismaService.name);
  private _extendedClient: any;

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

    this._extendedClient = this.$extends({
      query: {
        $allModels: {
          $allOperations({ operation, args, query }) {
            const ctx = tenantStorage.getStore();
            
            if (ctx?.organizationId) {
              const readWriteOps = ['findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow', 'findMany', 'update', 'updateMany', 'delete', 'deleteMany', 'count', 'aggregate', 'groupBy'];
              
              if (readWriteOps.includes(operation)) {
                args = args || ({} as any);
                (args as any).where = { ...(args as any).where, organizationId: ctx.organizationId };
              } else if (operation === 'create' || operation === 'createMany') {
                args = args || ({} as any);
                if ((args as any).data) {
                   if (Array.isArray((args as any).data)) {
                       (args as any).data = (args as any).data.map((d: any) => ({ ...d, organizationId: ctx.organizationId }));
                   } else {
                       (args as any).data = { ...(args as any).data, organizationId: ctx.organizationId };
                   }
                }
              }
            }
            return query(args);
          }
        }
      }
    });

    return new Proxy(this, {
      get: (target: any, prop: string | symbol) => {
        if (typeof prop === 'string' && target._extendedClient[prop]) {
          return target._extendedClient[prop];
        }
        return target[prop];
      }
    }) as any;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log(`Connected to HR database successfully (client initialized: ${!!this._extendedClient})`);
    } catch (error) {
      this.logger.error('Failed to connect to HR database', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
