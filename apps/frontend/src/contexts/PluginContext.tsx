import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PluginNavigationItem } from '@atlas/plugin-sdk';

import { mockPlugins } from '../plugins/mock-plugins';

export interface PluginContextType {
  navigationItems: PluginNavigationItem[];
  installedPlugins: string[];
  installPlugin: (pluginId: string, tier?: string) => void;
  uninstallPlugin: (pluginId: string) => void;
  registerNavigationItem: (item: PluginNavigationItem) => void;
  removeNavigationItem: (path: string) => void;
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export const PluginProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [installedPlugins, setInstalledPlugins] = useState<string[]>([]);
  const [navigationItems, setNavigationItems] = useState<PluginNavigationItem[]>([
    { title: 'Dashboard', path: '/' }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('atlas_installed_plugins');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInstalledPlugins(parsed);
        const navItems: PluginNavigationItem[] = [{ title: 'Dashboard', path: '/' }];
        parsed.forEach((pid: string) => {
          const plugin = mockPlugins.find(p => p.id === pid);
          if (plugin) {
            navItems.push(...plugin.navigation);
          }
        });
        setNavigationItems(navItems);
      } catch (e) {
        console.error('Failed to parse installed plugins');
      }
    }
  }, []);

  const installPlugin = (pluginId: string, _tier?: string) => {
    setInstalledPlugins(prev => {
      const updated = prev.includes(pluginId) ? prev : [...prev, pluginId];
      localStorage.setItem('atlas_installed_plugins', JSON.stringify(updated));
      return updated;
    });
    
    const plugin = mockPlugins.find(p => p.id === pluginId);
    if (plugin) {
      plugin.navigation.forEach(registerNavigationItem);
    }
  };

  const uninstallPlugin = (pluginId: string) => {
    setInstalledPlugins(prev => {
      const updated = prev.filter(id => id !== pluginId);
      localStorage.setItem('atlas_installed_plugins', JSON.stringify(updated));
      return updated;
    });
    
    const plugin = mockPlugins.find(p => p.id === pluginId);
    if (plugin) {
      plugin.navigation.forEach(nav => removeNavigationItem(nav.path));
    }
  };

  const registerNavigationItem = (item: PluginNavigationItem) => {
    setNavigationItems(prev => {
      if (prev.find(i => i.path === item.path)) return prev;
      return [...prev, item];
    });
  };

  const removeNavigationItem = (path: string) => {
    setNavigationItems(prev => prev.filter(i => i.path !== path));
  };

  return (
    <PluginContext.Provider value={{ navigationItems, installedPlugins, installPlugin, uninstallPlugin, registerNavigationItem, removeNavigationItem }}>
      {children}
    </PluginContext.Provider>
  );
};

export const usePlugins = () => {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePlugins must be used within a PluginProvider');
  }
  return context;
};
