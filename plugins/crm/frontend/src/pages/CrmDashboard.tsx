import React, { useState } from 'react';
import { CustomersList } from '../components/CustomersList';
import { DealsPipeline } from '../components/DealsPipeline';
import './CrmDashboard.css';

export const CrmDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'contacts' | 'pipeline'>('contacts');

  return (
    <div className="crm-dashboard">
      <div className="dashboard-header-container" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0', marginBottom: '1.5rem' }}>

        <div className="clean-tabs-bar" style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveView('contacts')}
            className={`clean-tab-btn ${activeView === 'contacts' ? 'active' : ''}`}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeView === 'contacts' ? '2px solid var(--color-accent-crm)' : '2px solid transparent',
              color: activeView === 'contacts' ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '0.5rem 0',
              cursor: 'pointer',
              fontWeight: activeView === 'contacts' ? '600' : '500',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Contacts & Leads
          </button>
          <button
            type="button"
            onClick={() => setActiveView('pipeline')}
            className={`clean-tab-btn ${activeView === 'pipeline' ? 'active' : ''}`}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeView === 'pipeline' ? '2px solid var(--color-accent-crm)' : '2px solid transparent',
              color: activeView === 'pipeline' ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '0.5rem 0',
              cursor: 'pointer',
              fontWeight: activeView === 'pipeline' ? '600' : '500',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Deals Pipeline
          </button>
        </div>
      </div>

      <div className="page-reveal" key={activeView}>
        {activeView === 'contacts' ? (
          <CustomersList />
        ) : (
          <DealsPipeline />
        )}
      </div>
    </div>
  );
};
