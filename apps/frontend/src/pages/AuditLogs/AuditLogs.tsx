import React, { useEffect, useState } from 'react';
import { api as apiClient } from '@atlas/api';
import './AuditLogs.css';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string | null;
  pluginId: string | null;
  action: string;
  result: string;
  ipAddress: string | null;
  details: any;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: search || ''
      });
      const response = await apiClient.get<any>(`/audit?${queryParams.toString()}`);
      
      if (response.success && response.data) {
        setLogs(response.data.items || []);
        setTotalPages(response.data.meta.totalPages || 1);
      } else {
        setLogs([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search]);

  return (
    <div className="audit-logs-page">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p>Organization-wide activity and security events.</p>
      </div>

      <div className="logs-controls">
        <input 
          type="text" 
          placeholder="Search actions or results..." 
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading">Loading logs...</div>
      ) : (
        <div className="logs-table-container glass-panel">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Result</th>
                <th>Plugin / IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                  </td>
                  <td>
                    <span className="badge badge-action">{log.action}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${log.result.toLowerCase()}`}>
                      {log.result}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm">
                      {log.pluginId ? `Plugin: ${log.pluginId}` : 'Core Platform'}
                      <br />
                      <span className="text-muted">{log.ipAddress || 'Unknown IP'}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4">No logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(p => p - 1)}
          className="btn btn-ghost"
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button 
          disabled={page === totalPages} 
          onClick={() => setPage(p => p + 1)}
          className="btn btn-ghost"
        >
          Next
        </button>
      </div>
    </div>
  );
};
