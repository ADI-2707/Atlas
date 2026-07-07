import React, { useState } from 'react';
import { Button, Tabs } from '@atlas/ui';
import { EmployeesList } from '../components/EmployeesList';
import { PayrollList } from '../components/PayrollList';
import { AddEmployeeModal } from '../components/AddEmployeeModal.tsx';
import { RunPayrollModal } from '../components/RunPayrollModal.tsx';
import { HrActivityLogs } from '../components/HrActivityLogs.tsx';
import './HrDashboard.css';

export const HrDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'employees' | 'payroll' | 'logs'>('employees');
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);

  const [refreshEmployees, setRefreshEmployees] = useState(0);
  const [refreshPayroll, setRefreshPayroll] = useState(0);

  return (
    <div className="hr-dashboard">
      <div className="hr-header-container" style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <Tabs
            tabs={[
              { id: 'employees', label: 'Employees' },
              { id: 'payroll', label: 'Payroll' },
              { id: 'logs', label: 'Logs' }
            ]}
            activeId={activeView}
            onChange={(id) => setActiveView(id as any)}
            accentColor="var(--color-accent-core)"
          />

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

        {activeView === 'employees' && (
          <div className="hr-stats-cards" style={{ marginTop: '1rem' }}>
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
              <span className="hr-stat-value">₹0</span>
            </div>
          </div>
        )}
      </div>

      <div className="page-reveal" key={activeView} style={{ marginTop: '1.5rem' }}>
        {activeView === 'employees' && <EmployeesList key={refreshEmployees} />}
        {activeView === 'payroll' && <PayrollList key={refreshPayroll} />}
        {activeView === 'logs' && <HrActivityLogs />}
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
