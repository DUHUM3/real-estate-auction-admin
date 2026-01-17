// components/Pagination.jsx
// Reusable pagination component with prev/next and page numbers
// Handles ellipsis for large page counts

import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.last_page <= 1) return null;

  const pages = [];

  pages.push(
    <button
      key="prev"
      className={`flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 ${
        pagination.current_page === 1
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-white text-gray-700 hover:bg-gray-50"
      }`}
      onClick={() =>
        pagination.current_page > 1 &&
        onPageChange(pagination.current_page - 1)
      }
      disabled={pagination.current_page === 1}
    >
      <ChevronRight className="w-4 h-4" />
    </button>
  );

  const showPages = [];
  showPages.push(1);

  if (pagination.current_page > 3) {
    showPages.push("ellipsis-start");
  }

  for (
    let i = Math.max(2, pagination.current_page - 1);
    i <= Math.min(pagination.last_page - 1, pagination.current_page + 1);
    i++
  ) {
    showPages.push(i);
  }

  if (pagination.current_page < pagination.last_page - 2) {
    showPages.push("ellipsis-end");
  }

  if (pagination.last_page > 1) {
    showPages.push(pagination.last_page);
  }

  const uniquePages = [...new Set(showPages)];

  uniquePages.forEach((page) => {
    if (page === "ellipsis-start" || page === "ellipsis-end") {
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
          className={`flex items-center justify-center w-10 h-10 rounded-lg border ${
            pagination.current_page === page
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
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
      className={`flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 ${
        pagination.current_page === pagination.last_page
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-white text-gray-700 hover:bg-gray-50"
      }`}
      onClick={() =>
        pagination.current_page < pagination.last_page &&
        onPageChange(pagination.current_page + 1)
      }
      disabled={pagination.current_page === pagination.last_page}
    >
      <ChevronLeft className="w-4 h-4" />
    </button>
  );

  return pages;
};

export default Pagination;