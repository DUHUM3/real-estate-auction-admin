// hooks/useMarketingRequests.jsx
// Custom hook for fetching marketing requests data
// Handles React Query integration with proper caching strategy

import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { fetchMarketingRequests } from "../../../services/marketingRequestsApi";

export const useMarketingRequests = (filters, refreshKey) => {
  const navigate = useNavigate();

  const {
    data: marketingRequestsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ["marketingRequests", filters, refreshKey],
    () => fetchMarketingRequests(filters, navigate),
    {
      staleTime: 0,
      cacheTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: "always",
    }
  );

  return {
    marketingRequestsData,
    isLoading,
    error,
    refetch,
  };
};
