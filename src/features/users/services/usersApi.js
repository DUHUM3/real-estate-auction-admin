// services/usersApi.js
// مسؤول عن: جميع طلبات API المتعلقة بالمستخدمين

import { API_BASE_URL } from '../constants/usersConstants';

// دالة مساعدة للحصول على التوكن
const getAuthToken = () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('لم يتم العثور على رمز الدخول');
  }
  return token;
};

// دالة مساعدة للتعامل مع الأخطاء
const handleApiError = async (response, navigate) => {
  if (response.status === 401) {
    localStorage.removeItem('access_token');
    navigate('/login');
    throw new Error('انتهت جلسة الدخول أو التوكن غير صالح');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'حدث خطأ في الطلب');
  }
};

// جلب قائمة المستخدمين
export const fetchUsers = async (queryString, navigate) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}/api/admin/users?${queryString}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  await handleApiError(response, navigate);
  return await response.json();
};

// قبول مستخدم
export const approveUser = async (userId, navigate) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}/api/admin/users/${userId}/approve`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  await handleApiError(response, navigate);
  return await response.json();
};

// رفض مستخدم
export const rejectUser = async (userId, adminMessage, navigate) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}/api/admin/users/${userId}/reject`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ admin_message: adminMessage }),
  });

  await handleApiError(response, navigate);
  return await response.json();
};