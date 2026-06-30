import React, { useState } from 'react';
import { Button } from '@atlas/ui';
import { EmployeesList } from '../components/EmployeesList';
import { PayrollList } from '../components/PayrollList';
import { AddEmployeeModal } from '../components/AddEmployeeModal.tsx';
import { RunPayrollModal } from '../components/RunPayrollModal.tsx';
import './HrDashboard.css';

export const HrDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'employees' | 'payroll'>('employees');
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);

  const [refreshEmployees, setRefreshEmployees] = useState(0);
  const [refreshPayroll, setRefreshPayroll] = useState(0);

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
            <Button variant="primary" size="small" onClick={() => setIsEmployeeModalOpen(true)}>
              Add Employee
            </Button>
          ) : (
            <Button variant="primary" size="small" onClick={() => setIsPayrollModalOpen(true)}>
              Run Payroll
            </Button>
          )}
        </div>

        <div className="hr-stats-cards">
          <div className="hr-stat-card">
            <span className="hr-stat-label">Total Employees</span>
            <span className="hr-stat-value">0</span>
          </div>
          <div className="hr-stat-card">
            <span className="hr-stat-label">On Leave</span>
            <span className="hr-stat-value">0</span>
          </div>
          <div className="hr-stat-card">
            <span className="hr-stat-label">Monthly Payroll</span>
            <span className="hr-stat-value">$0</span>
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
          <EmployeesList key={refreshEmployees} />
        ) : (
          <PayrollList key={refreshPayroll} />
        )}
      </div>

      <AddEmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSuccess={() => setRefreshEmployees(prev => prev + 1)}
      />

      <RunPayrollModal
        isOpen={isPayrollModalOpen}
        onClose={() => setIsPayrollModalOpen(false)}
        onSuccess={() => setRefreshPayroll(prev => prev + 1)}
      />
    </div>
  );
};
