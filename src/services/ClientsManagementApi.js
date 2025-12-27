// clientsAPI.js
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://core-api-x41.shaheenplus.sa/api/admin';

// دالة مساعدة للتحقق من التوكن والتنقل
const getAuthToken = (navigate) => {
  const token = localStorage.getItem('access_token');
  
  if (!token && navigate) {
    navigate('/login');
    throw new Error('لم يتم العثور على رمز الدخول');
  }
  
  return token;
};

// دالة مساعدة للتحقق من الاستجابة
const checkResponse = async (response, navigate) => {
  if (response.status === 401) {
    localStorage.removeItem('access_token');
    if (navigate) {
      navigate('/login');
    }
    throw new Error('انتهت جلسة الدخول أو التوكن غير صالح');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`فشل في العملية: ${errorText}`);
  }

  return response;
};

// ===========================================================================
// دوال API للعملاء
// ===========================================================================

/**
 * جلب قائمة العملاء
 * @param {Object} filters - فلاتر البحث
 * @param {Function} navigate - دالة التنقل
 * @returns {Promise} بيانات العملاء
 */
export const fetchClients = async (filters = {}, navigate) => {
  const token = getAuthToken(navigate);
  
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.sort_by) queryParams.append('sort_by', filters.sort_by);
  if (filters.sort_order) queryParams.append('sort_order', filters.sort_order);
  
  const url = `${API_BASE_URL}/clients${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  await checkResponse(response, navigate);
  const result = await response.json();
  
  if (result.success && Array.isArray(result.data)) {
    return {
      data: result.data,
      count: result.count,
      cache_info: result.cache_info
    };
  } else {
    throw new Error(result.message || 'هيكل البيانات غير متوقع');
  }
};

/**
 * إضافة عميل جديد
 * @param {Object} formData - بيانات العميل
 * @param {Function} navigate - دالة التنقل
 * @returns {Promise} نتيجة الإضافة
 */
export const addClient = async (formData, navigate) => {
  const token = getAuthToken(navigate);
  const formDataToSend = new FormData();
  
  formDataToSend.append('name', formData.name);
  if (formData.website) {
    formDataToSend.append('website', formData.website);
  }
  if (formData.logo) {
    formDataToSend.append('logo', formData.logo);
  }

  const response = await fetch(`${API_BASE_URL}/clients`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formDataToSend,
  });

  await checkResponse(response, navigate);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'فشل في إضافة العميل');
  }
  
  return result;
};

/**
 * حذف عميل
 * @param {number} clientId - معرف العميل
 * @param {Function} navigate - دالة التنقل
 * @returns {Promise} نتيجة الحذف
 */
export const deleteClient = async (clientId, navigate) => {
  const token = getAuthToken(navigate);
  
  const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  await checkResponse(response, navigate);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'فشل في حذف العميل');
  }
  
  return result;
};

/**
 * تحديث عميل
 * @param {number} clientId - معرف العميل
 * @param {Object} formData - بيانات التحديث
 * @param {Function} navigate - دالة التنقل
 * @returns {Promise} نتيجة التحديث
 */
export const updateClient = async (clientId, formData, navigate) => {
  const token = getAuthToken(navigate);
  const formDataToSend = new FormData();
  
  formDataToSend.append('name', formData.name);
  if (formData.website !== undefined) {
    formDataToSend.append('website', formData.website);
  }
  if (formData.logo) {
    formDataToSend.append('logo', formData.logo);
  }

  const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
    method: 'POST', // أو PUT حسب API
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formDataToSend,
  });

  await checkResponse(response, navigate);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'فشل في تحديث العميل');
  }
  
  return result;
};

/**
 * جلب بيانات عميل محدد
 * @param {number} clientId - معرف العميل
 * @param {Function} navigate - دالة التنقل
 * @returns {Promise} بيانات العميل
 */
export const fetchClientById = async (clientId, navigate) => {
  const token = getAuthToken(navigate);
  
  const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  await checkResponse(response, navigate);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'فشل في جلب بيانات العميل');
  }
  
  return result.data;
};

// دالة مساعدة لتنسيق التاريخ
export const formatDate = (dateString) => {
  if (!dateString) return 'غير محدد';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};