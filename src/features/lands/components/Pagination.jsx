/**
 * Pagination component
 * Handles page navigation
 */

import React from "react";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";

const Pagination = ({ pagination, currentPage, onPageChange }) => {
  if (!pagination || pagination.last_page <= 1) return null;

  const renderPages = () => {
    const pages = [];

    pages.push(
      <button
        key="prev"
        className={`px-3 py-1 rounded border ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FiChevronRight />
      </button>
    );

    const showPages = [];
    showPages.push(1);

    if (currentPage > 3) {
      showPages.push("ellipsis-start");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(pagination.last_page - 1, currentPage + 1);
      i++
    ) {
      showPages.push(i);
    }

    if (currentPage < pagination.last_page - 2) {
      showPages.push("ellipsis-end");
    }

    if (pagination.last_page > 1) {
      showPages.push(pagination.last_page);
    }

    const uniquePages = [...new Set(showPages)];

    uniquePages.forEach((page) => {
      if (page === "ellipsis-start" || page === "ellipsis-end") {
        pages.push(
          <span key={page} className="px-2 py-1">
            ...
          </span>
        );
      } else {
        pages.push(
          <button
            key={page}
            className={`px-3 py-1 rounded border ${
              currentPage === page
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        );
      }
    });

    pages.push(
      <button
        key="next"
        className={`px-3 py-1 rounded border ${
          currentPage === pagination.last_page
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() =>
          currentPage < pagination.last_page && onPageChange(currentPage + 1)
        }
        disabled={currentPage === pagination.last_page}
      >
        <FiChevronLeft />
      </button>
    );

    return pages;
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex justify-center items-center space-x-2 space-x-reverse">
        {renderPages()}
      </div>
    </div>
  );
};

export default Pagination;