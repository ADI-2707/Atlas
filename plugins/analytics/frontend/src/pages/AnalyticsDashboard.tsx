import React, { useState } from 'react';
import './AnalyticsDashboard.css';

export const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'anomalies' | 'forecasts'>('overview');

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
          </div>
        </div>
      </div>

      <div className="page-reveal" key={activeTab}>
        {activeTab === 'overview' && (
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>Overview</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Real-time KPIs and system metrics.</p>
          </div>
        )}
        {activeTab === 'anomalies' && (
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>Anomaly Detection</h2>
            <p style={{ color: 'var(--text-secondary)' }}>AI-powered anomaly detection alerts using Isolation Forest.</p>
          </div>
        )}
        {activeTab === 'forecasts' && (
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>Predictive Forecasts</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Machine learning predictions for upcoming trends (ARIMA).</p>
          </div>
        )}
      </div>
    </div>
  );
};
