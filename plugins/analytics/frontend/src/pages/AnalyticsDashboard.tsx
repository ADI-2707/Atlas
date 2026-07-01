import React, { useState, useEffect } from 'react';
import './AnalyticsDashboard.css';

interface DashboardProps {
  organizationId?: string;
  tier?: 'free' | 'pro' | 'business' | 'enterprise';
}

export const AnalyticsDashboard: React.FC<DashboardProps> = ({ organizationId = 'org_default_123', tier = 'enterprise' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'anomalies' | 'forecasts'>('overview');
  const [overviewData, setOverviewData] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const canGenerateReports = tier === 'pro' || tier === 'business' || tier === 'enterprise';
  const canViewAnomalies = tier === 'business' || tier === 'enterprise';
  const canViewForecasts = tier === 'enterprise';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, URL configuration and Auth tokens come from an API client
        const headers = { 'Content-Type': 'application/json' };
        
        const dashRes = await fetch(`/api/analytics/dashboard?org_id=${organizationId}`, { headers });
        if (dashRes.ok) setOverviewData(await dashRes.json());

        if (canViewAnomalies) {
          const anomRes = await fetch(`/api/analytics/anomalies?org_id=${organizationId}`, { headers });
          if (anomRes.ok) setAnomalies(await anomRes.json());
        }

        if (canViewForecasts) {
          const foreRes = await fetch(`/api/analytics/forecasts?org_id=${organizationId}`, { headers });
          if (foreRes.ok) setForecasts(await foreRes.json());
        }
      } catch (e) {
        console.error('Failed to fetch analytics', e);
      }
      setLoading(false);
    };

    fetchData();
  }, [tier, canViewAnomalies, canViewForecasts, organizationId]);

  const handleGenerateReport = async () => {
    try {
      const res = await fetch(`/api/analytics/reports/generate?org_id=${organizationId}`, { method: 'POST' });
      if (res.ok) {
        alert('Report generated successfully and is ready for download!');
      } else {
        alert('Failed to generate report.');
      }
    } catch (e) {
      console.error(e);
      alert('Error generating report.');
    }
  };

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header-container" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div className="clean-tabs-bar" style={{ display: 'flex', gap: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`clean-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'overview' ? '2px solid var(--color-accent-analytics, #3b82f6)' : '2px solid transparent',
                color: activeTab === 'overview' ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: '0.5rem 0',
                cursor: 'pointer',
                fontWeight: activeTab === 'overview' ? '600' : '500',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Overview
            </button>
            
            {canViewAnomalies && (
              <button
                type="button"
                onClick={() => setActiveTab('anomalies')}
                className={`clean-tab-btn ${activeTab === 'anomalies' ? 'active' : ''}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'anomalies' ? '2px solid var(--color-accent-analytics, #3b82f6)' : '2px solid transparent',
                  color: activeTab === 'anomalies' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '0.5rem 0',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'anomalies' ? '600' : '500',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Anomaly Detection
              </button>
            )}

            {canViewForecasts && (
              <button
                type="button"
                onClick={() => setActiveTab('forecasts')}
                className={`clean-tab-btn ${activeTab === 'forecasts' ? 'active' : ''}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'forecasts' ? '2px solid var(--color-accent-analytics, #3b82f6)' : '2px solid transparent',
                  color: activeTab === 'forecasts' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '0.5rem 0',
                  cursor: 'pointer',
                  fontWeight: activeTab === 'forecasts' ? '600' : '500',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Predictive Forecasts
              </button>
            )}
          </div>
          
          {canGenerateReports && (
             <button 
               onClick={handleGenerateReport}
               style={{
                 padding: '0.5rem 1rem',
                 background: 'var(--color-accent-analytics, #3b82f6)',
                 color: '#fff',
                 border: 'none',
                 borderRadius: '6px',
                 cursor: 'pointer',
                 fontWeight: '600'
               }}>
               Export PDF Report
             </button>
          )}
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
              <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>Overview</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Revenue</p>
                     <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>${overviewData?.overview?.totalRevenue || 0}</p>
                   </div>
                   <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                     <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active Users</p>
                     <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{overviewData?.overview?.activeUsers || 0}</p>
                   </div>
                </div>
              </div>
            )}
            
            {activeTab === 'anomalies' && canViewAnomalies && (
              <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>Anomaly Detection (Isolation Forest)</h2>
                {anomalies.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No anomalies detected recently.</p>
                ) : (
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '0.5rem' }}>Metric</th>
                        <th>Type</th>
                        <th>Severity</th>
                        <th>Timestamp</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {anomalies.map((a, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.5rem' }}>{a.metric}</td>
                          <td><span style={{ padding: '2px 6px', borderRadius: '4px', background: a.type === 'spike' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: a.type === 'spike' ? '#60a5fa' : '#f87171' }}>{a.type}</span></td>
                          <td>{a.severity}</td>
                          <td>{new Date(a.timestamp).toLocaleDateString()}</td>
                          <td>{a.value.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
            
            {activeTab === 'forecasts' && canViewForecasts && (
              <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>Predictive Forecasts (ARIMA)</h2>
                {forecasts.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>Not enough data for forecasting.</p>
                ) : (
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '0.5rem' }}>Metric</th>
                        <th>Forecast Date</th>
                        <th>Predicted Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecasts.map((f, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '0.5rem' }}>{f.metric}</td>
                          <td>{new Date(f.timestamp).toLocaleDateString()}</td>
                          <td>{f.forecast_value.toFixed(2)}</td>
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
