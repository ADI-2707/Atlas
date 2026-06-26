import React, { useState } from 'react';
import { Sidebar, SidebarItem, Navbar, Button } from '@atlas/ui';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@atlas/auth';
import { usePlugins } from '../../contexts/PluginContext';
import './AppLayout.css';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const { navigationItems } = usePlugins();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="atlas-app-layout">
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggle={() => setIsCollapsed(!isCollapsed)}
        logo="Atlas OS"
        footer={
          <Button variant="danger" size="small" onClick={handleLogout} style={{ width: '100%' }}>
            {isCollapsed ? 'Exit' : 'Logout'}
          </Button>
        }
      >
        {navigationItems.map((item) => (
          <SidebarItem
            key={item.path}
            label={item.title}
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
              <Button variant="secondary" size="small" onClick={() => document.documentElement.setAttribute('data-theme', document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')}>
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
