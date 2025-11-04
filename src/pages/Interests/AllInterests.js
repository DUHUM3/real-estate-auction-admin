import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiHeart,
  FiCheck,
  FiX,
  FiMail,
  FiPhone,
  FiCalendar,
  FiFileText,
  FiHome,
  FiFilter,
  FiChevronRight,
  FiChevronLeft,
  FiSearch,
  FiSlash,
  FiMessageSquare,
  FiEdit,
  FiRefreshCw,
  FiEye,
  FiMap,
  FiMapPin,
  FiLayers,
  FiDollarSign,
  FiCopy,
} from "react-icons/fi";
import { useQueryClient, useQuery, useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

const AllInterests = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ========== الحالات والمتغيرات ==========

  // استرجاع الفلاتر المحفوظة أو استخدام القيم الافتراضية
  const getInitialFilters = () => {
    const savedFilters = localStorage.getItem("interestsFilters");
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return {
      search: "",
      status: "all",
      property_id: "all",
      date_from: "",
      date_to: "",
      sort_by: "created_at",
      sort_order: "desc",
    };
  };

  const [filters, setFilters] = useState(getInitialFilters());
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("interestsCurrentPage");
    return savedPage ? parseInt(savedPage) : 1;
  });

  const [statusModal, setStatusModal] = useState({
    show: false,
    interestId: null,
    newStatus: "",
    adminNote: "",
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copyStatus, setCopyStatus] = useState({});

  // حالة المودال لعرض تفاصيل العقار
  const [propertyModal, setPropertyModal] = useState({
    show: false,
    property: null,
    loading: false,
  });

  // ========== الدوال الأساسية ==========

  // دالة نسخ النص إلى الحافظة
  const copyToClipboard = async (text, fieldName) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text.toString());

      setCopyStatus((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      setTimeout(() => {
        setCopyStatus((prev) => ({
          ...prev,
          [fieldName]: false,
        }));
      }, 2000);
    } catch (err) {
      console.error("فشل في نسخ النص: ", err);
      // استخدام الطريقة القديمة كبديل
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopyStatus((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      setTimeout(() => {
        setCopyStatus((prev) => ({
          ...prev,
          [fieldName]: false,
        }));
      }, 2000);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      await refetch();
    } catch (error) {
      console.error("خطأ في التحديث:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // حفظ الفلاتر والصفحة في localStorage عند تغييرها
  useEffect(() => {
    localStorage.setItem("interestsFilters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem("interestsCurrentPage", currentPage.toString());
  }, [currentPage]);

  // استعادة الاهتمام المحدد من localStorage إذا كان موجوداً
  useEffect(() => {
    const savedSelectedInterest = localStorage.getItem("selectedInterest");
    if (savedSelectedInterest) {
      setSelectedInterest(JSON.parse(savedSelectedInterest));
    }
  }, []);

  // حفظ الاهتمام المحدد في localStorage
  useEffect(() => {
    if (selectedInterest) {
      localStorage.setItem(
        "selectedInterest",
        JSON.stringify(selectedInterest)
      );
    } else {
      localStorage.removeItem("selectedInterest");
    }
  }, [selectedInterest]);

  // ========== الاستعلامات والبيانات ==========

  const buildQueryString = () => {
    const params = new URLSearchParams();

    if (filters.search.trim()) params.append("search", filters.search.trim());
    if (filters.status !== "all") params.append("status", filters.status);
    if (filters.property_id !== "all")
      params.append("property_id", filters.property_id);
    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);
    if (filters.sort_by) params.append("sort_by", filters.sort_by);
    if (filters.sort_order) params.append("sort_order", filters.sort_order);

    params.append("page", currentPage);
    params.append("per_page", 10);

    return params.toString();
  };

  // استخدام React Query لجلب بيانات طلبات الاهتمام
  const fetchInterests = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      throw new Error("لم يتم العثور على رمز الدخول");
    }

    const queryString = buildQueryString();
    const url = `https://shahin-tqay.onrender.com/api/admin/interests?${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("access_token");
      navigate("/login");
      throw new Error("انتهت جلسة الدخول أو التوكن غير صالح");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`فشل في جلب طلبات الاهتمام: ${errorText}`);
    }

    const result = await response.json();

    if (result.success && result.data) {
      return {
        data: result.data.interests || [],
        pagination: result.data.pagination || {
          current_page: currentPage,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: 0,
          to: 0,
        },
        filtersData: result.data.filters || {
          status_options: [],
          properties: [],
        },
      };
    } else {
      throw new Error(result.message || "هيكل البيانات غير متوقع");
    }
  };

  const {
    data: interestsData,
    isLoading,
    error,
    refetch,
  } = useQuery(["interests", filters, currentPage], fetchInterests, {
    staleTime: 5 * 60 * 1000, // 5 دقائق
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error("خطأ في جلب طلبات الاهتمام:", error);
      alert("حدث خطأ أثناء جلب البيانات: " + error.message);
    },
  });

  // دالة لجلب تفاصيل العقار
  const fetchPropertyDetails = async (propertyId) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      throw new Error("لم يتم العثور على رمز الدخول");
    }

    const response = await fetch(
      `https://shahin-tqay.onrender.com/api/admin/properties/${propertyId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("access_token");
      navigate("/login");
      throw new Error("انتهت جلسة الدخول أو التوكن غير صالح");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`فشل في جلب تفاصيل العقار: ${errorText}`);
    }

    const result = await response.json();

    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || "هيكل البيانات غير متوقع");
    }
  };

  // ========== دوال التحكم ==========

  // فتح مودال تفاصيل العقار
  const openPropertyModal = async (propertyId) => {
    if (!propertyId) {
      alert("لا يوجد معرف للعقار");
      return;
    }

    setPropertyModal({
      show: true,
      property: null,
      loading: true,
    });

    try {
      const propertyDetails = await fetchPropertyDetails(propertyId);
      setPropertyModal({
        show: true,
        property: propertyDetails,
        loading: false,
      });
    } catch (error) {
      console.error("خطأ في جلب تفاصيل العقار:", error);
      alert("حدث خطأ أثناء جلب تفاصيل العقار: " + error.message);
      setPropertyModal({
        show: false,
        property: null,
        loading: false,
      });
    }
  };

  // إغلاق مودال تفاصيل العقار
  const closePropertyModal = () => {
    setPropertyModal({
      show: false,
      property: null,
      loading: false,
    });
  };

  // استخدام useMutation لتحديث حالة الاهتمام
  const statusMutation = useMutation(
    async ({ interestId, status, adminNote }) => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `https://shahin-tqay.onrender.com/api/admin/interests/${interestId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: status,
            admin_note: adminNote.trim() || undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل في تحديث حالة الاهتمام");
      }

      return await response.json();
    },
    {
      onSuccess: () => {
        alert("تم تحديث حالة الاهتمام بنجاح");
        refetch();
        setSelectedInterest(null);
        closeStatusModal();
        queryClient.invalidateQueries(["interests"]);
      },
      onError: (error) => {
        alert(error.message);
      },
    }
  );

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };

    setFilters(newFilters);

    if (key !== "page" && currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const clearFilters = () => {
    const defaultFilters = {
      search: "",
      status: "all",
      property_id: "all",
      date_from: "",
      date_to: "",
      sort_by: "created_at",
      sort_order: "desc",
    };

    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const openStatusModal = (interestId, newStatus) => {
    setStatusModal({
      show: true,
      interestId,
      newStatus,
      adminNote: "",
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      show: false,
      interestId: null,
      newStatus: "",
      adminNote: "",
    });
  };

  const handleStatusUpdate = async () => {
    if (!statusModal.interestId || !statusModal.newStatus) {
      alert("بيانات غير مكتملة");
      return;
    }

    if (
      !window.confirm(
        `هل أنت متأكد من تغيير الحالة إلى "${getStatusText(
          statusModal.newStatus
        )}"؟`
      )
    ) {
      return;
    }

    statusMutation.mutate({
      interestId: statusModal.interestId,
      status: statusModal.newStatus,
      adminNote: statusModal.adminNote,
    });
  };

  // تحديث الصفحة الحالية
  const updatePagination = (newPage) => {
    setCurrentPage(newPage);
  };

  // ========== دوال المساعدة ==========

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";

    switch (status) {
      case "قيد المراجعة":
        return (
          <span
            className={`${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`}
          >
            قيد المراجعة
          </span>
        );
      case "تمت المراجعة":
        return (
          <span
            className={`${baseClasses} bg-green-100 text-green-800 border border-green-200`}
          >
            تمت المراجعة
          </span>
        );
      case "تم التواصل":
        return (
          <span
            className={`${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`}
          >
            تم التواصل
          </span>
        );
      case "ملغي":
        return (
          <span
            className={`${baseClasses} bg-red-100 text-red-800 border border-red-200`}
          >
            ملغي
          </span>
        );
      default:
        return (
          <span
            className={`${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`}
          >
            {status}
          </span>
        );
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "قيد المراجعة":
        return "قيد المراجعة";
      case "تمت المراجعة":
        return "تمت المراجعة";
      case "تم التواصل":
        return "تم التواصل";
      case "ملغي":
        return "ملغي";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "قيد المراجعة":
        return "yellow";
      case "تمت المراجعة":
        return "green";
      case "تم التواصل":
        return "blue";
      case "ملغي":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusMessagePlaceholder = (status) => {
    switch (status) {
      case "تمت المراجعة":
        return "اكتب رسالة للمهتم توضح الخطوات القادمة...";
      case "تم التواصل":
        return "اكتب ملاحظات حول عملية التواصل...";
      case "ملغي":
        return "اكتب سبب إلغاء طلب الاهتمام...";
      case "قيد المراجعة":
        return "اكتب ملاحظات إضافية حول المراجعة...";
      default:
        return "اكتب ملاحظات إضافية...";
    }
  };

  // ========== دوال العرض ==========

  // دالة لعرض تفاصيل العقار في المودال
  const renderPropertyDetails = (property) => {
    if (!property) return null;

    return (
      <div className="space-y-6">
        {/* المعلومات الأساسية */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            المعلومات الأساسية
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                عنوان العقار
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <span className="text-gray-800">
                  {property.title || "غير متوفر"}
                </span>
                {property.title && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      copyStatus["property_title"]
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(property.title, "property_title")
                    }
                    title="نسخ عنوان العقار"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الإعلان
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <span className="text-gray-800">
                  {property.announcement_number || "غير متوفر"}
                </span>
                {property.announcement_number && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      copyStatus["announcement_number"]
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        property.announcement_number,
                        "announcement_number"
                      )
                    }
                    title="نسخ رقم الإعلان"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع الأرض
              </label>
              <div
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  property.land_type === "سكني"
                    ? "bg-blue-100 text-blue-800"
                    : property.land_type === "تجاري"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {property.land_type || "غير محدد"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الغرض
              </label>
              <div
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  property.purpose === "بيع"
                    ? "bg-red-100 text-red-800"
                    : "bg-indigo-100 text-indigo-800"
                }`}
              >
                {property.purpose || "غير محدد"}
              </div>
            </div>
          </div>
        </div>

        {/* الموقع والمساحة */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            الموقع والمساحة
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المنطقة
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <span className="text-gray-800">
                  {property.region || "غير متوفر"}
                </span>
                {property.region && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      copyStatus["property_region"]
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(property.region, "property_region")
                    }
                    title="نسخ المنطقة"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المدينة
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <span className="text-gray-800">
                  {property.city || "غير متوفر"}
                </span>
                {property.city && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      copyStatus["property_city"]
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(property.city, "property_city")
                    }
                    title="نسخ المدينة"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المساحة الكلية
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <span className="text-gray-800">{property.total_area} م²</span>
                <button
                  className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                    copyStatus["property_area"]
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                  onClick={() =>
                    copyToClipboard(
                      `${property.total_area} م²`,
                      "property_area"
                    )
                  }
                  title="نسخ المساحة الكلية"
                >
                  <FiCopy size={16} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الإحداثيات
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <span className="text-gray-800">
                  {property.geo_location_text || "غير متوفر"}
                </span>
                {property.geo_location_text && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      copyStatus["geo_location"]
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        property.geo_location_text,
                        "geo_location"
                      )
                    }
                    title="نسخ الإحداثيات"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* المعلومات المالية */}
        {(property.price_per_sqm || property.estimated_investment_value) && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              المعلومات المالية
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.price_per_sqm && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    سعر المتر
                  </label>
                  <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                    <span className="text-gray-800">
                      {property.price_per_sqm} ريال/م²
                    </span>
                    <button
                      className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                        copyStatus["price_per_sqm"]
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                      onClick={() =>
                        copyToClipboard(
                          `${property.price_per_sqm} ريال/م²`,
                          "price_per_sqm"
                        )
                      }
                      title="نسخ سعر المتر"
                    >
                      <FiCopy size={16} />
                    </button>
                  </div>
                </div>
              )}
              {property.estimated_investment_value && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    القيمة الاستثمارية
                  </label>
                  <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                    <span className="text-gray-800">
                      {property.estimated_investment_value} ريال
                    </span>
                    <button
                      className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                        copyStatus["investment_value"]
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                      onClick={() =>
                        copyToClipboard(
                          `${property.estimated_investment_value} ريال`,
                          "investment_value"
                        )
                      }
                      title="نسخ القيمة الاستثمارية"
                    >
                      <FiCopy size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* المعلومات القانونية */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            المعلومات القانونية
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الصك
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <span className="text-gray-800">
                  {property.deed_number || "غير متوفر"}
                </span>
                {property.deed_number && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      copyStatus["deed_number"]
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(property.deed_number, "deed_number")
                    }
                    title="نسخ رقم الصك"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
            {property.agency_number && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الوكالة
                </label>
                <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                  <span className="text-gray-800">
                    {property.agency_number}
                  </span>
                  <button
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      copyStatus["agency_number"]
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(property.agency_number, "agency_number")
                    }
                    title="نسخ رقم الوكالة"
                  >
                    <FiCopy size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* الوصف */}
        {property.description && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              الوصف
            </h4>
            <div className="flex items-start justify-between bg-gray-50 rounded-md p-4">
              <p className="text-gray-800 flex-1">{property.description}</p>
              <button
                className={`p-1 rounded hover:bg-gray-200 transition-colors ml-2 ${
                  copyStatus["property_description"]
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
                onClick={() =>
                  copyToClipboard(property.description, "property_description")
                }
                title="نسخ الوصف"
              >
                <FiCopy size={16} />
              </button>
            </div>
          </div>
        )}

        {/* معلومات المالك */}
        {property.user && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              معلومات المالك
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المالك
                </label>
                <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                  <span className="text-gray-800">
                    {property.user.full_name || "غير متوفر"}
                  </span>
                  {property.user.full_name && (
                    <button
                      className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                        copyStatus["owner_name"]
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                      onClick={() =>
                        copyToClipboard(property.user.full_name, "owner_name")
                      }
                      title="نسخ اسم المالك"
                    >
                      <FiCopy size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                  <span className="text-gray-800">
                    {property.user.email || "غير متوفر"}
                  </span>
                  {property.user.email && (
                    <button
                      className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                        copyStatus["owner_email"]
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                      onClick={() =>
                        copyToClipboard(property.user.email, "owner_email")
                      }
                      title="نسخ البريد الإلكتروني"
                    >
                      <FiCopy size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الهاتف
              </label>
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                <span className="text-gray-800">
                  {property.user.phone || "غير متوفر"}
                </span>
                {property.user.phone && (
                  <button
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      copyStatus["owner_phone"]
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(property.user.phone, "owner_phone")
                    }
                    title="نسخ رقم الهاتف"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* الصور */}
        {property.images && property.images.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              صور العقار ({property.images.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.images.map((image, index) => (
                <div
                  key={image.id}
                  className="border border-gray-200 rounded-lg p-4 text-center"
                >
                  <FiMap className="mx-auto text-gray-400 mb-2" size={24} />
                  <span className="text-sm text-gray-600">
                    صورة {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInterestDetails = (interest) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <FiUser className="text-gray-500 ml-2" />
            <span className="text-sm font-medium text-gray-700">
              اسم المهتم
            </span>
          </div>
          <span className="text-gray-900 font-medium">
            {interest.full_name}
          </span>
        </div>

        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <FiMail className="text-gray-500 ml-2" />
            <span className="text-sm font-medium text-gray-700">
              البريد الإلكتروني
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-900 font-medium mr-2">
              {interest.email}
            </span>
            <button
              className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                copyStatus["email"] ? "text-green-600" : "text-gray-500"
              }`}
              onClick={() => copyToClipboard(interest.email, "email")}
              title="نسخ البريد الإلكتروني"
            >
              <FiCopy size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <FiPhone className="text-gray-500 ml-2" />
            <span className="text-sm font-medium text-gray-700">
              رقم الهاتف
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-900 font-medium mr-2">
              {interest.phone}
            </span>
            <button
              className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                copyStatus["phone"] ? "text-green-600" : "text-gray-500"
              }`}
              onClick={() => copyToClipboard(interest.phone, "phone")}
              title="نسخ رقم الهاتف"
            >
              <FiCopy size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <FiHome className="text-gray-500 ml-2" />
            <span className="text-sm font-medium text-gray-700">
              العقار المهتم به
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-gray-900 font-medium mr-2">
              {interest.property?.title || "غير محدد"}
            </span>
            <div className="flex space-x-1 space-x-reverse">
              {interest.property_id && (
                <button
                  className="p-1 rounded hover:bg-gray-200 transition-colors text-blue-600"
                  onClick={() => openPropertyModal(interest.property_id)}
                  title="عرض تفاصيل العقار"
                >
                  <FiEye size={16} />
                </button>
              )}
              {interest.property?.title && (
                <button
                  className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                    copyStatus["property_title"]
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                  onClick={() =>
                    copyToClipboard(interest.property.title, "property_title")
                  }
                  title="نسخ اسم العقار"
                >
                  <FiCopy size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <span className="text-sm font-medium text-gray-700">الحالة</span>
          {getStatusBadge(interest.status)}
        </div>

        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <FiCalendar className="text-gray-500 ml-2" />
            <span className="text-sm font-medium text-gray-700">
              تاريخ الاهتمام
            </span>
          </div>
          <span className="text-gray-900">
            {formatDate(interest.created_at)}
          </span>
        </div>

        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <div className="flex items-center">
            <FiCalendar className="text-gray-500 ml-2" />
            <span className="text-sm font-medium text-gray-700">آخر تحديث</span>
          </div>
          <span className="text-gray-900">
            {formatDate(interest.updated_at)}
          </span>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <FiMessageSquare className="text-gray-500 ml-2" />
            <span className="text-sm font-medium text-gray-700">
              رسالة المهتم
            </span>
          </div>
          <div className="bg-white rounded-md p-3 border border-gray-200">
            <p className="text-gray-800">
              {interest.message || "لا توجد رسالة"}
            </p>
          </div>
        </div>

        {interest.admin_notes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <FiEdit className="text-gray-500 ml-2" />
              <span className="text-sm font-medium text-gray-700">
                ملاحظات المسؤول
              </span>
            </div>
            <div className="flex items-center justify-between bg-white rounded-md p-3 border border-gray-200">
              <p className="text-gray-800 flex-1">{interest.admin_notes}</p>
              <button
                className={`p-1 rounded hover:bg-gray-200 transition-colors ml-2 ${
                  copyStatus["admin_notes"] ? "text-green-600" : "text-gray-500"
                }`}
                onClick={() =>
                  copyToClipboard(interest.admin_notes, "admin_notes")
                }
                title="نسخ ملاحظات المسؤول"
              >
                <FiCopy size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ========== الباجينيشن ==========

  // إنشاء أزرار الباجينيشن
  const renderPagination = () => {
    if (
      !interestsData ||
      !interestsData.pagination ||
      interestsData.pagination.last_page <= 1
    )
      return null;

    const pages = [];
    const pagination = interestsData.pagination;

    pages.push(
      <button
        key="prev"
        className={`flex items-center justify-center w-10 h-10 rounded-md border ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
        onClick={() => currentPage > 1 && updatePagination(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FiChevronRight />
      </button>
    );

    const showPages = [];
    showPages.push(1);

    if (currentPage > 3) {
      showPages.push("ellipsis-start");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(pagination.last_page - 1, currentPage + 1);
      i++
    ) {
      showPages.push(i);
    }

    if (currentPage < pagination.last_page - 2) {
      showPages.push("ellipsis-end");
    }

    if (pagination.last_page > 1) {
      showPages.push(pagination.last_page);
    }

    const uniquePages = [...new Set(showPages)];

    uniquePages.forEach((page) => {
      if (page === "ellipsis-start" || page === "ellipsis-end") {
        pages.push(
          <span
            key={page}
            className="flex items-center justify-center w-10 h-10 text-gray-500"
          >
            ...
          </span>
        );
      } else {
        pages.push(
          <button
            key={page}
            className={`flex items-center justify-center w-10 h-10 rounded-md border ${
              currentPage === page
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => updatePagination(page)}
          >
            {page}
          </button>
        );
      }
    });

    pages.push(
      <button
        key="next"
        className={`flex items-center justify-center w-10 h-10 rounded-md border ${
          currentPage === pagination.last_page
            ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
        onClick={() =>
          currentPage < pagination.last_page &&
          updatePagination(currentPage + 1)
        }
        disabled={currentPage === pagination.last_page}
      >
        <FiChevronLeft />
      </button>
    );

    return pages;
  };

  // ========== المتغيرات المساعدة ==========

  // التحقق إذا كان هناك أي فلتر نشط
  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.property_id !== "all" ||
    filters.date_from ||
    filters.date_to;

  // استخراج البيانات من نتيجة الاستعلام
  const interests = interestsData?.data || [];
  const pagination = interestsData?.pagination || {
    current_page: currentPage,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  };
  const filtersData = interestsData?.filtersData || {
    status_options: [],
    properties: [],
  };

  const loading = isLoading || isRefreshing || statusMutation.isLoading;

  // ========== واجهة المستخدم ==========

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* شريط البحث والتصفية */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FiFilter className="text-blue-600 ml-2" />
            <span className="text-lg font-semibold text-gray-800">
              أدوات البحث والتصفية:
            </span>
          </div>

          {hasActiveFilters && (
            <button
              className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
              onClick={clearFilters}
            >
              <FiSlash className="ml-1" />
              مسح الفلاتر
            </button>
          )}
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو البريد الإلكتروني أو الرسالة..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              بحث
            </button>
            <button
              className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
            >
              <FiRefreshCw
                className={`ml-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "جاري التحديث..." : "تحديث البيانات"}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الحالة:
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع الحالات</option>
              {filtersData.status_options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              من تاريخ:
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              إلى تاريخ:
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ترتيب حسب:
            </label>
            <select
              value={filters.sort_by}
              onChange={(e) => handleFilterChange("sort_by", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created_at">تاريخ الاهتمام</option>
              <option value="full_name">اسم المستخدم</option>
              <option value="status">الحالة</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الاتجاه:
            </label>
            <select
              value={filters.sort_order}
              onChange={(e) => handleFilterChange("sort_order", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">تنازلي</option>
              <option value="asc">تصاعدي</option>
            </select>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* قائمة طلبات الاهتمام */}
        <div className="xl:col-span-2">
          <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200">
            <div className="p-6 border-b border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
                  قائمة طلبات الاهتمام ({interests.length})
                </h3>
                <span className="text-sm text-gray-600">
                  {pagination.total > 0 ? (
                    <>
                      عرض {pagination.from} إلى {pagination.to} من{" "}
                      {pagination.total} - الصفحة {pagination.current_page} من{" "}
                      {pagination.last_page}
                    </>
                  ) : (
                    "لا توجد نتائج"
                  )}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
              </div>
            ) : interests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiHeart className="text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 text-lg mb-4">لا توجد نتائج</p>
                {hasActiveFilters && (
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={clearFilters}
                  >
                    مسح الفلاتر
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="divide-y divide-blue-200">
                  {interests.map((interest) => (
                    <div
                      key={interest.id}
                      className={`p-6 cursor-pointer transition-colors ${
                        selectedInterest?.id === interest.id
                          ? "bg-blue-100 border-r-4 border-r-blue-600"
                          : "hover:bg-blue-50"
                      }`}
                      onClick={() => setSelectedInterest(interest)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 space-x-reverse">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <FiUser className="text-blue-600" size={20} />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 space-x-reverse mb-2">
                              <h4 className="text-lg font-semibold text-gray-800">
                                {interest.full_name}
                              </h4>
                              {getStatusBadge(interest.status)}
                            </div>
                            <p className="text-gray-600 mb-2">
                              {interest.property?.title}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 mb-2">
                              <FiCalendar className="ml-1" size={14} />
                              <span>{formatDate(interest.created_at)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <FiMessageSquare className="ml-1" size={14} />
                              <span className="truncate">
                                {interest.message?.substring(0, 60)}...
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* الباجينيشن */}
                {pagination.last_page > 1 && (
                  <div className="p-6 border-t border-blue-200">
                    <div className="flex items-center justify-center space-x-2 space-x-reverse">
                      {renderPagination()}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {/* تفاصيل طلب الاهتمام */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
            {selectedInterest ? (
              <div>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-800">
                      تفاصيل طلب الاهتمام
                    </h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      ID: {selectedInterest.id}
                    </span>
                  </div>
                </div>

                <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {renderInterestDetails(selectedInterest)}
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        openStatusModal(selectedInterest.id, "تمت المراجعة")
                      }
                      disabled={
                        selectedInterest.status === "تمت المراجعة" || loading
                      }
                    >
                      <FiCheck className="ml-1" size={16} />
                      تمت المراجعة
                    </button>

                    <button
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        openStatusModal(selectedInterest.id, "تم التواصل")
                      }
                      disabled={
                        selectedInterest.status === "تم التواصل" || loading
                      }
                    >
                      <FiPhone className="ml-1" size={16} />
                      تم التواصل
                    </button>

                    <button
                      className="flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        openStatusModal(selectedInterest.id, "قيد المراجعة")
                      }
                      disabled={
                        selectedInterest.status === "قيد المراجعة" || loading
                      }
                    >
                      <FiFileText className="ml-1" size={16} />
                      قيد المراجعة
                    </button>

                    <button
                      className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        openStatusModal(selectedInterest.id, "ملغي")
                      }
                      disabled={selectedInterest.status === "ملغي" || loading}
                    >
                      <FiX className="ml-1" size={16} />
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiHeart className="text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 text-lg">
                  اختر طلب اهتمام لعرض التفاصيل
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== المودالات ========== */}

      {/* مودال تغيير الحالة */}
      {statusModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiEdit className="ml-2" />
                تغيير حالة الاهتمام
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl"
                onClick={closeStatusModal}
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة الجديدة
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {getStatusBadge(statusModal.newStatus)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رسالة / ملاحظات إضافية
                </label>
                <textarea
                  value={statusModal.adminNote}
                  onChange={(e) =>
                    setStatusModal((prev) => ({
                      ...prev,
                      adminNote: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  placeholder={getStatusMessagePlaceholder(
                    statusModal.newStatus
                  )}
                />
                <div className="text-sm text-gray-500 mt-1">
                  هذه الرسالة ستظهر للمستخدم كتفسير لتغيير الحالة
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 space-x-reverse p-6 border-t border-gray-200">
              <button
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                onClick={closeStatusModal}
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleStatusUpdate}
                disabled={loading}
              >
                <FiCheck className="ml-1" />
                {loading ? "جاري الحفظ..." : "تأكيد التغيير"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال تفاصيل العقار */}
      {propertyModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiMap className="ml-2" />
                تفاصيل العقار
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl"
                onClick={closePropertyModal}
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {propertyModal.loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                    <div
                      className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <p className="mt-4 text-gray-600">
                    جاري تحميل تفاصيل العقار...
                  </p>
                </div>
              ) : (
                renderPropertyDetails(propertyModal.property)
              )}
            </div>
            <div className="flex items-center justify-end p-6 border-t border-gray-200">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                onClick={closePropertyModal}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllInterests;
