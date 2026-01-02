import { useQueryClient, useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

// الدوال الخاصة بالـ API
export const useInterestsAPI = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // دالة جلب طلبات الاهتمام
  const fetchInterests = async ({ queryKey }) => {
    const [, filters, currentPage] = queryKey;
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      throw new Error("لم يتم العثور على رمز الدخول");
    }

    const queryString = buildQueryString(filters, currentPage);
    const url = `https://core-api-x41.shaheenplus.sa/api/admin/interests?${queryString}`;

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

  // دالة بناء query string
  const buildQueryString = (filters, currentPage) => {
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

  // دالة جلب تفاصيل العقار
  const fetchPropertyDetails = async (propertyId) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      throw new Error("لم يتم العثور على رمز الدخول");
    }

    const response = await fetch(
      `https://core-api-x41.shaheenplus.sa/api/admin/properties/${propertyId}`,
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

  // دالة تحديث حالة الاهتمام
  const updateInterestStatus = useMutation(
    async ({ interestId, status, adminNote }) => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `https://core-api-x41.shaheenplus.sa/api/admin/interests/${interestId}/status`,
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
        queryClient.invalidateQueries(["interests"]);
      },
    }
  );

  // دوال المساعدة
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

  return {
    fetchInterests,
    fetchPropertyDetails,
    updateInterestStatus,
    formatDate,
    getStatusBadge,
    getStatusText,
    getStatusMessagePlaceholder,
  };
};