import React, { useState } from 'react';
import { Button } from '@atlas/ui';

interface ProjectModalProps {
  onClose: () => void;
  onSubmit: (data: { name: string; key: string; description: string }) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !key) return;
    onSubmit({ name, key: key.toUpperCase(), description });
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="modal-content" style={{ backgroundColor: 'var(--bg-surface-primary)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Create New Project</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Project Name</label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (!key) {
                  setKey(e.target.value.substring(0, 3).toUpperCase());
                }
              }}
              className="atlas-input"
              style={{ width: '100%' }}
              required
              autoFocus
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Project Key</label>
            <input
              type="text"
              value={key}
              onChange={e => setKey(e.target.value.toUpperCase())}
              className="atlas-input"
              style={{ width: '100%' }}
              maxLength={6}
              required
            />
            <small style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>E.g. PRJ</small>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="atlas-input"
              style={{ width: '100%' }}
              rows={3}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button variant="primary" type="submit">Create</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
