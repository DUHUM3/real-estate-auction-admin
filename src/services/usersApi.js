import axios from 'axios';

const API_BASE_URL = 'https://core-api-x41.shaheenplus.sa/api/admin';

// إنشاء instance من axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor لإضافة التوكن
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor للتعامل مع الأخطاء
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('usersFilters');
      localStorage.removeItem('usersCurrentPage');
      localStorage.removeItem('selectedUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =============================================
// دوال API للمستخدمين
// =============================================

export const usersApi = {
  // جلب جميع المستخدمين
  getUsers: async (filters = {}, page = 1) => {
    const params = {
      search: filters.search?.trim() || undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      user_type_id: filters.user_type_id !== 'all' ? filters.user_type_id : undefined,
      sort_field: filters.sort_field || 'created_at',
      sort_direction: filters.sort_direction || 'desc',
      page: page,
    };

    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    try {
      const response = await apiClient.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('❌ خطأ في جلب المستخدمين:', error);
      throw new Error(error.response?.data?.message || 'فشل في جلب المستخدمين');
    }
  },

  // قبول المستخدم
  approveUser: async (userId) => {
    try {
      const response = await apiClient.post(`/users/${userId}/approve`);
      return response.data;
    } catch (error) {
      console.error('❌ خطأ في قبول المستخدم:', error);
      throw new Error(error.response?.data?.message || 'فشل في قبول المستخدم');
    }
  },

  // رفض المستخدم
  rejectUser: async (userId, adminMessage) => {
    try {
      const response = await apiClient.post(`/users/${userId}/reject`, {
        admin_message: adminMessage,
      });
      return response.data;
    } catch (error) {
      console.error('❌ خطأ في رفض المستخدم:', error);
      throw new Error(error.response?.data?.message || 'فشل في رفض المستخدم');
    }
  },

  // جلب أنواع المستخدمين
  getUserTypes: async () => {
    try {
      const response = await apiClient.get('/user-types');
      return response.data;
    } catch (error) {
      console.error('❌ خطأ في جلب أنواع المستخدمين:', error);
      return [];
    }
  },

  // جلب إحصائيات المستخدمين
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/users/statistics');
      return response.data;
    } catch (error) {
      console.error('❌ خطأ في جلب الإحصائيات:', error);
      return null;
    }
  },
};

// =============================================
// دوال المساعدة
// =============================================

export const usersUtils = {
  // تنسيق التاريخ
  formatDate: (dateString) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // نص حالة المستخدم
  getUserStatusText: (status) => {
    const statusMap = {
      pending: 'قيد المراجعة',
      approved: 'مقبول',
      rejected: 'مرفوض',
    };
    return statusMap[status] || status;
  },

  // لون حالة المستخدم
  getUserStatusColor: (status) => {
    const colorMap = {
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      approved: 'text-green-600 bg-green-50 border-green-200',
      rejected: 'text-red-600 bg-red-50 border-red-200',
    };
    return colorMap[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  },

  // badge حالة المستخدم
  getStatusBadge: (status) => {
    const badgeMap = {
      pending: (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          قيد المراجعة
        </span>
      ),
      approved: (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          مقبول
        </span>
      ),
      rejected: (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          مرفوض
        </span>
      ),
    };
    return badgeMap[status] || (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        {status}
      </span>
    );
  },

  // اسم نوع المستخدم
  getUserTypeName: (user) => {
    const typeMap = {
      1: 'مستخدم عام',
      2: 'مالك أرض',
      3: 'وكيل شرعي',
      4: 'جهة تجارية',
      5: 'وسيط عقاري',
      6: 'شركة مزادات',
    };
    
    if (user.user_type?.type_name) {
      return user.user_type.type_name;
    }
    
    return typeMap[user.user_type_id] || `نوع ${user.user_type_id}`;
  },

  // استخراج بيانات الفلاتر
  extractFiltersData: (users) => {
    const types = [...new Set(users.map(user => user.user_type_id).filter(Boolean))];
    
    return {
      types,
      statuses: [
        { value: 'pending', label: 'قيد المراجعة' },
        { value: 'approved', label: 'مقبول' },
        { value: 'rejected', label: 'مرفوض' },
      ],
      sortOptions: [
        { value: 'created_at', label: 'تاريخ التسجيل' },
        { value: 'full_name', label: 'الاسم' },
        { value: 'email', label: 'البريد الإلكتروني' },
      ],
      sortDirections: [
        { value: 'desc', label: 'تنازلي' },
        { value: 'asc', label: 'تصاعدي' },
      ],
    };
  },

  // بناء query string
  buildQueryString: (filters, page = 1) => {
    const params = new URLSearchParams();

    if (filters.search?.trim()) params.append('search', filters.search.trim());
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.user_type_id !== 'all') params.append('user_type_id', filters.user_type_id);
    if (filters.sort_field) params.append('sort_field', filters.sort_field);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);
    params.append('page', page);

    return params.toString();
  },

  // فلاتر افتراضية
  getDefaultFilters: () => ({
    search: '',
    status: 'all',
    user_type_id: 'all',
    sort_field: 'created_at',
    sort_direction: 'desc',
  }),
};