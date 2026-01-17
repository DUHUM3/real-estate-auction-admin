// hooks/useUsersFilters.jsx
// مسؤول عن: إدارة الفلاتر والتخزين المحلي

import { useState, useEffect } from 'react';
import { DEFAULT_FILTERS } from '../constants/usersConstants';

const STORAGE_KEYS = {
  FILTERS: 'usersFilters',
  PAGE: 'usersCurrentPage',
  SELECTED_USER: 'selectedUser',
};

export const useUsersFilters = () => {
  // استرجاع الفلاتر المحفوظة
  const getInitialFilters = () => {
    const savedFilters = localStorage.getItem(STORAGE_KEYS.FILTERS);
    return savedFilters ? JSON.parse(savedFilters) : DEFAULT_FILTERS;
  };

  const getInitialPage = () => {
    const savedPage = localStorage.getItem(STORAGE_KEYS.PAGE);
    return savedPage ? parseInt(savedPage) : 1;
  };

  const [filters, setFilters] = useState(getInitialFilters());
  const [currentPage, setCurrentPage] = useState(getInitialPage());
  const [selectedUser, setSelectedUser] = useState(null);

  // حفظ الفلاتر عند التغيير
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
  }, [filters]);

  // حفظ الصفحة الحالية
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAGE, currentPage.toString());
  }, [currentPage]);

  // استرجاع المستخدم المحدد
  useEffect(() => {
    const savedSelectedUser = localStorage.getItem(STORAGE_KEYS.SELECTED_USER);
    if (savedSelectedUser) {
      setSelectedUser(JSON.parse(savedSelectedUser));
    }
  }, []);

  // حفظ المستخدم المحدد
  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_USER, JSON.stringify(selectedUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_USER);
    }
  }, [selectedUser]);

  // تحديث فلتر معين
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key !== 'page' && currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // مسح جميع الفلاتر
  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  // بناء query string للـ API
  const buildQueryString = () => {
    const params = new URLSearchParams();

    if (filters.search.trim()) params.append('search', filters.search.trim());
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.user_type_id !== 'all') params.append('user_type_id', filters.user_type_id);
    if (filters.sort_field) params.append('sort_field', filters.sort_field);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);
    params.append('page', currentPage);

    return params.toString();
  };

  // التحقق من وجود فلاتر نشطة
  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.user_type_id !== 'all';

  return {
    filters,
    currentPage,
    selectedUser,
    updateFilter,
    setCurrentPage,
    setSelectedUser,
    clearFilters,
    buildQueryString,
    hasActiveFilters,
  };
};