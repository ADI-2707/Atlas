import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PluginNavigationItem } from '@atlas/plugin-sdk';
import { TokenStorage } from '@atlas/auth';

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
    const fetchPlugins = async () => {
      const token = TokenStorage.getToken();
      if (!token) return;

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiUrl}/plugins`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const plugins = await res.json();
          // Filter out plugins that are installed or enabled
          const installedIds = plugins
            .filter((p: any) => p.status === 'INSTALLED' || p.status === 'ENABLED')
            .map((p: any) => p.id);
            
          setInstalledPlugins(installedIds);
          
          const navItems: PluginNavigationItem[] = [{ title: 'Dashboard', path: '/' }];
          installedIds.forEach((pid: string) => {
            const plugin = mockPlugins.find(p => p.id === pid);
            if (plugin) {
              navItems.push(...plugin.navigation);
            }
          });
          setNavigationItems(navItems);
        }
      } catch (err) {
        console.error('Failed to fetch installed plugins from API', err);
      }
    };

    fetchPlugins();
  }, []);

  const installPlugin = async (pluginId: string, _tier?: string) => {
    const token = TokenStorage.getToken();
    if (!token) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/plugins/${pluginId}/install`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setInstalledPlugins(prev => {
          const updated = prev.includes(pluginId) ? prev : [...prev, pluginId];
          return updated;
        });
        
        const plugin = mockPlugins.find(p => p.id === pluginId);
        if (plugin) {
          plugin.navigation.forEach(registerNavigationItem);
        }
      }
    } catch (err) {
      console.error(`Failed to install plugin ${pluginId}`, err);
    }
  };

  const uninstallPlugin = async (pluginId: string) => {
    const token = TokenStorage.getToken();
    if (!token) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/plugins/${pluginId}/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setInstalledPlugins(prev => {
          const updated = prev.filter(id => id !== pluginId);
          return updated;
        });
        
        const plugin = mockPlugins.find(p => p.id === pluginId);
        if (plugin) {
          plugin.navigation.forEach(nav => removeNavigationItem(nav.path));
        }
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
