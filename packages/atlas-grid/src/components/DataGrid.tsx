import React, { useState, useMemo } from 'react';
import './DataGrid.css';

export interface Column<T> {
  id: string;
  header: React.ReactNode;
  accessor?: keyof T;
  renderCell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataGridProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    pageSizeOptions?: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  isLoading?: boolean;
  emptyMessage?: React.ReactNode;
}

export function DataGrid<T>({
  columns,
  data,
  keyExtractor,
  pagination,
  isLoading,
  emptyMessage = 'No data available.'
}: DataGridProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (columnId: string, sortable?: boolean) => {
    if (!sortable) return;
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === columnId && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnId, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const column = columns.find(c => c.id === sortConfig.key);
      if (!column || !column.accessor) return 0;

      const aValue = a[column.accessor];
      const bValue = b[column.accessor];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig, columns]);

  return (
    <div className="atlas-datagrid-container">
      <div className="atlas-datagrid-wrapper">
        <table className="atlas-datagrid">
          <thead>
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.id} 
                  onClick={() => handleSort(col.id, col.sortable)}
                  className={col.sortable ? 'sortable-header' : ''}
                >
                  <div className="header-content">
                    {col.header}
                    {col.sortable && sortConfig?.key === col.id && (
                      <span className="sort-icon">{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="datagrid-message">Loading...</td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="datagrid-message">{emptyMessage}</td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <tr key={keyExtractor(row)}>
                  {columns.map((col) => (
                    <td key={col.id}>
                      {col.renderCell ? col.renderCell(row) : (col.accessor ? String(row[col.accessor]) : null)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="atlas-datagrid-pagination">
          <div className="pagination-controls">
            <button 
              disabled={pagination.currentPage <= 1} 
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            >
              Previous
            </button>
            <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
            <button 
              disabled={pagination.currentPage >= pagination.totalPages} 
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            >
              Next
            </button>
          </div>
          <div className="pagination-size">
            <select 
              value={pagination.pageSize} 
              onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
            >
              {(pagination.pageSizeOptions || [10, 20, 50]).map(size => (
                <option key={size} value={size}>Show {size}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
