// Hook for managing filters and pagination state with localStorage persistence
import { useState, useEffect } from "react";
import {
  DEFAULT_FILTERS,
  STORAGE_KEYS,
} from "../constants/interestsConstants";

export const useInterestsFilters = () => {
  const getInitialFilters = () => {
    const savedFilters = localStorage.getItem(STORAGE_KEYS.FILTERS);
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return DEFAULT_FILTERS;
  };

  const getInitialPage = () => {
    const savedPage = localStorage.getItem(STORAGE_KEYS.CURRENT_PAGE);
    return savedPage ? parseInt(savedPage) : 1;
  };

  const [filters, setFilters] = useState(getInitialFilters());
  const [currentPage, setCurrentPage] = useState(getInitialPage());

  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
  }, [filters]);

  // Save current page to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, currentPage.toString());
  }, [currentPage]);

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };

    setFilters(newFilters);

    // Reset to first page when filters change (except page itself)
    if (key !== "page" && currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.property_id !== "all" ||
    filters.date_from ||
    filters.date_to;

  return {
    filters,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearFilters,
    hasActiveFilters,
  };
};