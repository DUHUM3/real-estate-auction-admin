import React from "react";
import { FiFilter, FiSearch, FiRefreshCw, FiSlash } from "react-icons/fi";

const SearchFilters = ({
  filters,
  handleFilterChange,
  handleSearch,
  handleRefresh,
  clearFilters,
  isRefreshing,
  loading,
}) => {
  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.region !== "all" ||
    filters.city !== "all" ||
    filters.date;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
      {/* الخلفية الخاصة بشريط الأدوات فقط */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiFilter className="text-blue-600" size={22} />
          <span className="text-lg font-semibold text-gray-800">
            أدوات البحث والتصفية:
          </span>
        </div>
        {hasActiveFilters && (
          <button
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 transition-colors"
            onClick={clearFilters}
          >
            <FiSlash size={16} />
            مسح الفلاتر
          </button>
        )}
      </div>
      <form onSubmit={handleSearch} className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="ابحث باسم المزاد أو الوصف..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            بحث
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
          >
            <FiRefreshCw
              className={isRefreshing ? "animate-spin" : ""}
              size={18}
            />
            {isRefreshing ? "جاري التحديث..." : "تحديث البيانات"}
          </button>
        </div>
      </form>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الحالة:
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="مفتوح">مفتوح</option>
            <option value="قيد المراجعة">قيد المراجعة</option>
            <option value="مغلق">مغلق</option>
            <option value="مرفوض">مرفوض</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المنطقة:
          </label>
          <select
            value={filters.region}
            onChange={(e) => handleFilterChange("region", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المدينة:
          </label>
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange("city", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            تاريخ المزاد:
          </label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange("date", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ترتيب حسب:
          </label>
          <select
            value={filters.sort_field}
            onChange={(e) => handleFilterChange("sort_field", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="created_at">تاريخ الإنشاء</option>
            <option value="auction_date">تاريخ المزاد</option>
            <option value="title">اسم المزاد</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الاتجاه:
          </label>
          <select
            value={filters.sort_direction}
            onChange={(e) =>
              handleFilterChange("sort_direction", e.target.value)
            }
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="desc">تنازلي</option>
            <option value="asc">تصاعدي</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;