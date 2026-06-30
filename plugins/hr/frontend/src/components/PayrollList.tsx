import React, { useEffect, useState } from 'react';
import { api } from '@atlas/api';
import { PayrollRecord } from '../../../shared';

export const PayrollList: React.FC = () => {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: PayrollRecord[] }>('/hr/payroll');

      if (!res.data || res.data.length === 0) {
        setRecords([]);
      } else {
        setRecords(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch payroll', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid': return 'badge-active';
      case 'pending': return 'badge-leave';
      case 'processed': return 'badge-active';
      default: return '';
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading payroll records...</div>;
  }

  return (
    <div className="hr-table-container">
      <table className="hr-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Amount</th>
            <th>Period</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => (
            <tr key={record.id}>
              <td style={{ fontWeight: 500 }}>{record.employeeId}</td>
              <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: record.currency }).format(record.amount)}
              </td>
              <td style={{ color: 'var(--text-secondary)' }}>
                {new Date(record.periodStart).toLocaleDateString()} - {new Date(record.periodEnd).toLocaleDateString()}
              </td>
              <td>
                <span className={`hr-badge ${getStatusBadgeClass(record.status)}`}>
                  {record.status.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No payroll records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
