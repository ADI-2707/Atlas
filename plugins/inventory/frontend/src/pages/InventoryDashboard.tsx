import React, { useState, useEffect } from 'react';
import { Button } from '@atlas/ui';
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
    const token = localStorage.getItem('atlas_token') || sessionStorage.getItem('atlas_token');
    if (!token) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
      
      const [configRes, productsRes] = await Promise.all([
        fetch(`${apiUrl}/inventory/config`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiUrl}/inventory/products`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (configRes.ok && productsRes.ok) {
        setConfig(await configRes.json());
        setProducts(await productsRes.json());
      }
    } catch (err) {
      console.error('Failed to fetch inventory data', err);
    }
  };

  const handleCreateProduct = async (data: any) => {
    const token = localStorage.getItem('atlas_token') || sessionStorage.getItem('atlas_token');
    if (!token) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
      const res = await fetch(`${apiUrl}/inventory/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        fetchInventoryData();
        setIsModalOpen(false);
      }
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
