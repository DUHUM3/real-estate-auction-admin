import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiClock, 
  FiCheck, 
  FiX, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiFileText, 
  FiHash, 
  FiGlobe, 
  FiImage, 
  FiPlus, 
  FiTrash2, 
  FiRefreshCw,
  FiFilter,
  FiSearch,
  FiSlash
} from 'react-icons/fi';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

/**
 * =============================================
 * إدارة العملاء المميزين - Clients Management
 * =============================================
 * 
 * الفهرس:
 * 1. State Management - إدارة الحالة
 * 2. API Functions - دوال API
 * 3. Event Handlers - معالجات الأحداث
 * 4. Helper Functions - دوال مساعدة
 * 5. UI Components - مكونات الواجهة
 *    - 5.1 Header Section - قسم الرأس
 *    - 5.2 Filter Section - قسم الفلاتر
 *    - 5.3 Add Client Modal - نافذة إضافة عميل
 *    - 5.4 Clients List - قائمة العملاء
 *    - 5.5 Client Details - تفاصيل العميل
 * 6. Main Component - المكون الرئيسي
 */

const ClientsManagement = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // ===========================================================================
  // 1. State Management - إدارة الحالة
  // ===========================================================================
  
  // استرجاع الفلاتر المحفوظة أو استخدام القيم الافتراضية
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
  
  const [filters, setFilters] = useState(getInitialFilters());
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    logo: null
  });

  // حفظ الفلاتر في localStorage عند تغييرها
  useEffect(() => {
    localStorage.setItem('clientsFilters', JSON.stringify(filters));
  }, [filters]);

  // ===========================================================================
  // 2. API Functions - دوال API
  // ===========================================================================
  
  // جلب بيانات العملاء
  const fetchClients = async () => {
    const token = localStorage.getItem('access_token');
      
    if (!token) {
      navigate('/login');
      throw new Error('لم يتم العثور على رمز الدخول');
    }

    const response = await fetch('https://shahin-tqay.onrender.com/api/admin/clients', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      localStorage.removeItem('access_token');
      navigate('/login');
      throw new Error('انتهت جلسة الدخول أو التوكن غير صالح');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`فشل في جلب العملاء: ${errorText}`);
    }

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

  // استخدام React Query لجلب بيانات العملاء
  const { 
    data: clientsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery(
    ['clients', filters],
    fetchClients,
    {
      staleTime: 5 * 60 * 1000, // 5 دقائق
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('خطأ في جلب العملاء:', error);
        alert('حدث خطأ أثناء جلب البيانات: ' + error.message);
      }
    }
  );

  // استخدام useMutation لإضافة عميل جديد
  const addClientMutation = useMutation(
    async (formData) => {
      const token = localStorage.getItem('access_token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      if (formData.website) {
        formDataToSend.append('website', formData.website);
      }
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }

      const response = await fetch('https://shahin-tqay.onrender.com/api/admin/clients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في إضافة العميل');
      }

      return await response.json();
    },
    {
      onSuccess: () => {
        alert('تم إضافة العميل بنجاح');
        setFormData({ name: '', website: '', logo: null });
        setShowAddForm(false);
        refetch();
        queryClient.invalidateQueries(['clients']);
      },
      onError: (error) => {
        alert(error.message);
      }
    }
  );

  // استخدام useMutation لحذف عميل
  const deleteClientMutation = useMutation(
    async (clientId) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في حذف العميل');
      }

      return await response.json();
    },
    {
      onSuccess: () => {
        alert('تم حذف العميل بنجاح');
        setSelectedClient(null);
        refetch();
        queryClient.invalidateQueries(['clients']);
      },
      onError: (error) => {
        alert(error.message);
      }
    }
  );

  // ===========================================================================
  // 3. Event Handlers - معالجات الأحداث
  // ===========================================================================
  
  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    
    setFilters(newFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const clearFilters = () => {
    const defaultFilters = {
      search: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    
    setFilters(defaultFilters);
  };

  // إضافة عميل جديد
  const handleAddClient = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('يرجى إدخال اسم العميل');
      return;
    }

    addClientMutation.mutate(formData);
  };

  // حذف عميل
  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      return;
    }

    deleteClientMutation.mutate(clientId);
  };

  // معالجة اختيار ملف اللوجو
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة فقط');
        return;
      }
      
      // التحقق من حجم الملف (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الملف يجب أن يكون أقل من 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
    }
  };

  // ===========================================================================
  // 4. Helper Functions - دوال مساعدة
  // ===========================================================================
  
  const formatDate = (dateString) => {
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

  // التحقق إذا كان هناك أي فلتر نشط
  const hasActiveFilters = filters.search;

  // استخراج البيانات من نتيجة الاستعلام
  const clients = clientsData?.data || [];
  const count = clientsData?.count || 0;

  const loading = isLoading || addClientMutation.isLoading || deleteClientMutation.isLoading;

  // ===========================================================================
  // 5. UI Components - مكونات الواجهة
  // ===========================================================================
  
  // 5.1 Client Details Renderer - عرض تفاصيل العميل
  const renderClientDetails = (client) => {
    return (
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">تفاصيل العميل</h4>
        
        {client.logo && (
          <div className="flex items-start mb-4">
            <div className="flex items-center text-gray-600 w-32">
              <FiImage className="ml-2" />
              <span>الشعار</span>
            </div>
            <div className="flex-1">
              <img 
                src={client.logo} 
                alt={`شعار ${client.name}`}
                className="max-w-[150px] max-h-[80px] rounded border border-gray-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden text-gray-600">
                <FiImage className="inline ml-1" /> لا يمكن تحميل الصورة
              </div>
            </div>
          </div>
        )}

        {client.website && (
          <div className="flex items-start mb-4">
            <div className="flex items-center text-gray-600 w-32">
              <FiGlobe className="ml-2" />
              <span>الموقع الإلكتروني</span>
            </div>
            <div className="flex-1">
              <a 
                href={client.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {client.website}
              </a>
            </div>
          </div>
        )}

        <div className="flex items-start mb-4">
          <div className="flex items-center text-gray-600 w-32">
            <FiCalendar className="ml-2" />
            <span>تاريخ الإضافة</span>
          </div>
          <div className="flex-1 text-gray-800">
            {formatDate(client.created_at)}
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center text-gray-600 w-32">
            <FiCalendar className="ml-2" />
            <span>آخر تحديث</span>
          </div>
          <div className="flex-1 text-gray-800">
            {formatDate(client.updated_at)}
          </div>
        </div>
      </div>
    );
  };

  // ===========================================================================
  // 6. Main Component - المكون الرئيسي
  // ===========================================================================
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* 5.1 Header Section - قسم الرأس */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <FiUser className="text-2xl text-blue-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">إدارة العملاء المميزين</h1>
        </div>
        <p className="text-gray-600">إدارة قائمة العملاء المميزين - العدد الإجمالي: {count}</p>
      </div>

      {/* 5.2 Filter Section - قسم الفلاتر */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FiFilter className="text-gray-600 ml-2" />
            <span className="text-gray-700 font-medium">أدوات البحث والتصفية:</span>
          </div>
          {hasActiveFilters && (
            <button 
              className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
              onClick={clearFilters}
            >
              <FiSlash className="ml-1" />
              مسح الفلاتر
            </button>
          )}
        </div>
        
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث باسم العميل..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <button 
              type="submit" 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              بحث
            </button>
            <div className="flex gap-3">
              <button 
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                onClick={() => refetch()}
                disabled={loading}
              >
                <FiRefreshCw className="ml-2" />
                تحديث البيانات
              </button>
              
              <button 
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={() => setShowAddForm(true)}
              >
                <FiPlus className="ml-2" />
                إضافة عميل جديد
              </button>
            </div>
          </div>
        </form>

        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <label className="text-gray-700">ترتيب حسب:</label>
            <select 
              value={filters.sort_by} 
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="created_at">تاريخ الإضافة</option>
              <option value="name">اسم العميل</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-gray-700">الاتجاه:</label>
            <select 
              value={filters.sort_order} 
              onChange={(e) => handleFilterChange('sort_order', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="desc">تنازلي</option>
              <option value="asc">تصاعدي</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5.3 Add Client Modal - نافذة إضافة عميل */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">إضافة عميل جديد</h3>
              <button 
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setShowAddForm(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddClient} className="p-6">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">اسم العميل *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="أدخل اسم العميل"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">الموقع الإلكتروني</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 mb-2">شعار العميل</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                    <FiImage className="ml-2 text-gray-400" />
                    <span className="text-gray-600">
                      {formData.logo ? formData.logo.name : 'اختر ملف الشعار'}
                    </span>
                  </label>
                </div>
                {formData.logo && (
                  <div className="mt-3">
                    <img 
                      src={URL.createObjectURL(formData.logo)} 
                      alt="معاينة الشعار"
                      className="max-w-[100px] max-h-[60px] rounded border border-gray-300"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button 
                  type="button"
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  onClick={() => setShowAddForm(false)}
                  disabled={addClientMutation.isLoading}
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={addClientMutation.isLoading}
                >
                  {addClientMutation.isLoading ? 'جاري الإضافة...' : 'إضافة العميل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5.4 & 5.5 Clients List and Details - قائمة العملاء وتفاصيلهم */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          
          {/* 5.4 Clients List - قائمة العملاء */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">قائمة العملاء ({clients.length})</h3>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="mt-4 text-gray-600">جاري تحميل العملاء...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiUser className="text-4xl text-gray-400 mb-3" />
                <p className="text-gray-500 mb-4">لا توجد عملاء مميزين</p>
                {hasActiveFilters && (
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={clearFilters}
                  >
                    مسح الفلاتر
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {clients.map((client) => (
                  <div 
                    key={client.id} 
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedClient?.id === client.id 
                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-300">
                      {client.logo ? (
                        <img 
                          src={client.logo} 
                          alt={client.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : null}
                      {!client.logo && <FiUser className="text-gray-400" />}
                    </div>
                    <div className="flex-1 mr-4">
                      <h4 className="font-medium text-gray-800">{client.name}</h4>
                      {client.created_at && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <FiCalendar className="ml-1" />
                          <span>{formatDate(client.created_at)}</span>
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      مميز
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5.5 Client Details - تفاصيل العميل */}
          <div>
            {selectedClient ? (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">تفاصيل العميل</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">ID: {selectedClient.id}</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center text-gray-600 w-32">
                      <FiUser className="ml-2" />
                      <span>اسم العميل</span>
                    </div>
                    <div className="flex-1 text-gray-800 font-medium">{selectedClient.name}</div>
                  </div>

                  {selectedClient.website && (
                    <div className="flex items-start">
                      <div className="flex items-center text-gray-600 w-32">
                        <FiGlobe className="ml-2" />
                        <span>الموقع الإلكتروني</span>
                      </div>
                      <div className="flex-1">
                        <a 
                          href={selectedClient.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {selectedClient.website}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start">
                    <div className="flex items-center text-gray-600 w-32">
                      <span>الحالة</span>
                    </div>
                    <div className="flex-1">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        مميز
                      </span>
                    </div>
                  </div>

                  {/* تفاصيل إضافية */}
                  {renderClientDetails(selectedClient)}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button 
                    className="flex items-center justify-center w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    onClick={() => handleDeleteClient(selectedClient.id)}
                    disabled={deleteClientMutation.isLoading}
                  >
                    <FiTrash2 className="ml-2" />
                    {deleteClientMutation.isLoading ? 'جاري المعالجة...' : 'حذف العميل'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <FiUser className="text-4xl text-gray-400 mb-3" />
                <p className="text-gray-500">اختر عميلاً لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsManagement;