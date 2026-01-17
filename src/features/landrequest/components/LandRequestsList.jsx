// components/LandRequestsList.jsx
import React from "react";
import {
  FiUser,
  FiNavigation,
  FiTarget,
  FiCalendar,
  FiMessageSquare,
  FiGitPullRequest,
  FiMap,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import { STATUS_CONFIG, PURPOSE_TEXT, TYPE_TEXT } from "../constants/landRequestsConstants";

const formatDate = (dateString) => {
  if (!dateString) return "غير محدد";
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const LandRequestsList = ({
  requests,
  pagination,
  selectedRequestId,
  onSelectRequest,
  currentPage,
  onPageChange,
  loading,
  hasActiveFilters,
  onClearFilters,
}) => {
  const renderPagination = () => {
    if (!pagination || pagination.last_page <= 1) return null;

    const pages = [];

    // Previous button
    pages.push(
      <button
        key="prev"
        className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FiChevronRight className="w-4 h-4" />
      </button>
    );

    // Page numbers
    const showPages = [];
    showPages.push(1);

    if (currentPage > 3) showPages.push("ellipsis-start");

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(pagination.last_page - 1, currentPage + 1);
      i++
    ) {
      showPages.push(i);
    }

    if (currentPage < pagination.last_page - 2) showPages.push("ellipsis-end");

    if (pagination.last_page > 1) showPages.push(pagination.last_page);

    const uniquePages = [...new Set(showPages)];

    uniquePages.forEach((page) => {
      if (page === "ellipsis-start" || page === "ellipsis-end") {
        pages.push(
          <span
            key={page}
            className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
          >
            ...
          </span>
        );
      } else {
        pages.push(
          <button
            key={page}
            className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
              currentPage === page
                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        );
      }
    });

    // Next button
    pages.push(
      <button
        key="next"
        className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
          currentPage === pagination.last_page
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => currentPage < pagination.last_page && onPageChange(currentPage + 1)}
        disabled={currentPage === pagination.last_page}
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>
    );

    return pages;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-medium text-gray-900">
            قائمة طلبات الأراضي ({requests.length})
          </h3>
          <span className="text-sm text-gray-500">
            {pagination.total > 0 ? (
              <>
                عرض {pagination.from} إلى {pagination.to} من {pagination.total} - الصفحة{" "}
                {pagination.current_page} من {pagination.last_page}
              </>
            ) : (
              "لا توجد نتائج"
            )}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
              <div
                className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <p className="mt-4 text-sm text-gray-500">جاري تحميل البيانات...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <FiMap className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">لا توجد نتائج</p>
            {hasActiveFilters && (
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={onClearFilters}
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedRequestId === request.id
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => onSelectRequest(request)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {request.user?.name || request.user?.full_name || "مستخدم غير معروف"}
                          </h4>
                          <div
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              STATUS_CONFIG[request.status]?.color || "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {STATUS_CONFIG[request.status]?.text || request.status}
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <FiNavigation className="w-3 h-3" />
                            <span>
                              {request.region} - {request.city}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiTarget className="w-3 h-3" />
                            <span>
                              {PURPOSE_TEXT[request.purpose] || request.purpose} -{" "}
                              {TYPE_TEXT[request.type] || request.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            <span>{formatDate(request.created_at)}</span>
                          </div>
                          {request.description && (
                            <div className="flex items-start gap-1">
                              <FiMessageSquare className="w-3 h-3 mt-0.5" />
                              <span className="line-clamp-1">{request.description}</span>
                            </div>
                          )}
                          {request.offers && request.offers.length > 0 && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <FiGitPullRequest className="w-3 h-3" />
                              <span>{request.offers.length} عرض</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="mt-6 flex items-center justify-center">
                <div className="flex items-center space-x-1">{renderPagination()}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LandRequestsList;