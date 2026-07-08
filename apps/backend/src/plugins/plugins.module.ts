import { Module, DynamicModule } from '@nestjs/common';
import { PluginManagerService } from './plugin-manager.service';
import { PluginsController } from './plugins.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { join } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';


@Module({})
export class PluginsModule {
  static async register(): Promise<DynamicModule> {
    const controllers: any[] = [PluginsController];
    const providers: any[] = [PluginManagerService, PrismaService, AuditService];

    let dir = join(process.cwd(), 'plugins');
    if (!existsSync(dir)) {
      dir = join(process.cwd(), '..', '..', 'plugins');
    }

    if (existsSync(dir)) {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const manifestPath = join(dir, entry.name, 'manifest.json');
          if (existsSync(manifestPath)) {
            try {
              const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
              let config: any;
              const backendPath = join(dir, entry.name, 'backend', 'src', 'index.ts');
              const shouldPreferSource = process.env.NODE_ENV !== 'production';

              if (shouldPreferSource && existsSync(backendPath)) {
                try {
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  const pluginExport = require(backendPath);
                  config = pluginExport.default || pluginExport;
                } catch (srcErr) {
                  console.warn(`Failed to require source file ${backendPath}, will try compiled package:`, srcErr);
                }
              }

              if (!config) {
                try {
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  const pluginExport = require(`@atlas/plugin-${manifest.id}`);
                  config = pluginExport.default || pluginExport;
                } catch (pkgErr) {
                  if (existsSync(backendPath)) {
                    try {
                      // eslint-disable-next-line @typescript-eslint/no-require-imports
                      const pluginExport = require(backendPath);
                      config = pluginExport.default || pluginExport;
                    } catch (srcErr) {
                      console.error(`Failed to load plugin ${manifest.id} from source:`, srcErr);
                    }
                  }
                }
              }
              if (config) {
                if (config.controllers) {
                  controllers.push(...config.controllers);
                }
                if (config.providers) {
                  providers.push(...config.providers);
                }
              }
            } catch (err) {
              console.error(`Failed to register extensions for ${entry.name}:`, err);
            }
          }
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
