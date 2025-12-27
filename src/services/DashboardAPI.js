// dashboardAPI.js

// API base URL
const API_BASE_URL = 'https://core-api-x41.shaheenplus.sa';

// دوال مساعدة
const getAuthToken = () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new Error('لم يتم العثور على رمز الدخول');
  }
  return token;
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem('access_token');
    throw new Error('انتهت جلسة الدخول أو التوكن غير صالح');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`فشل في العملية: ${errorText}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'خطأ غير معروف');
  }
  
  return result;
};

// ===========================================================================
// دوال API للداشبورد
// ===========================================================================

/**
 * جلب إحصائيات الداشبورد
 * @returns {Promise} إحصائيات الداشبورد
 */
export const fetchDashboardStatistics = async () => {
  try {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/statistics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse(response);
    
    return {
      data: result.data,
      success: true
    };
  } catch (error) {
    console.error('خطأ في جلب إحصائيات الداشبورد:', error);
    throw error;
  }
};

/**
 * تنسيق الأرقام باللغة العربية
 * @param {number} num - الرقم
 * @returns {string} الرقم المنسق
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('ar-SA').format(num);
};

/**
 * حساب نسبة النمو
 * @param {number} current - القيمة الحالية
 * @param {number} previous - القيمة السابقة
 * @returns {number} نسبة النمو
 */
export const calculateGrowth = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * التحقق من أن البيانات قديمة
 * @param {Date} lastUpdated - تاريخ آخر تحديث
 * @param {number} minutesThreshold - الحد الأقصى بالدقائق
 * @returns {boolean} هل البيانات قديمة؟
 */
export const isDataStale = (lastUpdated, minutesThreshold = 5) => {
  if (!lastUpdated) return true;
  const now = new Date();
  const lastUpdate = new Date(lastUpdated);
  const diffInMinutes = (now - lastUpdate) / (1000 * 60);
  return diffInMinutes > minutesThreshold;
};

/**
 * إعدادات الألوان للرسوم البيانية
 */
export const chartColors = {
  blue: {
    primary: '#3b82f6',
    gradient: ['#3b82f6', '#8b5cf6'],
    light: '#dbeafe'
  },
  purple: {
    primary: '#8b5cf6',
    gradient: ['#8b5cf6', '#ec4899'],
    light: '#f3e8ff'
  },
  pink: {
    primary: '#ec4899',
    gradient: ['#ec4899', '#f59e0b'],
    light: '#fce7f3'
  },
  orange: {
    primary: '#f59e0b',
    gradient: ['#f59e0b', '#10b981'],
    light: '#fef3c7'
  },
  green: {
    primary: '#10b981',
    gradient: ['#10b981', '#06b6d4'],
    light: '#d1fae5'
  },
  cyan: {
    primary: '#06b6d4',
    gradient: ['#06b6d4', '#f43f5e'],
    light: '#cffafe'
  },
  red: {
    primary: '#f43f5e',
    gradient: ['#f43f5e', '#3b82f6'],
    light: '#ffe4e6'
  }
};

/**
 * إعدادات الأيقونات حسب النوع
 */
export const iconConfig = {
  users: {
    icon: 'FiUsers',
    color: 'blue',
    title: 'المستخدمين'
  },
  auctions: {
    icon: 'FiCalendar',
    color: 'purple',
    title: 'المزادات'
  },
  interests: {
    icon: 'FiHeart',
    color: 'pink',
    title: 'الاهتمامات'
  },
  properties: {
    icon: 'FiHome',
    color: 'orange',
    title: 'العقارات'
  },
  revenue: {
    icon: 'FiDollarSign',
    color: 'green',
    title: 'الإيرادات'
  },
  performance: {
    icon: 'FiActivity',
    color: 'cyan',
    title: 'الأداء'
  }
};