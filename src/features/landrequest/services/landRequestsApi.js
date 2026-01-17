// services/landRequestsApi.js

const API_BASE = "https://core-api-x41.shaheenplus.sa/api/admin";

const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
});

export const landRequestsApi = {
  // Fetch land requests with filters
  fetchLandRequests: async (filters, currentPage, navigate) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      throw new Error("لم يتم العثور على رمز الدخول");
    }

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
    params.append("_t", Date.now());

    const response = await fetch(`${API_BASE}/land-requests?${params}`, {
      headers: getAuthHeaders(token),
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
    }

    throw new Error(result.message || "هيكل البيانات غير متوقع");
  },

  // Fetch user details
  fetchUserDetails: async (userId, navigate) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      throw new Error("لم يتم العثور على رمز الدخول");
    }

    const response = await fetch(`${API_BASE}/users/${userId}?_t=${Date.now()}`, {
      headers: getAuthHeaders(token),
    });

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
    }

    throw new Error(result.message || "هيكل البيانات غير متوقع");
  },

  // Update request status
  updateRequestStatus: async (requestId, status, adminNote) => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE}/land-requests/${requestId}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        status,
        admin_note: adminNote.trim() || undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "فشل في تحديث حالة الطلب");
    }

    return response.json();
  },
};