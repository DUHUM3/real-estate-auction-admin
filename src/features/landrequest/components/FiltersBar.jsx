// components/FiltersBar.jsx
import React, { useState, useEffect } from "react";
import { FiFilter, FiSlash, FiSearch, FiRefreshCw } from "react-icons/fi";
import { PURPOSE_TEXT, TYPE_TEXT, STATUS_CONFIG } from "../constants/landRequestsConstants";
import { saudiRegions } from "../../../constants/saudiRegions"; // تأكد من المسار الصحيح

const FiltersBar = ({
  filters,
  filtersData,
  onFilterChange,
  onSearch,
  onClearFilters,
  onRefresh,
  isRefreshing,
  loading,
  hasActiveFilters,
}) => {
  const [availableCities, setAvailableCities] = useState([]);

  // تحديث المدن المتاحة عند تغيير المنطقة
  useEffect(() => {
    if (filters.region && filters.region !== "all") {
      const selectedRegion = saudiRegions.find(
        region => region.name.trim() === filters.region.trim()
      );
      
      if (selectedRegion) {
        setAvailableCities(selectedRegion.cities);
      } else {
        setAvailableCities([]);
      }
    } else {
      setAvailableCities([]);
    }
  }, [filters.region]);

  const handleRegionChange = (value) => {
    onFilterChange("region", value);
    // إعادة تعيين المدينة عند تغيير المنطقة
    if (value === "all") {
      onFilterChange("city", "all");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(e);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">أدوات البحث والتصفية:</span>
          </div>
          {hasActiveFilters && (
            <button
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              onClick={onClearFilters}
            >
              <FiSlash className="w-4 h-4" />
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث باسم المستخدم أو الوصف..."
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            بحث
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
              isRefreshing || loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={onRefresh}
            disabled={isRefreshing || loading}
          >
            <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "جاري التحديث..." : "تحديث البيانات"}
          </button>
        </div>
      </form>

      {/* Filter Inputs */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المنطقة:</label>
            <select
              value={filters.region}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">جميع المناطق</option>
              {saudiRegions.map((region) => (
                <option key={region.id} value={region.name.trim()}>
                  {region.name.trim()}
                </option>
              ))}
              {filtersData?.regions?.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المدينة:</label>
            <select
              value={filters.city}
              onChange={(e) => onFilterChange("city", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={availableCities.length === 0 && filters.region !== "all"}
            >
              <option value="all">
                {availableCities.length === 0 && filters.region !== "all" 
                  ? "اختر المنطقة أولاً" 
                  : "جميع المدن"}
              </option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
              {filtersData?.cities?.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الغرض:</label>
            <select
              value={filters.purpose}
              onChange={(e) => onFilterChange("purpose", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">جميع الأغراض</option>
              {filtersData.purposes.map((purpose) => (
                <option key={purpose} value={purpose}>
                  {PURPOSE_TEXT[purpose]}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">النوع:</label>
            <select
              value={filters.type}
              onChange={(e) => onFilterChange("type", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">جميع الأنواع</option>
              {filtersData.types.map((type) => (
                <option key={type} value={type}>
                  {TYPE_TEXT[type]}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الحالة:</label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange("status", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">جميع الحالات</option>
              {filtersData.statuses.map((status) => (
                <option key={status} value={status}>
                  {STATUS_CONFIG[status]?.text || status}
                </option>
              ))}
            </select>
          </div>

          {/* Area Min */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المساحة من (م²):</label>
            <input
              type="number"
              value={filters.area_min}
              onChange={(e) => onFilterChange("area_min", e.target.value)}
              placeholder="أدنى مساحة"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Area Max */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المساحة إلى (م²):</label>
            <input
              type="number"
              value={filters.area_max}
              onChange={(e) => onFilterChange("area_max", e.target.value)}
              placeholder="أقصى مساحة"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ:</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => onFilterChange("date_from", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ:</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => onFilterChange("date_to", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ترتيب حسب:</label>
            <select
              value={filters.sort_by}
              onChange={(e) => onFilterChange("sort_by", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="created_at">تاريخ الطلب</option>
              <option value="area">المساحة</option>
              <option value="region">المنطقة</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاتجاه:</label>
            <select
              value={filters.sort_order}
              onChange={(e) => onFilterChange("sort_order", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

export default FiltersBar;