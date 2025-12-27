import React, { useState } from "react";
import {
  FiFilter,
  FiSearch,
  FiSlash,
  FiRefreshCw,
} from "react-icons/fi";

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

  const handleLocalSearchChange = (e) => {
    setLocalSearch(e.target.value);
    onFilterChange("search", e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(e);
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
              onChange={(e) => onFilterChange("region", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">جميع المناطق</option>
              <option value="الرياض">الرياض</option>
              <option value="مكة المكرمة">مكة المكرمة</option>
              <option value="المدينة المنورة">المدينة المنورة</option>
              <option value="القصيم">القصيم</option>
              <option value="الشرقية">الشرقية</option>
              <option value="عسير">عسير</option>
              <option value="تبوك">تبوك</option>
              <option value="حائل">حائل</option>
              <option value="الحدود الشمالية">الحدود الشمالية</option>
              <option value="جازان">جازان</option>
              <option value="نجران">نجران</option>
              <option value="الباحة">الباحة</option>
              <option value="الجوف">الجوف</option>
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
            >
              <option value="all">جميع المدن</option>
              <option value="الرياض">الرياض</option>
              <option value="جدة">جدة</option>
              <option value="مكة المكرمة">مكة المكرمة</option>
              <option value="المدينة المنورة">المدينة المنورة</option>
              <option value="الدمام">الدمام</option>
              <option value="الخبر">الخبر</option>
              <option value="الظهران">الظهران</option>
              <option value="الجبيل">الجبيل</option>
              <option value="القطيف">القطيف</option>
              <option value="تبوك">تبوك</option>
              <option value="حائل">حائل</option>
              <option value="بريدة">بريدة</option>
              <option value="عنيزة">عنيزة</option>
              <option value="الرس">الرس</option>
              <option value="خميس مشيط">خميس مشيط</option>
              <option value="أبها">أبها</option>
              <option value="نجران">نجران</option>
              <option value="جازان">جازان</option>
              <option value="بيشة">بيشة</option>
              <option value="الباحة">الباحة</option>
              <option value="سكاكا">سكاكا</option>
              <option value="عرعر">عرعر</option>
              <option value="القريات">القريات</option>
              <option value="ينبع">ينبع</option>
              <option value="رابغ">رابغ</option>
              <option value="الطائف">الطائف</option>
              <option value="محايل عسير">محايل عسير</option>
              <option value="بلجرشي">بلجرشي</option>
              <option value="صبيا">صبيا</option>
              <option value="أحد رفيدة">أحد رفيدة</option>
              <option value="تثليث">تثليث</option>
              <option value="المجمعة">المجمعة</option>
              <option value="الزلفي">الزلفي</option>
              <option value="حوطة بني تميم">حوطة بني تميم</option>
              <option value="الأحساء">الأحساء</option>
              <option value="بقيق">بقيق</option>
              <option value="رأس تنورة">رأس تنورة</option>
              <option value="سيهات">سيهات</option>
              <option value="صفوى">صفوى</option>
              <option value="تاروت">تاروت</option>
              <option value="النعيرية">النعيرية</option>
              <option value="قرية العليا">قرية العليا</option>
              <option value="الخرج">الخرج</option>
              <option value="الدوادمي">الدوادمي</option>
              <option value="القويعية">القويعية</option>
              <option value="وادي الدواسر">وادي الدواسر</option>
              <option value="الافلاج">الأفلاج</option>
              <option value="رنية">رنية</option>
              <option value="بيش">بيش</option>
              <option value="الدرب">الدرب</option>
              <option value="العارضة">العارضة</option>
              <option value="أملج">أملج</option>
              <option value="ضباء">ضباء</option>
              <option value="الوجه">الوجه</option>
              <option value="العلا">العلا</option>
              <option value="خيبر">خيبر</option>
              <option value="البدائع">البدائع</option>
              <option value="الأسياح">الأسياح</option>
              <option value="رياض الخبراء">رياض الخبراء</option>
              <option value="النبهانية">النبهانية</option>
              <option value="ضرما">ضرما</option>
              <option value="حوطة سدير">حوطة سدير</option>
              <option value="تمير">تمير</option>
              <option value="الحوطة">الحوطة</option>
              <option value="الحريق">الحريق</option>
              <option value="شقراء">شقراء</option>
              <option value="عفيف">عفيف</option>
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