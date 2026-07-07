import React, { useEffect, useState } from 'react';
import { api } from '@atlas/api';
import { FormBuilder } from '@atlas/forms';
import { z } from 'zod';
import './Team.css';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
}

const CreateEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const Team: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.get<User[]>('/users');
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (data: z.infer<typeof CreateEmployeeSchema>) => {
    setError('');
    try {
      await api.post('/users', data);
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create user.');
    }
  };

  return (
    <div className="team-page">
      <div className="page-header">
        <div>
          <h1>Team Management</h1>
          <p>Manage your organization's employees and their access.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Employee
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading team...</div>
      ) : (
        <div className="table-container glass-panel">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-name">
                      <div className="avatar">
                        {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                      </div>
                      <span>{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge badge-${u.status.toLowerCase()}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4">No team members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <h2>Add New Employee</h2>
            <p>They will be added to your organization instantly.</p>
            {error && <div className="error-message">{error}</div>}
            
            <FormBuilder
              schema={CreateEmployeeSchema}
              onSubmit={handleCreateUser}
              submitLabel="Create Account"
              fields={[
                { name: 'firstName', label: 'First Name', type: 'text' },
                { name: 'lastName', label: 'Last Name', type: 'text' },
                { name: 'email', label: 'Email Address', type: 'email' },
                { name: 'password', label: 'Temporary Password', type: 'text' },
              ]}
            />
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
