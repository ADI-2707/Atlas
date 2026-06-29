import { Module, DynamicModule } from '@nestjs/common';
import { PluginManagerService } from './plugin-manager.service';
import { PluginsController } from './plugins.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { join } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';

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
      const prisma = new PrismaClient();
      try {
        await prisma.$connect();
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const manifestPath = join(dir, entry.name, 'manifest.json');
            if (existsSync(manifestPath)) {
              try {
                const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
                const dbPlugin = await prisma.plugin.findUnique({
                  where: { id: manifest.id },
                });
                if (dbPlugin && (dbPlugin.status === 'ENABLED' || dbPlugin.status === 'INSTALLED')) {
                  let config: any;
                  try {
                    const pluginExport = require(`@atlas/plugin-${manifest.id}`);
                    config = pluginExport.default || pluginExport;
                  } catch (pkgErr) {
                    const backendPath = join(dir, entry.name, 'backend', 'src', 'index.ts');
                    if (existsSync(backendPath)) {
                      const pluginExport = require(backendPath);
                      config = pluginExport.default || pluginExport;
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
                }
              } catch (err) {
                console.error(`Failed to register extensions for ${entry.name}:`, err);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to query plugins during dynamic module registration:', err);
      } finally {
        await prisma.$disconnect();
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
