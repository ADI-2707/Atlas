import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Pagination, useDebounce } from '@atlas/ui';
import { api } from '@atlas/api';
import { ProductForm } from '../components/ProductForm';
import { WarehouseManager } from '../components/WarehouseManager';
import { AdjustmentLogs } from '../components/AdjustmentLogs';
import './InventoryDashboard.css';

export const InventoryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<any[]>([]);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'products' | 'warehouses' | 'logs'>('products');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [newColumnLabel, setNewColumnLabel] = useState('');
  const [newColumnType, setNewColumnType] = useState('string');
  const [errorMsg, setErrorMsg] = useState('');

  const [limitStats, setLimitStats] = useState<any>(null);

  const [adjustingStockMap, setAdjustingStockMap] = useState<Record<string, number>>({});
  const [isSavingStock, setIsSavingStock] = useState<Record<string, boolean>>({});

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

  const handleStockInputChange = (productId: string, value: string) => {
    const val = parseInt(value, 10);
    if (isNaN(val) || val < 0) return;
    setAdjustingStockMap(prev => ({
      ...prev,
      [productId]: val
    }));
  };

  const handleSaveStock = async (productId: string) => {
    const qty = adjustingStockMap[productId];
    if (qty === undefined) return;
    setIsSavingStock(prev => ({ ...prev, [productId]: true }));
    try {
      await api.post(`/inventory/products/${productId}/stock`, { quantity: qty });
      setAdjustingStockMap(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      if (activeTableId) {
        fetchProducts(activeTableId, page, limit, debouncedSearch);
      }
      fetchLimitStats();
    } catch (err) {
      console.error('Failed to update stock', err);
      alert('Failed to update stock count');
    } finally {
      setIsSavingStock(prev => ({ ...prev, [productId]: false }));
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

  const handleExportCSV = async () => {
    if (!activeTableId) return;
    const activeTable = tables.find((t) => t.id === activeTableId);
    if (!activeTable) return;
    try {
      const res = await api.get<{ csv: string }>(`/inventory/tables/${activeTableId}/export`);
      const blob = new Blob([res.csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeTable.name.toLowerCase().replace(/\s+/g, '_')}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV', err);
      alert('Failed to export CSV file');
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeTableId) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const csvText = evt.target?.result as string;
      if (!csvText) return;
      try {
        const res = await api.post<any>(`/inventory/tables/${activeTableId}/import`, { csv: csvText });
        const importData = res.data || {};
        alert(`Import completed!\nSuccessfully imported: ${importData.importedCount || 0}\nSkipped: ${importData.skippedCount || 0}\nTotal processed: ${importData.totalCount || 0}`);
        fetchProducts(activeTableId, page, limit, debouncedSearch);
        fetchLimitStats();
      } catch (err: any) {
        alert('Failed to import CSV file. Make sure column headers are: SKU, Name, Base Price');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCreateTable = async () => {
    const isTableLimitReached = limitStats ? tables.length >= limitStats.maxTables : false;
    if (isTableLimitReached) {
      alert("Table limit reached. Please upgrade your subscription plan to create more tables.");
      return;
    }
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
  const isWarehouseLocked = limitStats ? limitStats.maxWarehouses === 0 : false;

  const LockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '6px' }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );

  const BigLockIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header-container" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Inventory Management</h1>
            {limitStats && (
              <span className="capacity-badge" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-surface-tertiary)', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                {limitStats.productCount} / {limitStats.maxProducts} Items Used
              </span>
            )}
          </div>
          {activeView === 'products' && (
            <Button
              variant="primary"
              size="small"
              disabled={isAddLocked}
              onClick={() => setIsProductModalOpen(true)}
              title={isAddLocked ? "Storage limit reached. Upgrade plan to add products." : ""}
            >
              Add Product
            </Button>
          )}
        </div>

        <div className="clean-tabs-bar" style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveView('products')}
            className={`clean-tab-btn ${activeView === 'products' ? 'active' : ''}`}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeView === 'products' ? '2px solid var(--color-accent-active)' : '2px solid transparent',
              color: activeView === 'products' ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '0.5rem 0',
              cursor: 'pointer',
              fontWeight: activeView === 'products' ? '600' : '500',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Products
          </button>
          <button
            type="button"
            onClick={() => setActiveView('warehouses')}
            className={`clean-tab-btn ${activeView === 'warehouses' ? 'active' : ''}`}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeView === 'warehouses' ? '2px solid var(--color-accent-active)' : '2px solid transparent',
              color: activeView === 'warehouses' ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '0.5rem 0',
              cursor: 'pointer',
              fontWeight: activeView === 'warehouses' ? '600' : '500',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Warehouses {isWarehouseLocked && <LockIcon />}
          </button>
          <button
            type="button"
            onClick={() => setActiveView('logs')}
            className={`clean-tab-btn ${activeView === 'logs' ? 'active' : ''}`}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeView === 'logs' ? '2px solid var(--color-accent-active)' : '2px solid transparent',
              color: activeView === 'logs' ? 'var(--text-primary)' : 'var(--text-secondary)',
              padding: '0.5rem 0',
              cursor: 'pointer',
              fontWeight: activeView === 'logs' ? '600' : '500',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Logs
          </button>
        </div>
      </div>

      {limitStats && (limitStats.productCount / limitStats.maxProducts) >= 0.80 && (
        <div className={`inventory-alert-banner ${(limitStats.productCount / limitStats.maxProducts) >= 0.995 ? 'locked-banner' : ''}`} style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.85rem' }}>
          {(limitStats.productCount / limitStats.maxProducts) >= 0.995
            ? "Critical limit reached. Storage is locked. Please upgrade your subscription plan to add or modify items."
            : `Warning: You are approaching your item storage limit (${limitStats.productCount} / ${limitStats.maxProducts} items). Upgrade your plan to avoid lockout.`}
        </div>
      )}

      <div className="page-reveal" key={activeView}>
        {activeView === 'products' ? (
          <>
            <div className="inventory-filters-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
                <div className="table-selector-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Table:</span>
                  <select
                    value={activeTableId || ''}
                    onChange={(e) => {
                      if (e.target.value === '__new__') {
                        handleCreateTable();
                        return;
                      }
                      const tableIndex = tables.findIndex(t => t.id === e.target.value);
                      const maxTables = limitStats?.maxTables || 1;
                      if (tableIndex >= maxTables) {
                        alert("This table is locked under your current subscription plan. Upgrade to unlock access.");
                        return;
                      }
                      setActiveTableId(e.target.value);
                    }}
                    className="atlas-input"
                    style={{ minWidth: '160px', padding: '0.4rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}
                  >
                    {tables.map((table, idx) => {
                      const maxTables = limitStats?.maxTables || 1;
                      const isLocked = idx >= maxTables;
                      return (
                        <option key={table.id} value={table.id}>
                          {table.name} {isLocked ? '(Locked 🔒)' : ''}
                        </option>
                      );
                    })}
                    <option value="__new__">+ Create New Table...</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="atlas-input"
                  style={{ maxWidth: '300px', padding: '0.4rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="secondary" size="small" onClick={handleExportCSV}>Export</Button>
                <Button variant="secondary" size="small" onClick={() => fileInputRef.current?.click()}>Import</Button>
                <input type="file" ref={fileInputRef} accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} />
                <Button variant="secondary" size="small" onClick={() => setIsColumnModalOpen(true)}>Columns</Button>
              </div>
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
                    {isWarehouseLocked && <th style={{ textAlign: 'center' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5 + customFields.length + (isWarehouseLocked ? 1 : 0)} style={{ textAlign: 'center', padding: '2rem' }}>No products found.</td>
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
                        <td>
                          {isWarehouseLocked && adjustingStockMap[product.id] !== undefined ? (
                            <input
                              type="number"
                              min="0"
                              value={adjustingStockMap[product.id]}
                              onChange={e => handleStockInputChange(product.id, e.target.value)}
                              className="atlas-input"
                              style={{ width: '80px', textAlign: 'center', padding: '0.25rem', fontSize: '0.85rem' }}
                            />
                          ) : (
                            stock
                          )}
                        </td>
                        {isWarehouseLocked && (
                          <td style={{ textAlign: 'center' }}>
                            {adjustingStockMap[product.id] !== undefined ? (
                              <Button
                                variant="primary"
                                size="small"
                                disabled={isSavingStock[product.id]}
                                onClick={() => handleSaveStock(product.id)}
                              >
                                {isSavingStock[product.id] ? 'Saving...' : 'Set'}
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="small"
                                style={{ background: '#eab308', color: '#000', border: 'none', fontWeight: 'bold' }}
                                onClick={() => handleStockInputChange(product.id, String(stock))}
                              >
                                Edit
                              </Button>
                            )}
                          </td>
                        )}
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
          </>
        ) : isWarehouseLocked && activeView === 'warehouses' ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5rem 2rem',
            background: 'var(--bg-surface-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            textAlign: 'center',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <BigLockIcon />
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Warehouse Feature Locked</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Multi-location warehouse tracking and audit logs are premium features available only on the Business (Tier 2) and Enterprise (Tier 3) plans.
            </p>
            <button 
              type="button"
              style={{
                background: 'var(--color-accent-active)',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 1.2rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem',
                marginTop: '0.5rem',
                transition: 'background-color 0.15s'
              }}
              onClick={() => navigate('/store/inventory')}
            >
              Upgrade Plan
            </button>
          </div>
        ) : activeView === 'warehouses' ? (
          <WarehouseManager
            products={products}
            onRefreshProducts={() => activeTableId && fetchProducts(activeTableId, page, limit, debouncedSearch)}
            limitStats={limitStats}
          />
        ) : (
          <AdjustmentLogs />
        )}
      </div>

      {isProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Product to {activeTable.name}</h2>
            <ProductForm customFields={customFields} onSubmit={handleCreateProduct} onCancel={() => setIsProductModalOpen(false)} />
          </div>
        </div>
      )}

      {isColumnModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content column-modal">
            <h2>Manage Columns for {activeTable.name}</h2>
            <div className="current-columns" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem' }}>
              {customFields.map((f: any) => (
                <div key={f.name} className="column-item">
                  <span>{f.label} <small style={{ color: 'var(--text-tertiary)' }}>({f.type})</small></span>
                  <button className="btn-delete" onClick={() => handleDeleteColumn(f.name)}>×</button>
                </div>
              ))}
              {customFields.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No custom columns yet.</p>}
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>Add New Column</h3>
            <div className="add-column-form">
              <input
                type="text"
                placeholder="Column Label (e.g. Brand)"
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
        </div>
      )}
    </div>
  );
};
