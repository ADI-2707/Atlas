import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PluginManagerService } from './plugin-manager.service';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('plugins')
@ApiBearerAuth()
@Controller('plugins')
export class PluginsController {
  constructor(private readonly pluginManager: PluginManagerService) {}

  @Get()
  @ApiOperation({ summary: 'List all discovered plugins' })
  async getPlugins(@CurrentUser() user: any) {
    return this.pluginManager.getPlugins(user.organizationId);
  }

  @Post(':id/install')
  @RequirePermissions('plugins.write')
  @ApiOperation({ summary: 'Install a plugin and run onInstall lifecycle hook' })
  async installPlugin(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body?: { tier?: string }
  ) {
    return this.pluginManager.installPlugin(id, user.organizationId, body?.tier);
  }

  @Post(':id/enable')
  @RequirePermissions('plugins.write')
  @ApiOperation({ summary: 'Enable an installed plugin' })
  async enablePlugin(@Param('id') id: string, @CurrentUser() user: any) {
    return this.pluginManager.enablePlugin(id, user.organizationId);
  }

  @Post(':id/disable')
  @RequirePermissions('plugins.write')
  @ApiOperation({ summary: 'Disable an enabled plugin' })
  async disablePlugin(@Param('id') id: string, @CurrentUser() user: any) {
    return this.pluginManager.disablePlugin(id, user.organizationId);
  }

  @Post(':id/upgrade')
  @RequirePermissions('plugins.write')
  @ApiOperation({ summary: 'Upgrade or change a plugin subscription tier' })
  async upgradePlugin(
    @Param('id') id: string,
    @Body() body: { tier: string },
    @CurrentUser() user: any,
  ) {
    return this.pluginManager.upgradePlugin(id, user.organizationId, body.tier);
  }
}

