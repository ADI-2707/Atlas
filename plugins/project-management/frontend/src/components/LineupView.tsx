import React from 'react';
import { Button } from '@atlas/ui';

interface Lineup {
  id: string;
  name: string;
  allocatedUserId?: string;
}

interface LineupViewProps {
  projectId: string;
}

export const LineupView: React.FC<LineupViewProps> = ({ projectId }) => {
  const [lineups, setLineups] = React.useState<Lineup[]>([]);

  React.useEffect(() => {
    setLineups([
      { id: '1', name: 'Design Phase', allocatedUserId: 'user-1' },
      { id: '2', name: 'Development Phase', allocatedUserId: 'user-2' },
      { id: '3', name: 'QA Phase', allocatedUserId: 'user-3' }
    ]);
  }, [projectId]);

  return (
    <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Custom Lineups & Workflows</h3>
        <Button variant="primary" size="small">+ Add Stage</Button>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Define custom stages for this project and allocate resources to each step.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {lineups.map((l, idx) => (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-primary)' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--color-accent-pm)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {idx + 1}
            </div>
            <div style={{ flex: 1, fontWeight: 500 }}>{l.name}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Allocated: {l.allocatedUserId ? <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>User {l.allocatedUserId}</span> : 'Unassigned'}
            </div>
            <Button variant="secondary" size="small">Edit</Button>
          </div>
        ))}
      </div>
    </div>
  );
};
