/**
 * Custom hook for fetching lands data using React Query
 * Handles data fetching, loading states, and refetching
 */

import { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { fetchLands } from "../../../services/landsAPI";

export const useLandsData = (filters, currentPage) => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: landsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ["lands", filters, currentPage],
    () => fetchLands(filters, currentPage, navigate),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error("خطأ في جلب الأراضي:", error);
        alert("حدث خطأ أثناء جلب البيانات: " + error.message);
      },
    }
  );

  const handleRefresh = async () => {
    console.log("بدء تحديث بيانات الأراضي...");
    setIsRefreshing(true);

    try {
      await refetch();
    } catch (error) {
      console.error("خطأ في التحديث:", error);
      alert("حدث خطأ أثناء تحديث البيانات: " + error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    landsData,
    isLoading,
    error,
    refetch,
    isRefreshing,
    handleRefresh,
  };
};