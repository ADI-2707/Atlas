import React, { useState } from 'react';
import { CustomersList } from '../components/CustomersList';
import { DealsPipeline } from '../components/DealsPipeline';
import './CrmDashboard.css';

export const CrmDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'contacts' | 'pipeline'>('contacts');

  return (
    <div className="crm-dashboard">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1>{activeView === 'contacts' ? 'Contacts & Leads' : 'Sales Pipeline'}</h1>
          <div className="view-toggles" style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface-secondary)', padding: '0.25rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <button
              type="button"
              onClick={() => setActiveView('contacts')}
              style={{
                background: activeView === 'contacts' ? 'var(--color-accent-core)' : 'transparent',
                color: activeView === 'contacts' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem'
              }}
            >
              👥 Contacts
            </button>
            <button
              type="button"
              onClick={() => setActiveView('pipeline')}
              style={{
                background: activeView === 'pipeline' ? 'var(--color-accent-core)' : 'transparent',
                color: activeView === 'pipeline' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem'
              }}
            >
              💼 Deals Pipeline
            </button>
          </div>
        </div>
      </div>

      {activeView === 'contacts' ? (
        <CustomersList />
      ) : (
        <DealsPipeline />
      )}
    </div>
  );
};
