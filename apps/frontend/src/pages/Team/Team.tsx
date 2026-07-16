import React, { useEffect, useState } from 'react';
import { api } from '@atlas/api';
import { useAuth } from '@atlas/auth';
import { useToast } from '@atlas/ui';
import { Tabs } from '@atlas/ui';
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
  const [isAddingFirstMember, setIsAddingFirstMember] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<string>('members');

  const orgTier = user?.orgTier || 'starter';
  const currentSeats = users.length + invitations.filter(i => i.status === 'PENDING').length;
  
  let limitSeats = 25;
  if (orgTier === 'enterprise') limitSeats = 9999;
  else if (orgTier === 'custom') limitSeats = 1000;
  
  const isLimitReached = currentSeats >= limitSeats;
  const hasMembers = users.length > 1 || invitations.length > 0;
  const showEmptyState = !hasMembers && !isAddingFirstMember;

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
      setIsAddingFirstMember(false);
      setActiveTab('members');
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
    <div className="team-page" style={{ height: '100%' }}>
      {showEmptyState ? (
        <div className="dashboard-active-state" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '450px' }}>
          <div className="dashboard-empty-state" style={{ maxWidth: '600px', padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
            <div className="dashboard-empty-icon" style={{ fontSize: '3.5rem', marginBottom: 'var(--spacing-lg)' }}>👥</div>
            <h2 className="dashboard-empty-title" style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1.125rem' }}>
              Welcome, {user?.name ? user.name.split(' ')[0] : 'Admin'}! Your team is empty.
            </h2>
            <p className="dashboard-empty-sub" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)', lineHeight: '1.6', fontSize: '0.95rem' }}>
              You haven't added any team members yet. Invite your first employee to start collaborating, assigning roles, and managing permissions in your workspace.
            </p>
            <button
              className="dashboard-empty-btn"
              onClick={() => {
                setIsAddingFirstMember(true);
                setActiveTab('add-member');
              }}
              disabled={isLimitReached}
            >
              <span>+</span> Add Member
            </button>
            {isLimitReached && (
              <div style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-danger)', fontSize: '0.85rem' }}>
                Plan capacity reached. Please upgrade your plan.
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <Tabs
              tabs={[
                { id: 'members', label: 'Members Management' },
                { id: 'add-member', label: 'Add Member' },
                { id: 'roles', label: 'Roles & Permissions' },
                { id: 'subscription', label: 'Subscription Plan' }
              ]}
              activeId={activeTab}
              onChange={(id) => setActiveTab(id)}
              accentColor="var(--color-accent-active)"
            />
          </div>

          {activeTab === 'members' ? (
            loading ? (
              <div className="loading">Loading team...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2xl)' }}>
                {/* Active Members Section */}
                <div>
                  <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.25rem', fontWeight: 600 }}>Active Members</h2>
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
                  <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.25rem', fontWeight: 600 }}>Pending Invitations</h2>
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
                                    style={{ color: 'var(--color-danger)', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
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
          ) : activeTab === 'add-member' ? (
            <div style={{ maxWidth: '600px' }} className="glass-panel">
              <div style={{ padding: 'var(--spacing-xl)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>Invite New Team Member</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--spacing-xl)' }}>
                  They will receive a secure registration link to create their profile and join your workspace.
                </p>

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
                    <label style={{ marginBottom: 'var(--spacing-sm)' }}>Assign Roles</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', maxHeight: '180px', overflowY: 'auto', padding: 'var(--spacing-sm)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
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

                  <div style={{ marginTop: 'var(--spacing-xl)' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: 'var(--spacing-sm) var(--spacing-xl)' }} disabled={isLimitReached}>
                      Send Invitation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : activeTab === 'roles' ? (
            <RolesConfig />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
              {/* Plan Summary Card */}
              <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>Subscription & Seat Limits</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your organization's subscription tier and review active workspace seat allocations.</p>
                  </div>
                  <span className="badge badge-active" style={{ fontSize: '0.9rem', padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: '20px' }}>
                    Active Plan: {orgTier.toUpperCase()}
                  </span>
                </div>

                <div style={{ padding: 'var(--spacing-lg)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)', fontSize: '0.95rem' }}>
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
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>Available Workspace Tiers</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-lg)' }}>
                  {/* Starter Plan */}
                  <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', border: orgTier === 'starter' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)', borderRadius: '16px', position: 'relative' }}>
                    {orgTier === 'starter' && <span style={{ position: 'absolute', top: '-12px', right: '20px', background: 'var(--color-primary)', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>CURRENT PLAN</span>}
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>Starter Plan</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 700, margin: 'var(--spacing-md) 0 var(--spacing-sm)' }}>$49<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/month</span></div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', minHeight: '40px' }}>Ideal for small teams getting started with workspace orchestration.</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 'var(--spacing-lg) 0 var(--spacing-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
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
                  <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', border: orgTier === 'enterprise' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)', borderRadius: '16px', position: 'relative' }}>
                    {orgTier === 'enterprise' && <span style={{ position: 'absolute', top: '-12px', right: '20px', background: 'var(--color-primary)', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>CURRENT PLAN</span>}
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>Enterprise Plan</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 700, margin: 'var(--spacing-md) 0 var(--spacing-sm)' }}>$199<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/month</span></div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', minHeight: '40px' }}>Unlimited scaling, premium support, and access to all standard plugins.</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 'var(--spacing-lg) 0 var(--spacing-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
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
                  <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', border: orgTier === 'custom' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)', borderRadius: '16px', position: 'relative' }}>
                    {orgTier === 'custom' && <span style={{ position: 'absolute', top: '-12px', right: '20px', background: 'var(--color-primary)', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600 }}>CURRENT PLAN</span>}
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>Custom Plan</h4>
                    <div style={{ fontSize: '2rem', fontWeight: 700, margin: 'var(--spacing-md) 0 var(--spacing-sm)' }}>Custom<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}> pricing</span></div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', minHeight: '40px' }}>For large-scale organisations with customized compliance needs.</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 'var(--spacing-lg) 0 var(--spacing-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
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
        </>
      )}
    </div>
  );
};
