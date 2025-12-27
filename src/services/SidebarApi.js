const API_BASE_URL = "https://core-api-x41.shaheenplus.sa/api";

// دالة عامة للطلبات مع التعامل مع الأخطاء
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("admin_token");
  
  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
};

// خدمات محددة
export const adminService = {
  // ملف تعريف المدير
  getProfile: async () => {
    return await fetchWithAuth("/admin/profile");
  },

  // يمكنك إضافة المزيد من دوال الـ API هنا
  // getAllUsers: async () => {
  //   return await fetchWithAuth("/admin/users");
  // },
  
  // updateUser: async (userId, data) => {
  //   return await fetchWithAuth(`/admin/users/${userId}`, {
  //     method: "PUT",
  //     body: JSON.stringify(data),
  //   });
  // },
};

export default {
  adminService,
};