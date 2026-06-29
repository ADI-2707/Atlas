import React from 'react';
import './Pagination.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  disabled = false,
}) => {
  if (totalPages <= 1 && !onPageSizeChange) return null;

  const handlePrev = () => {
    if (currentPage > 1 && !disabled) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !disabled) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('ellipsis-start');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }

      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`atlas-pagination ${disabled ? 'atlas-pagination--disabled' : ''}`}>
      <div className="atlas-pagination__controls">
        <button
          type="button"
          className="atlas-pagination__btn atlas-pagination__btn--prev"
          onClick={handlePrev}
          disabled={currentPage === 1 || disabled}
        >
          &larr; Prev
        </button>

        {pages.map((p, index) => {
          if (p === 'ellipsis-start' || p === 'ellipsis-end') {
            return (
              <span key={`ellipsis-${index}`} className="atlas-pagination__ellipsis">
                ...
              </span>
            );
          }

          return (
            <button
              type="button"
              key={`page-${p}`}
              className={`atlas-pagination__btn atlas-pagination__btn--number ${
                currentPage === p ? 'atlas-pagination__btn--active' : ''
              }`}
              onClick={() => onPageChange(p as number)}
              disabled={disabled}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          className="atlas-pagination__btn atlas-pagination__btn--next"
          onClick={handleNext}
          disabled={currentPage === totalPages || totalPages === 0 || disabled}
        >
          Next &rarr;
        </button>
      </div>

      {onPageSizeChange && (
        <div className="atlas-pagination__size-selector">
          <span className="atlas-pagination__size-label">Show</span>
          <select
            className="atlas-pagination__select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={disabled}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="atlas-pagination__size-label">items</span>
        </div>
      )}
    </div>
  );
};
