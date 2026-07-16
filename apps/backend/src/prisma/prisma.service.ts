import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { tenantStorage } from '../common/tenant.context';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private _extendedClient: any;

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });

    this._extendedClient = this.$extends({
      query: {
        $allModels: {
          $allOperations({ model, operation, args, query }) {
            const ctx = tenantStorage.getStore();
            
            // Exclude models that are global or don't have organizationId
            const globalModels = ['Plugin', 'SystemLog', 'Organization', 'PluginData', 'Notification', 'Permission'];
            
            if (ctx?.organizationId && !globalModels.includes(model as string)) {
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
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
