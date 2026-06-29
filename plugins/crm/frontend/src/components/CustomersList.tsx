import React, { useState, useEffect } from 'react';
import { api } from '@atlas/api';
import { Button, Pagination, useDebounce } from '@atlas/ui';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
}

export const CustomersList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formStatus, setFormStatus] = useState('LEAD');

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchCustomers();
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

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
    setEditingCustomer(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCompany('');
    setFormStatus('LEAD');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormName(cust.name);
    setFormEmail(cust.email);
    setFormPhone(cust.phone || '');
    setFormCompany(cust.company || '');
    setFormStatus(cust.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formName,
      email: formEmail,
      phone: formPhone || null,
      company: formCompany || null,
      status: formStatus
    };

    try {
      if (editingCustomer) {
        await api.put(`/crm/customers/${editingCustomer.id}`, payload);
      } else {
        await api.post('/crm/customers', payload);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      console.error('Failed to save customer', err);
      alert('Error saving customer detail');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await api.delete(`/crm/customers/${id}`);
      fetchCustomers();
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
      
      <div className="table-actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="atlas-input"
          style={{ maxWidth: '300px' }}
        />
        <Button variant="primary" onClick={handleOpenCreateModal}>+ Add Contact</Button>
      </div>

      <div className="table-container">
        <table className="atlas-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>Loading contacts...</td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>No contacts found. Add one to start.</td>
              </tr>
            ) : customers.map(cust => (
              <tr key={cust.id}>
                <td>{cust.name}</td>
                <td>{cust.email}</td>
                <td>{cust.phone || '-'}</td>
                <td>{cust.company || '-'}</td>
                <td>
                  <span className={getStatusBadgeClass(cust.status)}>{cust.status}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" size="small" style={{ background: '#eab308', color: '#000', border: 'none', fontWeight: 'bold' }} onClick={() => handleOpenEditModal(cust)}>Edit</Button>
                    <Button variant="secondary" size="small" style={{ background: '#ef4444', color: '#fff', border: 'none' }} onClick={() => handleDelete(cust.id)}>Delete</Button>
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

      {isModalOpen && (
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
                <Button type="submit" variant="primary">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
