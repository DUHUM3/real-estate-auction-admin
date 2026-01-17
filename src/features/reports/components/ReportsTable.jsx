import React from "react";
import { FiFileText } from "react-icons/fi";
import { tableHeaders, getStatusBadgeClass, getStatusText } from "../constants/statusOptions";

/**
 * Report data table component
 */
const ReportTable = ({ reports, filters, loading, error, totalCount, dateRange, onRetry, onClearFilters, hasActiveFilters }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 text-lg">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-red-50 rounded-lg">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
          onClick={onRetry}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
        <FiFileText className="text-6xl text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg mb-4">لا توجد بيانات للعرض</p>
        {hasActiveFilters && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
            onClick={onClearFilters}
          >
            مسح الفلاتر
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
        <p className="text-blue-800 text-sm">
          الفترة من: <strong>{dateRange.from}</strong> إلى:{" "}
          <strong>{dateRange.to}</strong>
        </p>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              {tableHeaders[filters.type].map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((item, index) => (
              <tr
                key={item.id || index}
                className="hover:bg-gray-50 transition duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
                </td>
                {filters.type === "users" && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.full_name || "غير محدد"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.email || "غير متوفر"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.user_type || "غير محدد"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.created_at || "غير محدد"}
                    </td>
                  </>
                )}
                {filters.type === "properties" && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.title || "غير محدد"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.region || "غير محدد"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.city || "غير محدد"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.owner || "غير محدد"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.created_at || "غير محدد"}
                    </td>
                  </>
                )}
                {filters.type === "auctions" && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.title || "غير محدد"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.auction_date || "غير محدد"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.company || "غير محدد"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.owner || "غير محدد"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.created_at || "غير محدد"}
                    </td>
                  </>
                )}
                {filters.type === "interests" && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.user || "غير محدد"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.email || "غير متوفر"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.property || "غير محدد"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.created_at || "غير محدد"}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg">
        <p className="text-sm text-gray-700">
          إجمالي النتائج: <span className="font-semibold">{totalCount}</span>
        </p>
      </div>
    </>
  );
};

export default ReportTable;