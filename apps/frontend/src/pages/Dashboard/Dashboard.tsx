import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@atlas/ui';
import { useAuth } from '@atlas/auth';
import { usePlugins } from '../../contexts/PluginContext';
import { mockPlugins } from '../../plugins/mock-plugins';
import { api } from '@atlas/api';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { installedPlugins } = usePlugins();
  const navigate = useNavigate();
  const [inventoryStats, setInventoryStats] = useState<any>(null);

  useEffect(() => {
    if (installedPlugins.includes('inventory')) {
      api.get<any>('/inventory/stats')
        .then(res => setInventoryStats(res))
        .catch(err => console.error('Failed to load inventory stats', err));
    }
  }, [installedPlugins]);

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

          const isInventory = pid === 'inventory';
          const stats = isInventory ? inventoryStats : null;
          const productPct = stats ? (stats.productCount / stats.maxProducts) * 100 : 0;
          const tablePct = stats ? (stats.tableCount / stats.maxTables) * 100 : 0;

          let fillClass = 'fill-normal';
          if (productPct >= 90) fillClass = 'fill-critical';
          else if (productPct >= 80) fillClass = 'fill-warning';

          const isCriticalPulsing = productPct >= 99.5;

          return (
            <div key={pid} className={`dashboard-widget-card ${isCriticalPulsing ? 'pulsing-critical' : ''}`}>
              <div className="widget-header">
                <h3>{plugin.name}</h3>
                <span
                  className="widget-badge"
                  style={isCriticalPulsing ? { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171' } : {}}
                >
                  {isCriticalPulsing ? 'Locked' : 'Active'}
                </span>
              </div>
              <div className="widget-body">
                <p>Status: {isCriticalPulsing ? 'Critical (Locked)' : 'Healthy'}</p>

                {isInventory && stats && (
                  <div className="widget-limits-container">
                    <div className="limit-item">
                      <div className="limit-label">
                        <span>Products Usage</span>
                        <span>{stats.productCount} / {stats.maxProducts} ({productPct.toFixed(1)}%)</span>
                      </div>
                      <div className="limit-progress-bar">
                        <div
                          className={`limit-progress-fill ${fillClass}`}
                          style={{ width: `${Math.min(productPct, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="limit-item">
                      <div className="limit-label">
                        <span>Tables</span>
                        <span>{stats.tableCount} / {stats.maxTables} ({tablePct.toFixed(0)}%)</span>
                      </div>
                      <div className="limit-progress-bar">
                        <div
                          className="limit-progress-fill fill-normal"
                          style={{ width: `${Math.min(tablePct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {isCriticalPulsing && (
                      <div className="critical-message">
                        ⚠️ Limit exceeded (&gt;=99.5%). Upgrade required to add or modify items.
                      </div>
                    )}
                  </div>
                )}

                {!isInventory && (
                  <>
                    <p>Usage: Normal</p>
                  </>
                )}
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

