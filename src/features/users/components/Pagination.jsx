// components/Pagination.jsx
// مسؤول عن: عرض أزرار الباجينيشن

import React from 'react';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';

const Pagination = ({ pagination, currentPage, onPageChange }) => {
  if (!pagination || pagination.last_page <= 1) return null;

  const renderPageButtons = () => {
    const pages = [];
    const showPages = [];

    showPages.push(1);

    if (currentPage > 3) {
      showPages.push('ellipsis-start');
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(pagination.last_page - 1, currentPage + 1);
      i++
    ) {
      showPages.push(i);
    }

    if (currentPage < pagination.last_page - 2) {
      showPages.push('ellipsis-end');
    }

    if (pagination.last_page > 1) {
      showPages.push(pagination.last_page);
    }

    const uniquePages = [...new Set(showPages)];

    uniquePages.forEach((page) => {
      if (page === 'ellipsis-start' || page === 'ellipsis-end') {
        pages.push(
          <span
            key={page}
            className="flex items-center justify-center w-10 h-10 text-gray-500"
          >
            ...
          </span>
        );
      } else {
        pages.push(
          <button
            key={page}
            className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
              currentPage === page
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        );
      }
    });

    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 py-4 border-t border-gray-100 bg-white">
      <button
        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
          currentPage === 1
            ? 'border-gray-300 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FiChevronRight size={18} />
      </button>

      {renderPageButtons()}

      <button
        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
          currentPage === pagination.last_page
            ? 'border-gray-300 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
        onClick={() =>
          currentPage < pagination.last_page && onPageChange(currentPage + 1)
        }
        disabled={currentPage === pagination.last_page}
      >
        <FiChevronLeft size={18} />
      </button>
    </div>
  );
};

export default Pagination;