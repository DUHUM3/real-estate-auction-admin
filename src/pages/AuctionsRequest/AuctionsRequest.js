import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiMap,
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
  FiNavigation,
  FiTarget,
  FiLayers,
  FiImage,
  FiClock,
} from "react-icons/fi";
import { useQueryClient, useQuery, useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

const MarketingRequests = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // =============================================
  // 1. المتغيرات والحالات
  // =============================================

  // استرجاع الفلاتر المحفوظة أو استخدام القيم الافتراضية
  const getInitialFilters = () => {
    const savedFilters = localStorage.getItem("marketingRequestsFilters");
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return {
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
  };

  const [filters, setFilters] = useState(getInitialFilters());
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusModal, setStatusModal] = useState({
    show: false,
    requestId: null,
    newStatus: "",
    rejectionMessage: "",
  });
  const [imageModal, setImageModal] = useState({
    show: false,
    images: [],
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };

      // إعادة ضبط الصفحة عند تغيير أي فلتر آخر غير الصفحة
      if (key !== "page" && prev.page !== 1) {
        newFilters.page = 1;
      }

      return newFilters;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  // 🔥 الحل: دالة مسح الفلاتر المحدثة
  const clearFilters = () => {
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

    setFilters(defaultFilters);
    localStorage.removeItem("marketingRequestsFilters");

    // استخدام setTimeout لضمان تحديث state أولاً ثم إعادة الجلب
    setTimeout(() => {
      refetch();
    }, 0);
  };

  // 🔥 الحل: دالة تحديث البيانات المحسنة
  const handleRefresh = () => {
    refetch();
  };

  // حفظ الفلاتر في localStorage عند تغييرها
  useEffect(() => {
    localStorage.setItem("marketingRequestsFilters", JSON.stringify(filters));
  }, [filters]);

  // إعادة جلب البيانات عند تغيير الفلاتر
  useEffect(() => {
    refetch();
  }, [filters]);

  // =============================================
  // 2. دوال جلب البيانات
  // =============================================

  const buildQueryString = () => {
    const params = new URLSearchParams();

    if (filters.status && filters.status !== "all")
      params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    if (filters.region && filters.region !== "all")
      params.append("region", filters.region);
    if (filters.city && filters.city !== "all")
      params.append("city", filters.city);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.sort_by) params.append("sort_by", filters.sort_by);

    params.append("page", filters.page || 1);
    params.append("per_page", filters.per_page || 10);

    return params.toString();
  };

  // استخدام React Query لجلب بيانات طلبات التسويق
  const fetchMarketingRequests = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      throw new Error("لم يتم العثور على رمز الدخول");
    }
    const queryString = buildQueryString();
    const url = `http://72.61.119.194/api/admin/auction-requests?${queryString}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("فشل في جلب البيانات");

    if (response.status === 401) {
      localStorage.removeItem("access_token");
      navigate("/login");
      throw new Error("انتهت جلسة الدخول أو التوكن غير صالح");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`فشل في جلب طلبات التسويق: ${errorText}`);
    }

    const result = await response.json();

    if (result.auction_requests) {
      // استخراج المناطق والمدن المتاحة من البيانات
      const regions = [
        ...new Set(
          result.auction_requests.map((req) => req.region).filter(Boolean)
        ),
      ];
      const cities = [
        ...new Set(
          result.auction_requests.map((req) => req.city).filter(Boolean)
        ),
      ];

      return {
        data: result.auction_requests,
        pagination: {
          current_page: filters.page,
          last_page: Math.ceil(
            result.auction_requests.length / filters.per_page
          ),
          per_page: filters.per_page,
          total: result.auction_requests.length,
          from: (filters.page - 1) * filters.per_page + 1,
          to: Math.min(
            filters.page * filters.per_page,
            result.auction_requests.length
          ),
        },
        filtersData: {
          regions,
          cities,
          statuses: [
            { value: "under_review", label: "قيد المراجعة" },
            { value: "reviewed", label: "تمت المراجعة" },
            { value: "auctioned", label: "تم عرض العفار في شركة المزادات" },
            { value: "rejected", label: "مرفوض" },
          ],
        },
      };
    } else {
      throw new Error(result.message || "هيكل البيانات غير متوقع");
    }
  };

  const {
    data: marketingRequestsData,
    isLoading,
    error,
    refetch,
  } = useQuery(["marketingRequests", filters], fetchMarketingRequests, {
    staleTime: 0, // البيانات تعتبر قديمة فوراً
    cacheTime: 0, // التخلص من الكاش بعد فترة قصيرة
    refetchOnWindowFocus: true,
    refetchOnMount: "always", // كل مرة نركب المكون، يعيد جلب البيانات من السيرفر
  });

  // ✅ استخدام useMutation لتحديث حالة الطلب (نسخة محسّنة وآمنة)
  const statusMutation = useMutation(
    async ({ requestId, status, message }) => {
      const token = localStorage.getItem("access_token");

      const requestBody = { status };
      if (status === "rejected" && message) {
        requestBody.message = message;
      }

      const response = await fetch(
        `http://72.61.119.194/api/admin/auction-requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "حدث خطأ أثناء تحديث الحالة");
      }

      return data;
    },
    {
      onSuccess: (data) => {
        alert(data.message || "تم تحديث حالة الطلب بنجاح");
        setSelectedRequest(null);
        closeStatusModal();

        // 🔥 تحديث العنصر مباشرة في الـ state بدون إعادة fetch كامل
        queryClient.setQueryData(["marketingRequests", filters], (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: oldData.data.map((req) =>
              req.id === data.auction_request.id ? data.auction_request : req
            ),
          };
        });
      },
      onError: (error) => {
        console.error("❌ خطأ أثناء تحديث الحالة:", error);
        alert(error.message || "فشل في تحديث حالة الطلب");
      },
    }
  );

  // =====================================================
  // ⚙️ معالجة الحالات والإجراءات
  // =====================================================

  // فتح نافذة تغيير الحالة
  const openStatusModal = (requestId, newStatus) => {
    setStatusModal({
      show: true,
      requestId,
      newStatus,
      rejectionMessage: "",
    });
  };

  // إغلاق نافذة الحالة
  const closeStatusModal = () => {
    setStatusModal({
      show: false,
      requestId: null,
      newStatus: "",
      rejectionMessage: "",
    });
  };

  // تحديث الحالة فعليًا
  const handleStatusUpdate = async () => {
    if (!statusModal.requestId || !statusModal.newStatus) {
      alert("بيانات غير مكتملة");
      return;
    }

    if (
      statusModal.newStatus === "rejected" &&
      !statusModal.rejectionMessage.trim()
    ) {
      alert("يرجى إدخال سبب الرفض");
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

    statusMutation.mutate(
      {
        requestId: statusModal.requestId,
        status: statusModal.newStatus,
        message: statusModal.rejectionMessage,
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries(["marketingRequests"]); // يجبر جلب جديد من السيرفر
          closeStatusModal();
        },
      }
    );
  };

  // 🔥 الحل: إضافة الدوال المفقودة
  const updatePagination = (page) => {
    handleFilterChange("page", page);
  };

  const openImageModal = (images) => {
    setImageModal({
      show: true,
      images: images,
    });
  };

  const closeImageModal = () => {
    setImageModal({
      show: false,
      images: [],
    });
  };

  // =============================================
  // 5. دوال المساعدة
  // =============================================

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
    switch (status) {
      case "under_review":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            قيد المراجعة
          </span>
        );
      case "reviewed":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            تمت المراجعة
          </span>
        );
      case "auctioned":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            تم عرض العفار في شركة المزادات
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            مرفوض
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "under_review":
        return "قيد المراجعة";
      case "reviewed":
        return "تمت المراجعة";
      case "auctioned":
        return "تم عرض العقار في شركة المزادات";
      case "rejected":
        return "مرفوض";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "under_review":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "reviewed":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "auctioned":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    return `http://72.61.119.194/storage/${imagePath}`;
  };

  // إنشاء أزرار الباجينيشن
  const renderPagination = () => {
    if (
      !marketingRequestsData ||
      !marketingRequestsData.pagination ||
      marketingRequestsData.pagination.last_page <= 1
    )
      return null;

    const pages = [];
    const pagination = marketingRequestsData.pagination;

    pages.push(
      <button
        key="prev"
        className={`flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 ${
          pagination.current_page === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() =>
          pagination.current_page > 1 &&
          updatePagination(pagination.current_page - 1)
        }
        disabled={pagination.current_page === 1}
      >
        <FiChevronRight className="w-4 h-4" />
      </button>
    );

    const showPages = [];
    showPages.push(1);

    if (pagination.current_page > 3) {
      showPages.push("ellipsis-start");
    }

    for (
      let i = Math.max(2, pagination.current_page - 1);
      i <= Math.min(pagination.last_page - 1, pagination.current_page + 1);
      i++
    ) {
      showPages.push(i);
    }

    if (pagination.current_page < pagination.last_page - 2) {
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
            className={`flex items-center justify-center w-10 h-10 rounded-lg border ${
              pagination.current_page === page
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
        className={`flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 ${
          pagination.current_page === pagination.last_page
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() =>
          pagination.current_page < pagination.last_page &&
          updatePagination(pagination.current_page + 1)
        }
        disabled={pagination.current_page === pagination.last_page}
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>
    );

    return pages;
  };

  // =============================================
  // 6. واجهة المستخدم الرئيسية
  // =============================================

  const hasActiveFilters =
    filters.search ||
    filters.region !== "all" ||
    filters.city !== "all" ||
    filters.status !== "all" ||
    filters.start_date ||
    filters.end_date;

  const requests = marketingRequestsData?.data || [];
  const pagination = marketingRequestsData?.pagination || {
    current_page: filters.page,
    last_page: 1,
    per_page: filters.per_page,
    total: 0,
    from: 0,
    to: 0,
  };
  const filtersData = marketingRequestsData?.filtersData || {
    regions: [],
    cities: [],
    statuses: [],
  };

  const loading = isLoading || statusMutation.isLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* رأس الصفحة */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FiTarget className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                إدارة طلبات التسويق
              </h1>
              <p className="text-gray-600 mt-1">
                عرض وإدارة جميع طلبات التسويق - العدد الإجمالي:{" "}
                {pagination.total}
              </p>
            </div>
          </div>

          <button
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={handleRefresh}
            disabled={loading}
          >
            <FiRefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* قسم الفلاتر والبحث */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <FiFilter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">
                أدوات البحث والتصفية
              </span>
            </div>

            {hasActiveFilters && (
              <button
                className="flex items-center space-x-2 space-x-reverse px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                onClick={clearFilters}
              >
                <FiSlash className="w-4 h-4" />
                <span>مسح الفلاتر</span>
              </button>
            )}
          </div>

          {/* شريط البحث */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex space-x-3 space-x-reverse">
              <div className="flex-1 relative">
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث باسم المستخدم أو الوصف..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                بحث
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
                value={filters.region}
                onChange={(e) => handleFilterChange("region", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                {filtersData.regions.map((region) => (
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
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">جميع المدن</option>
                <option value="الرياض">الرياض</option>
                <option value="جدة">جدة</option>
                <option value="مكة المكرمة">مكة المكرمة</option>
                <option value="المدينة المنورة">المدينة المنورة</option>
                <option value="الدمام">الدمام</option>
                <option value="الخبر">الخبر</option>
                <option value="الظهران">الظهران</option>
                <option value="القطيف">القطيف</option>
                {filtersData.cities.map((city) => (
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
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">جميع الحالات</option>
                <option value="under_review">قيد المراجعة</option>
                <option value="reviewed">تمت المراجعة</option>
                <option value="auctioned">
                  تم عرض المزاد في شركة المزادات
                </option>
                <option value="rejected">مرفوض</option>
              </select>
            </div>

            {/* فلتر الترتيب */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ترتيب حسب
              </label>
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange("sort_by", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                value={filters.start_date}
                onChange={(e) =>
                  handleFilterChange("start_date", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                إلى تاريخ
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange("end_date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* محتوى الصفحة الرئيسي */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* قائمة الطلبات */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  قائمة طلبات التسويق ({requests.length})
                </h3>
                <span className="text-sm text-gray-500">
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

            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex space-x-2 space-x-reverse mb-4">
                    <div
                      className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    ></div>
                  </div>
                  <p className="text-gray-600">جاري تحميل طلبات التسويق...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FiTarget className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg mb-4">
                    لا توجد طلبات تسويق
                  </p>
                  {hasActiveFilters && (
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={clearFilters}
                    >
                      مسح الفلاتر
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedRequest?.id === request.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedRequest(request)}
                      >
                        <div className="flex items-start space-x-4 space-x-reverse">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <FiUser className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-medium text-gray-900 truncate">
                                {request.user?.name}
                              </h4>
                              <div
                                className={
                                  getStatusColor(request.status) +
                                  " px-3 py-1 rounded-full text-sm font-medium border"
                                }
                              >
                                {request.status_ar ||
                                  getStatusText(request.status)}
                              </div>
                            </div>

                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <FiMail className="w-4 h-4" />
                                <span>{request.user?.email}</span>
                              </div>

                              <div className="flex items-center space-x-2 space-x-reverse">
                                <FiNavigation className="w-4 h-4" />
                                <span>
                                  {request.region} - {request.city}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2 space-x-reverse">
                                <FiCalendar className="w-4 h-4" />
                                <span>{formatDate(request.created_at)}</span>
                              </div>

                              <div className="flex items-start space-x-2 space-x-reverse">
                                <FiMessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-1">
                                  {request.description?.substring(0, 100)}...
                                </span>
                              </div>

                              {request.images && request.images.length > 0 && (
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <FiImage className="w-4 h-4" />
                                  <span>
                                    {request.images.length} صورة مرفوعة
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* الباجينيشن */}
                  {pagination.last_page > 1 && (
                    <div className="flex items-center justify-center space-x-2 space-x-reverse mt-6">
                      {renderPagination()}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* تفاصيل الطلب المحدد */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
            {selectedRequest ? (
              <div>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      تفاصيل طلب التسويق
                    </h3>
                    <span className="text-sm text-gray-500">
                      ID: {selectedRequest.id}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {/* معلومات المستخدم */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      معلومات مقدم الطلب
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <FiUser className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">الاسم</p>
                          <p className="font-medium">
                            {selectedRequest.user?.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 space-x-reverse">
                        <FiMail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">
                            البريد الإلكتروني
                          </p>
                          <p className="font-medium">
                            {selectedRequest.user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 space-x-reverse">
                        <FiPhone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">رقم الهاتف</p>
                          <p className="font-medium">
                            {selectedRequest.user?.phone}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">نوع المستخدم</p>
                        <p className="font-medium">
                          {selectedRequest.user?.user_type}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">رقم الهوية</p>
                        <p className="font-medium">
                          {selectedRequest.user?.identity_number || "غير محدد"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* معلومات الطلب */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      معلومات الطلب
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <FiNavigation className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">المنطقة</p>
                          <p className="font-medium">
                            {selectedRequest.region}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 space-x-reverse">
                        <FiHome className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">المدينة</p>
                          <p className="font-medium">{selectedRequest.city}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">رقم الوثيقة</p>
                        <p className="font-medium">
                          {selectedRequest.document_number}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">الحالة</p>
                        <div className="mt-1">
                          {getStatusBadge(selectedRequest.status)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 space-x-reverse">
                        <FiCalendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">تاريخ الطلب</p>
                          <p className="font-medium">
                            {formatDate(selectedRequest.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* الوصف */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      الوصف
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">
                        {selectedRequest.description}
                      </p>
                    </div>
                  </div>

                  {/* سبب الرفض */}
                  {selectedRequest.rejection_message && (
                    <div>
                      <h4 className="text-sm font-medium text-red-700 mb-3">
                        سبب الرفض
                      </h4>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <p className="text-red-700">
                          {selectedRequest.rejection_message}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* الصور المرفوعة */}
                  {selectedRequest.images &&
                    selectedRequest.images.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          الصور المرفوعة
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedRequest.images.map((image, index) => (
                            <div
                              key={index}
                              className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() =>
                                openImageModal(selectedRequest.images)
                              }
                            >
                              <img
                                src={getImageUrl(image)}
                                alt={`صورة الطلب ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                              <div className="hidden w-full h-full flex-col items-center justify-center bg-gray-200 text-gray-500">
                                <FiImage className="w-6 h-6 mb-1" />
                                <span className="text-xs">
                                  تعذر تحميل الصورة
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* أزرار الإجراءات */}
                <div className="p-6 border-t border-gray-200">
                  <div className="flex flex-col space-y-3">
                    {/* زر: قيد المراجعة */}
                    <button
                      className="flex items-center justify-center space-x-2 space-x-reverse w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        openStatusModal(selectedRequest.id, "under_review")
                      }
                      disabled={
                        selectedRequest.status === "under_review" || loading
                      }
                    >
                      <FiClock className="w-4 h-4" />
                      <span>قيد المراجعة</span>
                    </button>

                    {/* زر: تمت المراجعة */}
                    <button
                      className="flex items-center justify-center space-x-2 space-x-reverse w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        openStatusModal(selectedRequest.id, "reviewed")
                      }
                      disabled={
                        selectedRequest.status === "reviewed" || loading
                      }
                    >
                      <FiCheck className="w-4 h-4" />
                      <span>تمت المراجعة</span>
                    </button>

                    {/* زر: عرض المزاد في شركة المزادات */}
                    <button
                      className="flex items-center justify-center space-x-2 space-x-reverse w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        openStatusModal(selectedRequest.id, "auctioned")
                      }
                      disabled={
                        selectedRequest.status === "auctioned" || loading
                      }
                    >
                      <FiTarget className="w-4 h-4" />
                      <span>تم عرض العقار في شركة المزادات</span>
                    </button>

                    {/* زر: رفض الطلب */}
                    <button
                      className="flex items-center justify-center space-x-2 space-x-reverse w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        openStatusModal(selectedRequest.id, "rejected")
                      }
                      disabled={
                        selectedRequest.status === "rejected" || loading
                      }
                    >
                      <FiX className="w-4 h-4" />
                      <span>رفض الطلب</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiTarget className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500">اختر طلب تسويق لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================= */}
      {/* 7. المودالات */}
      {/* ============================================= */}

      {/* مودال تغيير الحالة */}
      {statusModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3 space-x-reverse">
                <FiEdit className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  تغيير حالة الطلب
                </h3>
              </div>
              <button
                className="text-gray-400 hover:text-gray-500 transition-colors"
                onClick={closeStatusModal}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* الحالة الجديدة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة الجديدة
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      statusModal.newStatus === "reviewed"
                        ? "bg-green-100 text-green-800"
                        : statusModal.newStatus === "auctioned"
                        ? "bg-purple-100 text-purple-800"
                        : statusModal.newStatus === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {getStatusText(statusModal.newStatus)}
                  </span>
                </div>
              </div>

              {/* سبب الرفض فقط عند الحالة rejected */}
              {statusModal.newStatus === "rejected" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    سبب الرفض *
                  </label>
                  <textarea
                    value={statusModal.rejectionMessage}
                    onChange={(e) =>
                      setStatusModal((prev) => ({
                        ...prev,
                        rejectionMessage: e.target.value,
                      }))
                    }
                    placeholder="يرجى إدخال سبب رفض الطلب..."
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              )}

              {/* رسالة التأكيد */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-700 text-sm">
                  هل أنت متأكد من تغيير حالة هذا الطلب إلى{" "}
                  <strong>{getStatusText(statusModal.newStatus)}</strong>؟
                </p>
              </div>
            </div>

            {/* الأزرار */}
            <div className="flex items-center justify-end space-x-3 space-x-reverse p-6 border-t border-gray-200">
              <button
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                onClick={closeStatusModal}
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleStatusUpdate}
                disabled={
                  loading ||
                  (statusModal.newStatus === "rejected" &&
                    !statusModal.rejectionMessage.trim())
                }
              >
                <FiCheck className="w-4 h-4 inline ml-1" />
                {loading ? "جاري الحفظ..." : "تأكيد التغيير"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال عرض الصور */}
      {imageModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3 space-x-reverse">
                <FiImage className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  معرض الصور
                </h3>
              </div>
              <button
                className="text-gray-400 hover:text-gray-500 transition-colors"
                onClick={closeImageModal}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imageModal.images.map((image, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`صورة ${index + 1}`}
                      className="w-full h-auto object-contain max-h-96"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="hidden w-full h-64 flex-col items-center justify-center bg-gray-200 text-gray-500">
                      <FiImage className="w-12 h-12 mb-2" />
                      <span>تعذر تحميل الصورة</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingRequests;
