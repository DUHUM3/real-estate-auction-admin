import { useState, useEffect } from "react";
import { saudiRegions } from "../../../constants/saudiRegions";

/**
 * Custom hook to manage report filters state and logic
 */
export const useReportFilters = () => {
  const [filters, setFilters] = useState({
    type: "users",
    period: "daily",
    status: "all",
    search: "",
    region: "",
    city: "",
  });
  const [availableCities, setAvailableCities] = useState([]);

  useEffect(() => {
    if (filters.region) {
      const selectedRegion = saudiRegions.find((r) => r.name === filters.region);
      setAvailableCities(selectedRegion ? selectedRegion.cities : []);
      setFilters((prev) => ({ ...prev, city: "" }));
    } else {
      setAvailableCities([]);
      setFilters((prev) => ({ ...prev, city: "" }));
    }
  }, [filters.region]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: "users",
      period: "daily",
      status: "all",
      search: "",
      region: "",
      city: "",
    });
    setAvailableCities([]);
  };

  const hasActiveFilters =
    filters.status !== "all" || filters.search || filters.region || filters.city;

  return {
    filters,
    availableCities,
    handleFilterChange,
    clearFilters,
    hasActiveFilters,
  };
};