import React, { useMemo } from "react";
import {
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiX,
  FiChevronDown,
} from "react-icons/fi";
import { saudiRegions } from "../../constants/saudiRegions"; // عدّل المسار حسب موقع الملف

const SearchFilters = ({
  filters,
  handleFilterChange,
  handleSearch,
  handleRefresh,
  clearFilters,
  isRefreshing,
  loading,
}) => {
  // التحقق من وجود فلاتر نشطة
  const hasActiveFilters = useMemo(() => {
    return (
      (filters.search && filters.search.trim() !== "") ||
      filters.status !== "all" ||
      filters.region !== "all" ||
      filters.city !== "all" ||
      (filters.date && filters.date !== "")
    );
  }, [filters]);

  // الحصول على المدن بناءً على المنطقة المختارة
  const availableCities = useMemo(() => {
    if (filters.region === "all") {
      // إرجاع جميع المدن من كل المناطق
      return saudiRegions.flatMap((region) => region.cities);
    }
    const selectedRegion = saudiRegions.find(
      (region) => region.name.trim() === filters.region.trim(),
    );
    return selectedRegion ? selectedRegion.cities : [];
  }, [filters.region]);

  // معالجة تغيير المنطقة
  const handleRegionChange = (value) => {
    handleFilterChange("region", value);
    // إعادة تعيين المدينة عند تغيير المنطقة
    if (filters.city !== "all") {
      handleFilterChange("city", "all");
    }
  };

  // معالجة مسح الفلاتر
  const handleClearFilters = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // إذا كانت دالة clearFilters موجودة، استخدمها
    if (typeof clearFilters === "function") {
      console.log("Calling clearFilters function");

      clearFilters();
    } else {
      // خلاف ذلك، امسح كل فلتر يدوياً
      handleFilterChange("search", "");
      handleFilterChange("status", "all");
      handleFilterChange("region", "all");
      handleFilterChange("city", "all");
      handleFilterChange("date", "");
      handleFilterChange("sort_field", "created_at");
      handleFilterChange("sort_direction", "desc");
    }
  };

  // معالجة البحث
  const onSearchSubmit = (e) => {
    e.preventDefault();
    if (typeof handleSearch === "function") {
      handleSearch(e);
    }
  };

  // عدد الفلاتر النشطة
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search && filters.search.trim() !== "") count++;
    if (filters.status !== "all") count++;
    if (filters.region !== "all") count++;
    if (filters.city !== "all") count++;
    if (filters.date && filters.date !== "") count++;
    return count;
  }, [filters]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
      {/* شريط العنوان */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiFilter className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                أدوات البحث والتصفية
              </h3>
              {activeFiltersCount > 0 && (
                <span className="text-xs text-gray-500">
                  {activeFiltersCount} فلتر نشط
                </span>
              )}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              onClick={handleClearFilters}
            >
              <FiX size={16} />
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* حقل البحث */}
      <form
        onSubmit={onSearchSubmit}
        className="p-4 border-b border-gray-100 bg-gray-50/50"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              size={18}
            />
            <input
              type="text"
              placeholder="ابحث باسم المزاد أو الوصف..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            />
          </div>

          <div className="flex gap-2 sm:flex-shrink-0">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              <span className="flex items-center justify-center gap-2">
                <FiSearch size={16} />
                بحث
              </span>
            </button>

            <button
              type="button"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
            >
              <FiRefreshCw
                className={isRefreshing ? "animate-spin" : ""}
                size={16}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? "جاري التحديث..." : "تحديث"}
              </span>
            </button>
          </div>
        </div>
      </form>

      {/* فلاتر التصفية */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* الحالة */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              الحالة
            </label>
            <div className="relative">
              <select
                value={filters.status || "all"}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full p-2.5 pr-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white cursor-pointer"
              >
                <option value="all">جميع الحالات</option>
                <option value="مفتوح">مفتوح</option>
                <option value="قيد المراجعة">قيد المراجعة</option>
                <option value="مغلق">مغلق</option>
                <option value="مرفوض">مرفوض</option>
              </select>
              <FiChevronDown
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>
          </div>

          {/* المنطقة */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              المنطقة
            </label>
            <div className="relative">
              <select
                value={filters.region || "all"}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full p-2.5 pr-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white cursor-pointer"
              >
                <option value="all">جميع المناطق</option>
                {saudiRegions.map((region) => (
                  <option key={region.id} value={region.name.trim()}>
                    {region.name.trim()}
                  </option>
                ))}
              </select>
              <FiChevronDown
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>
          </div>

          {/* المدينة */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              المدينة
            </label>
            <div className="relative">
              <select
                value={filters.city || "all"}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                className="w-full p-2.5 pr-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={
                  filters.region === "all" && availableCities.length === 0
                }
              >
                <option value="all">جميع المدن</option>
                {availableCities.map((city, index) => (
                  <option key={`${city}-${index}`} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <FiChevronDown
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>
          </div>

          {/* تاريخ المزاد */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              تاريخ المزاد
            </label>
            <input
              type="date"
              value={filters.date || ""}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white cursor-pointer"
            />
          </div>

          {/* ترتيب حسب */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              ترتيب حسب
            </label>
            <div className="relative">
              <select
                value={filters.sort_field || "created_at"}
                onChange={(e) =>
                  handleFilterChange("sort_field", e.target.value)
                }
                className="w-full p-2.5 pr-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white cursor-pointer"
              >
                <option value="created_at">تاريخ الإنشاء</option>
                <option value="auction_date">تاريخ المزاد</option>
                <option value="title">اسم المزاد</option>
              </select>
              <FiChevronDown
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>
          </div>

          {/* الاتجاه */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              الاتجاه
            </label>
            <div className="relative">
              <select
                value={filters.sort_direction || "desc"}
                onChange={(e) =>
                  handleFilterChange("sort_direction", e.target.value)
                }
                className="w-full p-2.5 pr-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white cursor-pointer"
              >
                <option value="desc">تنازلي (الأحدث أولاً)</option>
                <option value="asc">تصاعدي (الأقدم أولاً)</option>
              </select>
              <FiChevronDown
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>
          </div>
        </div>

        {/* شريط الفلاتر النشطة */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">الفلاتر النشطة:</span>

              {filters.search && filters.search.trim() !== "" && (
                <FilterBadge
                  label={`البحث: ${filters.search}`}
                  onRemove={() => handleFilterChange("search", "")}
                />
              )}

              {filters.status !== "all" && (
                <FilterBadge
                  label={`الحالة: ${filters.status}`}
                  onRemove={() => handleFilterChange("status", "all")}
                />
              )}

              {filters.region !== "all" && (
                <FilterBadge
                  label={`المنطقة: ${filters.region}`}
                  onRemove={() => {
                    handleFilterChange("region", "all");
                    handleFilterChange("city", "all");
                  }}
                />
              )}

              {filters.city !== "all" && (
                <FilterBadge
                  label={`المدينة: ${filters.city}`}
                  onRemove={() => handleFilterChange("city", "all")}
                />
              )}

              {filters.date && filters.date !== "" && (
                <FilterBadge
                  label={`التاريخ: ${filters.date}`}
                  onRemove={() => handleFilterChange("date", "")}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// مكون شارة الفلتر
const FilterBadge = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
    {label}
    <button
      type="button"
      onClick={onRemove}
      className="p-0.5 hover:bg-blue-200 rounded-full transition-colors duration-150 focus:outline-none"
      aria-label="إزالة الفلتر"
    >
      <FiX size={12} />
    </button>
  </span>
);

export default SearchFilters;
