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

  // 兜底处理，避免 undefined 导致 NaN 或键名显示问题
  const safeCurrent = Number.isFinite(currentPage) ? currentPage : 1;
  const safeTotalPages = Number.isFinite(totalPages) ? totalPages : 1;
  const safePerPage = Number.isFinite(itemsPerPage) ? itemsPerPage : 10;
  const safeTotalItems = Number.isFinite(totalItems) ? totalItems : 0;

  if (safeTotalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, safeCurrent - delta); 
         i <= Math.min(safeTotalPages - 1, safeCurrent + delta); 
         i++) {
      range.push(i);
    }

    if (safeCurrent - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (safeCurrent + delta < safeTotalPages - 1) {
      rangeWithDots.push('...', safeTotalPages);
    } else {
      rangeWithDots.push(safeTotalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      <div className="text-sm text-gray-500">
        {t('pagination.showing', {
          start: (safeCurrent - 1) * safePerPage + 1,
          end: Math.min(safeCurrent * safePerPage, safeTotalItems),
          total: safeTotalItems
        })}
      </div>

      <nav aria-label="Pagination">
        <ul className="inline-flex items-center gap-1">
          <li>
            <button
              onClick={() => safeCurrent > 1 && onPageChange(safeCurrent - 1)}
              className={`px-3 py-2 rounded-md border text-sm ${safeCurrent <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              disabled={safeCurrent <= 1}
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
                  className={`px-3 py-2 rounded-md border text-sm ${page === safeCurrent ? 'bg-gray-100 border-gray-300' : 'hover:bg-gray-50'}`}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

          <li>
            <button
              onClick={() => safeCurrent < safeTotalPages && onPageChange(safeCurrent + 1)}
              className={`px-3 py-2 rounded-md border text-sm ${safeCurrent >= safeTotalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              disabled={safeCurrent >= safeTotalPages}
            >
              {t('common.next')}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

