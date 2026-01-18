/**
 * Lands list component
 * Displays filtered lands with pagination
 */

import React from "react";
import { FiMap } from "react-icons/fi";
import LandCard from "./LandCard";
import Pagination from "./Pagination";

const LandsList = ({
  lands,
  pagination,
  loading,
  selectedLandId,
  hasActiveFilters,
  onSelectLand,
  onPageChange,
  onClearFilters,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-semibold text-lg text-gray-800">
            قائمة الأراضي ({lands.length})
          </h3>
          <span className="text-sm text-gray-500">
            {pagination.total > 0 ? (
              <>
                عرض {pagination.from} إلى {pagination.to} من {pagination.total}{" "}
                - الصفحة {pagination.current_page} من {pagination.last_page}
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
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      ) : lands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FiMap className="text-gray-400 text-4xl mb-4" />
          <p className="text-gray-500 mb-4">لا توجد نتائج</p>
          {hasActiveFilters && (
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={onClearFilters}
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-200">
            {lands.map((land) => (
              <LandCard
                key={land.id}
                land={land}
                isSelected={selectedLandId === land.id}
                onClick={() => onSelectLand(land)}
              />
            ))}
          </div>

          <Pagination
            pagination={pagination}
            currentPage={pagination.current_page}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
};

export default LandsList;
