import { SetMetadata } from '@nestjs/common';

export const PLUGIN_KEY = 'pluginId';
export const RequirePlugin = (pluginId: string) => SetMetadata(PLUGIN_KEY, pluginId);
