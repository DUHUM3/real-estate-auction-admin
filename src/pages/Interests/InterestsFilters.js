import React, { useState } from "react";
import {
  FiFilter,
  FiSearch,
  FiSlash,
  FiRefreshCw,
} from "react-icons/fi";

const InterestsFilters = ({
  filters,
  onFilterChange,
  onSearch,
  onClearFilters,
  filtersData,
  loading,
  hasActiveFilters,
  handleRefresh,
  isRefreshing,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search);

  const handleLocalSearchChange = (e) => {
    setLocalSearch(e.target.value);
    onFilterChange("search", e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(e);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FiFilter className="text-blue-600 ml-2" />
          <span className="text-lg font-semibold text-gray-800">
            أدوات البحث والتصفية:
          </span>
        </div>

        {hasActiveFilters && (
          <button
            className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
            onClick={onClearFilters}
          >
            <FiSlash className="ml-1" />
            مسح الفلاتر
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو البريد الإلكتروني أو الرسالة..."
              value={localSearch}
              onChange={handleLocalSearchChange}
              className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            بحث
          </button>
          <button
            className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
          >
            <FiRefreshCw
              className={`ml-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "جاري التحديث..." : "تحديث البيانات"}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الحالة:
          </label>
         <select
  value={filters.status}
  onChange={(e) => onFilterChange("status", e.target.value)}
  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
  <option value="all">جميع الحالات</option>
  {/* التحقق من وجود البيانات قبل استخدام map */}
  {filtersData?.status_options && filtersData.status_options.length > 0 ? (
    filtersData.status_options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))
  ) : (
    // عرض الخيارات الافتراضية إذا لم تكن البيانات متوفرة
    <>
      <option value="open">مفتوحة</option>
      <option value="pending">قيد المراجعة</option>
      <option value="completed">مكتملة</option>
      <option value="close">مغلقة</option>
    </>
  )}
</select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            من تاريخ:
          </label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => onFilterChange("date_from", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            إلى تاريخ:
          </label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => onFilterChange("date_to", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ترتيب حسب:
          </label>
          <select
            value={filters.sort_by}
            onChange={(e) => onFilterChange("sort_by", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="created_at">تاريخ الاهتمام</option>
            <option value="full_name">اسم المستخدم</option>
            <option value="status">الحالة</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الاتجاه:
          </label>
          <select
            value={filters.sort_order}
            onChange={(e) => onFilterChange("sort_order", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="desc">تنازلي</option>
            <option value="asc">تصاعدي</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default InterestsFilters;