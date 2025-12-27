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
  },

  saveFilters: (filters) => {
    localStorage.setItem("interestsFilters", JSON.stringify(filters));
  },

  clearFilters: () => {
    localStorage.removeItem("interestsFilters");
    return {
      search: "",
      status: "all",
      property_id: "all",
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
    if (filters.property_id !== "all")
      params.append("property_id", filters.property_id);
    if (filters.date_from) params.append("date_from", filters.date_from);
    if (filters.date_to) params.append("date_to", filters.date_to);
    if (filters.sort_by) params.append("sort_by", filters.sort_by);
    if (filters.sort_order) params.append("sort_order", filters.sort_order);

    params.append("page", currentPage);
    params.append("per_page", 10);

    return params.toString();
  },
};

// =============================================
// 3. دوال جلب البيانات من API
// =============================================

export const fetchInterests = async (filters, currentPage, navigate) => {
  const token = checkAuthAndRedirect(navigate);
  
  const queryString = filtersManager.buildQueryString(filters, currentPage);
  const url = `${API_BASE_URL}/interests?${queryString}`;

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

export const fetchPropertyDetails = async (propertyId, navigate) => {
  const token = checkAuthAndRedirect(navigate);

  const response = await fetch(
    `${API_BASE_URL}/properties/${propertyId}`,
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
    throw new Error(`فشل في جلب تفاصيل الأرض: ${errorText}`);
  }

  const result = await response.json();

  if (result.success && result.data) {
    return result.data;
  } else {
    throw new Error(result.message || "هيكل البيانات غير متوقع");
  }
};

export const updateInterestStatus = async (interestId, status, adminNote = null) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error("لم يتم العثور على رمز الدخول");
  }

  const response = await fetch(
    `${API_BASE_URL}/interests/${interestId}/status`,
    {
      method: "PUT",
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
    throw new Error(errorData.message || "فشل في تحديث حالة الاهتمام");
  }

  return await response.json();
};

// =============================================
// 4. دوال المساعدة العامة
// =============================================

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  return `https://core-api-x41.shaheenplus.sa/storage/${imagePath}`;
};

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

export const getStatusText = (status) => {
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

export const getStatusBadge = (status) => {
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

export const getStatusColor = (status) => {
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

export const getStatusMessagePlaceholder = (status) => {
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