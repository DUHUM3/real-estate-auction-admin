// ملف API - يحتوي على جميع دوال التواصل مع السيرفر

const API_BASE_URL = "https://core-api-x41.shaheenplus.sa/api/admin";

// =============================================
// 1. دوال المصادقة والمساعدة
// =============================================

const getAuthToken = () => {
  return localStorage.getItem("access_token");
};

const checkAuthAndRedirect = (navigate) => {
  const token = getAuthToken();
  if (!token) {
    navigate("/login");
    throw new Error("لم يتم العثور على رمز الدخول");
  }
  return token;
};

// =============================================
// 2. دوال إدارة الفلاتر
// =============================================

export const filtersManager = {
  getInitialFilters: () => {
    const savedFilters = localStorage.getItem("landRequestsFilters");
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return {
      search: "",
      status: "all",
      region: "all",
      city: "all",
      purpose: "all",
      type: "all",
      area_min: "",
      area_max: "",
      date_from: "",
      date_to: "",
      sort_by: "created_at",
      sort_order: "desc",
    };
  },

  saveFilters: (filters) => {
    localStorage.setItem("landRequestsFilters", JSON.stringify(filters));
  },

  clearFilters: () => {
    localStorage.removeItem("landRequestsFilters");
    return {
      search: "",
      status: "all",
      region: "all",
      city: "all",
      purpose: "all",
      type: "all",
      area_min: "",
      area_max: "",
      date_from: "",
      date_to: "",
      sort_by: "created_at",
      sort_order: "desc",
    };
  },

  buildQueryString: (filters, currentPage) => {
    const params = new URLSearchParams();

    if (filters.search.trim()) params.append("search", filters.search.trim());
    if (filters.status !== "all") params.append("status", filters.status);
    if (filters.region !== "all") params.append("region", filters.region);
    if (filters.city !== "all") params.append("city", filters.city);
    if (filters.purpose !== "all") params.append("purpose", filters.purpose);
    if (filters.type !== "all") params.append("type", filters.type);
    if (filters.area_min) params.append("area_min", filters.area_min);
    if (filters.area_max) params.append("area_max", filters.area_max);
    if (filters.date_from) params.append("start_date", filters.date_from);
    if (filters.date_to) params.append("end_date", filters.date_to);
    if (filters.sort_by) params.append("sort_by", filters.sort_by);
    if (filters.sort_order) params.append("sort_order", filters.sort_order);

    params.append("page", currentPage);
    params.append("per_page", 10);
    params.append("_t", Date.now()); // منع التخزين المؤقت

    return params.toString();
  },
};

// =============================================
// 3. دوال جلب البيانات من API
// =============================================

export const fetchLandRequests = async (filters, currentPage, navigate) => {
  const token = checkAuthAndRedirect(navigate);
  
  const queryString = filtersManager.buildQueryString(filters, currentPage);
  const url = `${API_BASE_URL}/land-requests?${queryString}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0"
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("access_token");
    navigate("/login");
    throw new Error("انتهت جلسة الدخول أو التوكن غير صالح");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`فشل في جلب طلبات الأراضي: ${errorText}`);
  }

  const result = await response.json();

  if (result.success && result.data) {
    return {
      data: result.data,
      pagination: result.meta || {
        current_page: currentPage,
        last_page: 1,
        per_page: 10,
        total: result.data.length,
        from: 1,
        to: result.data.length,
      },
      filtersData: {
        regions: result.meta?.filters?.regions || [],
        cities: result.meta?.filters?.cities || [],
        purposes: ["sale", "investment"],
        types: ["residential", "commercial", "industrial", "agricultural"],
        statuses: ["open", "close", "completed", "pending"],
      },
    };
  } else {
    throw new Error(result.message || "هيكل البيانات غير متوقع");
  }
};

export const fetchUserDetails = async (userId, navigate) => {
  const token = checkAuthAndRedirect(navigate);

  const response = await fetch(
    `${API_BASE_URL}/users/${userId}?_t=${Date.now()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
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
    throw new Error(`فشل في جلب تفاصيل المستخدم: ${errorText}`);
  }

  const result = await response.json();

  if (result.success && result.data) {
    return result.data;
  } else {
    throw new Error(result.message || "هيكل البيانات غير متوقع");
  }
};

export const updateLandRequestStatus = async (requestId, status, adminNote = null) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error("لم يتم العثور على رمز الدخول");
  }

  const response = await fetch(
    `${API_BASE_URL}/land-requests/${requestId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: status,
        admin_note: adminNote?.trim() || undefined,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "فشل في تحديث حالة الطلب");
  }

  return await response.json();
};

// =============================================
// 4. دوال المساعدة العامة
// =============================================

export const formatDate = (dateString) => {
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

export const getStatusBadge = (status) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  switch (status) {
    case "open":
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          مفتوح
        </span>
      );
    case "pending":
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
          قيد المراجعة
        </span>
      );
    case "completed":
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          مكتمل
        </span>
      );
    case "close":
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800`}>مغلق</span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
          {status}
        </span>
      );
  }
};

export const getUserStatusBadge = (status) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  switch (status) {
    case "approved":
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          مقبول
        </span>
      );
    case "pending":
      return (
        <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
          قيد المراجعة
        </span>
      );
    case "close":
      return (
        <span className={`${baseClasses} bg-red-100 text-red-800`}>
          موقوف
        </span>
      );
    case "completed":
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
          مكتمل
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
          {status}
        </span>
      );
  }
};

export const getUserTypeBadge = (userType) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  switch (userType) {
    case "مالك":
      return (
        <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
          مالك
        </span>
      );
    case "وكيل شرعي":
      return (
        <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>
          وكيل شرعي
        </span>
      );
    case "شركة":
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
          شركة
        </span>
      );
    case "وسيط عقاري":
      return (
        <span className={`${baseClasses} bg-cyan-100 text-cyan-800`}>
          وسيط عقاري
        </span>
      );
    case "شركة مزاد":
      return (
        <span className={`${baseClasses} bg-pink-100 text-pink-800`}>
          شركة مزاد
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
          {userType}
        </span>
      );
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case "open":
      return "مفتوح";
    case "close":
      return "مغلق";
    case "completed":
      return "مكتمل";
    case "pending":
      return "قيد المراجعة";
    default:
      return "غير معروف";
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case "open":
      return "bg-yellow-100 text-yellow-800";
    case "close":
      return "bg-red-100 text-red-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-red-100 text-red-800";
  }
};

export const getPurposeText = (purpose) => {
  switch (purpose) {
    case "sale":
      return "بيع";
    case "investment":
      return "استثمار";
    default:
      return purpose;
  }
};

export const getTypeText = (type) => {
  switch (type) {
    case "residential":
      return "سكني";
    case "commercial":
      return "تجاري";
    case "industrial":
      return "صناعي";
    case "agricultural":
      return "زراعي";
    default:
      return type;
  }
};

export const getStatusMessagePlaceholder = (status) => {
  switch (status) {
    case "completed":
      return "اكتب رسالة للمستخدم توضح إتمام الطلب...";
    case "pending":
      return "اكتب ملاحظات حول طلب قيد المراجعة...";
    case "close":
      return "اكتب سبب إغلاق الطلب...";
    case "open":
      return "اكتب ملاحظات إضافية حول الطلب...";
    default:
      return "اكتب ملاحظات إضافية...";
  }
};

// أيقونة الهدية (FiGift) للاستخدام في مكون العرض
export const FiGift = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-2h14a2 2 0 110 2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
    />
  </svg>
);