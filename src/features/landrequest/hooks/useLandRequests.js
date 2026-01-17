// hooks/useLandRequests.js
import { useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { landRequestsApi } from "../services/landRequestsApi";

export const useLandRequests = (filters, currentPage) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const query = useQuery(
    ["landRequests", filters, currentPage],
    () => landRequestsApi.fetchLandRequests(filters, currentPage, navigate),
    {
      cacheTime: 0,
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      keepPreviousData: false,
      onError: (error) => {
        console.error("خطأ في جلب طلبات الأراضي:", error);
        alert("حدث خطأ أثناء جلب البيانات: " + error.message);
      },
    }
  );

  const refresh = async () => {
    console.log("بدء تحديث بيانات طلبات الأراضي...");
    try {
      await queryClient.invalidateQueries(["landRequests"]);
      await queryClient.refetchQueries(["landRequests"], {
        active: true,
        exact: false,
      });
      console.log("تم تحديث بيانات طلبات الأراضي بنجاح");
    } catch (error) {
      console.error("خطأ في التحديث:", error);
      alert("حدث خطأ أثناء تحديث البيانات: " + error.message);
    }
  };

  return { ...query, refresh };
};