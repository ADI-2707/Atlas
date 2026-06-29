import React, { useState, useEffect } from 'react';
import { api } from '@atlas/api';
import { Button } from '@atlas/ui';

interface Customer {
  id: string;
  name: string;
  company: string | null;
}

interface LimitStats {
  tier: string;
  usage: { customers: number; deals: number };
  limits: { customers: number; deals: number };
}

interface DealItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface Deal {
  id: string;
  title: string;
  stage: string;
  value: number;
  customer: Customer;
  lineItems: DealItem[];
}

interface Product {
  id: string;
  name: string;
  sku: string;
  basePrice: number;
}

const STAGES = [
  { key: 'QUALIFICATION', label: 'Qualification' },
  { key: 'PROPOSAL', label: 'Proposal' },
  { key: 'NEGOTIATION', label: 'Negotiation' },
  { key: 'CLOSED_WON', label: 'Closed Won 🎉' },
  { key: 'CLOSED_LOST', label: 'Closed Lost ❌' }
];

export const DealsPipeline: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<LimitStats | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formStage, setFormStage] = useState('QUALIFICATION');
  const [formItems, setFormItems] = useState<DealItem[]>([]);

  useEffect(() => {
    fetchStats();
    fetchDeals();
    fetchCustomers();
    fetchInventoryProducts();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get<LimitStats>('/crm/limits');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const fetchDeals = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ data: Deal[] }>('/crm/deals');
      setDeals(res.data || []);
    } catch (err) {
      console.error('Failed to fetch deals', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get<{ data: { data: Customer[] } }>('/crm/customers?limit=100');
      setCustomers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch customers for dropdown', err);
    }
  };

  const fetchInventoryProducts = async () => {
    try {
      // 1. Fetch tables
      const tablesRes = await api.get<{ data: any[] }>('/inventory/tables');
      const tables = tablesRes.data || [];
      if (tables.length === 0) return;

      // 2. Fetch products from first table (or combine them)
      const productsRes = await api.get<{ data: { data: Product[] } }>(`/inventory/tables/${tables[0].id}/products?limit=100`);
      setProducts(productsRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load inventory products catalog', err);
    }
  };

  const handleOpenCreateModal = () => {
    if (stats && stats.limits.deals !== -1 && stats.usage.deals >= stats.limits.deals) {
      alert(`Deal limit reached for your current tier (${stats.tier}). Please upgrade to add more.`);
      return;
    }
    setEditingDeal(null);
    setFormTitle('');
    setFormCustomerId(customers[0]?.id || '');
    setFormStage('QUALIFICATION');
    setFormItems([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (deal: Deal) => {
    setEditingDeal(deal);
    setFormTitle(deal.title);
    setFormCustomerId(deal.customer.id);
    setFormStage(deal.stage);
    setFormItems(deal.lineItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    })));
    setIsModalOpen(true);
  };

  const handleAddItemRow = () => {
    const defaultProduct = products[0];
    setFormItems(prev => [
      ...prev,
      {
        productId: defaultProduct?.id || '',
        quantity: 1,
        unitPrice: defaultProduct?.basePrice || 0
      }
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setFormItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof DealItem, val: any) => {
    setFormItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      
      const updated = { ...item, [field]: val };
      
      // Auto-populate price when product changes
      if (field === 'productId') {
        const prod = products.find(p => p.id === val);
        if (prod) {
          updated.unitPrice = prod.basePrice;
        }
      }
      return updated;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerId) {
      alert('Please create and select a contact first.');
      return;
    }

    const payload = {
      title: formTitle,
      customerId: formCustomerId,
      stage: formStage,
      lineItems: formItems
    };

    try {
      if (editingDeal) {
        await api.put(`/crm/deals/${editingDeal.id}`, payload);
      } else {
        await api.post('/crm/deals', payload);
      }
      setIsModalOpen(false);
      fetchDeals();
    } catch (err) {
      console.error('Failed to save deal', err);
      alert('Error saving sales deal');
    }
  };

  const handleDeleteDeal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await api.delete(`/crm/deals/${id}`);
      fetchDeals();
    } catch (err) {
      console.error('Failed to delete deal', err);
      alert('Failed to delete opportunity');
    }
  };

  const calculateTotalValue = () => {
    return formItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {stats && stats.limits.deals !== -1 && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Usage: {stats.usage.deals} / {stats.limits.deals} Deals ({stats.tier.toUpperCase()} Plan)
            </span>
          )}
          {stats && stats.limits.deals === -1 && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Usage: {stats.usage.deals} Deals (Unlimited Plan)
            </span>
          )}
        </div>
        <Button variant="primary" onClick={handleOpenCreateModal}>+ New Deal</Button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>Loading pipeline...</div>
      ) : (
        <div className="kanban-board">
          {STAGES.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage.key);
            const totalStageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div key={stage.key} className="kanban-column">
                <div className="kanban-column-header">
                  <h3>{stage.label}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                    ${totalStageValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="deal-card-list">
                  {stageDeals.map(deal => (
                    <div key={deal.id} className="deal-card" onClick={() => handleOpenEditModal(deal)}>
                      <div className="deal-card-title">{deal.title}</div>
                      <div className="deal-card-customer">
                        👤 {deal.customer.name} {deal.customer.company && `(${deal.customer.company})`}
                      </div>
                      <div className="deal-card-value">${deal.value.toFixed(2)}</div>
                    </div>
                  ))}
                  {stageDeals.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)', fontSize: '0.8rem', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
                      Drag / Create deals here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <h2>{editingDeal ? 'Edit Deal Opportunity' : 'Create Deal Opportunity'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Deal Title</label>
                  <input
                    required
                    placeholder="e.g. 50 Enterprise Licenses"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="atlas-input"
                  />
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Contact / Customer</label>
                  <select
                    required
                    value={formCustomerId}
                    onChange={e => setFormCustomerId(e.target.value)}
                    className="atlas-input"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">-- Select Contact --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} {c.company && `(${c.company})`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pipeline Stage</label>
                <select
                  value={formStage}
                  onChange={e => setFormStage(e.target.value)}
                  className="atlas-input"
                  style={{ cursor: 'pointer' }}
                >
                  {STAGES.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Deal Line Items - Inventory Integration */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Catalog Items (Inventory Integration)</span>
                  <Button type="button" variant="secondary" size="small" onClick={handleAddItemRow}>+ Add Item</Button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                  {formItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        value={item.productId}
                        onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                        className="atlas-input"
                        style={{ flex: 2, cursor: 'pointer' }}
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (${p.basePrice.toFixed(2)})</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                        className="atlas-input"
                        style={{ width: '70px', textAlign: 'center' }}
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={e => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="atlas-input"
                        style={{ width: '100px', textAlign: 'center' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        style={{ background: 'transparent', border: 'none', color: '#ef5350', fontSize: '1.25rem', cursor: 'pointer' }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {formItems.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem', padding: '1rem' }}>
                      No items added. Add items to calculate deal value.
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '0.95rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  Calculated Value: ${calculateTotalValue().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <div>
                  {editingDeal && (
                    <Button type="button" variant="secondary" style={{ background: '#ef4444', color: '#fff', border: 'none' }} onClick={() => handleDeleteDeal(editingDeal.id)}>
                      Delete Deal
                    </Button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary">Save</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
