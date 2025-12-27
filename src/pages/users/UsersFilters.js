import React from 'react';
import {
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiSlash,
} from 'react-icons/fi';

const UsersFilters = ({
  filters,
  onFilterChange,
  onSearch,
  onClearFilters,
  onRefresh,
  filtersData,
  loading,
  isRefreshing,
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.user_type_id !== 'all';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
      {/* الهيدر */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FiFilter className="text-blue-600" size={20} />
            <span className="text-lg font-semibold text-gray-800">
              أدوات البحث والتصفية
            </span>
          </div>
          {hasActiveFilters && (
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              onClick={onClearFilters}
              disabled={loading}
            >
              <FiSlash size={16} />
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* المحتوى */}
      <div className="p-6">
        {/* شريط البحث */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                name="search"
                placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                value={filters.search}
                onChange={handleInputChange}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                disabled={loading}
              >
                بحث
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onRefresh}
                disabled={loading || isRefreshing}
              >
                <FiRefreshCw
                  className={isRefreshing ? "animate-spin" : ""}
                  size={18}
                />
                {isRefreshing ? "جاري التحديث..." : "تحديث البيانات"}
              </button>
            </div>
          </div>
        </form>

        {/* الفلاتر */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* حالة المستخدم */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              الحالة:
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد المراجعة</option>
              <option value="approved">مقبول</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>

          {/* نوع المستخدم */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              نوع المستخدم:
            </label>
            <select
              name="user_type_id"
              value={filters.user_type_id}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
            >
              <option value="all">جميع الأنواع</option>
              <option value="1">مستخدم عام</option>
              <option value="2">مالك أرض</option>
              <option value="3">وكيل شرعي</option>
              <option value="4">جهة تجارية</option>
              <option value="5">وسيط عقاري</option>
              <option value="6">شركة مزادات</option>
            </select>
          </div>

          {/* ترتيب حسب */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              ترتيب حسب:
            </label>
            <select
              name="sort_field"
              value={filters.sort_field}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
            >
              <option value="created_at">تاريخ التسجيل</option>
              <option value="full_name">الاسم</option>
              <option value="email">البريد الإلكتروني</option>
            </select>
          </div>

          {/* اتجاه الترتيب */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              الاتجاه:
            </label>
            <select
              name="sort_direction"
              value={filters.sort_direction}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
            >
              <option value="desc">تنازلي</option>
              <option value="asc">تصاعدي</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersFilters;