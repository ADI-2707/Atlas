import React, { useState, useEffect } from 'react';
import { api } from '@atlas/api';
import './Team.css';

interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  module: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: { id: string; code: string }[];
}

export const RolesConfig: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]); // Array of permission IDs
  
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesData, permsData] = await Promise.all([
        api.get<Role[]>('/roles'),
        api.get<Permission[]>('/permissions'),
      ]);
      setRoles(rolesData);
      setPermissions(permsData);
      
      if (rolesData.length > 0) {
        // Default select the first custom or standard role
        setSelectedRole(rolesData[0]);
        setRolePermissions(rolesData[0].permissions.map((p) => p.id));
      }
    } catch (err) {
      console.error('Failed to load roles and permissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setRolePermissions(role.permissions.map((p) => p.id));
    setIsEditing(false);
    setError('');
  };

  const handlePermissionToggle = (permId: string) => {
    if (selectedRole?.isSystem) return; // Prevent modifying system roles
    setRolePermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId],
    );
    setIsEditing(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedRole) return;
    setError('');
    try {
      await api.patch(`/roles/${selectedRole.id}`, {
        permissionIds: rolePermissions,
      });
      setIsEditing(false);
      alert('Role permissions updated successfully!');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newRoleName.trim()) {
      setError('Role name is required.');
      return;
    }
    try {
      await api.post<Role>('/roles', {
        name: newRoleName,
        description: newRoleDesc,
        permissionIds: [],
      });
      setShowCreateModal(false);
      setNewRoleName('');
      setNewRoleDesc('');
      await fetchData();
      // Select the newly created role
      const loadedRoles = await api.get<Role[]>('/roles');
      const matched = loadedRoles.find((r) => r.name === newRoleName);
      if (matched) {
        handleRoleSelect(matched);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role.');
    }
  };

  // Group permissions by their module name
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const key = perm.module.toUpperCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return <div className="loading">Loading roles and permissions configuration...</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', marginTop: '1rem' }}>
      
      {/* Roles List Sidebar */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Roles</h3>
          <button className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} onClick={() => setShowCreateModal(true)}>
            + New Role
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => handleRoleSelect(role)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                background: selectedRole?.id === role.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.02)',
                color: selectedRole?.id === role.id ? '#fff' : 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{role.name}</span>
                {role.isSystem && (
                  <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.3rem', borderRadius: '4px', background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                    System
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: selectedRole?.id === role.id ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {role.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Grid Editor */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        {selectedRole ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>{selectedRole.name} Permissions</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  {selectedRole.description || 'No description provided.'}
                </p>
              </div>
              {!selectedRole.isSystem && (
                <button
                  className="btn btn-primary"
                  onClick={handleSaveChanges}
                  disabled={!isEditing}
                  style={{ opacity: isEditing ? 1 : 0.6 }}
                >
                  Save Changes
                </button>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            {selectedRole.isSystem && (
              <div style={{ background: 'rgba(245,158,11,0.05)', color: '#f59e0b', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.15)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                ℹ️ This is a built-in system role. System roles are managed by the platform and cannot be edited.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {Object.entries(groupedPermissions).map(([module, perms]) => (
                <div key={module}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    {module === 'CORE' ? 'Core Platform Operations' : `${module} Plugin Actions`}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    {perms.map((perm) => {
                      const isChecked = rolePermissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: isChecked ? 'rgba(26, 115, 232, 0.03)' : 'rgba(255,255,255,0.01)',
                            cursor: selectedRole.isSystem ? 'default' : 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={selectedRole.isSystem}
                            onChange={() => handlePermissionToggle(perm.id)}
                            style={{ marginTop: '0.2rem', cursor: selectedRole.isSystem ? 'default' : 'pointer' }}
                          />
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{perm.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{perm.description}</div>
                            <code style={{ fontSize: '0.7rem', color: 'var(--color-accent-active)', marginTop: '0.25rem', display: 'block' }}>{perm.code}</code>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem' }}>
            Select a role on the left to configure its access privileges.
          </div>
        )}
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <h2>Create Custom Role</h2>
            <p>Define a new security role for your organization employees.</p>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleCreateRole}>
              <div className="form-group">
                <label>Role Name</label>
                <input
                  type="text"
                  placeholder="CRM Manager"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  placeholder="Manages CRM customer records and sales pipelines"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => { setShowCreateModal(false); setError(''); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
