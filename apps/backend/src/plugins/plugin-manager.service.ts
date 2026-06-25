import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { join } from 'path';
import { readdirSync, existsSync, readFileSync } from 'fs';
import { PluginManifest } from '@atlas/plugin-sdk';

@Injectable()
export class PluginManagerService implements OnModuleInit {
  private pluginsDir: string;
  private loadedPlugins = new Map<string, any>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {
    let dir = join(process.cwd(), 'plugins');
    if (!existsSync(dir)) {
      dir = join(process.cwd(), '..', '..', 'plugins');
    }
    this.pluginsDir = dir;
  }

  async onModuleInit() {
    await this.discoverAndSyncPlugins();
  }

  async discoverAndSyncPlugins() {
    if (!existsSync(this.pluginsDir)) {
      return;
    }
    const entries = readdirSync(this.pluginsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const manifestPath = join(this.pluginsDir, entry.name, 'manifest.json');
        if (existsSync(manifestPath)) {
          try {
            const manifest: PluginManifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
            const dbPlugin = await this.prisma.plugin.findUnique({
              where: { id: manifest.id },
            });
            if (!dbPlugin) {
              await this.prisma.plugin.create({
                data: {
                  id: manifest.id,
                  name: manifest.name,
                  version: manifest.version,
                  description: manifest.description ?? '',
                  status: 'INSTALLED',
                  config: {},
                },
              });
            } else {
              await this.prisma.plugin.update({
                where: { id: manifest.id },
                data: {
                  name: manifest.name,
                  version: manifest.version,
                  description: manifest.description ?? '',
                },
              });
            }

            try {
              const pluginExport = require(`@atlas/plugin-${manifest.id}`);
              const config = pluginExport.default || pluginExport;
              this.loadedPlugins.set(manifest.id, config);
            } catch (pkgErr) {
              const backendPath = join(this.pluginsDir, entry.name, 'backend', 'src', 'index.ts');
              if (existsSync(backendPath)) {
                const pluginExport = require(backendPath);
                const config = pluginExport.default || pluginExport;
                this.loadedPlugins.set(manifest.id, config);
              }
            }
          } catch (err) {
            console.error(`Failed to load plugin ${entry.name}:`, err);
          }
        }
      }
    }
  }

  async getPlugins() {
    return this.prisma.plugin.findMany();
  }

  async installPlugin(id: string) {
    const plugin = await this.prisma.plugin.findUnique({ where: { id } });
    if (!plugin) throw new Error('Plugin not found');

    const loaded = this.loadedPlugins.get(id);
    if (loaded?.lifecycle?.onInstall) {
      await loaded.lifecycle.onInstall();
    }

    if (loaded?.permissions && Array.isArray(loaded.permissions)) {
      for (const perm of loaded.permissions) {
        await this.prisma.permission.upsert({
          where: { code: perm.code },
          update: {
            name: perm.name,
            description: perm.description,
            module: id,
          },
          create: {
            code: perm.code,
            name: perm.name,
            description: perm.description,
            module: id,
          },
        });
      }
    }

    await this.auditService.createLog({
      action: 'plugin.install',
      result: 'SUCCESS',
      pluginId: id,
      details: { id, name: plugin.name },
    });

    return this.prisma.plugin.update({
      where: { id },
      data: { status: 'ENABLED' },
    });
  }

  async enablePlugin(id: string) {
    const plugin = await this.prisma.plugin.findUnique({ where: { id } });
    if (!plugin) throw new Error('Plugin not found');

    const loaded = this.loadedPlugins.get(id);
    if (loaded?.lifecycle?.onEnable) {
      await loaded.lifecycle.onEnable();
    }

    await this.auditService.createLog({
      action: 'plugin.enable',
      result: 'SUCCESS',
      pluginId: id,
      details: { id },
    });

    return this.prisma.plugin.update({
      where: { id },
      data: { status: 'ENABLED' },
    });
  }

  async disablePlugin(id: string) {
    const plugin = await this.prisma.plugin.findUnique({ where: { id } });
    if (!plugin) throw new Error('Plugin not found');

    const loaded = this.loadedPlugins.get(id);
    if (loaded?.lifecycle?.onDisable) {
      await loaded.lifecycle.onDisable();
    }

    await this.auditService.createLog({
      action: 'plugin.disable',
      result: 'SUCCESS',
      pluginId: id,
      details: { id },
    });

    return this.prisma.plugin.update({
      where: { id },
      data: { status: 'DISABLED' },
    });
  }
}
