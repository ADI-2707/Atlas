import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PluginNavigationItem } from '@atlas/plugin-sdk';
import { api } from '@atlas/api';
import { useAuth } from '@atlas/auth';

import { mockPlugins } from '../plugins/mock-plugins';

export interface PluginContextType {
  navigationItems: PluginNavigationItem[];
  installedPlugins: string[];
  allPlugins: any[];
  isLoadingPlugins: boolean;
  installPlugin: (pluginId: string, tier?: string) => Promise<void>;
  upgradePlugin: (pluginId: string, tier: string) => Promise<void>;
  uninstallPlugin: (pluginId: string) => Promise<void>;
  registerNavigationItem: (item: PluginNavigationItem) => void;
  removeNavigationItem: (path: string) => void;
  workspaceLock: { title: string; description: string; upgradePath: string; secondaryAction?: { label: string; onClick: () => void } } | null;
  setWorkspaceLock: (lock: { title: string; description: string; upgradePath: string; secondaryAction?: { label: string; onClick: () => void } } | null) => void;
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export const PluginProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [installedPlugins, setInstalledPlugins] = useState<string[]>([]);
  const [allPlugins, setAllPlugins] = useState<any[]>([]);
  const [isLoadingPlugins, setIsLoadingPlugins] = useState(true);
  const [navigationItems, setNavigationItems] = useState<PluginNavigationItem[]>([
    { title: 'Dashboard', path: '/', icon: 'dashboard' }
  ]);
  const [workspaceLock, setWorkspaceLock] = useState<{ title: string; description: string; upgradePath: string; secondaryAction?: { label: string; onClick: () => void } } | null>(null);

  useEffect(() => {
    const fetchPlugins = async () => {
      setIsLoadingPlugins(true);
      try {
        const json = await api.get<{ data: any[] }>('/plugins');
        const plugins = json.data || [];

        setAllPlugins(plugins);

        const installedIds = plugins
          .filter((p: any) => p.status === 'INSTALLED' || p.status === 'ENABLED')
          .map((p: any) => p.id);

        setInstalledPlugins(installedIds);

        const navItems: PluginNavigationItem[] = [{ title: 'Dashboard', path: '/', icon: 'dashboard' }];
        installedIds.forEach((pid: string) => {
          const plugin = mockPlugins.find(p => p.id === pid);
          if (plugin) {
            navItems.push(...plugin.navigation);
          }
        });
        setNavigationItems(navItems);
      } catch (err) {
        console.error('Failed to fetch installed plugins from API', err);
      } finally {
        setIsLoadingPlugins(false);
      }
    };

    if (isAuthLoading) {
      return;
    }

    if (isAuthenticated) {
      fetchPlugins();
    } else {
      setInstalledPlugins([]);
      setAllPlugins([]);
      setNavigationItems([{ title: 'Dashboard', path: '/', icon: 'dashboard' }]);
      setIsLoadingPlugins(false);
    }
  }, [isAuthenticated, isAuthLoading]);

  const installPlugin = async (pluginId: string, tier?: string) => {
    setInstalledPlugins(prev => {
      const updated = prev.includes(pluginId) ? prev : [...prev, pluginId];
      return updated;
    });

    const plugin = mockPlugins.find(p => p.id === pluginId);
    if (plugin) {
      plugin.navigation.forEach(registerNavigationItem);
    }

    let backendTier = 'free';
    if (tier === 'pro') backendTier = 'tier1';
    else if (tier === 'business') backendTier = 'tier2';
    else if (tier === 'enterprise') backendTier = 'tier3';

    try {
      await api.post(`/plugins/${pluginId}/install`, { tier: backendTier });
    } catch (err) {
      console.error(`Failed to install plugin ${pluginId}`, err);
    }
  };

  const upgradePlugin = async (pluginId: string, tier: string) => {
    let backendTier = 'free';
    if (tier === 'pro') backendTier = 'tier1';
    else if (tier === 'business') backendTier = 'tier2';
    else if (tier === 'enterprise') backendTier = 'tier3';

    try {
      await api.post(`/plugins/${pluginId}/upgrade`, { tier: backendTier });
    } catch (err) {
      console.error(`Failed to upgrade plugin ${pluginId}`, err);
      throw err;
    }
  };

  const uninstallPlugin = async (pluginId: string) => {
    try {
      await api.post(`/plugins/${pluginId}/disable`);
      
      setInstalledPlugins(prev => {
        const updated = prev.filter(id => id !== pluginId);
        return updated;
      });

      const plugin = mockPlugins.find(p => p.id === pluginId);
      if (plugin) {
        plugin.navigation.forEach(nav => removeNavigationItem(nav.path));
      }
    } catch (err) {
      console.error(`Failed to uninstall plugin ${pluginId}`, err);
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
    <PluginContext.Provider value={{
      navigationItems,
      installedPlugins,
      allPlugins,
      isLoadingPlugins,
      installPlugin,
      upgradePlugin,
      uninstallPlugin,
      registerNavigationItem,
      removeNavigationItem,
      workspaceLock,
      setWorkspaceLock
    }}>
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
