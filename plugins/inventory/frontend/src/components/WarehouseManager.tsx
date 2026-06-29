import React, { useState, useEffect } from 'react';
import { Button } from '@atlas/ui';
import { api } from '@atlas/api';

interface Warehouse {
  id: string;
  name: string;
  location: string | null;
}

interface WarehouseManagerProps {
  products: any[];
  onRefreshProducts: () => void;
}

export const WarehouseManager: React.FC<WarehouseManagerProps> = ({ products, onRefreshProducts }) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  
  const [isAddingWarehouse, setIsAddingWarehouse] = useState(false);
  const [whName, setWhName] = useState('');
  const [whLocation, setWhLocation] = useState('');
  const [editingWhId, setEditingWhId] = useState<string | null>(null);

  const [adjustingStockMap, setAdjustingStockMap] = useState<Record<string, number>>({});
  const [isSavingStock, setIsSavingStock] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await api.get<{ data: Warehouse[] }>('/inventory/warehouses');
      const whList = res.data || [];
      setWarehouses(whList);
      if (whList.length > 0 && !selectedWarehouseId) {
        setSelectedWarehouseId(whList[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch warehouses', err);
    }
  };

  const handleAddWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName.trim()) return;
    try {
      if (editingWhId) {
        await api.patch(`/inventory/warehouses/${editingWhId}`, { name: whName, location: whLocation });
      } else {
        const res = await api.post<any>('/inventory/warehouses', { name: whName, location: whLocation });
        if (res && res.id && !selectedWarehouseId) {
          setSelectedWarehouseId(res.id);
        }
      }
      setWhName('');
      setWhLocation('');
      setIsAddingWarehouse(false);
      setEditingWhId(null);
      await fetchWarehouses();
    } catch (err) {
      console.error('Failed to save warehouse', err);
    }
  };

  const handleEditWarehouseClick = (wh: Warehouse) => {
    setWhName(wh.name);
    setWhLocation(wh.location || '');
    setEditingWhId(wh.id);
    setIsAddingWarehouse(true);
  };

  const handleDeleteWarehouse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this warehouse? This will also remove all stock counts stored in it.')) {
      return;
    }
    try {
      await api.delete(`/inventory/warehouses/${id}`);
      if (selectedWarehouseId === id) {
        setSelectedWarehouseId(null);
      }
      await fetchWarehouses();
      onRefreshProducts();
    } catch (err) {
      console.error('Failed to delete warehouse', err);
    }
  };

  const handleStockInputChange = (productId: string, val: string) => {
    const num = parseInt(val, 10);
    setAdjustingStockMap(prev => ({
      ...prev,
      [productId]: isNaN(num) ? 0 : num
    }));
  };

  const handleSaveStock = async (productId: string) => {
    if (!selectedWarehouseId) return;
    const quantity = adjustingStockMap[productId];
    if (quantity === undefined || quantity < 0) return;

    setIsSavingStock(prev => ({ ...prev, [productId]: true }));
    try {
      await api.post('/inventory/stock/adjust', {
        productId,
        warehouseId: selectedWarehouseId,
        quantity
      });
      onRefreshProducts();
      setAdjustingStockMap(prev => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
    } catch (err) {
      console.error('Failed to adjust stock', err);
      alert('Failed to update stock quantity');
    } finally {
      setIsSavingStock(prev => ({ ...prev, [productId]: false }));
    }
  };

  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId);

  return (
    <div className="warehouse-manager-container" style={{ display: 'flex', gap: '2rem', marginTop: '1rem', minHeight: '400px' }}>
      
      {/* Left Pane - Warehouses List */}
      <div className="warehouse-list-pane" style={{ flex: '1', background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Warehouses</h2>
          <Button variant="primary" size="small" onClick={() => {
            setIsAddingWarehouse(true);
            setEditingWhId(null);
            setWhName('');
            setWhLocation('');
          }}>+ Add</Button>
        </div>

        {isAddingWarehouse && (
          <form onSubmit={handleAddWarehouse} style={{ background: '#222', padding: '1rem', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid #444' }}>
            <h3 style={{ fontSize: '0.9rem', margin: 0 }}>{editingWhId ? 'Edit Warehouse' : 'New Warehouse'}</h3>
            <input
              placeholder="Warehouse Name"
              value={whName}
              onChange={e => setWhName(e.target.value)}
              className="atlas-input"
              required
              style={{ width: '100%' }}
            />
            <input
              placeholder="Location (optional)"
              value={whLocation}
              onChange={e => setWhLocation(e.target.value)}
              className="atlas-input"
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button type="button" variant="secondary" size="small" onClick={() => setIsAddingWarehouse(false)}>Cancel</Button>
              <Button type="submit" variant="primary" size="small">Save</Button>
            </div>
          </form>
        )}

        <div className="warehouses-scroll" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {warehouses.map(wh => (
            <div
              key={wh.id}
              onClick={() => setSelectedWarehouseId(wh.id)}
              style={{
                padding: '0.75rem 1rem',
                background: selectedWarehouseId === wh.id ? 'var(--color-accent-active)' : '#262626',
                color: selectedWarehouseId === wh.id ? '#000' : '#fff',
                fontWeight: selectedWarehouseId === wh.id ? '600' : '400',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.2s',
              }}
            >
              <div>
                <div>{wh.name}</div>
                {wh.location && <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>📍 {wh.location}</div>}
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }} onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => handleEditWarehouseClick(wh)}
                  style={{ background: 'transparent', border: 'none', color: selectedWarehouseId === wh.id ? '#000' : '#888', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteWarehouse(wh.id)}
                  style={{ background: 'transparent', border: 'none', color: selectedWarehouseId === wh.id ? '#000' : '#ef5350', cursor: 'pointer', fontSize: '1rem' }}
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
          {warehouses.length === 0 && <div style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>No warehouses configured.</div>}
        </div>
      </div>

      {/* Right Pane - Selected Warehouse Stock List */}
      <div className="warehouse-stock-pane" style={{ flex: '2', background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
        {selectedWarehouse ? (
          <div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              Stock at <span style={{ color: 'var(--color-accent-active)' }}>{selectedWarehouse.name}</span>
            </h2>

            <table className="atlas-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem 1rem', background: '#222', color: '#aaa', textAlign: 'left' }}>SKU</th>
                  <th style={{ padding: '0.75rem 1rem', background: '#222', color: '#aaa', textAlign: 'left' }}>Product Name</th>
                  <th style={{ padding: '0.75rem 1rem', background: '#222', color: '#aaa', textAlign: 'center' }}>Current Stock</th>
                  <th style={{ padding: '0.75rem 1rem', background: '#222', color: '#aaa', textAlign: 'right' }}>Adjust Quantity</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No products found. Add products first.</td>
                  </tr>
                ) : products.map(prod => {
                  const stockEntry = prod.stock?.find((s: any) => s.warehouseId === selectedWarehouseId);
                  const currentQty = stockEntry ? stockEntry.quantity : 0;
                  const isEditing = adjustingStockMap[prod.id] !== undefined;
                  const displayQty = isEditing ? adjustingStockMap[prod.id] : currentQty;

                  return (
                    <tr key={prod.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>{prod.sku}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{prod.name}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 'bold' }}>
                        {currentQty}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <input
                            type="number"
                            min="0"
                            value={displayQty}
                            onChange={e => handleStockInputChange(prod.id, e.target.value)}
                            className="atlas-input"
                            style={{ width: '80px', textAlign: 'center', padding: '0.25rem' }}
                          />
                          {isEditing && (
                            <Button
                              variant="primary"
                              size="small"
                              disabled={isSavingStock[prod.id]}
                              onClick={() => handleSaveStock(prod.id)}
                            >
                              {isSavingStock[prod.id] ? 'Saving...' : 'Set'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#888' }}>
            Select or add a warehouse to manage stock.
          </div>
        )}
      </div>
    </div>
  );
};
