import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_FILTERS } from '../constants/contactsConstants';

export const useContactFilters = (onFiltersChange) => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Reset filters to default
  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Apply filters manually
  const handleApplyFilters = useCallback(() => {
    onFiltersChange(filters, 1);
  }, [filters, onFiltersChange]);

  // Debounce search and status changes
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      onFiltersChange(filters, 1);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [filters.search, filters.status]);

  // Trigger fetch when other filters change (non-debounced)
  useEffect(() => {
    if (filters.search === "" && filters.status === "") {
      onFiltersChange(filters, 1);
    }
  }, [
    filters.start_date,
    filters.end_date,
    filters.sort_by,
    filters.sort_order,
    filters.per_page,
  ]);

  return {
    filters,
    handleFilterChange,
    handleResetFilters,
    handleApplyFilters,
  };
};