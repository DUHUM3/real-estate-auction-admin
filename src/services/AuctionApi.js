import { useQueryClient, useQuery, useMutation } from "react-query";

const API_BASE_URL = "https://core-api-x41.shaheenplus.sa/api/admin";

// وظيفة للحصول على التوكن
const getAuthToken = () => {
  return localStorage.getItem("access_token");
};

// وظيفة للتعامل مع الأخطاء العامة
const handleApiError = (response, errorMessage) => {
  if (response.status === 401) {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
    throw new Error("انتهت جلسة الدخول أو التوكن غير صالح");
  }

  if (!response.ok) {
    throw new Error(`${errorMessage}: ${response.statusText}`);
  }

  return response.json();
};

// تصدير الدوال API
export const auctionApi = {
  // جلب قائمة المزادات
  fetchAuctions: async (filters = {}, currentPage = 1) => {
    const token = getAuthToken();
    if (!token) {
      window.location.href = "/login";
      throw new Error("لم يتم العثور على رمز الدخول");
    }

    const params = new URLSearchParams();

    // إضافة الفلاتر
    if (filters.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }
    if (filters.status && filters.status !== "all") {
      params.append("status", filters.status);
    }
    if (filters.region && filters.region !== "all") {
      params.append("region", filters.region);
    }
    if (filters.city && filters.city !== "all") {
      params.append("city", filters.city);
    }
    if (filters.date) {
      params.append("date", filters.date);
    }
    if (filters.sort_field) {
      params.append("sort_field", filters.sort_field);
    }
    if (filters.sort_direction) {
      params.append("sort_direction", filters.sort_direction);
    }

    params.append("page", currentPage);
    params.append("per_page", filters.per_page || 10);

    const url = `${API_BASE_URL}/auctions?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await handleApiError(response, "فشل في جلب المزادات");

    if (result.success) {
      return {
        data: result.data || [],
        pagination: result.pagination || {
          current_page: currentPage,
          last_page: 1,
          per_page: 10,
          total: result.data?.length || 0,
          from: 1,
          to: result.data?.length || 0,
        },
      };
    } else {
      throw new Error(result.message || "فشل في جلب البيانات");
    }
  },

  // قبول المزاد
  approveAuction: async (auctionId) => {
    const token = getAuthToken();
    if (!token) throw new Error("لم يتم العثور على رمز الدخول");

    const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/approve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await handleApiError(response, "فشل في قبول المزاد");

    if (!result.success) {
      throw new Error(result.message || "فشل في قبول المزاد");
    }

    return result;
  },

  // رفض المزاد
  rejectAuction: async (auctionId, reason) => {
    const token = getAuthToken();
    if (!token) throw new Error("لم يتم العثور على رمز الدخول");

    const response = await fetch(`${API_BASE_URL}/auctions/${auctionId}/reject`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: reason || "سبب الرفض غير محدد",
      }),
    });

    const result = await handleApiError(response, "فشل في رفض المزاد");

    if (!result.success) {
      throw new Error(result.message || "فشل في رفض المزاد");
    }

    return result;
  },
};

// Custom Hooks لاستخدام API مع React Query
export const useAuctionQueries = () => {
  const queryClient = useQueryClient();

  // Hook لجلب المزادات
  const useFetchAuctions = (filters, currentPage) => {
    return useQuery(
      ["auctions", filters, currentPage],
      () => auctionApi.fetchAuctions(filters, currentPage),
      {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        onError: (error) => {
          console.error("خطأ في جلب المزادات:", error);
        },
      }
    );
  };

  // Hook لقبول المزاد
  const useApproveAuction = () => {
    return useMutation(
      (auctionId) => auctionApi.approveAuction(auctionId),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["auctions"]);
        },
      }
    );
  };

  // Hook لرفض المزاد
  const useRejectAuction = () => {
    return useMutation(
      ({ auctionId, reason }) => auctionApi.rejectAuction(auctionId, reason),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["auctions"]);
        },
      }
    );
  };

  return {
    useFetchAuctions,
    useApproveAuction,
    useRejectAuction,
  };
};