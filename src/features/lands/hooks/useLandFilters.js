/**
 * Custom hook for managing land filters state
 * Handles filter changes, localStorage persistence, and reset
 */

import { useState, useEffect } from "react";
import { filtersManager } from "../../../services/landsAPI";

export const useLandFilters = () => {
  const [filters, setFilters] = useState(filtersManager.getInitialFilters());
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("landsCurrentPage");
    return savedPage ? parseInt(savedPage) : 1;
  });

  // Save filters to localStorage when they change
  useEffect(() => {
    filtersManager.saveFilters(filters);
  }, [filters]);

  // Save current page to localStorage
  useEffect(() => {
    localStorage.setItem("landsCurrentPage", currentPage.toString());
  }, [currentPage]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    if (key !== "page" && currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const clearFilters = () => {
    const defaultFilters = filtersManager.clearFilters();
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.region !== "all" ||
    filters.city !== "all" ||
    filters.land_type !== "all" ||
    filters.purpose !== "all" ||
    filters.user_type_id !== "all" ||
    filters.min_area ||
    filters.max_area;

  return {
    filters,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearFilters,
    hasActiveFilters,
  };
};