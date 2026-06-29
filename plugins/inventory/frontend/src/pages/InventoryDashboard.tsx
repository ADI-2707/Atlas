import React, { useState, useEffect } from 'react';
import { Button, Pagination, useDebounce } from '@atlas/ui';
import { api } from '@atlas/api';
import { ProductForm } from '../components/ProductForm';
import { WarehouseManager } from '../components/WarehouseManager';
import './InventoryDashboard.css';

export const InventoryDashboard: React.FC = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'products' | 'warehouses'>('products');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

  const [newColumnLabel, setNewColumnLabel] = useState('');
  const [newColumnType, setNewColumnType] = useState('string');
  const [errorMsg, setErrorMsg] = useState('');

  const [limitStats, setLimitStats] = useState<any>(null);

  useEffect(() => {
    fetchTables();
    fetchLimitStats();
  }, []);

  const fetchLimitStats = async () => {
    try {
      const res = await api.get<{ data: any }>('/inventory/stats');
      setLimitStats(res.data);
    } catch (err) {
      console.error('Failed to fetch limit stats', err);
    }
  };

  useEffect(() => {
    if (activeTableId) {
      fetchProducts(activeTableId, page, limit, debouncedSearch);
    }
  }, [activeTableId, page, limit, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [activeTableId, debouncedSearch]);

  useEffect(() => {
    if (tables.length > 0 && limitStats && activeTableId) {
      const activeIdx = tables.findIndex(t => t.id === activeTableId);
      if (activeIdx >= limitStats.maxTables) {
        setActiveTableId(tables[0].id);
      }
    }
  }, [tables, limitStats, activeTableId]);

  const fetchTables = async () => {
    try {
      const res = await api.get<{ data: any[] }>('/inventory/tables');
      const fetchedTables = res.data || [];
      setTables(fetchedTables);
      if (fetchedTables.length > 0 && !activeTableId) {
        setActiveTableId(fetchedTables[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch tables', err);
    }
  };

  const fetchProducts = async (tableId: string, currentPage: number, currentLimit: number, currentSearch: string) => {
    try {
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        limit: String(currentLimit),
      });
      if (currentSearch.trim()) {
        queryParams.append('search', currentSearch.trim());
      }
      const res = await api.get<{ data: any }>(`/inventory/tables/${tableId}/products?${queryParams.toString()}`);
      setProducts(res.data?.data || []);
      setTotalPages(res.data?.meta?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const handleCreateProduct = async (data: any) => {
    if (!activeTableId) return;
    try {
      await api.post('/inventory/products', { ...data, tableId: activeTableId });
      fetchProducts(activeTableId, page, limit, debouncedSearch);
      fetchLimitStats();
      setIsProductModalOpen(false);
    } catch (err) {
      console.error('Failed to create product', err);
    }
  };

  const handleCreateTable = async () => {
    const name = prompt('Enter new table name:');
    if (!name) return;
    try {
      const res = await api.post<any>('/inventory/tables', { name, fieldSchema: [] });
      await fetchTables();
      if (res && res.id) {
        setActiveTableId(res.id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create table');
    }
  };

  const handleAddColumn = async () => {
    if (!activeTableId || !newColumnLabel.trim()) return;
    const activeTable = tables.find(t => t.id === activeTableId);
    if (!activeTable) return;

    const name = newColumnLabel.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

    if (activeTable.fieldSchema.some((f: any) => f.name === name)) {
      setErrorMsg('Column with this name already exists!');
      return;
    }

    const newSchema = [...activeTable.fieldSchema, { name, label: newColumnLabel, type: newColumnType }];

    try {
      await api.patch(`/inventory/tables/${activeTableId}/schema`, newSchema);
      setNewColumnLabel('');
      setErrorMsg('');
      fetchTables();
    } catch (err) {
      setErrorMsg('Failed to update schema');
    }
  };

  const handleDeleteColumn = async (colName: string) => {
    if (!activeTableId) return;
    const activeTable = tables.find(t => t.id === activeTableId);
    if (!activeTable) return;

    const newSchema = activeTable.fieldSchema.filter((f: any) => f.name !== colName);
    try {
      await api.patch(`/inventory/tables/${activeTableId}/schema`, newSchema);
      fetchTables();
    } catch (err) {
      alert('Failed to delete column');
    }
  };

  if (tables.length === 0) return <div style={{ padding: '2rem', color: '#fff' }}>Loading Inventory...</div>;

  const activeTable = tables.find(t => t.id === activeTableId) || tables[0];
  const customFields = activeTable?.fieldSchema || [];

  const isAddLocked = limitStats ? (limitStats.productCount / limitStats.maxProducts) >= 0.995 : false;

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1>{activeView === 'products' ? activeTable.name : 'Warehouse & Stock'}</h1>
          <div className="view-toggles" style={{ display: 'flex', gap: '0.5rem', background: '#222', padding: '0.25rem', borderRadius: '6px', border: '1px solid #333' }}>
            <button
              type="button"
              onClick={() => setActiveView('products')}
              style={{
                background: activeView === 'products' ? 'var(--color-accent-active)' : 'transparent',
                color: activeView === 'products' ? '#000' : '#888',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem'
              }}
            >
              📦 Products
            </button>
            <button
              type="button"
              onClick={() => setActiveView('warehouses')}
              style={{
                background: activeView === 'warehouses' ? 'var(--color-accent-active)' : 'transparent',
                color: activeView === 'warehouses' ? '#000' : '#888',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem'
              }}
            >
              🏢 Warehouses
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {activeView === 'products' && (
            <>
              <Button variant="secondary" onClick={() => setIsColumnModalOpen(true)}>Manage Columns</Button>
              <Button
                variant="primary"
                disabled={isAddLocked}
                onClick={() => setIsProductModalOpen(true)}
                title={isAddLocked ? "Storage limit reached. Upgrade plan to add products." : ""}
              >
                + Add Product
              </Button>
            </>
          )}
        </div>
      </div>

      {limitStats && (limitStats.productCount / limitStats.maxProducts) >= 0.80 && (
        <div className={`inventory-alert-banner ${(limitStats.productCount / limitStats.maxProducts) >= 0.995 ? 'locked-banner' : ''}`}>
          ⚠️ {(limitStats.productCount / limitStats.maxProducts) >= 0.995
            ? "Critical limit reached. Storage is locked. Please upgrade your subscription plan to add or modify items."
            : `Warning: You are approaching your item storage limit (${limitStats.productCount} / ${limitStats.maxProducts} items). Upgrade your plan to avoid lockout.`}
        </div>
      )}

      {activeView === 'products' ? (
        <>
          <div className="table-actions-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="atlas-input"
              style={{ maxWidth: '300px' }}
            />
          </div>

          <div className="table-container">
            <table className="atlas-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Base Price</th>
                  {customFields.map((field: any) => (
                    <th key={field.name}>{field.label}</th>
                  ))}
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4 + customFields.length} style={{ textAlign: 'center', padding: '2rem' }}>No products found.</td>
                  </tr>
                ) : products.map(product => {
                  const stock = product.stock?.reduce((acc: number, s: any) => acc + s.quantity, 0) || 0;
                  return (
                    <tr key={product.id}>
                      <td>{product.sku}</td>
                      <td>{product.name}</td>
                      <td>${product.basePrice.toFixed(2)}</td>
                      {customFields.map((field: any) => (
                        <td key={field.name}>{product.customData?.[field.name] || '-'}</td>
                      ))}
                      <td>{stock}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={limit}
            pageSizeOptions={[5, 10, 20, 50]}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => {
              setLimit(s);
              setPage(1);
            }}
          />

          <div className="excel-tabs">
            {tables.map((table, idx) => {
              const maxTables = limitStats?.maxTables || 1;
              const isLocked = idx >= maxTables;

              return (
                <button
                  key={table.id}
                  className={`excel-tab ${table.id === activeTableId ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                  onClick={() => {
                    if (isLocked) {
                      alert("This table is locked under your current subscription plan. Upgrade to unlock access.");
                      return;
                    }
                    setActiveTableId(table.id);
                  }}
                  title={isLocked ? "Table locked under current plan" : ""}
                >
                  {isLocked && <span style={{ marginRight: '6px' }}>🔒</span>}
                  {table.name}
                </button>
              );
            })}
            <button className="excel-tab-add" onClick={handleCreateTable}>+</button>
          </div>
        </>
      ) : (
        <WarehouseManager
          products={products}
          onRefreshProducts={() => activeTableId && fetchProducts(activeTableId, page, limit, debouncedSearch)}
        />
      )}

      {isProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Product to {activeTable.name}</h2>
            <ProductForm customFields={customFields} onSubmit={handleCreateProduct} onCancel={() => setIsProductModalOpen(false)} />
          </div>
        </div>
      )}

      {isColumnModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content column-modal">
            <h2>Manage Columns for {activeTable.name}</h2>
            <div className="current-columns">
              {customFields.map((f: any) => (
                <div key={f.name} className="column-item">
                  <span>{f.label} <small>({f.type})</small></span>
                  <button className="btn-delete" onClick={() => handleDeleteColumn(f.name)}>×</button>
                </div>
              ))}
              {customFields.length === 0 && <p className="text-muted">No custom columns yet.</p>}
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>Add New Column</h3>
            <div className="add-column-form">
              <input
                type="text"
                placeholder="Column Label (e.g. Brand)"
                value={newColumnLabel}
                onChange={e => setNewColumnLabel(e.target.value)}
                className="atlas-input"
              />
              <select value={newColumnType} onChange={e => setNewColumnType(e.target.value)} className="atlas-input">
                <option value="string">Text</option>
                <option value="number">Number</option>
              </select>
              <Button variant="primary" onClick={handleAddColumn}>Add</Button>
            </div>
            {errorMsg && <p className="text-danger" style={{ marginTop: '0.5rem' }}>{errorMsg}</p>}

            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
              <Button variant="secondary" onClick={() => setIsColumnModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
