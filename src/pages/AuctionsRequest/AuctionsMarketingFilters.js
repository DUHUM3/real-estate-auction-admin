import React, { useState, useEffect } from "react";
import Icons from "../../icons/index";
import { saudiRegions } from "../../constants/saudiRegions"; // تأكد من المسار الصحيح

const MarketingFilters = ({
  filters,
  onFilterChange,
  onSearch,
  onClearFilters,
  filtersData,
  loading = false,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [availableCities, setAvailableCities] = useState([]);
  const [search, setSearch] = useState(filters.search || "");

  // تحديث الحالات المحلية عند تغيير الفلاتر الخارجية
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // تحديث المدن المتاحة عند تغيير المنطقة
  useEffect(() => {
    if (localFilters.region && localFilters.region !== "all") {
      const selectedRegion = saudiRegions.find(
        (region) => region.name.trim() === localFilters.region.trim()
      );

      if (selectedRegion) {
        setAvailableCities(selectedRegion.cities);
      } else {
        setAvailableCities([]);
      }
    } else {
      setAvailableCities([]);
    }
  }, [localFilters.region]);

  const handleLocalFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };

    // إذا تم تغيير المنطقة، نعيد تعيين المدينة
    if (key === "region") {
      newFilters.city = "all";
    }

    setLocalFilters(newFilters);

    // إذا لم يكن تغيير الصفحة، نعيد تعيين الصفحة إلى 1
    if (key !== "page" && localFilters.page !== 1) {
      newFilters.page = 1;
    }

    onFilterChange(newFilters);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newFilters = {
      ...localFilters,
      search,
      page: 1,
    };

    setLocalFilters(newFilters);
    onFilterChange(newFilters);
    onSearch();
  };

  const handleClear = () => {
    const defaultFilters = {
      search: "",
      region: "all",
      city: "all",
      status: "all",
      start_date: "",
      end_date: "",
      sort_by: "created_at",
      sort_order: "desc",
      page: 1,
      per_page: 10,
    };

    setSearch("");
    setLocalFilters(defaultFilters);
    setAvailableCities([]);
    onClearFilters();
  };

  const hasActiveFilters =
    localFilters.search ||
    localFilters.region !== "all" ||
    localFilters.city !== "all" ||
    localFilters.status !== "all" ||
    localFilters.start_date ||
    localFilters.end_date;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Icons.FiFilter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">
              أدوات البحث والتصفية
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="flex items-center space-x-2 space-x-reverse px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              onClick={handleClear}
              disabled={loading}
            >
              <Icons.FiSlash className="w-4 h-4" />
              <span>مسح الفلاتر</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex space-x-3 space-x-reverse">
            <div className="flex-1 relative">
              <Icons.FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث باسم المستخدم أو الوصف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg"
              disabled={loading}
            >
              {loading ? "جاري البحث..." : "بحث"}
            </button>
          </div>
        </form>

        {/* عناصر التصفية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* فلتر المنطقة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المنطقة
            </label>
            <select
              value={localFilters.region}
              onChange={(e) =>
                handleLocalFilterChange("region", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
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

          {/* فلتر المدينة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المدينة
            </label>
            <select
              value={localFilters.city}
              onChange={(e) => handleLocalFilterChange("city", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading || availableCities.length === 0}
            >
              <option value="all">
                {availableCities.length === 0
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

          {/* فلتر الحالة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحالة
            </label>
            <select
              value={localFilters.status}
              onChange={(e) =>
                handleLocalFilterChange("status", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
            >
              <option value="all">جميع الحالات</option>
              <option value="under_review">قيد المراجعة</option>
              <option value="reviewed">تمت المراجعة</option>
              <option value="auctioned">تم عرض المزاد في شركة المزادات</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>

          {/* فلتر الترتيب */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ترتيب حسب
            </label>
            <select
              value={localFilters.sort_by}
              onChange={(e) =>
                handleLocalFilterChange("sort_by", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
            >
              <option value="created_at">تاريخ الطلب</option>
              <option value="region">المنطقة</option>
            </select>
          </div>
        </div>

        {/* تواريخ البداية والنهاية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              من تاريخ
            </label>
            <input
              type="date"
              value={localFilters.start_date}
              onChange={(e) =>
                handleLocalFilterChange("start_date", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={localFilters.end_date}
              onChange={(e) =>
                handleLocalFilterChange("end_date", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingFilters;
