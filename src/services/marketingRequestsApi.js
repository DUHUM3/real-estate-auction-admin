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
    const savedFilters = localStorage.getItem("marketingRequestsFilters");
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return {
      search: "",
      region: "all",
      city: "all",
      status: "all",
      property_role: "all",
      start_date: "",
      end_date: "",
      sort_by: "created_at",
      sort_order: "desc",
      page: 1,
      per_page: 10,
    };
  },

  saveFilters: (filters) => {
    localStorage.setItem("marketingRequestsFilters", JSON.stringify(filters));
  },

  clearFilters: () => {
    localStorage.removeItem("marketingRequestsFilters");
    return {
      search: "",
      region: "all",
      city: "all",
      status: "all",
      property_role: "all",
      start_date: "",
      end_date: "",
      sort_by: "created_at",
      sort_order: "desc",
      page: 1,
      per_page: 10,
    };
  },

  buildQueryString: (filters) => {
    const params = new URLSearchParams();

    if (filters.status && filters.status !== "all")
      params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    if (filters.region && filters.region !== "all")
      params.append("region", filters.region);
    if (filters.city && filters.city !== "all")
      params.append("city", filters.city);
    if (filters.property_role && filters.property_role !== "all")
      params.append("property_role", filters.property_role);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.sort_by) params.append("sort_by", filters.sort_by);
    if (filters.sort_order) params.append("sort_order", filters.sort_order);

    params.append("page", filters.page || 1);
    params.append("per_page", filters.per_page || 10);

    return params.toString();
  },
};

// =============================================
// 3. دوال جلب البيانات من API
// =============================================

export const fetchMarketingRequests = async (filters, navigate) => {
  const token = checkAuthAndRedirect(navigate);
  
  const queryString = filtersManager.buildQueryString(filters);
  const url = `${API_BASE_URL}/auction-requests?${queryString}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      navigate("/login");
      throw new Error("انتهت جلسة الدخول أو التوكن غير صالح");
    }

    const errorText = await response.text();
    throw new Error(`فشل في جلب طلبات التسويق: ${errorText}`);
  }

  const result = await response.json();

  if (!result.auction_requests) {
    throw new Error(result.message || "هيكل البيانات غير متوقع");
  }

  return {
    data: result.auction_requests,
    pagination: result.pagination,
    filtersData: result.filters_data,
  };
};

export const updateRequestStatus = async (requestId, status, message = null) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error("لم يتم العثور على رمز الدخول");
  }

  const requestBody = { status };
  if (status === "rejected" && message) {
    requestBody.message = message;
  }

  const response = await fetch(
    `${API_BASE_URL}/auction-requests/${requestId}/status`,
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

export const getPropertyRoleText = (role) => {
  switch (role) {
    case "owner":
      return "مالك";
    case "legal_agent":
      return "وكيل شرعي";
    default:
      return role;
  }
};

export const getStatusText = (status) => {
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

export const getStatusColor = (status) => {
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

export const getStatusBadge = (status) => {
  const statusText = getStatusText(status);
  
  switch (status) {
    case "under_review":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          {statusText}
        </span>
      );
    case "reviewed":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {statusText}
        </span>
      );
    case "auctioned":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
          {statusText}
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          {statusText}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          {statusText}
        </span>
      );
  }
};