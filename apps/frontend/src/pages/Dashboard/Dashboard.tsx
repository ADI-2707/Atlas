import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@atlas/auth';
import { usePlugins } from '../../contexts/PluginContext';
import { Dashboard as DashboardEngine } from '@atlas/dashboard';
import { WidgetRegistry } from '@atlas/widgets';
import { InventoryWidget, CrmWidget, HrWidget, AnalyticsWidget, PmWidget } from './widgets';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { installedPlugins } = usePlugins();
  const { user } = useAuth();
  const navigate = useNavigate();

  const registry = useMemo(() => {
    const reg = new WidgetRegistry();
    if (installedPlugins.includes('inventory')) {
      reg.register({
        id: 'inventory',
        name: 'Inventory',
        description: 'Inventory management widget',
        component: InventoryWidget,
        defaultWidth: 4, defaultHeight: 6,
      });
    }
    if (installedPlugins.includes('crm')) {
      reg.register({
        id: 'crm',
        name: 'CRM',
        description: 'Customer relationship management widget',
        component: CrmWidget,
        defaultWidth: 4, defaultHeight: 6,
      });
    }
    if (installedPlugins.includes('hr')) {
      reg.register({
        id: 'hr',
        name: 'HR',
        description: 'Human resources widget',
        component: HrWidget,
        defaultWidth: 4, defaultHeight: 6,
      });
    }
    if (installedPlugins.includes('analytics')) {
      reg.register({
        id: 'analytics',
        name: 'Analytics',
        description: 'Analytics overview widget',
        component: AnalyticsWidget,
        defaultWidth: 4, defaultHeight: 6,
      });
    }
    if (installedPlugins.includes('project-management')) {
      reg.register({
        id: 'project-management',
        name: 'Project Management',
        description: 'Project management widget',
        component: PmWidget,
        defaultWidth: 4, defaultHeight: 6,
      });
    }
    return reg;
  }, [installedPlugins]);

  return (
    <div className="dashboard-active-state">
      {installedPlugins.length === 0 && (
        <div className="dashboard-empty-state">
          <div className="dashboard-empty-icon">🧩</div>
          <h2 className="dashboard-empty-title">
            Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! Your workspace is empty.
          </h2>
          <p className="dashboard-empty-sub">
            You haven't added any plugins yet. Install your first plugin to start
            using Atlas — CRM, Inventory, HR, Analytics and more.
          </p>
          <button
            className="dashboard-empty-btn"
            onClick={() => navigate('/store')}
          >
            <span>+</span> Add Plugin
          </button>
        </div>
      )}

      {installedPlugins.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <DashboardEngine registry={registry} />
        </div>
      )}
    </div>
  );
};
