import { useState, useEffect } from 'react';

const getInitialFilters = () => {
  const savedFilters = localStorage.getItem('clientsFilters');
  if (savedFilters) {
    return JSON.parse(savedFilters);
  }
  return {
    search: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  };
};

export const useClientFilters = () => {
  const [filters, setFilters] = useState(getInitialFilters());

  useEffect(() => {
    localStorage.setItem('clientsFilters', JSON.stringify(filters));
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    });
  };

  const hasActiveFilters = filters.search;

  return {
    filters,
    handleFilterChange,
    clearFilters,
    hasActiveFilters
  };
};