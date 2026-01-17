import React from "react";
import { FiFilter, FiSlash, FiSearch } from "react-icons/fi";
import { reportTypes, periodTypes } from "../constants/reportTypes";
import { statusOptions } from "../constants/statusOptions";
import { saudiRegions } from "../../../constants/saudiRegions";

/**
 * Report filters component
 */
const ReportFilters = ({
  filters,
  availableCities,
  handleFilterChange,
  clearFilters,
  hasActiveFilters,
  onSearch,
}) => {
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FiFilter className="text-xl text-blue-600" />
          <span className="text-lg font-semibold text-gray-900">
            أدوات البحث والتصفية:
          </span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
          >
            <FiSlash />
            مسح الفلاتر
          </button>
        )}
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث هنا..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 font-medium"
          >
            بحث
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            نوع التقرير
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          >
            {reportTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الفترة
          </label>
          <select
            value={filters.period}
            onChange={(e) => handleFilterChange("period", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          >
            {periodTypes.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            الحالة
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          >
            {statusOptions[filters.type]?.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {filters.type === "properties" && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              المنطقة
            </label>
            <select
              value={filters.region}
              onChange={(e) => handleFilterChange("region", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              <option value="">كل المناطق</option>
              {saudiRegions.map((region) => (
                <option key={region.id} value={region.name}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filters.type === "properties" && filters.region && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المدينة
          </label>
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange("city", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          >
            <option value="">كل المدن</option>
            {availableCities.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default ReportFilters;