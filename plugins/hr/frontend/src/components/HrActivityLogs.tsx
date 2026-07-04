import React, { useState, useEffect } from 'react';
import { api } from '@atlas/api';
import { Pagination, useDebounce } from '@atlas/ui';

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  result: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  details: any;
}

export const HrActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchLogs();
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (debouncedSearch.trim()) {
        queryParams.append('search', debouncedSearch.trim());
      }
      const res = await api.get<{ data: any }>('/hr/audit-logs?' + queryParams.toString());
      setLogs(res.data?.data || []);
      setTotalPages(res.data?.meta?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch hr.audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    return action.replace('hr.', '').replace('.', ' ').toUpperCase();
  };

  const getReadableDetails = (log: AuditLog) => {
    const details = log.details || {};
    switch (log.action) {
      case 'hr.employee.created':
        return `Created employee "${details.firstName} ${details.lastName}"`;
      case 'hr.employee.updated':
        return `Updated employee "${details.firstName} ${details.lastName}"`;
      case 'hr.employee.deleted':
        return `Deleted employee "${details.firstName} ${details.lastName}"`;
      case 'hr.payroll.processed':
        return `Processed payroll for employee ${details.employeeId}`;
      default:
        return JSON.stringify(details);
    }
  };

  return (
    <div className="hr.activity-logs-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
      
      <div className="table-actions-bar" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search logs by action..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="atlas-input"
          style={{ maxWidth: '300px' }}
        />
      </div>

      <div className="table-container" style={{ background: 'var(--bg-surface-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table className="atlas-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>Action</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>Details</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left' }}>Performed By</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>Result</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>Loading logs...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>No hr.logs found.</td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log.id}>
                <td style={{ padding: '1rem 1.5rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{getActionLabel(log.action)}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{getReadableDetails(log)}</td>
                <td style={{ padding: '1rem 1.5rem' }}>{log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}</td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                  <span className="badge badge-customer" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    {log.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={limit}
        pageSizeOptions={[5, 10, 20, 50]}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(s) => {
          setLimit(s);
          setPage(1);
        }}
      />
    </div>
  );
};
