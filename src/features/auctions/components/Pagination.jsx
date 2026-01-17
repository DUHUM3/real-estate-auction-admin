import React from "react";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";

const Pagination = ({ currentPage, totalPages, totalItems, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];

  // Previous button
  pages.push(
    <button
      key="prev"
      className={`p-2 rounded-lg border transition-all ${
        currentPage === 1
          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
          : "bg-white text-gray-700 hover:bg-blue-50 border-gray-300 hover:border-blue-300"
      }`}
      onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      <FiChevronRight size={18} />
    </button>
  );

  // Page numbers
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (endPage - startPage < 4) {
    if (currentPage < 3) {
      endPage = Math.min(totalPages, 5);
    } else {
      startPage = Math.max(1, totalPages - 4);
    }
  }

  // First page
  if (startPage > 1) {
    pages.push(
      <button
        key={1}
        className={`p-2 min-w-[40px] rounded-lg border transition-all ${
          currentPage === 1
            ? "bg-blue-600 text-white border-blue-600 shadow-md"
            : "bg-white text-gray-700 hover:bg-blue-50 border-gray-300 hover:border-blue-300"
        }`}
        onClick={() => onPageChange(1)}
      >
        1
      </button>
    );

    if (startPage > 2) {
      pages.push(
        <span key="ellipsis-start" className="px-3 py-2 text-gray-500">
          ...
        </span>
      );
    }
  }

  // Middle pages
  for (let i = startPage; i <= endPage; i++) {
    if (i === 1 && startPage > 1) continue;

    pages.push(
      <button
        key={i}
        className={`p-2 min-w-[40px] rounded-lg border transition-all ${
          currentPage === i
            ? "bg-blue-600 text-white border-blue-600 shadow-md"
            : "bg-white text-gray-700 hover:bg-blue-50 border-gray-300 hover:border-blue-300"
        }`}
        onClick={() => onPageChange(i)}
      >
        {i}
      </button>
    );
  }

  // Last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push(
        <span key="ellipsis-end" className="px-3 py-2 text-gray-500">
          ...
        </span>
      );
    }

    pages.push(
      <button
        key={totalPages}
        className={`p-2 min-w-[40px] rounded-lg border transition-all ${
          currentPage === totalPages
            ? "bg-blue-600 text-white border-blue-600 shadow-md"
            : "bg-white text-gray-700 hover:bg-blue-50 border-gray-300 hover:border-blue-300"
        }`}
        onClick={() => onPageChange(totalPages)}
      >
        {totalPages}
      </button>
    );
  }

  // Next button
  pages.push(
    <button
      key="next"
      className={`p-2 rounded-lg border transition-all ${
        currentPage === totalPages
          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
          : "bg-white text-gray-700 hover:bg-blue-50 border-gray-300 hover:border-blue-300"
      }`}
      onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      <FiChevronLeft size={18} />
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-gray-600 font-medium">
        الصفحة {currentPage} من {totalPages} - إجمالي {totalItems} نتيجة
      </div>
      <div className="flex items-center gap-1 flex-wrap justify-center">{pages}</div>
    </div>
  );
};

export default Pagination;