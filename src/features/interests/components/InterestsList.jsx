// List of interests with pagination
import React from "react";
import {
  FiUser,
  FiHeart,
  FiCalendar,
  FiMessageSquare,
} from "react-icons/fi";
import Pagination from "./Pagination";
import { useInterestsAPI } from "../../../services/interestsAPI";

const InterestsList = ({
  interests,
  pagination,
  selectedInterest,
  setSelectedInterest,
  currentPage,
  setCurrentPage,
  loading,
  hasActiveFilters,
  clearFilters,
}) => {
  const { formatDate, getStatusBadge } = useInterestsAPI();

  return (
    <div className="xl:col-span-2">
      <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200">
        <div className="p-6 border-b border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
              قائمة طلبات الاهتمام ({interests.length})
            </h3>
            <span className="text-sm text-gray-600">
              {pagination.total > 0 ? (
                <>
                  عرض {pagination.from} إلى {pagination.to} من{" "}
                  {pagination.total} - الصفحة {pagination.current_page} من{" "}
                  {pagination.last_page}
                </>
              ) : (
                "لا توجد نتائج"
              )}
            </span>
          </div>
        </div>

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
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        ) : interests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FiHeart className="text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg mb-4">لا توجد نتائج</p>
            {hasActiveFilters && (
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={clearFilters}
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y divide-blue-200">
              {interests.map((interest) => (
                <div
                  key={interest.id}
                  className={`p-6 cursor-pointer transition-colors ${
                    selectedInterest?.id === interest.id
                      ? "bg-blue-100 border-r-4 border-r-blue-600"
                      : "hover:bg-blue-50"
                  }`}
                  onClick={() => setSelectedInterest(interest)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 space-x-reverse">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <FiUser className="text-blue-600" size={20} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          <h4 className="text-lg font-semibold text-gray-800">
                            {interest.full_name}
                          </h4>
                          {getStatusBadge(interest.status)}
                        </div>
                        <p className="text-gray-600 mb-2">
                          {interest.property?.title}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <FiCalendar className="ml-1" size={14} />
                          <span>{formatDate(interest.created_at)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <FiMessageSquare className="ml-1" size={14} />
                          <span className="truncate">
                            {interest.message?.substring(0, 60)}...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.last_page > 1 && (
              <Pagination
                pagination={pagination}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InterestsList;