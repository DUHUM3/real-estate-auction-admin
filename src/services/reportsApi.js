/**
 * API service for fetching reports data
 */
export const fetchReportsData = async (filters) => {
  let url = `https://core-api-x41.shaheenplus.sa/api/admin/reports?period=${filters.period}&type=${filters.type}`;

  if (filters.status && filters.status !== "all") {
    url += `&status=${filters.status}`;
  }

  if (filters.search) {
    url += `&search=${encodeURIComponent(filters.search)}`;
  }

  if (filters.type === "properties") {
    if (filters.region) {
      url += `&region=${encodeURIComponent(filters.region)}`;
    }
    if (filters.city) {
      url += `&city=${encodeURIComponent(filters.city)}`;
    }
  }

  const token = localStorage.getItem("access_token");
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("فشل في جلب البيانات");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "حدث خطأ غير معروف");
  }

  return result;
};