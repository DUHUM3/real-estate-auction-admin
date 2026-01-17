import React, { useState, useEffect } from "react";
import {
  FiFilter,
  FiSearch,
  FiSlash,
  FiRefreshCw,
} from "react-icons/fi";
import { saudiRegions } from "../../constants/saudiRegions"; // تأكد من المسار الصحيح

const LandsFilters = ({
  filters,
  onFilterChange,
  onSearch,
  onClearFilters,
  loading,
  hasActiveFilters,
  handleRefresh,
  isRefreshing,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search);
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

  const handleLocalSearchChange = (e) => {
    setLocalSearch(e.target.value);
    onFilterChange("search", e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(e);
  };

  const handleRegionChange = (value) => {
    onFilterChange("region", value);
    // إعادة تعيين المدينة عند تغيير المنطقة
    if (value === "all") {
      onFilterChange("city", "all");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <FiFilter className="text-blue-600 ml-2" size={24} />
            <span className="font-medium text-gray-700">
              أدوات البحث والتصفية:
            </span>
          </div>

          {hasActiveFilters && (
            <button
              className="flex items-center px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
              onClick={onClearFilters}
            >
              <FiSlash className="ml-1" />
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث بالعنوان أو رقم الإعلان أو وصف الأرض..."
              value={localSearch}
              onChange={handleLocalSearchChange}
              className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            بحث
          </button>
          <button
            className={`flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
              isRefreshing || loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
          >
            <FiRefreshCw
              className={`ml-1 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "جاري التحديث..." : "تحديث البيانات"}
          </button>
        </div>
      </form>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              الحالة:
            </label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange("status", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">جميع الحالات</option>
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="مفتوح">مفتوح</option>
              <option value="مرفوض">مرفوض</option>
              <option value="تم البيع">تم البيع</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              المنطقة:
            </label>
            <select
              value={filters.region}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">جميع المناطق</option>
              {saudiRegions.map((region) => (
                <option key={region.id} value={region.name.trim()}>
                  {region.name.trim()}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              المدينة:
            </label>
            <select
              value={filters.city}
              onChange={(e) => onFilterChange("city", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              نوع الأرض:
            </label>
            <select
              value={filters.land_type}
              onChange={(e) => onFilterChange("land_type", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">جميع الأنواع</option>
              <option value="سكني">سكني</option>
              <option value="تجاري">تجاري</option>
              <option value="زراعي">زراعي</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              الغرض:
            </label>
            <select
              value={filters.purpose}
              onChange={(e) => onFilterChange("purpose", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">جميع الأغراض</option>
              <option value="بيع">بيع</option>
              <option value="استثمار">استثمار</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              أقل مساحة:
            </label>
            <input
              type="number"
              value={filters.min_area}
              onChange={(e) => onFilterChange("min_area", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="0"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              أكبر مساحة:
            </label>
            <input
              type="number"
              value={filters.max_area}
              onChange={(e) => onFilterChange("max_area", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="10000"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              ترتيب حسب:
            </label>
            <select
              value={filters.sort_field}
              onChange={(e) => onFilterChange("sort_field", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="created_at">تاريخ الإضافة</option>
              <option value="title">العنوان</option>
              <option value="total_area">المساحة</option>
              <option value="price_per_sqm">سعر المتر</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              الاتجاه:
            </label>
            <select
              value={filters.sort_direction}
              onChange={(e) => onFilterChange("sort_direction", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

export default LandsFilters;