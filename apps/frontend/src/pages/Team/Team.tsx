import React, { useEffect, useState } from 'react';
import { api } from '@atlas/api';
import { useAuth } from '@atlas/auth';
import { useToast } from '../../lib/toast/ToastContext';
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
  const { user } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'roles' | 'subscription'>('members');

  const orgTier = user?.orgTier || 'starter';
  const currentSeats = users.length + invitations.filter(i => i.status === 'PENDING').length;
  
  let limitSeats = 25;
  if (orgTier === 'enterprise') limitSeats = 9999;
  else if (orgTier === 'custom') limitSeats = 1000;
  
  const isLimitReached = currentSeats >= limitSeats;

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

    if (isLimitReached) {
      setError(`Seat limit reached for your current plan (${orgTier.toUpperCase()}). Please upgrade.`);
      showToast('Capacity Limit Reached', `You have used ${currentSeats} of ${limitSeats} seats. Upgrade to add more users.`, 'error');
      return;
    }

    if (selectedRoleIds.length === 0) {
      setError('Please select at least one role.');
      return;
    }

    try {
      await api.post('/invitations', {
        email,
        roleIds: selectedRoleIds,
      });
      showToast('Invitation Sent', `A secure onboarding link has been sent to ${email}`, 'success');
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
      showToast('Invitation Revoked', 'The pending onboarding invitation has been revoked.', 'warning');
      loadData();
    } catch (err) {
      showToast('Error', 'Failed to revoke invitation.', 'error');
    }
  };

  const handleUpdatePlan = async (newTier: string) => {
    if (newTier === 'starter' && currentSeats > 25) {
      showToast(
        'Downgrade Blocked', 
        `Your organization currently utilizes ${currentSeats} seats. Starter plan allows max 25 seats. Remove members/invitations first.`, 
        'error'
      );
      return;
    }
    
    if (newTier === 'custom' && currentSeats > 1000) {
      showToast(
        'Downgrade Blocked', 
        `Your organization currently utilizes ${currentSeats} seats. Custom plan allows max 1000 seats.`, 
        'error'
      );
      return;
    }

    try {
      await api.patch('/users/organization/tier', { tier: newTier });
      showToast(
        'Subscription Updated', 
        `Successfully changed organization workspace plan to ${newTier.toUpperCase()}. Syncing page state...`, 
        'success'
      );
      
      const stored = localStorage.getItem('atlas_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.orgTier = newTier;
        localStorage.setItem('atlas_user', JSON.stringify(parsed));
      }
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      showToast('Update Failed', err instanceof Error ? err.message : 'Could not change subscription plan.', 'error');
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
        <button
          className={`tab-btn ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscription')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'subscription' ? '2px solid var(--color-primary)' : 'none',
            color: activeTab === 'subscription' ? 'var(--text-primary)' : 'var(--text-secondary)',
            padding: '0.75rem 1rem',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '1rem',
          }}
        >
          Subscription Plan
        </button>
      </div>

      {activeTab === 'members' ? (
        loading ? (
          <div className="loading">Loading team...</div>
        ) : users.length <= 1 && invitations.length === 0 ? (
          <div className="team-empty-state glass-panel">
            <div className="empty-state-icon-wrapper">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Assemble Your Dream Team</h3>
            <p>
              Invite developers, administrators, and collaborators to join your organization on Atlas. 
              Assign roles, manage access controls, and build together.
            </p>
            <button className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 600 }} onClick={() => setShowModal(true)} disabled={isLimitReached}>
              Invite Your First Member
            </button>
            <div className="empty-state-limit">
              <span>Plan Capacity: {currentSeats} of {limitSeats === 9999 ? 'Unlimited' : limitSeats} seats used ({orgTier.toUpperCase()} plan)</span>
            </div>
          </div>
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
    ) : activeTab === 'roles' ? (
      <RolesConfig />
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Plan Summary Card */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Subscription & Seat Limits</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Manage your organization's subscription tier and review active workspace seat allocations.</p>
            </div>
            <span className="badge badge-active" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', borderRadius: '20px' }}>
              Active Plan: {orgTier.toUpperCase()}
            </span>
          </div>

          <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Employee Seat Allocation</span>
              <span style={{ fontWeight: 600 }}>{currentSeats} of {limitSeats === 9999 ? 'Unlimited' : limitSeats} seats used</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, (currentSeats / limitSeats) * 100)}%`,
                height: '100%',
                background: isLimitReached ? 'var(--color-danger)' : 'var(--color-primary)',
                borderRadius: '4px'
              }} />
            </div>
          </div>
        </div>

        {/* Plan Options Grid */}
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Available Workspace Tiers</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Starter Plan */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', border: orgTier === 'starter' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)', borderRadius: '16px', position: 'relative' }}>
              {orgTier === 'starter' && <span style={{ position: 'absolute', top: '-12px', right: '20px', background: 'var(--color-primary)', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>CURRENT PLAN</span>}
              <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Starter Plan</h4>
              <div style={{ fontSize: '2rem', fontWeight: 700, margin: '1rem 0 0.5rem' }}>$49<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/month</span></div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', minHeight: '40px' }}>Ideal for small teams getting started with workspace orchestration.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <li>✓ Up to 25 seats capacity</li>
                <li>✓ Core dashboard access</li>
                <li>✓ Role-based permissions</li>
                <li>✓ System audit logs</li>
              </ul>
              <button
                className="btn"
                style={{ width: '100%', marginTop: 'auto', background: orgTier === 'starter' ? 'var(--border-color)' : 'var(--color-primary)', color: orgTier === 'starter' ? 'var(--text-primary)' : 'white' }}
                disabled={orgTier === 'starter'}
                onClick={() => handleUpdatePlan('starter')}
              >
                {orgTier === 'starter' ? 'Active Plan' : 'Switch to Starter'}
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', border: orgTier === 'enterprise' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)', borderRadius: '16px', position: 'relative' }}>
              {orgTier === 'enterprise' && <span style={{ position: 'absolute', top: '-12px', right: '20px', background: 'var(--color-primary)', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>CURRENT PLAN</span>}
              <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Enterprise Plan</h4>
              <div style={{ fontSize: '2rem', fontWeight: 700, margin: '1rem 0 0.5rem' }}>$199<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/month</span></div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', minHeight: '40px' }}>Unlimited scaling, premium support, and access to all standard plugins.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <li>✓ Unlimited seat allocation</li>
                <li>✓ All standard plugins included</li>
                <li>✓ 24/7 dedicated support</li>
                <li>✓ SSO & advanced audit trails</li>
              </ul>
              <button
                className="btn"
                style={{ width: '100%', marginTop: 'auto', background: orgTier === 'enterprise' ? 'var(--border-color)' : 'var(--color-primary)', color: orgTier === 'enterprise' ? 'var(--text-primary)' : 'white' }}
                disabled={orgTier === 'enterprise'}
                onClick={() => handleUpdatePlan('enterprise')}
              >
                {orgTier === 'enterprise' ? 'Active Plan' : 'Switch to Enterprise'}
              </button>
            </div>

            {/* Custom Plan */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', border: orgTier === 'custom' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)', borderRadius: '16px', position: 'relative' }}>
              {orgTier === 'custom' && <span style={{ position: 'absolute', top: '-12px', right: '20px', background: 'var(--color-primary)', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>CURRENT PLAN</span>}
              <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Custom Plan</h4>
              <div style={{ fontSize: '2rem', fontWeight: 700, margin: '1rem 0 0.5rem' }}>Custom<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}> pricing</span></div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', minHeight: '40px' }}>For large-scale organisations with customized compliance needs.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <li>✓ Up to 1000 seat capacity</li>
                <li>✓ Dedicated servers & infrastructure</li>
                <li>✓ Custom plugin integrations</li>
                <li>✓ Service-level agreement (SLA)</li>
              </ul>
              <button
                className="btn"
                style={{ width: '100%', marginTop: 'auto', background: orgTier === 'custom' ? 'var(--border-color)' : 'var(--color-primary)', color: orgTier === 'custom' ? 'var(--text-primary)' : 'white' }}
                disabled={orgTier === 'custom'}
                onClick={() => handleUpdatePlan('custom')}
              >
                {orgTier === 'custom' ? 'Active Plan' : 'Switch to Custom'}
              </button>
            </div>
          </div>
        </div>
      </div>
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
