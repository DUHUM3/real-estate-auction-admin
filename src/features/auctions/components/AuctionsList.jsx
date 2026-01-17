import React from "react";
import { FiCalendar, FiMapPin } from "react-icons/fi";
import Pagination from "./Pagination";
import { formatDate, getStatusBadge } from "../utils/formatters";

const AuctionsList = ({
  auctions,
  pagination,
  currentPage,
  setCurrentPage,
  selectedAuction,
  setSelectedAuction,
  loading,
  filters,
  clearFilters,
}) => {
  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.region !== "all" ||
    filters.city !== "all" ||
    filters.date;

  return (
    <div className="xl:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-bold text-white mb-2 sm:mb-0">
          قائمة المزادات ({pagination.total || 0})
        </h3>
        <div className="flex flex-col sm:items-end">
          <span className="text-sm text-blue-100">
            {pagination.total > 0 ? (
              <>
                عرض {pagination.from || 1} إلى {pagination.to || auctions.length} من {pagination.total} نتيجة
              </>
            ) : (
              "لا توجد نتائج"
            )}
          </span>
          {pagination.last_page > 1 && (
            <span className="text-xs text-blue-200 mt-1">
              الصفحة {currentPage} من {pagination.last_page}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex space-x-2 mb-4">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
          <p className="text-gray-600 font-medium">جاري تحميل البيانات...</p>
        </div>
      ) : auctions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FiCalendar className="text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 text-lg mb-4 font-medium">لا توجد مزادات</p>
          {hasActiveFilters && (
            <button
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
              onClick={clearFilters}
            >
              مسح الفلاتر
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
            {auctions.map((auction) => (
              <div
                key={auction.id}
                className={`p-5 cursor-pointer transition-all duration-200 ${
                  selectedAuction?.id === auction.id
                    ? "bg-blue-50 border-r-4 border-blue-600 shadow-inner"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedAuction(auction)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                    <FiCalendar className="text-blue-600" size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-gray-900 truncate mb-1">{auction.title}</h4>
                    <p className="text-sm text-gray-600 font-medium mb-2">
                      {auction.company?.auction_name || "غير محدد"}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                        <FiCalendar size={14} />
                        {formatDate(auction.auction_date)}
                      </span>
                      <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                        <FiMapPin size={14} />
                        {auction.city || auction.address || "غير محدد"}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">{getStatusBadge(auction.status)}</div>
                </div>
              </div>
            ))}
          </div>

          {pagination.last_page > 1 && (
            <div className="p-5 border-t border-gray-200 bg-gray-50">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.last_page}
                totalItems={pagination.total}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuctionsList;