import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PluginManagerService } from './plugin-manager.service';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('plugins')
@ApiBearerAuth()
@Controller('plugins')
export class PluginsController {
  constructor(private readonly pluginManager: PluginManagerService) {}

  @Get()
  @ApiOperation({ summary: 'List all discovered plugins' })
  async getPlugins() {
    return this.pluginManager.getPlugins();
  }

  @Post(':id/install')
  @RequirePermissions('plugins.write')
  @ApiOperation({ summary: 'Install a plugin and run onInstall lifecycle hook' })
  async installPlugin(
    @Param('id') id: string,
    @Body() body?: { tier?: string }
  ) {
    return this.pluginManager.installPlugin(id, body?.tier);
  }

  @Post(':id/enable')
  @RequirePermissions('plugins.write')
  @ApiOperation({ summary: 'Enable an installed plugin' })
  async enablePlugin(@Param('id') id: string) {
    return this.pluginManager.enablePlugin(id);
  }

  @Post(':id/disable')
  @RequirePermissions('plugins.write')
  @ApiOperation({ summary: 'Disable an enabled plugin' })
  async disablePlugin(@Param('id') id: string) {
    return this.pluginManager.disablePlugin(id);
  }

  @Post(':id/upgrade')
  @RequirePermissions('plugins.write')
  @ApiOperation({ summary: 'Upgrade or change a plugin subscription tier' })
  async upgradePlugin(
    @Param('id') id: string,
    @Body() body: { tier: string }
  ) {
    return this.pluginManager.upgradePlugin(id, body.tier);
  }
}

