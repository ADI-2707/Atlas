import React, { useState } from 'react';
import { Sidebar, SidebarItem, Navbar, Button } from '@atlas/ui';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@atlas/auth';
import { usePlugins } from '../../contexts/PluginContext';
import { useTheme } from '../../contexts/ThemeContext';
import './AppLayout.css';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('atlas_sidebar_collapsed') === 'true';
  });
  const { logout, user } = useAuth();
  const { navigationItems } = usePlugins();
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

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
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggle={handleToggle}
        logo="Atlas OS"
        footer={
          <div className={isCollapsed ? "atlas-sidebar-tooltip-wrapper" : ""} data-tooltip="Logout" style={{ position: isCollapsed ? 'relative' : 'static' }}>
            <Button variant="danger" size="small" onClick={handleLogout} style={{ width: '100%', padding: isCollapsed ? '0.5rem 0' : undefined, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
      </Sidebar>

      <main className="atlas-app-main">
        <Navbar 
          rightContent={
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Welcome, {user?.name || 'User'}
              </span>
              <Button variant="secondary" size="small" onClick={toggleTheme}>
                Toggle Theme
              </Button>
            </div>
          }
        />
        <div className="atlas-app-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
