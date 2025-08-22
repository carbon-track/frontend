import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage, 
  totalItems,
  className = '' 
}) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      <div className="text-sm text-gray-500">
        {t('common.pagination.showing', {
          start: (currentPage - 1) * itemsPerPage + 1,
          end: Math.min(currentPage * itemsPerPage, totalItems),
          total: totalItems
        })}
      </div>

      <nav aria-label="Pagination">
        <ul className="inline-flex items-center gap-1">
          <li>
            <button
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              className={`px-3 py-2 rounded-md border text-sm ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              disabled={currentPage <= 1}
            >
              {t('common.previous')}
            </button>
          </li>

          {visiblePages.map((page, index) => (
            <li key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-sm text-gray-400">…</span>
              ) : (
                <button
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-2 rounded-md border text-sm ${page === currentPage ? 'bg-gray-100 border-gray-300' : 'hover:bg-gray-50'}`}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

          <li>
            <button
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              className={`px-3 py-2 rounded-md border text-sm ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              disabled={currentPage >= totalPages}
            >
              {t('common.next')}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

