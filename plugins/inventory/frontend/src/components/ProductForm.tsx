import React, { useState } from 'react';
import { Button, Input } from '@atlas/ui';

interface ProductFormProps {
  customFields: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ customFields, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    basePrice: '',
  });
  
  const [customData, setCustomData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      basePrice: parseFloat(formData.basePrice) || 0,
      customData
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
      <Input
        label="Product Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <Input
        label="SKU"
        value={formData.sku}
        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
        required
      />
      <Input
        label="Base Price"
        type="number"
        step="0.01"
        value={formData.basePrice}
        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
        required
      />

      {customFields.map(field => (
        <Input
          key={field.name}
          label={field.label}
          type={field.type === 'number' ? 'number' : 'text'}
          value={customData[field.name] || ''}
          onChange={(e) => setCustomData({ ...customData, [field.name]: e.target.value })}
        />
      ))}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
        <Button variant="secondary" onClick={onCancel} type="button">Cancel</Button>
        <Button variant="primary" type="submit">Save Product</Button>
      </div>
    </form>
  );
};
