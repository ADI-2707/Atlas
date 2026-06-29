import React, { useState, useEffect } from 'react';
import { api } from '@atlas/api';
import { Pagination, useDebounce } from '@atlas/ui';

interface Transaction {
  id: string;
  type: string;
  quantity: number;
  reference: string | null;
  createdAt: string;
  product: {
    sku: string;
    name: string;
  };
  warehouse: {
    name: string;
  } | null;
}

export const AdjustmentLogs: React.FC = () => {
  const [logs, setLogs] = useState<Transaction[]>([]);
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
      
      const res = await api.get<{ data: any }>('/inventory/stock/transactions?' + queryParams.toString());
      setLogs(res.data?.data || []);
      setTotalPages(res.data?.meta?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch stock transactions', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getQuantityBadge = (qty: number) => {
    const isPositive = qty > 0;
    const style = {
      color: isPositive ? '#10b981' : '#ef4444',
      fontWeight: 'bold',
      background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      padding: '0.2rem 0.5rem',
      borderRadius: '4px',
      display: 'inline-block'
    };
    return <span style={style}>{isPositive ? `+${qty}` : qty}</span>;
  };

  return (
    <div className="adjustment-logs-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
      
      <div className="table-actions-bar" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search logs by product name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="atlas-input"
          style={{ maxWidth: '300px' }}
        />
      </div>

      <div className="table-container" style={{ background: '#1a1a1a', borderRadius: '8px', border: '1px solid #333', overflow: 'hidden' }}>
        <table className="atlas-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '1rem 1.5rem', background: '#222', color: '#aaa', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '1rem 1.5rem', background: '#222', color: '#aaa', textAlign: 'left' }}>SKU</th>
              <th style={{ padding: '1rem 1.5rem', background: '#222', color: '#aaa', textAlign: 'left' }}>Product</th>
              <th style={{ padding: '1rem 1.5rem', background: '#222', color: '#aaa', textAlign: 'left' }}>Warehouse</th>
              <th style={{ padding: '1rem 1.5rem', background: '#222', color: '#aaa', textAlign: 'center' }}>Adjustment</th>
              <th style={{ padding: '1rem 1.5rem', background: '#222', color: '#aaa', textAlign: 'left' }}>Reference Notes</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>Loading logs...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>No stock transactions found.</td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '1rem 1.5rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                <td style={{ padding: '1rem 1.5rem' }}>{log.product.sku}</td>
                <td style={{ padding: '1rem 1.5rem' }}>{log.product.name}</td>
                <td style={{ padding: '1rem 1.5rem' }}>{log.warehouse?.name || '-'}</td>
                <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                  {getQuantityBadge(log.quantity)}
                </td>
                <td style={{ padding: '1rem 1.5rem', color: '#ccc', fontSize: '0.9rem' }}>{log.reference || '-'}</td>
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
