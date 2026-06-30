import React, { useState } from 'react';
import { Button } from '@atlas/ui';
import { EmployeesList } from '../components/EmployeesList';
import { PayrollList } from '../components/PayrollList';
import './HrDashboard.css';

export const HrDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'employees' | 'payroll'>('employees');

  return (
    <div className="hr-dashboard">
      <div className="hr-header-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Human Resources</h1>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Manage your employees and payroll seamlessly.
            </p>
          </div>
          {activeView === 'employees' ? (
            <Button variant="primary" size="small">
              Add Employee
            </Button>
          ) : (
            <Button variant="primary" size="small">
              Run Payroll
            </Button>
          )}
        </div>

        <div className="hr-stats-cards">
          <div className="hr-stat-card">
            <span className="hr-stat-label">Total Employees</span>
            <span className="hr-stat-value">124</span>
          </div>
          <div className="hr-stat-card">
            <span className="hr-stat-label">On Leave</span>
            <span className="hr-stat-value">12</span>
          </div>
          <div className="hr-stat-card">
            <span className="hr-stat-label">Monthly Payroll</span>
            <span className="hr-stat-value">$424,500</span>
          </div>
        </div>

        <div className="clean-tabs-bar" style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => setActiveView('employees')}
            className={`clean-tab-btn ${activeView === 'employees' ? 'active' : ''}`}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeView === 'employees' ? '2px solid var(--color-accent-core)' : '2px solid transparent',
              color: activeView === 'employees' ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '0.75rem 0',
              cursor: 'pointer',
              fontWeight: activeView === 'employees' ? '600' : '500',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Employees
          </button>
          <button
            type="button"
            onClick={() => setActiveView('payroll')}
            className={`clean-tab-btn ${activeView === 'payroll' ? 'active' : ''}`}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeView === 'payroll' ? '2px solid var(--color-accent-core)' : '2px solid transparent',
              color: activeView === 'payroll' ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '0.75rem 0',
              cursor: 'pointer',
              fontWeight: activeView === 'payroll' ? '600' : '500',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Payroll
          </button>
        </div>
      </div>

      <div className="page-reveal" key={activeView} style={{ marginTop: '1.5rem' }}>
        {activeView === 'employees' ? (
          <EmployeesList />
        ) : (
          <PayrollList />
        )}
      </div>
    </div>
  );
};
