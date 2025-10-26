import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiMap, 
  FiCheck, 
  FiX, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiFileText, 
  FiHome,
  FiFilter, 
  FiChevronRight, 
  FiChevronLeft, 
  FiSearch, 
  FiSlash,
  FiMessageSquare,
  FiEdit,
  FiRefreshCw,
  FiNavigation,
  FiTarget,
  FiLayers
} from 'react-icons/fi';
import { useData } from '../../contexts/DataContext';
import '../../styles/PendingUsers.css';

const LandRequests = () => {
  const { state, dispatch } = useData();
  const [localLoading, setLocalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusModal, setStatusModal] = useState({
    show: false,
    requestId: null,
    newStatus: ''
  });
  
  // استخدام البيانات من Context
  const landRequestsData = state.landRequests.data || [];
  const pagination = state.landRequests.pagination || {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  };
  const filters = state.landRequests.filters;
  const filtersData = state.landRequests.filtersData;

  useEffect(() => {
    // إذا البيانات غير موجودة أو قديمة، قم بجلبها
    if (!state.landRequests.data || state.landRequests.data.length === 0 || isLandRequestsDataStale()) {
      fetchLandRequests();
    }
  }, [filters, pagination.current_page]);

  const isLandRequestsDataStale = () => {
    if (!state.landRequests.lastUpdated) return true;
    const now = new Date();
    const lastUpdate = new Date(state.landRequests.lastUpdated);
    const diffInMinutes = (now - lastUpdate) / (1000 * 60);
    return diffInMinutes > 10; // تحديث إذا مرت أكثر من 10 دقائق
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    // إضافة معاملات البحث والتصفية فقط إذا كانت محددة
    if (filters.search.trim()) params.append('search', filters.search.trim());
    if (filters.region !== 'all') params.append('region', filters.region);
    if (filters.city !== 'all') params.append('city', filters.city);
    if (filters.purpose !== 'all') params.append('purpose', filters.purpose);
    if (filters.type !== 'all') params.append('type', filters.type);
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.area_min) params.append('area_min', filters.area_min);
    if (filters.area_max) params.append('area_max', filters.area_max);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);
    
    // إضافة معاملات الباجينيشن
    params.append('page', pagination.current_page);
    params.append('per_page', filters.per_page);
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  const fetchLandRequests = async (forceRefresh = false) => {
    // إذا البيانات موجودة وليست forced refresh، لا تعيد الجلب
    if (state.landRequests.data && state.landRequests.data.length > 0 && !forceRefresh && !isLandRequestsDataStale()) {
      return;
    }

    try {
      dispatch({ type: 'SET_LAND_REQUESTS_LOADING', payload: true });
      setLocalLoading(true);
      
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
        window.location.href = '/login';
        return;
      }

      const queryString = buildQueryString();
      const url = `https://shahin-tqay.onrender.com/api/admin/land-requests${queryString}`;

      console.log('جلب البيانات من:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        alert('انتهت جلسة الدخول أو التوكن غير صالح');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const result = await response.json();
        console.log('بيانات الاستجابة:', result);
        
        if (result.success && result.data) {
          dispatch({
            type: 'SET_LAND_REQUESTS_DATA',
            payload: {
              data: result.data,
              pagination: result.meta || {
                current_page: 1,
                last_page: 1,
                per_page: 10,
                total: result.data.length,
                from: 1,
                to: result.data.length
              },
              filters: filters,
              filtersData: {
                regions: result.meta?.filters?.regions || [],
                cities: result.meta?.filters?.cities || [],
                purposes: result.meta?.filters?.purposes || [],
                types: result.meta?.filters?.types || [],
                statuses: result.meta?.filters?.statuses || []
              }
            }
          });
        } else {
          console.error('هيكل البيانات غير متوقع:', result);
          dispatch({ type: 'CLEAR_LAND_REQUESTS_DATA' });
        }
      } else {
        const errorText = await response.text();
        console.error('فشل في جلب طلبات الأراضي:', errorText);
        alert('فشل في جلب بيانات طلبات الأراضي');
        dispatch({ type: 'CLEAR_LAND_REQUESTS_DATA' });
      }
    } catch (error) {
      console.error('خطأ في جلب طلبات الأراضي:', error);
      alert('حدث خطأ أثناء جلب البيانات: ' + error.message);
      dispatch({ type: 'CLEAR_LAND_REQUESTS_DATA' });
    } finally {
      dispatch({ type: 'SET_LAND_REQUESTS_LOADING', payload: false });
      setLocalLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    
    dispatch({
      type: 'UPDATE_LAND_REQUESTS_FILTERS',
      payload: newFilters
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLandRequests();
  };

  const clearFilters = () => {
    const defaultFilters = {
      search: '',
      region: 'all',
      city: 'all',
      purpose: 'all',
      type: 'all',
      status: 'all',
      area_min: '',
      area_max: '',
      start_date: '',
      end_date: '',
      sort_by: 'created_at',
      sort_order: 'desc',
      page: 1,
      per_page: 10
    };
    
    dispatch({
      type: 'UPDATE_LAND_REQUESTS_FILTERS',
      payload: defaultFilters
    });
  };

  const openStatusModal = (requestId, newStatus) => {
    setStatusModal({
      show: true,
      requestId,
      newStatus
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      show: false,
      requestId: null,
      newStatus: ''
    });
  };

  const handleStatusUpdate = async () => {
    if (!statusModal.requestId || !statusModal.newStatus) {
      alert('بيانات غير مكتملة');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/land-requests/${statusModal.requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: statusModal.newStatus
        })
      });

      if (response.ok) {
        // تحديث الحالة في الـ context مباشرة
        dispatch({
          type: 'UPDATE_LAND_REQUESTS_STATUS',
          payload: {
            requestId: statusModal.requestId,
            status: statusModal.newStatus
          }
        });
        
        setSelectedRequest(null);
        closeStatusModal();
        alert('تم تحديث حالة الطلب بنجاح');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'فشل في تحديث حالة الطلب');
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      alert('حدث خطأ أثناء تحديث حالة الطلب');
    } finally {
      setActionLoading(false);
    }
  };

  // دالة لتحديث الباجينيشن
  const updatePagination = (newPage) => {
    handleFilterChange('page', newPage);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="status-badge pending">مفتوح</span>;
      case 'in_progress':
        return <span className="status-badge in-progress">قيد المعالجة</span>;
      case 'completed':
        return <span className="status-badge approved">مكتمل</span>;
      case 'cancelled':
        return <span className="status-badge rejected">ملغي</span>;
      default:
        return <span className="status-badge unknown">{status}</span>;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return 'مفتوح';
      case 'in_progress':
        return 'قيد المعالجة';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'pending';
      case 'in_progress':
        return 'in-progress';
      case 'completed':
        return 'approved';
      case 'cancelled':
        return 'rejected';
      default:
        return 'unknown';
    }
  };

  const getPurposeText = (purpose) => {
    switch (purpose) {
      case 'sale':
        return 'بيع';
      case 'rent':
        return 'إيجار';
      case 'investment':
        return 'استثمار';
      default:
        return purpose;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'residential':
        return 'سكني';
      case 'commercial':
        return 'تجاري';
      case 'industrial':
        return 'صناعي';
      case 'agricultural':
        return 'زراعي';
      default:
        return type;
    }
  };

  // إنشاء أزرار الباجينيشن
  const renderPagination = () => {
    if (pagination.last_page <= 1) return null;

    const pages = [];
    const currentPage = pagination.current_page;
    const lastPage = pagination.last_page;
    
    // زر الصفحة السابقة
    pages.push(
      <button
        key="prev"
        className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={() => currentPage > 1 && updatePagination(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FiChevronRight />
      </button>
    );

    // أزرار الصفحات
    const showPages = [];
    
    // دائما نعرض الصفحة الأولى
    showPages.push(1);
    
    // نقاط إذا كانت الصفحة الحالية بعيدة عن البداية
    if (currentPage > 3) {
      showPages.push('ellipsis-start');
    }
    
    // الصفحات حول الصفحة الحالية
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(lastPage - 1, currentPage + 1); i++) {
      showPages.push(i);
    }
    
    // نقاط إذا كانت الصفحة الحالية بعيدة عن النهاية
    if (currentPage < lastPage - 2) {
      showPages.push('ellipsis-end');
    }
    
    // دائما نعرض الصفحة الأخيرة إذا كانت أكثر من 1
    if (lastPage > 1) {
      showPages.push(lastPage);
    }
    
    // إزالة التكرارات
    const uniquePages = [...new Set(showPages)];
    
    uniquePages.forEach(page => {
      if (page === 'ellipsis-start' || page === 'ellipsis-end') {
        pages.push(<span key={page} className="pagination-ellipsis">...</span>);
      } else {
        pages.push(
          <button
            key={page}
            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
            onClick={() => updatePagination(page)}
          >
            {page}
          </button>
        );
      }
    });

    // زر الصفحة التالية
    pages.push(
      <button
        key="next"
        className={`pagination-btn ${currentPage === lastPage ? 'disabled' : ''}`}
        onClick={() => currentPage < lastPage && updatePagination(currentPage + 1)}
        disabled={currentPage === lastPage}
      >
        <FiChevronLeft />
      </button>
    );

    return pages;
  };

  // التحقق إذا كان هناك أي فلتر نشط
  const hasActiveFilters = filters.search || 
    filters.region !== 'all' || 
    filters.city !== 'all' || 
    filters.purpose !== 'all' || 
    filters.type !== 'all' || 
    filters.status !== 'all' || 
    filters.area_min || 
    filters.area_max || 
    filters.start_date || 
    filters.end_date;

  const loading = state.landRequests.isLoading || localLoading;

  return (
    <div className="pending-users-container">
      <div className="content-header">
        <h1>
          <FiMap className="header-icon" />
          إدارة طلبات الأراضي
        </h1>
        <p>عرض وإدارة جميع طلبات الأراضي - العدد الإجمالي: {pagination.total}</p>
        <div className="dashboard-header-actions">
          <button 
            className="dashboard-refresh-btn" 
            onClick={() => fetchLandRequests(true)}
            disabled={loading}
          >
            <FiRefreshCw />
            تحديث البيانات
          </button>
        </div>
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
              placeholder="ابحث باسم المستخدم أو الوصف..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              بحث
            </button>
          </div>
        </form>

        <div className="filter-controls">
          <div className="filter-group">
            <label>المنطقة:</label>
            <select 
              value={filters.region} 
              onChange={(e) => handleFilterChange('region', e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع المناطق</option>
              {filtersData.regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>المدينة:</label>
            <select 
              value={filters.city} 
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع المدن</option>
              {filtersData.cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>الغرض:</label>
            <select 
              value={filters.purpose} 
              onChange={(e) => handleFilterChange('purpose', e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع الأغراض</option>
              <option value="sale">بيع</option>
              <option value="rent">إيجار</option>
              <option value="investment">استثمار</option>
            </select>
          </div>

          <div className="filter-group">
            <label>النوع:</label>
            <select 
              value={filters.type} 
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع الأنواع</option>
              <option value="residential">سكني</option>
              <option value="commercial">تجاري</option>
              <option value="industrial">صناعي</option>
              <option value="agricultural">زراعي</option>
            </select>
          </div>

          <div className="filter-group">
            <label>الحالة:</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع الحالات</option>
              <option value="open">مفتوح</option>
              <option value="in_progress">قيد المعالجة</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>

          <div className="filter-group">
            <label>المساحة من (م²):</label>
            <input
              type="number"
              value={filters.area_min}
              onChange={(e) => handleFilterChange('area_min', e.target.value)}
              placeholder="أدنى مساحة"
              className="filter-select"
            />
          </div>

          <div className="filter-group">
            <label>المساحة إلى (م²):</label>
            <input
              type="number"
              value={filters.area_max}
              onChange={(e) => handleFilterChange('area_max', e.target.value)}
              placeholder="أقصى مساحة"
              className="filter-select"
            />
          </div>

          <div className="filter-group">
            <label>من تاريخ:</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="filter-select"
            />
          </div>

          <div className="filter-group">
            <label>إلى تاريخ:</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="filter-select"
            />
          </div>

          <div className="filter-group">
            <label>ترتيب حسب:</label>
            <select 
              value={filters.sort_by} 
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
              className="filter-select"
            >
              <option value="created_at">تاريخ الطلب</option>
              <option value="area">المساحة</option>
              <option value="region">المنطقة</option>
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

      <div className="content-body">
        <div className="users-grid">
          {/* Land Requests List */}
          <div className="users-list">
            <div className="list-header">
              <h3>قائمة طلبات الأراضي ({landRequestsData.length})</h3>
              <span className="page-info">
                {pagination.total > 0 ? (
                  <>عرض {pagination.from} إلى {pagination.to} من {pagination.total} - الصفحة {pagination.current_page} من {pagination.last_page}</>
                ) : (
                  'لا توجد نتائج'
                )}
              </span>
            </div>
            
            {loading ? (
              <div className="list-loading">
                <div className="loading-spinner"></div>
                <p>جاري تحميل طلبات الأراضي...</p>
              </div>
            ) : landRequestsData.length === 0 ? (
              <div className="empty-state">
                <FiMap className="empty-icon" />
                <p>لا توجد نتائج</p>
                {hasActiveFilters && (
                  <button className="btn btn-primary" onClick={clearFilters}>
                    مسح الفلاتر
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="users-cards">
                  {landRequestsData.map((request) => (
                    <div 
                      key={request.id} 
                      className={`user-card ${selectedRequest?.id === request.id ? 'active' : ''}`}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <div className="user-avatar">
                        <FiUser />
                      </div>
                      <div className="user-info">
                        <h4>{request.user?.full_name}</h4>
                        <span className="user-type">
                          <FiNavigation />
                          {request.region} - {request.city}
                        </span>
                        <span className="user-type">
                          <FiTarget />
                          {getPurposeText(request.purpose)} - {getTypeText(request.type)}
                        </span>
                        <span className="user-date">
                          <FiCalendar />
                          {formatDate(request.created_at)}
                        </span>
                        <div className="user-message-preview">
                          <FiMessageSquare />
                          {request.description?.substring(0, 50)}...
                        </div>
                      </div>
                      <div className={`user-status ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* الباجينيشن */}
                {pagination.last_page > 1 && (
                  <div className="pagination">
                    {renderPagination()}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Request Details */}
          <div className="user-details">
            {selectedRequest ? (
              <div className="details-card">
                <div className="details-header">
                  <h3>تفاصيل طلب الأرض</h3>
                  <span className="user-id">ID: {selectedRequest.id}</span>
                </div>
                
                <div className="details-content">
                  <div className="detail-item">
                    <div className="detail-label">
                      <FiUser />
                      اسم مقدم الطلب
                    </div>
                    <div className="detail-value">{selectedRequest.user?.full_name}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiMail />
                      البريد الإلكتروني
                    </div>
                    <div className="detail-value">{selectedRequest.user?.email}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiPhone />
                      رقم الهاتف
                    </div>
                    <div className="detail-value">{selectedRequest.user?.phone}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiNavigation />
                      المنطقة
                    </div>
                    <div className="detail-value">{selectedRequest.region}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiHome />
                      المدينة
                    </div>
                    <div className="detail-value">{selectedRequest.city}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiTarget />
                      الغرض
                    </div>
                    <div className="detail-value">{getPurposeText(selectedRequest.purpose)}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiLayers />
                      النوع
                    </div>
                    <div className="detail-value">{getTypeText(selectedRequest.type)}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      المساحة
                    </div>
                    <div className="detail-value">{selectedRequest.area} م²</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      الحالة
                    </div>
                    <div className="detail-value">
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiCalendar />
                      تاريخ الطلب
                    </div>
                    <div className="detail-value">{formatDate(selectedRequest.created_at)}</div>
                  </div>

                  <div className="detail-item full-width">
                    <div className="detail-label">
                      <FiMessageSquare />
                      الوصف
                    </div>
                    <div className="detail-value message-text">{selectedRequest.description}</div>
                  </div>
                </div>

                <div className="details-actions">
                  <div className="status-actions">
                    <button 
                      className="btn btn-success"
                      onClick={() => openStatusModal(selectedRequest.id, 'completed')}
                      disabled={selectedRequest.status === 'completed'}
                    >
                      <FiCheck />
                      إكمال
                    </button>
                    
                    <button 
                      className="btn btn-warning"
                      onClick={() => openStatusModal(selectedRequest.id, 'in_progress')}
                      disabled={selectedRequest.status === 'in_progress'}
                    >
                      <FiFileText />
                      قيد المعالجة
                    </button>
                    
                    <button 
                      className="btn btn-danger"
                      onClick={() => openStatusModal(selectedRequest.id, 'cancelled')}
                      disabled={selectedRequest.status === 'cancelled'}
                    >
                      <FiX />
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <FiMap className="no-selection-icon" />
                <p>اختر طلب أرض لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* مودال تغيير الحالة */}
      {statusModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <FiEdit />
                تغيير حالة الطلب
              </h3>
              <button 
                className="close-btn"
                onClick={closeStatusModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>الحالة الجديدة</label>
                <div className="status-display">
                  <span className={`status-badge ${getStatusColor(statusModal.newStatus)}`}>
                    {getStatusText(statusModal.newStatus)}
                  </span>
                </div>
              </div>
              
              <div className="form-group">
                <p className="confirmation-message">
                  هل أنت متأكد من تغيير حالة هذا الطلب إلى <strong>{getStatusText(statusModal.newStatus)}</strong>؟
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={closeStatusModal}
                disabled={actionLoading}
              >
                إلغاء
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleStatusUpdate}
                disabled={actionLoading}
              >
                <FiCheck />
                {actionLoading ? 'جاري الحفظ...' : 'تأكيد التغيير'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandRequests;