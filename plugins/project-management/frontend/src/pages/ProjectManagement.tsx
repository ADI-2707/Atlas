import React from 'react';
import { KanbanBoard } from './KanbanBoard';

export const ProjectManagement: React.FC = () => {
  return (
    <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-primary)' }}>Project Board</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>Manage your tasks and issues across columns.</p>
        </div>
        <button style={{ 
          padding: '0.5rem 1rem', 
          backgroundColor: 'var(--primary-color, #3b82f6)', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 500
        }}>
          + New Issue
        </button>
      </div>
      <KanbanBoard />
    </div>
  );
};
