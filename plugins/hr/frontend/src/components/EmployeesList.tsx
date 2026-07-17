import React, { useEffect, useState } from 'react';
import { api } from '@atlas/api';
import { Employee } from '../types/hr.types';

export const EmployeesList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/hr/employees');
      const employeesArray = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      if (employeesArray.length === 0) {
        setEmployees([]);
      } else {
        const mappedEmployees = employeesArray.map((emp: any) => ({
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          department: emp.department?.name || '',
          role: emp.jobTitle || '',
          status: (emp.status || '').toLowerCase(),
          joinDate: emp.hireDate || '',
        }));
        setEmployees(mappedEmployees);
      }
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
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
