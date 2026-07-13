import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PLUGIN_KEY } from '../decorators/plugin.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PluginActiveGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const pluginId = this.reflector.getAllAndOverride<string>(PLUGIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!pluginId) {
      return true; // No plugin requirement
    }

    const plugin = await this.prisma.plugin.findUnique({
      where: { id: pluginId },
    });

    if (!plugin || (plugin.status !== 'ENABLED' && plugin.status !== 'INSTALLED')) {
      throw new ForbiddenException(`Plugin ${pluginId} is not enabled.`);
    }

    return true;
  }
}
