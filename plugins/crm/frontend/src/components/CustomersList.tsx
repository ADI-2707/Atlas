import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@atlas/api';
import { Button, Pagination, useDebounce } from '@atlas/ui';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  customData?: Record<string, any>;
}

interface LimitStats {
  tier: string;
  usage: { customers: number; deals: number };
  limits: { customers: number; deals: number };
}

export const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<LimitStats | null>(null);

  const isAddLocked = stats && stats.limits.customers !== -1 ? (stats.usage.customers / stats.limits.customers) >= 0.995 : false;
  const isWarningActive = stats && stats.limits.customers !== -1 ? (stats.usage.customers / stats.limits.customers) >= 0.80 : false;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formStatus, setFormStatus] = useState('LEAD');
  const [customData, setCustomData] = useState<Record<string, any>>({});

  const [customFields, setCustomFields] = useState<any[]>([]);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [newColumnLabel, setNewColumnLabel] = useState('');
  const [newColumnType, setNewColumnType] = useState('string');
  const [errorMsg, setErrorMsg] = useState('');

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchCustomers();
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchStats();
    fetchContactSchema();
  }, []);

  const fetchContactSchema = async () => {
    try {
      const res = await api.get<{ data: any[] }>('/crm/schema');
      setCustomFields(res.data || []);
    } catch (err) {
      console.error('Failed to fetch contact schema', err);
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnLabel.trim()) return;
    const name = newColumnLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (customFields.some((f: any) => f.name === name)) {
      setErrorMsg('Column already exists');
      return;
    }
    const newField = { name, label: newColumnLabel.trim(), type: newColumnType };
    const updated = [...customFields, newField];
    try {
      await api.post('/crm/schema', updated);
      setCustomFields(updated);
      setNewColumnLabel('');
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Failed to add column');
    }
  };

  const handleDeleteColumn = async (colName: string) => {
    const updated = customFields.filter((f: any) => f.name !== colName);
    try {
      await api.post('/crm/schema', updated);
      setCustomFields(updated);
    } catch (err) {
      alert('Failed to delete column');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get<{ data: LimitStats }>('/crm/limits');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (debouncedSearch.trim()) {
        queryParams.append('search', debouncedSearch.trim());
      }
      const res = await api.get<{ data: any }>('/crm/customers?' + queryParams.toString());
      setCustomers(res.data?.data || []);
      setTotalPages(res.data?.meta?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    if (stats && stats.limits.customers !== -1 && stats.usage.customers >= stats.limits.customers) {
      alert(`Customer limit reached for your current tier (${stats.tier}). Please upgrade to add more.`);
      return;
    }
    setEditingCustomer(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCompany('');
    setFormStatus('LEAD');
    setCustomData({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormName(cust.name);
    setFormEmail(cust.email);
    setFormPhone(cust.phone || '');
    setFormCompany(cust.company || '');
    setFormStatus(cust.status);
    setCustomData(cust.customData || {});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      email: formEmail,
      phone: formPhone || null,
      company: formCompany || null,
      status: formStatus,
      customData
    };

    try {
      if (editingCustomer) {
        await api.put(`/crm/customers/${editingCustomer.id}`, payload);
      } else {
        await api.post('/crm/customers', payload);
      }
      setIsModalOpen(false);
      await fetchCustomers();
      await fetchStats();
    } catch (err) {
      console.error('Failed to save customer', err);
      alert('Error saving customer detail');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await api.delete(`/crm/customers/${id}`);
      await fetchCustomers();
      await fetchStats();
    } catch (err) {
      console.error('Failed to delete customer', err);
      alert('Failed to delete contact');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'LEAD': return 'badge badge-lead';
      case 'PROSPECT': return 'badge badge-prospect';
      case 'CUSTOMER': return 'badge badge-customer';
      case 'CHURNED': return 'badge badge-churned';
      default: return 'badge';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {stats && isWarningActive && (
        <div className={`crm-alert-banner ${isAddLocked ? 'locked-banner' : ''}`}>
          ⚠️ {isAddLocked
            ? "Critical limit reached. CRM contact modifications and additions are locked. Please upgrade your subscription plan to modify or add CRM contacts."
            : `Warning: You are approaching your CRM contact limit (${stats.usage.customers} / ${stats.limits.customers} contacts). Upgrade your plan to avoid lockout.`}
        </div>
      )}
      
      <div className="table-actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="atlas-input"
            style={{ maxWidth: '300px' }}
          />
          {stats && stats.limits.customers !== -1 && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Usage: {stats.usage.customers} / {stats.limits.customers} Contacts ({stats.tier.toUpperCase()} Plan)
            </span>
          )}
          {stats && stats.limits.customers === -1 && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Usage: {stats.usage.customers} Contacts (Unlimited Plan)
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => setIsColumnModalOpen(true)}>Columns</Button>
          <Button
            variant="primary"
            disabled={isAddLocked}
            onClick={handleOpenCreateModal}
            title={isAddLocked ? "Contact limit reached. Upgrade plan to add contacts." : ""}
          >
            + Add Contact
          </Button>
        </div>
      </div>

      <div className="table-container">
        <table className="atlas-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              {customFields.map((f: any) => (
                <th key={f.name}>{f.label}</th>
              ))}
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6 + customFields.length} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>Loading contacts...</td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6 + customFields.length} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>No contacts found. Add one to start.</td>
              </tr>
            ) : customers.map(cust => (
              <tr key={cust.id}>
                <td>{cust.name}</td>
                <td>{cust.email}</td>
                <td>{cust.phone || '-'}</td>
                <td>{cust.company || '-'}</td>
                {customFields.map((f: any) => (
                  <td key={f.name}>{cust.customData?.[f.name] || '-'}</td>
                ))}
                <td>
                  <span className={getStatusBadgeClass(cust.status)}>{cust.status}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <Button
                      variant="secondary"
                      size="small"
                      disabled={isAddLocked}
                      onClick={() => handleOpenEditModal(cust)}
                      title={isAddLocked ? "Limit reached. Upgrade plan to edit contacts." : ""}
                    >
                      Edit
                    </Button>
                    <Button variant="secondary" size="small" onClick={() => handleDelete(cust.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={limit}
        pageSizeOptions={[5, 10, 20, 50]}
        onPageChange={p => setPage(p)}
        onPageSizeChange={s => {
          setLimit(s);
          setPage(1);
        }}
      />

      {isModalOpen && createPortal(
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingCustomer ? 'Edit Contact' : 'Create Contact'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name</label>
                <input
                  required
                  placeholder="e.g. Jane Doe"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="atlas-input"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="e.g. jane@company.com"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  className="atlas-input"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone Number</label>
                <input
                  placeholder="e.g. +1 555-0199"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  className="atlas-input"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Company / Account</label>
                <input
                  placeholder="e.g. Acme Inc"
                  value={formCompany}
                  onChange={e => setFormCompany(e.target.value)}
                  className="atlas-input"
                />
              </div>
              {customFields.map((f: any) => (
                <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{f.label}</label>
                  <input
                    type={f.type === 'number' ? 'number' : 'text'}
                    placeholder={`Enter ${f.label.toLowerCase()}`}
                    value={customData[f.name] !== undefined ? customData[f.name] : ''}
                    onChange={e => {
                      const val = f.type === 'number' ? (parseFloat(e.target.value) || '') : e.target.value;
                      setCustomData(prev => ({ ...prev, [f.name]: val }));
                    }}
                    className="atlas-input"
                  />
                </div>
              ))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lifecycle Status</label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value)}
                  className="atlas-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="LEAD">Lead</option>
                  <option value="PROSPECT">Prospect</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="CHURNED">Churned</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isAddLocked}
                  title={isAddLocked ? "Contact limits reached. Upgrade plan to save changes." : ""}
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {isColumnModalOpen && createPortal(
        <div className="modal-overlay">
          <div className="modal-content column-modal">
            <h2>Manage Custom Contact Fields</h2>
            <div className="current-columns" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem' }}>
              {customFields.map((f: any) => (
                <div key={f.name} className="column-item">
                  <span>{f.label} <small style={{ color: 'var(--text-tertiary)' }}>({f.type})</small></span>
                  <button className="btn-delete" onClick={() => handleDeleteColumn(f.name)}>×</button>
                </div>
              ))}
              {customFields.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No custom fields yet.</p>}
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>Add New Custom Field</h3>
            <div className="add-column-form">
              <input
                type="text"
                placeholder="Field Label (e.g. Lead Source)"
                value={newColumnLabel}
                onChange={e => setNewColumnLabel(e.target.value)}
                className="atlas-input"
                style={{ fontSize: '0.85rem' }}
              />
              <select value={newColumnType} onChange={e => setNewColumnType(e.target.value)} className="atlas-input" style={{ fontSize: '0.85rem' }}>
                <option value="string">Text</option>
                <option value="number">Number</option>
              </select>
              <Button variant="primary" size="small" onClick={handleAddColumn}>Add</Button>
            </div>
            {errorMsg && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{errorMsg}</p>}

            <div style={{ marginTop: '2rem', textAlign: 'right', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <Button variant="secondary" size="small" onClick={() => setIsColumnModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
