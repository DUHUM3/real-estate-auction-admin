import React, { useState } from 'react';
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
import '../styles/PendingUsers.css';

const ClientsManagement = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
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
  React.useEffect(() => {
    localStorage.setItem('clientsFilters', JSON.stringify(filters));
  }, [filters]);

  // استخدام React Query لجلب بيانات العملاء
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

  const renderClientDetails = (client) => {
    return (
      <div className="additional-details">
        <h4>تفاصيل العميل</h4>
        
        {client.logo && (
          <div className="detail-item">
            <div className="detail-label">
              <FiImage />
              الشعار
            </div>
            <div className="detail-value">
              <img 
                src={client.logo} 
                alt={`شعار ${client.name}`}
                style={{ 
                  maxWidth: '150px', 
                  maxHeight: '80px', 
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none', color: '#5d6d7e' }}>
                <FiImage /> لا يمكن تحميل الصورة
              </div>
            </div>
          </div>
        )}

        {client.website && (
          <div className="detail-item">
            <div className="detail-label">
              <FiGlobe />
              الموقع الإلكتروني
            </div>
            <div className="detail-value">
              <a 
                href={client.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="link"
              >
                {client.website}
              </a>
            </div>
          </div>
        )}

        <div className="detail-item">
          <div className="detail-label">
            <FiCalendar />
            تاريخ الإضافة
          </div>
          <div className="detail-value">
            {formatDate(client.created_at)}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiCalendar />
            آخر تحديث
          </div>
          <div className="detail-value">
            {formatDate(client.updated_at)}
          </div>
        </div>
      </div>
    );
  };

  // التحقق إذا كان هناك أي فلتر نشط
  const hasActiveFilters = filters.search;

  // استخراج البيانات من نتيجة الاستعلام
  const clients = clientsData?.data || [];
  const count = clientsData?.count || 0;

  const loading = isLoading || addClientMutation.isLoading || deleteClientMutation.isLoading;

  return (
    <div className="pending-users-container">
      <div className="content-header">
        <h1>
          <FiUser className="header-icon" />
          إدارة العملاء المميزين
        </h1>
        <p>إدارة قائمة العملاء المميزين - العدد الإجمالي: {count}</p>
      </div>

      {/* شريط البحث والتصفية */}
      <div className="filter-section">
        <div className="filter-header">
          <FiFilter className="filter-icon" />
          <span>أدوات البحث والتصفية:</span>
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <FiSlash />
              مسح الفلاتر
            </button>
          )}
        </div>
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="ابحث باسم العميل..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              بحث
            </button>
            <div className="dashboard-header-actions">
              <button 
                className="dashboard-refresh-btn" 
                onClick={() => refetch()}
                disabled={loading}
              >
                <FiRefreshCw />
                تحديث البيانات
              </button>
              
              <button 
                className="btn btn-success"
                onClick={() => setShowAddForm(true)}
              >
                <FiPlus />
                إضافة عميل جديد
              </button>
            </div>
          </div>
        </form>

        <div className="filter-controls">
          <div className="filter-group">
            <label>ترتيب حسب:</label>
            <select 
              value={filters.sort_by} 
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
              className="filter-select"
            >
              <option value="created_at">تاريخ الإضافة</option>
              <option value="name">اسم العميل</option>
            </select>
          </div>

          <div className="filter-group">
            <label>الاتجاه:</label>
            <select 
              value={filters.sort_order} 
              onChange={(e) => handleFilterChange('sort_order', e.target.value)}
              className="filter-select"
            >
              <option value="desc">تنازلي</option>
              <option value="asc">تصاعدي</option>
            </select>
          </div>
        </div>
      </div>

      {/* نموذج إضافة عميل جديد */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>إضافة عميل جديد</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddClient} className="add-client-form">
              <div className="form-group">
                <label className="form-label">اسم العميل *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="أدخل اسم العميل"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">الموقع الإلكتروني</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">شعار العميل</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="file-input"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="file-label">
                    <FiImage />
                    {formData.logo ? formData.logo.name : 'اختر ملف الشعار'}
                  </label>
                </div>
                {formData.logo && (
                  <div className="file-preview">
                    <img 
                      src={URL.createObjectURL(formData.logo)} 
                      alt="معاينة الشعار"
                      style={{ 
                        maxWidth: '100px', 
                        maxHeight: '60px',
                        marginTop: '10px',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                  disabled={addClientMutation.isLoading}
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={addClientMutation.isLoading}
                >
                  {addClientMutation.isLoading ? 'جاري الإضافة...' : 'إضافة العميل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="content-body">
        <div className="users-grid">
          {/* قائمة العملاء */}
          <div className="users-list">
            <div className="list-header">
              <h3>قائمة العملاء ({clients.length})</h3>
            </div>
            
            {loading ? (
              <div className="dashboard-loading">
                <div className="dashboard-loading-dots">
                  <div className="dashboard-loading-dot"></div>
                  <div className="dashboard-loading-dot"></div>
                  <div className="dashboard-loading-dot"></div>
                </div>
                <p className="dashboard-loading-text">جاري تحميل العملاء...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="empty-state">
                <FiUser className="empty-icon" />
                <p>لا توجد عملاء مميزين</p>
                {hasActiveFilters && (
                  <button className="btn btn-primary" onClick={clearFilters}>
                    مسح الفلاتر
                  </button>
                )}
              </div>
            ) : (
              <div className="users-cards">
                {clients.map((client) => (
                  <div 
                    key={client.id} 
                    className={`user-card ${selectedClient?.id === client.id ? 'active' : ''}`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="user-avatar">
                      {client.logo ? (
                        <img 
                          src={client.logo} 
                          alt={client.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : null}
                      {!client.logo && <FiUser />}
                    </div>
                    <div className="user-info">
                      <h4>{client.name}</h4>
                      {client.created_at && (
                        <span className="user-date">
                          <FiCalendar />
                          {formatDate(client.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="user-status approved">
                      مميز
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* تفاصيل العميل */}
          <div className="user-details">
            {selectedClient ? (
              <div className="details-card">
                <div className="details-header">
                  <h3>تفاصيل العميل</h3>
                  <span className="user-id">ID: {selectedClient.id}</span>
                </div>
                
                <div className="details-content">
                  <div className="detail-item">
                    <div className="detail-label">
                      <FiUser />
                      اسم العميل
                    </div>
                    <div className="detail-value">{selectedClient.name}</div>
                  </div>

                  {selectedClient.website && (
                    <div className="detail-item">
                      <div className="detail-label">
                        <FiGlobe />
                        الموقع الإلكتروني
                      </div>
                      <div className="detail-value">
                        <a 
                          href={selectedClient.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="link"
                        >
                          {selectedClient.website}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="detail-item">
                    <div className="detail-label">
                      الحالة
                    </div>
                    <div className="detail-value">
                      <span className="status-badge approved">مميز</span>
                    </div>
                  </div>

                  {/* تفاصيل إضافية */}
                  {renderClientDetails(selectedClient)}
                </div>

                <div className="details-actions">
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteClient(selectedClient.id)}
                    disabled={deleteClientMutation.isLoading}
                  >
                    <FiTrash2 />
                    {deleteClientMutation.isLoading ? 'جاري المعالجة...' : 'حذف العميل'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <FiUser className="no-selection-icon" />
                <p>اختر عميلاً لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsManagement;