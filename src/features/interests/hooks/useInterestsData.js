// Hook for fetching interests data with react-query
import { useQuery } from "react-query";
import { useState } from "react";
import { useInterestsAPI } from "../../../services/interestsAPI";
import { STALE_TIME } from "../constants/interestsConstants";

export const useInterestsData = (filters, currentPage) => {
  const { fetchInterests } = useInterestsAPI();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: interestsData,
    isLoading,
    error,
    refetch,
  } = useQuery(["interests", filters, currentPage], fetchInterests, {
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error("خطأ في جلب طلبات الاهتمام:", error);
      alert("حدث خطأ أثناء جلب البيانات: " + error.message);
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("خطأ في التحديث:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const interests = interestsData?.data || [];
  const pagination = interestsData?.pagination || {
    current_page: currentPage,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  };

  return {
    interests,
    pagination,
    interestsData,
    isLoading,
    error,
    refetch,
    isRefreshing,
    handleRefresh,
  };
};