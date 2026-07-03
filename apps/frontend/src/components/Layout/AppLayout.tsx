import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarItem, Navbar, Button } from '@atlas/ui';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@atlas/auth';
import { api } from '@atlas/api';
import { usePlugins } from '../../contexts/PluginContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FullScreenLock } from '../FullScreenLock/FullScreenLock';
import { SupportWidget } from '../SupportWidget/SupportWidget';
import './AppLayout.css';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('atlas_sidebar_collapsed') === 'true';
  });
  const { logout, user } = useAuth();
  const { navigationItems, workspaceLock, setWorkspaceLock } = usePlugins();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();

  const getPageName = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/crm')) return 'CRM Management';
    if (path.startsWith('/inventory')) return 'Inventory Management';
    if (path.startsWith('/store')) return 'Plugin Marketplace';
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return 'Atlas';
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  };

  useEffect(() => {
    setWorkspaceLock(null);
  }, [location.pathname]);

  const [isInventoryLocked, setIsInventoryLocked] = useState(false);
  const [isCrmLocked, setIsCrmLocked] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith('/inventory')) {
      api.get<any>('/inventory/stats')
        .then(res => {
          const stats = res.data;
          const isLocked = stats ? (stats.productCount / stats.maxProducts) >= 0.995 : false;
          setIsInventoryLocked(isLocked);
        })
        .catch(() => setIsInventoryLocked(false));
    } else {
      setIsInventoryLocked(false);
    }

    if (location.pathname.startsWith('/crm')) {
      api.get<any>('/crm/limits')
        .then(res => {
          const stats = res.data;
          const isLocked = stats && (
            (stats.limits.customers !== -1 && (stats.usage.customers / stats.limits.customers) >= 0.995) ||
            (stats.limits.deals !== -1 && (stats.usage.deals / stats.limits.deals) >= 0.995)
          );
          setIsCrmLocked(isLocked);
        })
        .catch(() => setIsCrmLocked(false));
    } else {
      setIsCrmLocked(false);
    }
  }, [location.pathname]);

  const renderIcon = (name?: string) => {
    switch (name) {
      case 'dashboard':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect>
          </svg>
        );
      case 'inventory':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        );
      case 'crm':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        );
      case 'analytics':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
        );
      case 'hr':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
        );
      default:
        return undefined;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggle = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    localStorage.setItem('atlas_sidebar_collapsed', String(newVal));
  };

  return (
    <div className="atlas-app-layout">
      {workspaceLock && (
        <FullScreenLock
          title={workspaceLock.title}
          description={workspaceLock.description}
          upgradePath={workspaceLock.upgradePath}
          secondaryAction={workspaceLock.secondaryAction}
        />
      )}
      {isInventoryLocked && (
        <FullScreenLock
          title="Inventory Workspace Locked"
          description="Your inventory workspace has exceeded its permitted plan capacity. Please upgrade your subscription plan to restore access."
          upgradePath="/store"
        />
      )}
      {isCrmLocked && (
        <FullScreenLock
          title="CRM Workspace Locked"
          description="Your CRM contact database has exceeded its permitted plan capacity. Please upgrade your subscription plan to restore access."
          upgradePath="/store"
        />
      )}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={handleToggle}
        logo="Atlas OS"
        footer={
          <div className={isCollapsed ? "atlas-sidebar-tooltip-wrapper" : ""} data-tooltip="Logout" style={{ position: isCollapsed ? 'relative' : 'static' }}>
            <Button className="logout-btn" variant="danger" size="small" onClick={handleLogout} style={{ width: '100%', padding: isCollapsed ? '0.5rem 0' : undefined, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {isCollapsed ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              ) : 'Logout'}
            </Button>
          </div>
        }
      >
        {navigationItems.map((item) => (
          <SidebarItem
            key={item.path}
            label={item.title}
            icon={renderIcon(item.icon)}
            isActive={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
            onClick={() => navigate(item.path)}
          />
        ))}
        <SidebarItem
          label="Projects"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
          }
          isActive={location.pathname.startsWith('/projects')}
          onClick={() => navigate('/projects')}
        />
        <div style={{ flex: 1 }} />
        <SidebarItem
          label="Audit Logs"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          }
          isActive={location.pathname.startsWith('/logs')}
          onClick={() => navigate('/logs')}
        />
      </Sidebar>

      <main className="atlas-app-main">
        <Navbar
          leftContent={
            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginLeft: '0.5rem' }}>
              {getPageName()}
            </span>
          }
          rightContent={
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Welcome, {user?.name || 'User'}
              </span>

              <div
                className="theme-toggle-switch"
                onClick={toggleTheme}
                style={{
                  width: '22px',
                  height: '34px',
                  borderRadius: '11px',
                  backgroundColor: isDark ? 'var(--color-accent-active)' : '#b0bec5',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.25), inset 0 1px 1px rgba(0,0,0,0.15)'
                }}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <div
                  className="theme-toggle-thumb"
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'linear-gradient(180deg, #ffffff 0%, #e0e0e0 100%)',
                    border: '1px solid #a0a0a0',
                    position: 'absolute',
                    left: '2px',
                    top: isDark ? '2px' : '14px',
                    transition: 'top 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4), 0 1px 1px rgba(0,0,0,0.2)'
                  }}
                />
              </div>

              <Button className="marketplace-btn" variant="primary" size="small" onClick={() => navigate('/store')}>
                Plugin Marketplace
              </Button>
            </div>
          }
        />
        <div className="atlas-app-content">
          <div className="page-reveal" key={location.pathname} style={{ width: '100%', height: '100%' }}>
            <Outlet />
          </div>
        </div>
      </main>
      <SupportWidget />
    </div>
  );
};
