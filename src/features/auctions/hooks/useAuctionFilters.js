import { useState, useEffect } from "react";

// تعريف القيم الافتراضية بشكل منفصل
const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  region: "all",
  city: "all",
  date: "",
  sort_field: "created_at",
  sort_direction: "desc",
};

const getInitialFilters = () => {
  try {
    const savedFilters = localStorage.getItem("auctionsFilters");
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      // دمج القيم المحفوظة مع الافتراضيات للتأكد من وجود جميع الخصائص
      return { ...DEFAULT_FILTERS, ...parsed };
    }
  } catch (error) {
    console.error("Error loading filters from localStorage:", error);
  }
  return { ...DEFAULT_FILTERS };
};

const useAuctionFilters = () => {
  const [filters, setFilters] = useState(getInitialFilters());
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const savedPage = localStorage.getItem("auctionsCurrentPage");
      return savedPage ? parseInt(savedPage) : 1;
    } catch (error) {
      console.error("Error loading page from localStorage:", error);
      return 1;
    }
  });

  // حفظ الفلاتر في localStorage
  useEffect(() => {
    try {
      localStorage.setItem("auctionsFilters", JSON.stringify(filters));
    } catch (error) {
      console.error("Error saving filters to localStorage:", error);
    }
  }, [filters]);

  // حفظ الصفحة الحالية في localStorage
  useEffect(() => {
    try {
      localStorage.setItem("auctionsCurrentPage", currentPage.toString());
    } catch (error) {
      console.error("Error saving page to localStorage:", error);
    }
  }, [currentPage]);

  // مسح الفلاتر
  const clearFilters = () => {
    console.log("Clearing filters to default values");
    setFilters({ ...DEFAULT_FILTERS });
    setCurrentPage(1);
    
    // يمكنك أيضاً مسح localStorage مباشرة إذا أردت
    try {
      localStorage.removeItem("auctionsFilters");
      localStorage.removeItem("auctionsCurrentPage");
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

  // تحديث فلتر معين
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    // إعادة تعيين الصفحة إلى 1 عند تغيير أي فلتر
    setCurrentPage(1);
  };

  return {
    filters,
    currentPage,
    setFilters,
    setCurrentPage,
    clearFilters,
    updateFilter, // أضف هذه الدالة لتسهيل التحديث
  };
};

export default useAuctionFilters;