import React from 'react';
import {
  PER_PAGE_OPTIONS,
  SORT_BY_OPTIONS,
  SORT_ORDER_OPTIONS,
  STATUS_OPTIONS
} from '../constants/contactsConstants';

const ContactsFilters = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  onRefresh,
  refreshing,
  paginationInfo,
  total
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">فلاتر البحث</h2>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {refreshing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              جاري التحديث...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              تحديث البيانات
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            بحث
          </label>
          <input
            type="text"
            placeholder="ابحث في الرسائل..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الحالة
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            من تاريخ
          </label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => onFilterChange('start_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            إلى تاريخ
          </label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => onFilterChange('end_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ترتيب حسب
          </label>
          <select
            value={filters.sort_by}
            onChange={(e) => onFilterChange('sort_by', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {SORT_BY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            اتجاه الترتيب
          </label>
          <select
            value={filters.sort_order}
            onChange={(e) => onFilterChange('sort_order', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {SORT_ORDER_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Per Page */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            عدد العناصر في الصفحة
          </label>
          <select
            value={filters.per_page}
            onChange={(e) => onFilterChange('per_page', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {PER_PAGE_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          عرض {paginationInfo.start} إلى {paginationInfo.end} من أصل {total} رسالة
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={onResetFilters}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            إعادة التعيين
          </button>
          <button
            onClick={onApplyFilters}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            تطبيق الفلاتر
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactsFilters;