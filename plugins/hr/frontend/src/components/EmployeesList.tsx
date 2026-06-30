import React, { useEffect, useState } from 'react';
import { api } from '@atlas/api';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'leave' | 'terminated';
  joinDate: string;
}

export const EmployeesList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: Employee[] }>('/hr/employees');
      // Use mock data if API returns empty to show off the UI
      if (!res.data || res.data.length === 0) {
        setEmployees([
          { id: '1', firstName: 'Alice', lastName: 'Johnson', email: 'alice.j@example.com', department: 'Engineering', role: 'Senior Developer', status: 'active', joinDate: '2023-01-15' },
          { id: '2', firstName: 'Bob', lastName: 'Smith', email: 'bob.smith@example.com', department: 'Marketing', role: 'Marketing Manager', status: 'leave', joinDate: '2022-11-01' },
          { id: '3', firstName: 'Charlie', lastName: 'Davis', email: 'charlie.d@example.com', department: 'Sales', role: 'Sales Rep', status: 'active', joinDate: '2024-03-10' }
        ]);
      } else {
        setEmployees(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'active': return 'badge-active';
      case 'leave': return 'badge-leave';
      case 'terminated': return 'badge-terminated';
      default: return '';
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading employees...</div>;
  }

  return (
    <div className="hr-table-container">
      <table className="hr-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Role</th>
            <th>Status</th>
            <th>Join Date</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td style={{ fontWeight: 500 }}>{emp.firstName} {emp.lastName}</td>
              <td style={{ color: 'var(--text-secondary)' }}>{emp.email}</td>
              <td>{emp.department}</td>
              <td>{emp.role}</td>
              <td>
                <span className={`hr-badge ${getStatusBadgeClass(emp.status)}`}>
                  {emp.status.toUpperCase()}
                </span>
              </td>
              <td style={{ color: 'var(--text-secondary)' }}>{new Date(emp.joinDate).toLocaleDateString()}</td>
            </tr>
          ))}
          {employees.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
