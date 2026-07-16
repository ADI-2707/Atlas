import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Tabs } from '@atlas/ui';
import { api } from '@atlas/api';
import './AnalyticsDashboard.css';

interface DashboardProps {
  organizationId?: string;
  tier?: 'free' | 'pro' | 'business' | 'enterprise';
}

export const AnalyticsDashboard: React.FC<DashboardProps> = ({ organizationId = 'org_default_123', tier = 'enterprise' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'anomalies' | 'forecasts'>('overview');
  const [subTab, setSubTab] = useState<'hr' | 'crm' | 'inventory'>('hr');
  const [overviewData, setOverviewData] = useState<any>(null);
  const [timeseries, setTimeseries] = useState<any>({});
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const canGenerateReports = tier === 'pro' || tier === 'business' || tier === 'enterprise';
  const canViewAnomalies = tier === 'business' || tier === 'enterprise';
  const canViewForecasts = tier === 'enterprise';

  const fetchData = async () => {
    setLoading(true);
    try {
      // Headers removed as they are handled by api client
      
      const dashRes = await api.get<{ data: any }>(`/analytics/dashboard?org_id=${organizationId}`);
      if (dashRes) setOverviewData(dashRes.data);

      try {
        const tsRes = await api.get<{ data: any }>(`/analytics/timeseries?org_id=${organizationId}`);
        if (tsRes) setTimeseries(tsRes.data);
      } catch (e) { console.warn('timeseries endpoint not available'); }

      if (canViewAnomalies) {
        const anomRes = await api.get<{ data: any }>(`/analytics/anomalies?org_id=${organizationId}`);
        if (anomRes) setAnomalies(anomRes.data);
      }

      if (canViewForecasts) {
        const foreRes = await api.get<{ data: any }>(`/analytics/forecasts?org_id=${organizationId}`);
        if (foreRes) setForecasts(foreRes.data);
      }
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [tier, canViewAnomalies, canViewForecasts, organizationId]);

  const handleGenerateReport = async () => {
    try {
      const res = await api.post<{ data: any }>(`/analytics/reports/generate?org_id=${organizationId}`);
      if (res) {
        alert('Report generated successfully and is ready for download!');
      } else {
        alert('Failed to generate report.');
      }
    } catch (e) {
      console.error(e);
      alert('Error generating report.');
    }
  };

  const handleForceSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const res = await api.post<any>(`/analytics/sync?org_id=${organizationId}`);
      const isSuccess = res.success || res.status === 'success' || (res.data && res.data.status === 'success');
      const msg = res.message || (res.data && res.data.message);
      setSyncMsg(msg || (isSuccess ? 'Sync successful.' : 'Sync failed.'));
      if (isSuccess) {
        fetchData();
      }
    } catch (e) {
      setSyncMsg('Error triggering sync.');
    }
    setSyncing(false);
    setTimeout(() => setSyncMsg(''), 5000);
  };

  const renderOverviewSubTabs = () => {
    const hasData = timeseries && Object.keys(timeseries).length > 0;
    
    return (
      <div style={{ marginTop: '2rem' }}>
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
          <Tabs
            tabs={[
              { id: 'hr', label: 'HR Analytics' },
              { id: 'crm', label: 'CRM Analytics' },
              { id: 'inventory', label: 'Inventory Analytics' }
            ]}
            activeId={subTab}
            onChange={(id) => setSubTab(id as any)}
            accentColor="var(--color-accent-core, #3b82f6)"
          />
        </div>

        <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!hasData ? (
            <p style={{ color: 'var(--text-tertiary)' }}>No timeseries data available. Please add data or force sync.</p>
          ) : (
            <>
              {subTab === 'hr' && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeseries['hr_payroll'] || []}>
                    <defs>
                      <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-accent-core, #8b5cf6)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-accent-core, #8b5cf6)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="timestamp" stroke="var(--text-secondary)" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                    <YAxis stroke="var(--text-secondary)" />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                    <Legend />
                    <Area type="monotone" dataKey="value" name="Payroll Cost ($)" stroke="var(--color-accent-core, #8b5cf6)" fillOpacity={1} fill="url(#colorPayroll)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              {subTab === 'crm' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeseries['crm_deals_won'] || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="timestamp" stroke="var(--text-secondary)" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                    <YAxis stroke="var(--text-secondary)" />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                    <Legend />
                    <Bar dataKey="value" name="Deals Won Value ($)" fill="var(--color-accent-core, #10b981)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {subTab === 'inventory' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeseries['inv_valuation'] || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="timestamp" stroke="var(--text-secondary)" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                    <YAxis stroke="var(--text-secondary)" />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                    <Legend />
                    <Line type="stepAfter" dataKey="value" name="Inventory Valuation ($)" stroke="var(--color-accent-core, #f59e0b)" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header-container" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <Tabs
            tabs={[
              { id: 'overview', label: 'Overview' },
              ...(canViewAnomalies ? [{ id: 'anomalies', label: 'Anomaly Detection' }] : []),
              ...(canViewForecasts ? [{ id: 'forecasts', label: 'Predictive Forecasts' }] : [])
            ]}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as any)}
            accentColor="var(--color-accent-core, #3b82f6)"
          />
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {syncMsg && <span style={{ color: 'var(--color-accent-inventory, #10b981)', fontSize: '0.85rem' }}>{syncMsg}</span>}
            <button 
              onClick={handleForceSync}
              disabled={syncing}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--bg-surface-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md, 6px)',
                cursor: syncing ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: syncing ? 0.7 : 1
              }}>
              {syncing ? 'Syncing...' : 'Force Sync Data'}
            </button>

            {canGenerateReports && (
               <button 
                 onClick={handleGenerateReport}
                 style={{
                   padding: '0.5rem 1rem',
                   background: 'var(--color-accent-core, #3b82f6)',
                   color: '#fff',
                   border: 'none',
                   borderRadius: 'var(--radius-md, 6px)',
                   cursor: 'pointer',
                   fontWeight: '600'
                 }}>
                 Export PDF Report
               </button>
            )}
          </div>
        </div>
      </div>

      <div className="page-reveal" key={activeTab}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Analyzing trends...
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-lg, 12px)', background: 'var(--bg-surface-primary)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>Overview</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                   <div style={{ padding: '1.5rem', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md, 8px)', borderLeft: '4px solid var(--color-accent-inventory, #10b981)' }}>
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Deals Won Revenue</p>
                     <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-accent-inventory, #10b981)' }}>${overviewData?.overview?.totalRevenue?.toLocaleString() || 0}</p>
                   </div>
                   <div style={{ padding: '1.5rem', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md, 8px)', borderLeft: '4px solid var(--color-accent-crm, #8b5cf6)' }}>
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Payroll Expense</p>
                     <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-accent-crm, #8b5cf6)' }}>${overviewData?.overview?.totalPayroll?.toLocaleString() || 0}</p>
                   </div>
                   <div style={{ padding: '1.5rem', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md, 8px)', borderLeft: '4px solid var(--color-accent-inventory, #f59e0b)' }}>
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Inventory Valuation</p>
                     <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-accent-inventory, #f59e0b)' }}>${overviewData?.overview?.inventoryValuation?.toLocaleString() || 0}</p>
                   </div>
                   <div style={{ padding: '1.5rem', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md, 8px)', borderLeft: '4px solid var(--color-accent-core, #3b82f6)' }}>
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active User Sessions</p>
                     <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-accent-core, #3b82f6)' }}>{overviewData?.overview?.activeUsers || 0}</p>
                   </div>
                </div>
                {renderOverviewSubTabs()}
              </div>
            )}
            
            {activeTab === 'anomalies' && canViewAnomalies && (
              <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-lg, 12px)', background: 'var(--bg-surface-primary)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>Anomaly Detection (Isolation Forest)</h2>
                {anomalies.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '1.1rem' }}>No data available to detect anomalies.</p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Please sync data first from other plugins.</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Metric</th>
                        <th style={{ color: 'var(--text-secondary)' }}>Type</th>
                        <th style={{ color: 'var(--text-secondary)' }}>Severity</th>
                        <th style={{ color: 'var(--text-secondary)' }}>Timestamp</th>
                        <th style={{ color: 'var(--text-secondary)' }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {anomalies.map((a, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem 0.5rem', textTransform: 'capitalize', color: 'var(--text-primary)' }}>{a.metric.replace(/_/g, ' ')}</td>
                          <td><span style={{ padding: '2px 6px', borderRadius: '4px', background: a.type === 'spike' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: a.type === 'spike' ? 'var(--color-accent-core, #3b82f6)' : '#ef4444' }}>{a.type}</span></td>
                          <td style={{ color: 'var(--text-primary)' }}>{a.severity}</td>
                          <td style={{ color: 'var(--text-primary)' }}>{new Date(a.timestamp).toLocaleDateString()}</td>
                          <td style={{ color: 'var(--text-primary)' }}>{a.value.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
            
            {activeTab === 'forecasts' && canViewForecasts && (
              <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-lg, 12px)', background: 'var(--bg-surface-primary)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>Predictive Forecasts (ARIMA)</h2>
                {forecasts.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '1.1rem' }}>No data available for predictive forecasts.</p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Please sync data first from other plugins.</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>Metric</th>
                        <th style={{ color: 'var(--text-secondary)' }}>Forecast Date</th>
                        <th style={{ color: 'var(--text-secondary)' }}>Predicted Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecasts.map((f, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem 0.5rem', textTransform: 'capitalize', color: 'var(--text-primary)' }}>{f.metric.replace(/_/g, ' ')}</td>
                          <td style={{ color: 'var(--text-primary)' }}>{new Date(f.timestamp).toLocaleDateString()}</td>
                          <td style={{ color: 'var(--text-primary)' }}>{f.forecast_value.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
