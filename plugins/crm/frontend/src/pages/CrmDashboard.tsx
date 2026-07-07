import React, { useState, useEffect } from 'react';
import { api } from '@atlas/api';
import { Button, Tabs } from '@atlas/ui';
import { CustomersList } from '../components/CustomersList';
import { DealsPipeline } from '../components/DealsPipeline';
import { CrmActivityLogs } from '../components/CrmActivityLogs';
import './CrmDashboard.css';

interface LimitStats {
  tier: string;
  usage: { customers: number; deals: number };
  limits: { customers: number; deals: number };
}

export const CrmDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'contacts' | 'pipeline' | 'logs'>('contacts');
  const [stats, setStats] = useState<LimitStats | null>(null);
  const [addContactTrigger, setAddContactTrigger] = useState(0);
  const [addDealTrigger, setAddDealTrigger] = useState(0);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get<{ data: LimitStats }>('/crm/limits');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const handleRefreshStats = () => {
    fetchStats();
  };

  const isContactLocked = stats && stats.limits.customers !== -1 ? stats.usage.customers >= stats.limits.customers : false;
  const isDealLocked = stats && stats.limits.deals !== -1 ? stats.usage.deals >= stats.limits.deals : false;

  return (
    <div className="crm-dashboard">
      <div className="dashboard-header-container" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <Tabs
            tabs={[
              { id: 'contacts', label: 'Contacts & Leads' },
              { id: 'pipeline', label: 'Deals Pipeline' },
              { id: 'logs', label: 'Activity Logs' }
            ]}
            activeId={activeView}
            onChange={(id) => setActiveView(id as any)}
            accentColor="var(--color-accent-crm)"
          />

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {activeView === 'contacts' && (
              <Button
                variant="primary"
                size="small"
                disabled={isContactLocked}
                onClick={() => setAddContactTrigger(prev => prev + 1)}
                title={isContactLocked ? "Contact limit reached. Upgrade plan to add contacts." : ""}
              >
                Add Contact
              </Button>
            )}
            {activeView === 'pipeline' && (
              <Button
                variant="primary"
                size="small"
                disabled={isDealLocked}
                onClick={() => setAddDealTrigger(prev => prev + 1)}
                title={isDealLocked ? "Deal limit reached. Upgrade plan to add deals." : ""}
              >
                New Deal
              </Button>
            )}
          </div>
        </div>

        {activeView === 'contacts' && stats && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', marginBottom: '0.5rem' }}>
            <span className="capacity-badge" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-surface-tertiary)', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontWeight: 500 }}>
              Contacts: {stats.usage.customers} / {stats.limits.customers === -1 ? 'Unlimited' : stats.limits.customers}
            </span>
            <span className="capacity-badge" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-surface-tertiary)', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontWeight: 500 }}>
              Deals: {stats.usage.deals} / {stats.limits.deals === -1 ? 'Unlimited' : stats.limits.deals}
            </span>
          </div>
        )}
      </div>

      <div className="page-reveal" key={activeView}>
        {activeView === 'contacts' ? (
          <CustomersList addTrigger={addContactTrigger} onStatsChanged={handleRefreshStats} />
        ) : activeView === 'pipeline' ? (
          <DealsPipeline addTrigger={addDealTrigger} onStatsChanged={handleRefreshStats} />
        ) : (
          <CrmActivityLogs />
        )}
      </div>
    </div>
  );
};
