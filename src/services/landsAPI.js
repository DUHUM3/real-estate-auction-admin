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
    const savedFilters = localStorage.getItem("landsFilters");
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return {
      search: "",
      status: "all",
      region: "all",
      city: "all",
      land_type: "all",
      purpose: "all",
      user_type_id: "all",
      min_area: "",
      max_area: "",
      sort_field: "created_at",
      sort_direction: "desc",
    };
  },

  saveFilters: (filters) => {
    localStorage.setItem("landsFilters", JSON.stringify(filters));
  },

  clearFilters: () => {
    localStorage.removeItem("landsFilters");
    return {
      search: "",
      status: "all",
      region: "all",
      city: "all",
      land_type: "all",
      purpose: "all",
      user_type_id: "all",
      min_area: "",
      max_area: "",
      sort_field: "created_at",
      sort_direction: "desc",
    };
  },

  buildQueryString: (filters, currentPage) => {
    const params = new URLSearchParams();

    if (filters.search.trim()) params.append("search", filters.search.trim());
    if (filters.status !== "all") params.append("status", filters.status);
    if (filters.region !== "all") params.append("region", filters.region);
    if (filters.city !== "all") params.append("city", filters.city);
    if (filters.land_type !== "all")
      params.append("land_type", filters.land_type);
    if (filters.purpose !== "all") params.append("purpose", filters.purpose);
    if (filters.user_type_id !== "all")
      params.append("user_type_id", filters.user_type_id);
    if (filters.min_area) params.append("min_area", filters.min_area);
    if (filters.max_area) params.append("max_area", filters.max_area);
    if (filters.sort_field) params.append("sort_field", filters.sort_field);
    if (filters.sort_direction)
      params.append("sort_direction", filters.sort_direction);

    params.append("page", currentPage);

    return params.toString();
  },
};

// =============================================
// 3. دوال جلب البيانات من API
// =============================================

export const fetchLands = async (filters, currentPage, navigate) => {
  const token = checkAuthAndRedirect(navigate);
  
  const queryString = filtersManager.buildQueryString(filters, currentPage);
  const url = `${API_BASE_URL}/properties?${queryString}`;

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
    throw new Error(`فشل في جلب الأراضي: ${errorText}`);
  }

  const result = await response.json();
  return result;
};

export const updateLandStatus = async (landId, status, rejection_reason = null) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error("لم يتم العثور على رمز الدخول");
  }

  const requestBody =
    status === "مرفوض"
      ? {
          status,
          rejection_reason: rejection_reason || "سبب الرفض غير محدد",
        }
      : { status };

  console.log("إرسال طلب تحديث الحالة:", { landId, requestBody });

  const response = await fetch(
    `${API_BASE_URL}/properties/${landId}/status`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }
  );

  let result;
  try {
    result = await response.json();
  } catch (jsonError) {
    console.error("خطأ في تحليل JSON:", jsonError);
    throw new Error("استجابة غير صالحة من الخادم");
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || `فشل في تحديث الحالة: ${response.status}`
    );
  }

  return result;
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
  switch (status) {
    case "مفتوح":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
          مفتوح
        </span>
      );
    case "مرفوض":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
          مرفوض
        </span>
      );
    case "تم البيع":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200">
          تم البيع
        </span>
      );
    case "قيد المراجعة":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
          قيد المراجعة
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
          {status}
        </span>
      );
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case "مفتوح":
      return "مفتوح";
    case "مرفوض":
      return "مرفوض";
    case "تم البيع":
      return "تم البيع";
    case "قيد المراجعة":
      return "قيد المراجعة";
    default:
      return status;
    }
};

export const getLandTypeBadge = (landType) => {
  switch (landType) {
    case "سكني":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200">
          سكني
        </span>
      );
    case "تجاري":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
          تجاري
        </span>
      );
    case "زراعي":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          زراعي
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
          {landType}
        </span>
      );
  }
};

export const getPurposeBadge = (purpose) => {
  switch (purpose) {
    case "بيع":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          بيع
        </span>
      );
    case "استثمار":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
          استثمار
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
          {purpose}
        </span>
      );
  }
};

// خريطة أنواع المستخدمين بالعربي
export const userTypeMap = {
  1: "مستخدم عام",
  2: "مالك أرض",
  3: "وكيل قانوني",
  4: "كيان تجاري",
  5: "وسيط عقاري",
  6: "شركة مزاد",
};

// دالة لبناء رابط الصورة
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  return `https://core-api-x41.shaheenplus.sa/storage/${imagePath}`;
};

// دوال نسخ النص
export const copyText = async (text, setCopyStatus, fieldName) => {
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

// دالة لفتح الصورة في نافذة جديدة
export const openImageInNewWindow = (imagePath) => {
  const url = getImageUrl(imagePath);
  window.open(url, '_blank');
};