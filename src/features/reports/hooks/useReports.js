import { useState, useEffect } from "react";
import { fetchReportsData } from "../../../services/reportsApi";

/**
 * Custom hook to fetch and manage reports data
 */
export const useReports = (filters) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  useEffect(() => {
    fetchReports();
  }, [filters.type, filters.period, filters.status, filters.region, filters.city]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchReportsData(filters);
      
      setReports(result.data || []);
      setTotalCount(result.count || 0);
      setDateRange({
        from: result.range?.from
          ? new Date(result.range.from).toLocaleDateString("ar-SA")
          : "",
        to: result.range?.to
          ? new Date(result.range.to).toLocaleDateString("ar-SA")
          : "",
      });
    } catch (err) {
      setError(err.message);
      setReports([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  return {
    reports,
    loading,
    error,
    totalCount,
    dateRange,
    refetchReports: fetchReports,
  };
};