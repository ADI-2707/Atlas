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
                  status: 'AVAILABLE',
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

  private async getOrSyncPlugin(id: string) {
    let plugin = await this.prisma.plugin.findUnique({ where: { id } });
    if (!plugin) {
      await this.discoverAndSyncPlugins();
      plugin = await this.prisma.plugin.findUnique({ where: { id } });
    }
    return plugin;
  }

  async getPlugins(organizationId?: string) {
    await this.discoverAndSyncPlugins();
    const allPlugins = await this.prisma.plugin.findMany();
    if (!organizationId) {
      return allPlugins;
    }
    const orgPlugins = await this.prisma.organizationPlugin.findMany({
      where: { organizationId },
    });
    const orgPluginMap = new Map(orgPlugins.map(op => [op.pluginId, op]));
    return allPlugins.map(plugin => {
      const orgPlugin = orgPluginMap.get(plugin.id);
      return {
        ...plugin,
        status: orgPlugin ? orgPlugin.status : 'AVAILABLE',
        config: orgPlugin ? orgPlugin.config : {},
      };
    });
  }

  async installPlugin(id: string, organizationId: string, tier?: string) {
    const plugin = await this.getOrSyncPlugin(id);
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

    try {
      const orgRoles = await this.prisma.role.findMany({
        where: {
          organizationId,
          name: { in: ['Super Admin', 'Org Admin', 'User'] },
        },
      });

      if (loaded?.permissions && Array.isArray(loaded.permissions)) {
        const dbPerms = await this.prisma.permission.findMany({
          where: { code: { in: loaded.permissions.map((p: any) => p.code) } },
        });

        for (const role of orgRoles) {
          let rolePerms = dbPerms;
          if (role.name === 'User') {
            rolePerms = dbPerms.filter(p => p.code.endsWith('.read'));
          }

          await this.prisma.role.update({
            where: { id: role.id },
            data: {
              permissions: {
                connect: rolePerms.map(p => ({ id: p.id })),
              },
            },
          });
        }
      }
    } catch (e) {
      console.error('Failed to auto-connect plugin permissions to roles:', e);
    }

    await this.auditService.createLog({
      action: 'plugin.install',
      result: 'SUCCESS',
      pluginId: id,
      organizationId,
      details: { id, name: plugin.name },
    });

    const currentConfig = (plugin.config as Record<string, any>) || {};
    if (tier) {
      currentConfig.tier = tier;
    }

    await this.prisma.organizationPlugin.upsert({
      where: {
        organizationId_pluginId: {
          organizationId,
          pluginId: id,
        },
      },
      update: {
        status: 'ENABLED',
        config: currentConfig,
      },
      create: {
        organizationId,
        pluginId: id,
        status: 'ENABLED',
        config: currentConfig,
      },
    });

    return this.prisma.plugin.update({
      where: { id },
      data: {
        status: 'ENABLED',
        config: currentConfig,
      },
    });
  }

  async enablePlugin(id: string, organizationId: string) {
    const plugin = await this.getOrSyncPlugin(id);
    if (!plugin) throw new Error('Plugin not found');

    const loaded = this.loadedPlugins.get(id);
    if (loaded?.lifecycle?.onEnable) {
      await loaded.lifecycle.onEnable();
    }

    await this.auditService.createLog({
      action: 'plugin.enable',
      result: 'SUCCESS',
      pluginId: id,
      organizationId,
      details: { id },
    });

    await this.prisma.organizationPlugin.upsert({
      where: {
        organizationId_pluginId: {
          organizationId,
          pluginId: id,
        },
      },
      update: { status: 'ENABLED' },
      create: {
        organizationId,
        pluginId: id,
        status: 'ENABLED',
      },
    });

    return this.prisma.plugin.update({
      where: { id },
      data: { status: 'ENABLED' },
    });
  }

  async disablePlugin(id: string, organizationId: string) {
    const plugin = await this.getOrSyncPlugin(id);
    if (!plugin) throw new Error('Plugin not found');

    const loaded = this.loadedPlugins.get(id);
    if (loaded?.lifecycle?.onDisable) {
      await loaded.lifecycle.onDisable();
    }

    await this.auditService.createLog({
      action: 'plugin.disable',
      result: 'SUCCESS',
      pluginId: id,
      organizationId,
      details: { id },
    });

    await this.prisma.organizationPlugin.upsert({
      where: {
        organizationId_pluginId: {
          organizationId,
          pluginId: id,
        },
      },
      update: { status: 'DISABLED' },
      create: {
        organizationId,
        pluginId: id,
        status: 'DISABLED',
      },
    });

    return this.prisma.plugin.update({
      where: { id },
      data: { status: 'DISABLED' },
    });
  }

  async upgradePlugin(id: string, organizationId: string, tier: string) {
    const plugin = await this.getOrSyncPlugin(id);
    if (!plugin) throw new Error('Plugin not found');

    const config = (plugin.config as Record<string, any>) || {};
    const oldTier = config.tier || 'free';
    config.tier = tier;

    await this.auditService.createLog({
      action: 'plugin.upgrade',
      result: 'SUCCESS',
      pluginId: id,
      organizationId,
      details: { id, oldTier, newTier: tier },
    });

    await this.prisma.organizationPlugin.upsert({
      where: {
        organizationId_pluginId: {
          organizationId,
          pluginId: id,
        },
      },
      update: { config },
      create: {
        organizationId,
        pluginId: id,
        status: 'ENABLED',
        config,
      },
    });

    return this.prisma.plugin.update({
      where: { id },
      data: { config },
    });
  }

}

