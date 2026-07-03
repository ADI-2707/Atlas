import React, { useEffect, useState } from 'react';
import { api } from '@atlas/api';
import './Team.css';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
}

export const Team: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users', formData);
      setShowModal(false);
      setFormData({ firstName: '', lastName: '', email: '', password: '' });
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
            
            <form onSubmit={handleCreateUser}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Temporary Password</label>
                <input 
                  type="password" 
                  required 
                  minLength={8}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <small>Give this password to your employee so they can sign in.</small>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
