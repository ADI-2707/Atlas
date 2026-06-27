import React, { useState, useEffect } from 'react';
import { Button } from '@atlas/ui';
import { api } from '@atlas/api';
import { ProductForm } from '../components/ProductForm';
import './InventoryDashboard.css';

export const InventoryDashboard: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const [configRes, productsRes] = await Promise.all([
        api.get<{ data: any }>('/inventory/config'),
        api.get<{ data: any[] }>('/inventory/products')
      ]);

      setConfig(configRes.data);
      setProducts(productsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch inventory data', err);
    }
  };

  const handleCreateProduct = async (data: any) => {
    try {
      await api.post('/inventory/products', data);
      fetchInventoryData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create product', err);
    }
  };

  if (!config) return <div style={{ padding: '2rem', color: '#fff' }}>Loading Inventory...</div>;

  const customFields = config.fieldSchema || [];

  return (
    <div className="inventory-dashboard">
      <div className="dashboard-header">
        <h1>Inventory Management</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Add Product</Button>
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Product</h2>
            <ProductForm customFields={customFields} onSubmit={handleCreateProduct} onCancel={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
