export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author?: string;
  description?: string;
  atlasVersion: string;
  dependencies?: string[];
  permissions?: string[];
  events?: string[];
  routes?: string[];
  widgets?: string[];
}

export interface PluginPermission {
  code: string;
  name: string;
  description?: string;
}

export interface PluginRoute {
  path: string;
  component?: string;
  name?: string;
}

export interface PluginNavigationItem {
  title: string;
  path: string;
  icon?: string;
  permissions?: string[];
  children?: PluginNavigationItem[];
}

export interface PluginWidget {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
}

export interface PluginEventConfig {
  publishes?: string[];
  subscribes?: string[];
}

export interface PluginConfigurationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'json';
    default?: any;
    required?: boolean;
    label?: string;
  };
}

export interface PluginLifecycle {
  onInstall?: () => void | Promise<void>;
  onInitialize?: () => void | Promise<void>;
  onEnable?: () => void | Promise<void>;
  onDisable?: () => void | Promise<void>;
  onUpgrade?: (fromVersion: string, toVersion: string) => void | Promise<void>;
  onUninstall?: () => void | Promise<void>;
}

export interface AtlasPluginConfig {
  manifest: PluginManifest;
  controllers?: any[];
  providers?: any[];
  routes?: PluginRoute[];
  navigation?: PluginNavigationItem[];
  widgets?: PluginWidget[];
  permissions?: PluginPermission[];
  events?: PluginEventConfig;
  configuration?: PluginConfigurationSchema;
  lifecycle?: PluginLifecycle;
}

export function AtlasPlugin(config: AtlasPluginConfig): AtlasPluginConfig {
  return config;
}
