import React from 'react';
import { Issue } from './KanbanBoard';

interface TimelineViewProps {
  issues: Issue[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ issues }) => {
  return (
    <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '1rem' }}>Project Timeline</h3>
      <div style={{ border: '1px solid var(--border-color)', borderRadius: '4px', padding: '1rem' }}>
        {issues.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No issues to display on timeline.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {issues.map(issue => (
              <div key={issue.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: 'var(--bg-primary)', borderRadius: '4px' }}>
                <div style={{ width: '150px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.title}</div>
                <div style={{ flex: 1, height: '8px', background: 'var(--border-color)', borderRadius: '4px', position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: '20%', // placeholder positioning
                    width: '30%', // placeholder width
                    height: '100%', 
                    background: 'var(--color-accent-pm)', 
                    borderRadius: '4px' 
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
