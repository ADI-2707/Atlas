import React, { useEffect, useState } from 'react';
import { api } from '@atlas/api';
import { RolesConfig } from './RolesConfig';
import './Team.css';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
  roles: { id: string; name: string }[];
}

interface Role {
  id: string;
  name: string;
  description: string;
}

interface Invitation {
  id: string;
  email: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  roleIds: string[];
}

export const Team: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'roles'>('members');

  const fetchUsers = async () => {
    try {
      const res = await api.get<{ success: boolean; data: User[] }>('/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchInvitations = async () => {
    try {
      const res = await api.get<{ success: boolean; data: Invitation[] }>('/invitations');
      setInvitations(res.data || []);
    } catch (err) {
      console.error('Failed to fetch invitations:', err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get<{ success: boolean; data: Role[] }>('/roles');
      setRoles(res.data || []);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchInvitations(), fetchRoles()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedRoleIds.length === 0) {
      setError('Please select at least one role.');
      return;
    }

    try {
      await api.post('/invitations', {
        email,
        roleIds: selectedRoleIds,
      });
      setShowModal(false);
      setEmail('');
      setSelectedRoleIds([]);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation.');
    }
  };

  const handleRevokeInvite = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) return;
    try {
      await api.delete(`/invitations/${id}`);
      loadData();
    } catch (err) {
      console.error('Failed to revoke invitation:', err);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  };

  const getRoleNames = (roleIds: string[]) => {
    return roleIds
      .map((id) => roles.find((r) => r.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="team-page">
      <div className="page-header">
        <div>
          <h1>Team Management</h1>
          <p>Manage your organization's employees, pending invites, and access roles.</p>
        </div>
        {activeTab === 'members' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Invite Employee
          </button>
        )}
      </div>

      {/* Tabs Header */}
      <div className="tabs-header" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <button
          className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'members' ? '2px solid var(--color-primary)' : 'none',
            color: activeTab === 'members' ? 'var(--text-primary)' : 'var(--text-secondary)',
            padding: '0.75rem 1rem',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '1rem',
          }}
        >
          Members & Invites
        </button>
        <button
          className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'roles' ? '2px solid var(--color-primary)' : 'none',
            color: activeTab === 'roles' ? 'var(--text-primary)' : 'var(--text-secondary)',
            padding: '0.75rem 1rem',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '1rem',
          }}
        >
          Roles & Permissions
        </button>
      </div>

      {activeTab === 'members' ? (
        loading ? (
          <div className="loading">Loading team...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Active Members Section */}
          <div>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Active Members</h2>
            <div className="table-container glass-panel">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Roles</th>
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
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          {u.roles.map((r) => r.name).join(', ') || 'Standard User'}
                        </span>
                      </td>
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
                      <td colSpan={5} className="text-center py-4">No team members found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Invitations Section */}
          <div>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>Pending Invitations</h2>
            <div className="table-container glass-panel">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Invited Email</th>
                    <th>Roles Assigned</th>
                    <th>Status</th>
                    <th>Expires At</th>
                    <th>Sent Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((i) => {
                    const isExpired = new Date(i.expiresAt) < new Date();
                    const finalStatus = i.status === 'PENDING' && isExpired ? 'EXPIRED' : i.status;
                    return (
                      <tr key={i.id}>
                        <td>{i.email}</td>
                        <td>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {getRoleNames(i.roleIds) || 'Standard User'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${finalStatus.toLowerCase()}`}>
                            {finalStatus}
                          </span>
                        </td>
                        <td>{new Date(i.expiresAt).toLocaleDateString()}</td>
                        <td>{new Date(i.createdAt).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          {i.status === 'PENDING' && (
                            <button
                              className="btn btn-ghost"
                              style={{ color: 'var(--color-danger)', padding: '0.25rem 0.5rem' }}
                              onClick={() => handleRevokeInvite(i.id)}
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {invitations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-4">No pending invitations found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    ) : (
      <RolesConfig />
    )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '550px' }}>
            <h2>Invite New Employee</h2>
            <p>They will receive a secure registration link to create their profile.</p>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleInviteUser}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="employee@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ marginBottom: '0.75rem' }}>Assign Roles</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  {roles.map((role) => (
                    <label key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={selectedRoleIds.includes(role.id)}
                        onChange={() => handleRoleToggle(role.id)}
                        style={{ cursor: 'pointer' }}
                      />
                      <div>
                        <strong>{role.name}</strong> - <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{role.description}</span>
                      </div>
                    </label>
                  ))}
                  {roles.length === 0 && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No custom roles available.</div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowModal(false); setError(''); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
