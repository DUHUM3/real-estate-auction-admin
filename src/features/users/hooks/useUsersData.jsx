// hooks/useUsersData.jsx
// مسؤول عن: جلب وإدارة بيانات المستخدمين من API

import { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { fetchUsers } from '../services/usersApi';

export const useUsersData = (filters, currentPage, buildQueryString) => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['users', filters, currentPage],
    () => fetchUsers(buildQueryString(), navigate),
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('خطأ في جلب المستخدمين:', error);
        alert('حدث خطأ أثناء جلب البيانات: ' + error.message);
      },
    }
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('خطأ في التحديث:', error);
      alert('حدث خطأ أثناء تحديث البيانات: ' + error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    usersData,
    isLoading,
    error,
    refetch,
    isRefreshing,
    handleRefresh,
  };
};