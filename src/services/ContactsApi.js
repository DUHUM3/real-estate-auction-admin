// contactsAPI.js
const API_BASE_URL = "https://core-api-x41.shaheenplus.sa";

// دوال مساعدة
const getAuthToken = () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("لم يتم العثور على رمز الدخول");
  }
  return token;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`فشل في العملية: ${errorText}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || "خطأ غير معروف");
  }
  
  return result;
};

const buildQueryParams = (filters, page = 1) => {
  const params = new URLSearchParams();

  if (filters.search) params.append("search", filters.search);
  if (filters.status) params.append("status", filters.status);
  if (filters.start_date) params.append("start_date", filters.start_date);
  if (filters.end_date) params.append("end_date", filters.end_date);
  if (filters.sort_by) params.append("sort_by", filters.sort_by);
  if (filters.sort_order) params.append("sort_order", filters.sort_order);
  if (filters.per_page) params.append("per_page", filters.per_page);
  params.append("page", page);

  return params.toString();
};

// ===========================================================================
// دوال API لجهات الاتصال
// ===========================================================================

/**
 * جلب قائمة جهات الاتصال مع الفلاتر
 * @param {Object} filters - فلاتر البحث
 * @param {number} page - رقم الصفحة
 * @returns {Promise} بيانات جهات الاتصال
 */
export const fetchContacts = async (filters = {}, page = 1) => {
  try {
    const token = getAuthToken();
    const queryParams = buildQueryParams(filters, page);

    const response = await fetch(
      `${API_BASE_URL}/api/admin/contacts?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await handleResponse(response);
    
    return {
      data: result.data,
      meta: result.meta,
      success: true
    };
  } catch (error) {
    console.error("خطأ في جلب جهات الاتصال:", error);
    throw error;
  }
};

/**
 * جلب تفاصيل جهة اتصال محددة
 * @param {number} id - معرف جهة الاتصال
 * @returns {Promise} تفاصيل جهة الاتصال
 */
export const fetchContactDetails = async (id) => {
  try {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/admin/contacts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await handleResponse(response);
    
    return {
      data: result.data,
      success: true
    };
  } catch (error) {
    console.error("خطأ في جلب تفاصيل جهة الاتصال:", error);
    throw error;
  }
};

/**
 * حذف جهة اتصال
 * @param {number} id - معرف جهة الاتصال
 * @returns {Promise} نتيجة الحذف
 */
export const deleteContact = async (id) => {
  try {
    const token = getAuthToken();

    const response = await fetch(
      `${API_BASE_URL}/api/admin/contacts/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await handleResponse(response);
    
    return {
      success: true,
      message: result.message || "تم الحذف بنجاح"
    };
  } catch (error) {
    console.error("خطأ في حذف جهة الاتصال:", error);
    throw error;
  }
};

/**
 * تحديث حالة جهة الاتصال إلى "تم التواصل"
 * @param {number} id - معرف جهة الاتصال
 * @returns {Promise} نتيجة التحديث
 */
export const markAsContacted = async (id) => {
  try {
    const token = getAuthToken();

    const response = await fetch(
      `${API_BASE_URL}/api/admin/${id}/mark-contacted`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await handleResponse(response);
    
    return {
      success: true,
      message: result.message || "تم تحديث الحالة بنجاح"
    };
  } catch (error) {
    console.error("خطأ في تحديث حالة جهة الاتصال:", error);
    throw error;
  }
};

/**
 * تنزيل ملف مرفق
 * @param {string} filePath - مسار الملف
 * @returns {string} رابط التنزيل
 */
export const getAttachmentUrl = (filePath) => {
  if (!filePath) return null;
  return `${API_BASE_URL}/storage/${filePath}`;
};

/**
 * تنسيق التاريخ للعرض
 * @param {string} dateString - تاريخ كسلسلة نصية
 * @returns {string} تاريخ منسق
 */
export const formatDate = (dateString) => {
  if (!dateString) return "غير محدد";
  
  return new Date(dateString).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * قص النص لعرض معاينة
 * @param {string} text - النص الأصلي
 * @param {number} maxLength - الطول الأقصى
 * @returns {string} النص المقتطع
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * إعدادات الحالة للأزرار والعلامات
 * @param {string} status - حالة جهة الاتصال
 * @returns {Object} إعدادات الحالة
 */
export const getStatusConfig = (status) => {
  const statusConfig = {
    مقروءة: { 
      color: "bg-green-100 text-green-800", 
      label: "مقروءة",
      badgeColor: "bg-green-100 text-green-800"
    },
    "غير مقروءة": {
      color: "bg-yellow-100 text-yellow-800",
      label: "غير مقروءة",
      badgeColor: "bg-yellow-100 text-yellow-800"
    },
    "تم التواصل": { 
      color: "bg-blue-100 text-blue-800", 
      label: "تم التواصل",
      badgeColor: "bg-blue-100 text-blue-800"
    },
  };

  return statusConfig[status] || statusConfig["غير مقروءة"];
};