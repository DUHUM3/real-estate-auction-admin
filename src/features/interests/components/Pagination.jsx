// Pagination controls component
import React from "react";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";

const Pagination = ({ pagination, currentPage, setCurrentPage }) => {
  const renderPagination = () => {
    if (!pagination || pagination.last_page <= 1) return null;

    const pages = [];

    pages.push(
      <button
        key="prev"
        className={`flex items-center justify-center w-10 h-10 rounded-md border ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
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
            className={`flex items-center justify-center w-10 h-10 rounded-md border ${
              currentPage === page
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        );
      }
    });

    pages.push(
      <button
        key="next"
        className={`flex items-center justify-center w-10 h-10 rounded-md border ${
          currentPage === pagination.last_page
            ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
        onClick={() =>
          currentPage < pagination.last_page &&
          setCurrentPage(currentPage + 1)
        }
        disabled={currentPage === pagination.last_page}
      >
        <FiChevronLeft />
      </button>
    );

    return pages;
  };

  return (
    <div className="p-6 border-t border-blue-200">
      <div className="flex items-center justify-center space-x-2 space-x-reverse">
        {renderPagination()}
      </div>
    </div>
  );
};

export default Pagination;