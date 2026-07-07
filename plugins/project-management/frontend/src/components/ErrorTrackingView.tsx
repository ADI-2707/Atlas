import React from 'react';
import { Button } from '@atlas/ui';

interface ErrorLog {
  id: string;
  message: string;
  source: string;
  status: string;
  createdAt: string;
}

interface ErrorTrackingViewProps {
  projectId: string;
}

export const ErrorTrackingView: React.FC<ErrorTrackingViewProps> = ({ projectId }) => {
  const [logs, setLogs] = React.useState<ErrorLog[]>([]);

  React.useEffect(() => {
    setLogs([
      { id: '1', message: 'TypeError: undefined is not an object', source: 'SYSTEM', status: 'UNRESOLVED', createdAt: new Date().toISOString() },
      { id: '2', message: 'Failed to fetch resource', source: 'USER', status: 'RESOLVED', createdAt: new Date().toISOString() }
    ]);
  }, [projectId]);

  return (
    <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Error Tracking (Automated Ingestion)</h3>
        <Button variant="secondary" size="small">Configure Webhooks</Button>
      </div>
      <div className="table-container">
        <table className="atlas-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Message</th>
              <th>Source</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td><code style={{ fontSize: '0.85rem' }}>{log.message}</code></td>
                <td>{log.source}</td>
                <td>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    backgroundColor: log.status === 'RESOLVED' ? '#10b98120' : '#ef444420',
                    color: log.status === 'RESOLVED' ? '#10b981' : '#ef4444'
                  }}>
                    {log.status}
                  </span>
                </td>
                <td><Button size="small" variant="secondary">View</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
