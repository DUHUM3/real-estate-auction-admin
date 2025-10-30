import React, { useState } from 'react';
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
  FiLayers,
  FiImage
} from 'react-icons/fi';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import '../../styles/PendingUsers.css';

const MarketingRequests = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // استرجاع الفلاتر المحفوظة أو استخدام القيم الافتراضية
  const getInitialFilters = () => {
    const savedFilters = localStorage.getItem('marketingRequestsFilters');
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return {
      search: '',
      region: 'all',
      city: 'all',
      status: 'all',
      start_date: '',
      end_date: '',
      sort_by: 'created_at',
      sort_order: 'desc',
      page: 1,
      per_page: 10
    };
  };
  
  const [filters, setFilters] = useState(getInitialFilters());
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusModal, setStatusModal] = useState({
    show: false,
    requestId: null,
    newStatus: '',
    rejectionMessage: ''
  });
  const [imageModal, setImageModal] = useState({
    show: false,
    images: []
  });

  // حفظ الفلاتر في localStorage عند تغييرها
  React.useEffect(() => {
    localStorage.setItem('marketingRequestsFilters', JSON.stringify(filters));
  }, [filters]);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (filters.search.trim()) params.append('search', filters.search.trim());
    if (filters.region !== 'all') params.append('region', filters.region);
    if (filters.city !== 'all') params.append('city', filters.city);
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);
    
    params.append('page', filters.page);
    params.append('per_page', filters.per_page);
    
    return params.toString();
  };

  // استخدام React Query لجلب بيانات طلبات التسويق
  const fetchMarketingRequests = async () => {
    const token = localStorage.getItem('access_token');
      
    if (!token) {
      navigate('/login');
      throw new Error('لم يتم العثور على رمز الدخول');
    }

    const queryString = buildQueryString();
    const url = `https://shahin-tqay.onrender.com/api/admin/auction-requests?${queryString}`;

    const response = await fetch(url, {
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
      throw new Error(`فشل في جلب طلبات التسويق: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.auction_requests) {
      // استخراج المناطق والمدن المتاحة من البيانات
      const regions = [...new Set(result.auction_requests.map(req => req.region).filter(Boolean))];
      const cities = [...new Set(result.auction_requests.map(req => req.city).filter(Boolean))];
      
      return {
        data: result.auction_requests,
        pagination: {
          current_page: filters.page,
          last_page: Math.ceil(result.auction_requests.length / filters.per_page),
          per_page: filters.per_page,
          total: result.auction_requests.length,
          from: ((filters.page - 1) * filters.per_page) + 1,
          to: Math.min(filters.page * filters.per_page, result.auction_requests.length)
        },
        filtersData: {
          regions,
          cities,
          statuses: [
            { value: 'under_review', label: 'قيد المراجعة' },
            { value: 'approved', label: 'مقبول' },
            { value: 'rejected', label: 'مرفوض' }
          ]
        }
      };
    } else {
      throw new Error(result.message || 'هيكل البيانات غير متوقع');
    }
  };

  const { 
    data: marketingRequestsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery(
    ['marketingRequests', filters],
    fetchMarketingRequests,
    {
      staleTime: 5 * 60 * 1000, // 5 دقائق
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('خطأ في جلب طلبات التسويق:', error);
        alert('حدث خطأ أثناء جلب البيانات: ' + error.message);
      }
    }
  );

  // استخدام useMutation لتحديث حالة الطلب
  const statusMutation = useMutation(
    async ({ requestId, status, message }) => {
      const token = localStorage.getItem('access_token');
      const requestBody = {
        status: status
      };

      if (status === 'rejected' && message) {
        requestBody.message = message;
      }

      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/auction-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في تحديث حالة الطلب');
      }

      return await response.json();
    },
    {
      onSuccess: () => {
        alert('تم تحديث حالة الطلب بنجاح');
        setSelectedRequest(null);
        closeStatusModal();
        refetch();
        queryClient.invalidateQueries(['marketingRequests']);
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
    
    // إعادة ضبط الصفحة عند تغيير الفلاتر
    if (key !== 'page' && filters.page !== 1) {
      newFilters.page = 1;
    }
    
    setFilters(newFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const clearFilters = () => {
    const defaultFilters = {
      search: '',
      region: 'all',
      city: 'all',
      status: 'all',
      start_date: '',
      end_date: '',
      sort_by: 'created_at',
      sort_order: 'desc',
      page: 1,
      per_page: 10
    };
    
    setFilters(defaultFilters);
  };

  const openStatusModal = (requestId, newStatus) => {
    setStatusModal({
      show: true,
      requestId,
      newStatus,
      rejectionMessage: ''
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      show: false,
      requestId: null,
      newStatus: '',
      rejectionMessage: ''
    });
  };

  const openImageModal = (images) => {
    setImageModal({
      show: true,
      images: Array.isArray(images) ? images : [images]
    });
  };

  const closeImageModal = () => {
    setImageModal({
      show: false,
      images: []
    });
  };

  const handleStatusUpdate = async () => {
    if (!statusModal.requestId || !statusModal.newStatus) {
      alert('بيانات غير مكتملة');
      return;
    }

    // إذا كانت الحالة مرفوضة ولم يتم إدخال رسالة الرفض
    if (statusModal.newStatus === 'rejected' && !statusModal.rejectionMessage.trim()) {
      alert('يرجى إدخال سبب الرفض');
      return;
    }

    if (!window.confirm(`هل أنت متأكد من تغيير الحالة إلى "${getStatusText(statusModal.newStatus)}"؟`)) {
      return;
    }

    statusMutation.mutate({
      requestId: statusModal.requestId,
      status: statusModal.newStatus,
      message: statusModal.rejectionMessage
    });
  };

  // تحديث الصفحة الحالية
  const updatePagination = (newPage) => {
    handleFilterChange('page', newPage);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'under_review':
        return <span className="status-badge pending">قيد المراجعة</span>;
      case 'approved':
        return <span className="status-badge approved">مقبول</span>;
      case 'rejected':
        return <span className="status-badge rejected">مرفوض</span>;
      default:
        return <span className="status-badge unknown">{status}</span>;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'under_review':
        return 'قيد المراجعة';
      case 'approved':
        return 'مقبول';
      case 'rejected':
        return 'مرفوض';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'under_review':
        return 'pending';
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      default:
        return 'unknown';
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    // إضافة الرابط الأساسي إذا كان المسار نسبيًا
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `https://shahin-tqay.onrender.com/${imagePath}`;
  };

  // إنشاء أزرار الباجينيشن
  const renderPagination = () => {
    if (!marketingRequestsData || !marketingRequestsData.pagination || marketingRequestsData.pagination.last_page <= 1) return null;

    const pages = [];
    const pagination = marketingRequestsData.pagination;
    
    pages.push(
      <button
        key="prev"
        className={`pagination-btn ${pagination.current_page === 1 ? 'disabled' : ''}`}
        onClick={() => pagination.current_page > 1 && updatePagination(pagination.current_page - 1)}
        disabled={pagination.current_page === 1}
      >
        <FiChevronRight />
      </button>
    );

    // أزرار الصفحات
    const showPages = [];
    showPages.push(1);
    
    if (pagination.current_page > 3) {
      showPages.push('ellipsis-start');
    }
    
    for (let i = Math.max(2, pagination.current_page - 1); i <= Math.min(pagination.last_page - 1, pagination.current_page + 1); i++) {
      showPages.push(i);
    }
    
    if (pagination.current_page < pagination.last_page - 2) {
      showPages.push('ellipsis-end');
    }
    
    if (pagination.last_page > 1) {
      showPages.push(pagination.last_page);
    }
    
    const uniquePages = [...new Set(showPages)];
    
    uniquePages.forEach(page => {
      if (page === 'ellipsis-start' || page === 'ellipsis-end') {
        pages.push(<span key={page} className="pagination-ellipsis">...</span>);
      } else {
        pages.push(
          <button
            key={page}
            className={`pagination-btn ${pagination.current_page === page ? 'active' : ''}`}
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
        className={`pagination-btn ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}
        onClick={() => pagination.current_page < pagination.last_page && updatePagination(pagination.current_page + 1)}
        disabled={pagination.current_page === pagination.last_page}
      >
        <FiChevronLeft />
      </button>
    );

    return pages;
  };

  const renderRequestDetails = (request) => {
    return (
      <div className="details-content">
        <div className="detail-item">
          <div className="detail-label">
            <FiUser />
            اسم مقدم الطلب
          </div>
          <div className="detail-value">{request.user?.name}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiMail />
            البريد الإلكتروني
          </div>
          <div className="detail-value">{request.user?.email}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiPhone />
            رقم الهاتف
          </div>
          <div className="detail-value">{request.user?.phone}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            نوع المستخدم
          </div>
          <div className="detail-value">{request.user?.user_type}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            رقم الهوية
          </div>
          <div className="detail-value">{request.user?.identity_number || 'غير محدد'}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiNavigation />
            المنطقة
          </div>
          <div className="detail-value">{request.region}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiHome />
            المدينة
          </div>
          <div className="detail-value">{request.city}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            رقم الوثيقة
          </div>
          <div className="detail-value">{request.document_number}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            الحالة
          </div>
          <div className="detail-value">
            {getStatusBadge(request.status)}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiCalendar />
            تاريخ الطلب
          </div>
          <div className="detail-value">{formatDate(request.created_at)}</div>
        </div>

        <div className="detail-item full-width">
          <div className="detail-label">
            <FiMessageSquare />
            الوصف
          </div>
          <div className="detail-value message-text">{request.description}</div>
        </div>

        {request.rejection_message && (
          <div className="detail-item full-width">
            <div className="detail-label rejection-message">
              <FiX />
              سبب الرفض
            </div>
            <div className="detail-value rejection-text">{request.rejection_message}</div>
          </div>
        )}

        {request.images && request.images.length > 0 && (
          <div className="detail-item full-width">
            <div className="detail-label">
              <FiImage />
              الصور المرفوعة
            </div>
            <div className="images-grid">
              {request.images.map((image, index) => (
                <div 
                  key={index} 
                  className="image-thumbnail"
                  onClick={() => openImageModal(request.images)}
                >
                  <img 
                    src={getImageUrl(image)} 
                    alt={`صورة الطلب ${index + 1}`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="image-placeholder">
                    <FiImage />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // التحقق إذا كان هناك أي فلتر نشط
  const hasActiveFilters = filters.search || 
    filters.region !== 'all' || 
    filters.city !== 'all' || 
    filters.status !== 'all' || 
    filters.start_date || 
    filters.end_date;

  // استخراج البيانات من نتيجة الاستعلام
  const requests = marketingRequestsData?.data || [];
  const pagination = marketingRequestsData?.pagination || {
    current_page: filters.page,
    last_page: 1,
    per_page: filters.per_page,
    total: 0,
    from: 0,
    to: 0
  };
  const filtersData = marketingRequestsData?.filtersData || {
    regions: [],
    cities: [],
    statuses: []
  };

  const loading = isLoading || statusMutation.isLoading;

  return (
    <div className="pending-users-container">
      {/* <div className="content-header">
        <h1>
          <FiTarget className="header-icon" />
          إدارة طلبات التسويق
        </h1>
        <p>عرض وإدارة جميع طلبات التسويق - العدد الإجمالي: {pagination.total}</p>
      </div> */}

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
            <div className="dashboard-header-actions">
              <button 
                className="dashboard-refresh-btn" 
                onClick={() => refetch()}
                disabled={loading}
              >
                <FiRefreshCw />
                تحديث البيانات
              </button>
            </div>
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
            <label>الحالة:</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع الحالات</option>
              <option value="under_review">قيد المراجعة</option>
              <option value="approved">مقبول</option>
              <option value="rejected">مرفوض</option>
            </select>
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
          {/* Marketing Requests List */}
          <div className="users-list">
            <div className="list-header">
              <h3>قائمة طلبات التسويق ({requests.length})</h3>
              <span className="page-info">
                {pagination.total > 0 ? (
                  <>عرض {pagination.from} إلى {pagination.to} من {pagination.total} - الصفحة {pagination.current_page} من {pagination.last_page}</>
                ) : (
                  'لا توجد نتائج'
                )}
              </span>
            </div>
            
            {loading ? (
              <div className="dashboard-loading">
                <div className="dashboard-loading-dots">
                  <div className="dashboard-loading-dot"></div>
                  <div className="dashboard-loading-dot"></div>
                  <div className="dashboard-loading-dot"></div>
                </div>
                <p className="dashboard-loading-text">جاري تحميل طلبات التسويق...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="empty-state">
                <FiTarget className="empty-icon" />
                <p>لا توجد طلبات تسويق</p>
                {hasActiveFilters && (
                  <button className="btn btn-primary" onClick={clearFilters}>
                    مسح الفلاتر
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="users-cards">
                  {requests.map((request) => (
                    <div 
                      key={request.id} 
                      className={`user-card ${selectedRequest?.id === request.id ? 'active' : ''}`}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <div className="user-avatar">
                        <FiUser />
                      </div>
                      <div className="user-info">
                        <h4>{request.user?.name}</h4>
                        <span className="user-type">
                          <FiMail />
                          {request.user?.email}
                        </span>
                        <span className="user-type">
                          <FiNavigation />
                          {request.region} - {request.city}
                        </span>
                        <span className="user-date">
                          <FiCalendar />
                          {formatDate(request.created_at)}
                        </span>
                        <div className="user-message-preview">
                          <FiMessageSquare />
                          {request.description?.substring(0, 50)}...
                        </div>
                        {request.images && request.images.length > 0 && (
                          <span className="user-images">
                            <FiImage />
                            {request.images.length} صورة
                          </span>
                        )}
                      </div>
                      <div className={`user-status ${getStatusColor(request.status)}`}>
                        {request.status_ar || getStatusText(request.status)}
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
                  <h3>تفاصيل طلب التسويق</h3>
                  <span className="user-id">ID: {selectedRequest.id}</span>
                </div>
                
                {renderRequestDetails(selectedRequest)}

                <div className="details-actions">
                  <div className="status-actions">
                    <button 
                      className="btn btn-success"
                      onClick={() => openStatusModal(selectedRequest.id, 'approved')}
                      disabled={selectedRequest.status === 'approved' || loading}
                    >
                      <FiCheck />
                      قبول الطلب
                    </button>
                    
                    <button 
                      className="btn btn-danger"
                      onClick={() => openStatusModal(selectedRequest.id, 'rejected')}
                      disabled={selectedRequest.status === 'rejected' || loading}
                    >
                      <FiX />
                      رفض الطلب
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <FiTarget className="no-selection-icon" />
                <p>اختر طلب تسويق لعرض التفاصيل</p>
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
              
              {statusModal.newStatus === 'rejected' && (
                <div className="form-group">
                  <label>سبب الرفض *</label>
                  <textarea
                    value={statusModal.rejectionMessage}
                    onChange={(e) => setStatusModal(prev => ({
                      ...prev,
                      rejectionMessage: e.target.value
                    }))}
                    placeholder="يرجى إدخال سبب رفض الطلب..."
                    rows="4"
                    className="form-textarea"
                  />
                </div>
              )}
              
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
                disabled={loading}
              >
                إلغاء
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleStatusUpdate}
                disabled={loading || (statusModal.newStatus === 'rejected' && !statusModal.rejectionMessage.trim())}
              >
                <FiCheck />
                {loading ? 'جاري الحفظ...' : 'تأكيد التغيير'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال عرض الصور */}
      {imageModal.show && (
        <div className="modal-overlay">
          <div className="modal-content image-modal">
            <div className="modal-header">
              <h3>
                <FiImage />
                معرض الصور
              </h3>
              <button 
                className="close-btn"
                onClick={closeImageModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="images-gallery">
                {imageModal.images.map((image, index) => (
                  <div key={index} className="gallery-image">
                    <img 
                      src={getImageUrl(image)} 
                      alt={`صورة ${index + 1}`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="image-error">
                      <FiImage />
                      <span>تعذر تحميل الصورة</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingRequests;