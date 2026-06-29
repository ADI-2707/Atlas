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
  const [crmStats, setCrmStats] = useState<any>(null);

  const formatCurrency = (value: number) =>
    value.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });

  useEffect(() => {
    if (installedPlugins.includes('inventory')) {
      api.get<any>('/inventory/stats')
        .then(res => setInventoryStats(res.data))
        .catch(err => console.error('Failed to load inventory stats', err));
    }
    if (installedPlugins.includes('crm')) {
      api.get<any>('/crm/limits')
        .then(res => setCrmStats(res.data))
        .catch(err => console.error('Failed to load crm stats', err));
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
          const isCrm = pid === 'crm';
          
          let fillClass = 'fill-normal';
          let contactsFillClass = 'fill-normal';
          let dealsFillClass = 'fill-normal';
          let isCriticalPulsing = false;
          let productPct = 0;
          let contactsPct = 0;
          let dealsPct = 0;

          if (isInventory && inventoryStats) {
            productPct = (inventoryStats.productCount / inventoryStats.maxProducts) * 100;
            if (productPct >= 90) fillClass = 'fill-critical';
            else if (productPct >= 80) fillClass = 'fill-warning';
            isCriticalPulsing = productPct >= 99.5;
          } else if (isCrm && crmStats) {
            contactsPct = crmStats.limits.customers === -1 ? 0 : (crmStats.usage.customers / crmStats.limits.customers) * 100;
            dealsPct = crmStats.limits.deals === -1 ? 0 : (crmStats.usage.deals / crmStats.limits.deals) * 100;
            
            if (contactsPct >= 90) contactsFillClass = 'fill-critical';
            else if (contactsPct >= 80) contactsFillClass = 'fill-warning';
            
            if (dealsPct >= 90) dealsFillClass = 'fill-critical';
            else if (dealsPct >= 80) dealsFillClass = 'fill-warning';
            
            const maxPct = Math.max(contactsPct, dealsPct);
            isCriticalPulsing = maxPct >= 99.5;
          }

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

                {isInventory && inventoryStats && (
                  <div className="widget-limits-container">
                    <div className="limit-item">
                      <div className="limit-label">
                        <span>Products Usage</span>
                        <span>{inventoryStats.productCount} / {inventoryStats.maxProducts} ({productPct.toFixed(1)}%) &mdash; {Math.max(0, inventoryStats.maxProducts - inventoryStats.productCount)} left</span>
                      </div>
                      <div className="limit-progress-bar">
                        <div
                          className={`limit-progress-fill ${fillClass}`}
                          style={{ width: `${Math.min(productPct, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="limit-item">
                      <div className="limit-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Tables</span>
                        {inventoryStats.tableCount > inventoryStats.maxTables ? (
                          <span>
                            <span style={{ color: '#4ade80', fontWeight: 600 }}>{inventoryStats.maxTables} Active</span>
                            {', '}
                            <span style={{ color: '#f87171', fontWeight: 600 }}>{inventoryStats.tableCount - inventoryStats.maxTables} Locked</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginLeft: '6px' }}>
                              (Upgrade to unlock)
                            </span>
                          </span>
                        ) : (
                          <span>
                            <span style={{ color: '#4ade80', fontWeight: 600 }}>{inventoryStats.tableCount}</span>
                            {` / ${inventoryStats.maxTables}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {isCriticalPulsing && (
                      <div className="critical-message">
                        ⚠️ Limit exceeded (&gt;=99.5%). Upgrade required to add or modify items.
                      </div>
                    )}
                  </div>
                )}

                {isCrm && crmStats && (
                  <div className="widget-limits-container">
                    <div className="limit-item">
                      <div className="limit-label">
                        <span>Contacts Usage</span>
                        <span>
                          {crmStats.limits.customers === -1 
                            ? `${crmStats.usage.customers} (Unlimited)`
                            : `${crmStats.usage.customers} / ${crmStats.limits.customers} (${contactsPct.toFixed(1)}%) &mdash; ${Math.max(0, crmStats.limits.customers - crmStats.usage.customers)} left`}
                        </span>
                      </div>
                      <div className="limit-progress-bar">
                        <div
                          className={`limit-progress-fill ${contactsFillClass}`}
                          style={{ width: `${crmStats.limits.customers === -1 ? 0 : Math.min(contactsPct, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="crm-usage-grid">
                      <div className="crm-usage-metric">
                        <span>Leads</span>
                        <strong>{crmStats.usage.customerStatuses?.lead || 0}</strong>
                      </div>
                      <div className="crm-usage-metric">
                        <span>Prospects</span>
                        <strong>{crmStats.usage.customerStatuses?.prospect || 0}</strong>
                      </div>
                      <div className="crm-usage-metric">
                        <span>Customers</span>
                        <strong>{crmStats.usage.customerStatuses?.customer || 0}</strong>
                      </div>
                      <div className="crm-usage-metric">
                        <span>Churned</span>
                        <strong>{crmStats.usage.customerStatuses?.churned || 0}</strong>
                      </div>
                    </div>
                    
                    <div className="limit-item">
                      <div className="limit-label">
                        <span>Deals Pipeline</span>
                        <span>
                          {crmStats.limits.deals === -1 
                            ? `${crmStats.usage.deals} (Unlimited)`
                            : `${crmStats.usage.deals} / ${crmStats.limits.deals} (${dealsPct.toFixed(1)}%) &mdash; ${Math.max(0, crmStats.limits.deals - crmStats.usage.deals)} left`}
                        </span>
                      </div>
                      <div className="limit-progress-bar">
                        <div
                          className={`limit-progress-fill ${dealsFillClass}`}
                          style={{ width: `${crmStats.limits.deals === -1 ? 0 : Math.min(dealsPct, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="crm-usage-grid">
                      <div className="crm-usage-metric">
                        <span>Qualification</span>
                        <strong>{crmStats.usage.dealStages?.qualification || 0}</strong>
                      </div>
                      <div className="crm-usage-metric">
                        <span>Proposal</span>
                        <strong>{crmStats.usage.dealStages?.proposal || 0}</strong>
                      </div>
                      <div className="crm-usage-metric">
                        <span>Negotiation</span>
                        <strong>{crmStats.usage.dealStages?.negotiation || 0}</strong>
                      </div>
                      <div className="crm-usage-metric">
                        <span>Won / Lost</span>
                        <strong>{crmStats.usage.dealStages?.closedWon || 0} / {crmStats.usage.dealStages?.closedLost || 0}</strong>
                      </div>
                    </div>

                    <div className="crm-value-summary">
                      <div>
                        <span>Total Pipeline</span>
                        <strong>{formatCurrency(crmStats.usage.pipelineValue || 0)}</strong>
                      </div>
                      <div>
                        <span>Closed Won</span>
                        <strong>{formatCurrency(crmStats.usage.closedWonValue || 0)}</strong>
                      </div>
                    </div>

                    {isCriticalPulsing && (
                      <div className="critical-message">
                        ⚠️ Limit exceeded (&gt;=99.5%). Upgrade required to add or modify CRM items.
                      </div>
                    )}
                  </div>
                )}

                {!isInventory && !isCrm && (
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

