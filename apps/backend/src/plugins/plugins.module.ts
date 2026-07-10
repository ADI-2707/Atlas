import { Module, DynamicModule } from '@nestjs/common';
import { PluginManagerService } from './plugin-manager.service';
import { PluginsController } from './plugins.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { pluginsRegistry } from './plugins.registry';

@Module({})
export class PluginsModule {
  static async register(): Promise<DynamicModule> {
    const controllers: any[] = [PluginsController];
    const providers: any[] = [PluginManagerService, PrismaService, AuditService];

    for (const config of pluginsRegistry) {
      if (config) {
        if (config.controllers) {
          controllers.push(...config.controllers);
        }
        if (config.providers) {
          providers.push(...config.providers);
        }
      }
    }

    return {
      module: PluginsModule,
      controllers,
      providers,
      exports: [PluginManagerService],
    };
  }
}
