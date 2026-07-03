import React, { useEffect, useState } from 'react';
import { api } from '@atlas/api';

interface AdminMetrics {
  totalOrganizations: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  pluginUsage: { pluginId: string; name: string; installs: number }[];
}

export const Admin: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await api.get<AdminMetrics>('/admin/metrics');
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch admin metrics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>Loading Super Admin Dashboard...</div>;
  }

  if (!metrics) {
    return <div style={{ padding: '2rem', color: 'var(--color-danger)' }}>Error loading metrics. You may not have Super Admin permissions.</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: 'var(--text-primary)' }}>Super Admin Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: 'var(--surface-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem' }}>Total Organizations</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {metrics.totalOrganizations}
          </p>
        </div>
        
        <div style={{ background: 'var(--surface-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem' }}>Active Subscriptions</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {metrics.activeSubscriptions}
          </p>
        </div>

        <div style={{ background: 'var(--surface-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem' }}>MRR</h3>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2.5rem', fontWeight: 600, color: '#10b981' }}>
            ${metrics.monthlyRecurringRevenue}
          </p>
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Plugin Distribution</h2>
      <div style={{ background: 'var(--surface-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Plugin ID</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Name</th>
              <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Installs</th>
            </tr>
          </thead>
          <tbody>
            {metrics.pluginUsage.map(p => (
              <tr key={p.pluginId}>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{p.pluginId}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{p.name}</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{p.installs}</td>
              </tr>
            ))}
            {metrics.pluginUsage.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No plugins available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
