import React from 'react';
import { 
  FiFilter, 
  FiSearch, 
  FiSlash, 
  FiRefreshCw, 
  FiPlus 
} from 'react-icons/fi';

const ClientFilters = ({ 
  filters, 
  onFilterChange, 
  onSearch, 
  onClearFilters, 
  onRefresh, 
  onAddClient,
  hasActiveFilters,
  loading 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FiFilter className="text-gray-600 ml-2" />
          <span className="text-gray-700 font-medium">أدوات البحث والتصفية:</span>
        </div>
        {hasActiveFilters && (
          <button 
            className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
            onClick={onClearFilters}
          >
            <FiSlash className="ml-1" />
            مسح الفلاتر
          </button>
        )}
      </div>
      
      <form onSubmit={onSearch} className="mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث باسم العميل..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <button 
            type="submit" 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            بحث
          </button>
          <div className="flex gap-3">
            <button 
              type="button"
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              onClick={onRefresh}
              disabled={loading}
            >
              <FiRefreshCw className="ml-2" />
              تحديث البيانات
            </button>
            
            <button 
              type="button"
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              onClick={onAddClient}
            >
              <FiPlus className="ml-2" />
              إضافة عميل جديد
            </button>
          </div>
        </div>
      </form>

      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <label className="text-gray-700">ترتيب حسب:</label>
          <select 
            value={filters.sort_by} 
            onChange={(e) => onFilterChange('sort_by', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="created_at">تاريخ الإضافة</option>
            <option value="name">اسم العميل</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-gray-700">الاتجاه:</label>
          <select 
            value={filters.sort_order} 
            onChange={(e) => onFilterChange('sort_order', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="desc">تنازلي</option>
            <option value="asc">تصاعدي</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ClientFilters;