import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@atlas/ui';
import { useAuth } from '@atlas/auth';
import { usePlugins } from '../../contexts/PluginContext';
import { mockPlugins } from '../../plugins/mock-plugins';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { installedPlugins } = usePlugins();
  const navigate = useNavigate();

  const handleAddPlugins = () => {
    navigate('/store');
  };

  if (installedPlugins.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <div className="empty-state-content">
          <div className="welcome-icon">👋</div>
          <h1>Welcome to Atlas, {user?.name || 'User'}!</h1>
          <p>Your workspace is currently empty. To get started and unlock the power of Atlas, you need to install some enterprise plugins.</p>
          <Button onClick={handleAddPlugins} size="large">
            Add Plugins
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-active-state">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back, {user?.name || 'User'}</p>
      </div>

      <div className="dashboard-widgets-grid">
        {installedPlugins.map(pid => {
          const plugin = mockPlugins.find(p => p.id === pid);
          if (!plugin) return null;
          return (
            <div key={pid} className="dashboard-widget-card">
              <div className="widget-header">
                <h3>{plugin.name}</h3>
                <span className="widget-badge">Active</span>
              </div>
              <div className="widget-body">
                <p>Status: Healthy</p>
                <p>Usage: Normal</p>
              </div>
              <div className="widget-footer">
                <Button variant="secondary" size="small" onClick={() => navigate(plugin.navigation[0]?.path || '/')}>
                  Open App
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
