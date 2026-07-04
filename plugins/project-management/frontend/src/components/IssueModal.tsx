import React, { useState } from 'react';
import { Button } from '@atlas/ui';

interface IssueModalProps {
  onClose: () => void;
  onSubmit: (data: { title: string; priority: string; description: string }) => void;
}

export const IssueModal: React.FC<IssueModalProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onSubmit({ title, priority, description });
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="modal-content" style={{ backgroundColor: 'var(--bg-surface-primary)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Create New Issue</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="atlas-input"
              style={{ width: '100%' }}
              required
              autoFocus
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="atlas-input"
              style={{ width: '100%' }}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
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
