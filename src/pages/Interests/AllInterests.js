import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiHeart, 
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
  FiEdit
} from 'react-icons/fi';
import '../../styles/PendingUsers.css';

const AllInterests = () => {
  const [interests, setInterests] = useState([]);
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filtersData, setFiltersData] = useState({
    status_options: [],
    properties: []
  });
  const [statusModal, setStatusModal] = useState({
    show: false,
    interestId: null,
    newStatus: '',
    adminNote: ''
  });
  
  // حالة التصفية والترتيب
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    property_id: 'all',
    date_from: '',
    date_to: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  
  // حالة الباجينيشن
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  });

  useEffect(() => {
    fetchAllInterests();
  }, [filters, pagination.current_page]);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    // إضافة معاملات البحث والتصفية فقط إذا كانت محددة
    if (filters.search.trim()) params.append('search', filters.search.trim());
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.property_id !== 'all') params.append('property_id', filters.property_id);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);
    
    // إضافة معاملات الباجينيشن
    params.append('page', pagination.current_page);
    params.append('per_page', pagination.per_page);
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  const fetchAllInterests = async () => {
    try {
      setListLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
        window.location.href = '/login';
        return;
      }

      const queryString = buildQueryString();
      const url = `https://shahin-tqay.onrender.com/api/admin/interests${queryString}`;

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
          setInterests(result.data.interests || []);
          setFiltersData(result.data.filters || {
            status_options: [],
            properties: []
          });
          
          // استخدام البيانات من الاستجابة مباشرة
          setPagination(result.data.pagination || {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: result.data.interests?.length || 0,
            from: 1,
            to: result.data.interests?.length || 0
          });
        } else {
          console.error('هيكل البيانات غير متوقع:', result);
          setInterests([]);
          setPagination({
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: 0,
            from: 0,
            to: 0
          });
        }
      } else {
        const errorText = await response.text();
        console.error('فشل في جلب طلبات الاهتمام:', errorText);
        alert('فشل في جلب بيانات طلبات الاهتمام');
      }
    } catch (error) {
      console.error('خطأ في جلب طلبات الاهتمام:', error);
      alert('حدث خطأ أثناء جلب البيانات: ' + error.message);
    } finally {
      setListLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    // العودة للصفحة الأولى عند تغيير الفلتر
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // إعادة تعيين الصفحة للاولى عند البحث
    setPagination(prev => ({ ...prev, current_page: 1 }));
    fetchAllInterests();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      property_id: 'all',
      date_from: '',
      date_to: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    });
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const openStatusModal = (interestId, newStatus) => {
    setStatusModal({
      show: true,
      interestId,
      newStatus,
      adminNote: ''
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      show: false,
      interestId: null,
      newStatus: '',
      adminNote: ''
    });
  };

  const handleStatusUpdate = async () => {
    if (!statusModal.interestId || !statusModal.newStatus) {
      alert('بيانات غير مكتملة');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/interests/${statusModal.interestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: statusModal.newStatus,
          admin_note: statusModal.adminNote.trim() || undefined
        })
      });

      if (response.ok) {
        // إعادة جلب البيانات لتحديث القائمة
        fetchAllInterests();
        setSelectedInterest(null);
        closeStatusModal();
        alert('تم تحديث حالة الاهتمام بنجاح');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'فشل في تحديث حالة الاهتمام');
      }
    } catch (error) {
      console.error('Error updating interest status:', error);
      alert('حدث خطأ أثناء تحديث حالة الاهتمام');
    } finally {
      setActionLoading(false);
    }
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
      case 'قيد المراجعة':
        return <span className="status-badge pending">قيد المراجعة</span>;
      case 'تمت المراجعة':
        return <span className="status-badge approved">تمت المراجعة</span>;
      case 'تم التواصل':
        return <span className="status-badge contacted">تم التواصل</span>;
      case 'ملغي':
        return <span className="status-badge rejected">ملغي</span>;
      default:
        return <span className="status-badge unknown">{status}</span>;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'قيد المراجعة':
        return 'قيد المراجعة';
      case 'تمت المراجعة':
        return 'تمت المراجعة';
      case 'تم التواصل':
        return 'تم التواصل';
      case 'ملغي':
        return 'ملغي';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'قيد المراجعة':
        return 'pending';
      case 'تمت المراجعة':
        return 'approved';
      case 'تم التواصل':
        return 'contacted';
      case 'ملغي':
        return 'rejected';
      default:
        return 'unknown';
    }
  };

  const getStatusMessagePlaceholder = (status) => {
    switch (status) {
      case 'تمت المراجعة':
        return 'اكتب رسالة للمهتم توضح الخطوات القادمة...';
      case 'تم التواصل':
        return 'اكتب ملاحظات حول عملية التواصل...';
      case 'ملغي':
        return 'اكتب سبب إلغاء طلب الاهتمام...';
      case 'قيد المراجعة':
        return 'اكتب ملاحظات إضافية حول المراجعة...';
      default:
        return 'اكتب ملاحظات إضافية...';
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
        onClick={() => currentPage > 1 && setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
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
            onClick={() => setPagination(prev => ({ ...prev, current_page: page }))}
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
        onClick={() => currentPage < lastPage && setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
        disabled={currentPage === lastPage}
      >
        <FiChevronLeft />
      </button>
    );

    return pages;
  };

  // التحقق إذا كان هناك أي فلتر نشط
  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.property_id !== 'all' || filters.date_from || filters.date_to;

  return (
    <div className="pending-users-container">
      <div className="content-header">
        <h1>
          <FiHeart className="header-icon" />
          إدارة طلبات الاهتمام
        </h1>
        <p>عرض وإدارة جميع طلبات الاهتمام بالعقارات - العدد الإجمالي: {pagination.total}</p>
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
              placeholder="ابحث بالاسم أو البريد الإلكتروني أو الرسالة..."
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
            <label>الحالة:</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع الحالات</option>
              {filtersData.status_options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>العقار:</label>
            <select 
              value={filters.property_id} 
              onChange={(e) => handleFilterChange('property_id', e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع العقارات</option>
              {filtersData.properties.map(property => (
                <option key={property.id} value={property.id}>{property.title}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>من تاريخ:</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="filter-select"
            />
          </div>

          <div className="filter-group">
            <label>إلى تاريخ:</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
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
              <option value="created_at">تاريخ الاهتمام</option>
              <option value="full_name">اسم المستخدم</option>
              <option value="status">الحالة</option>
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
          {/* Interests List */}
          <div className="users-list">
            <div className="list-header">
              <h3>قائمة طلبات الاهتمام ({interests.length})</h3>
              <span className="page-info">
                {pagination.total > 0 ? (
                  <>عرض {pagination.from} إلى {pagination.to} من {pagination.total} - الصفحة {pagination.current_page} من {pagination.last_page}</>
                ) : (
                  'لا توجد نتائج'
                )}
              </span>
            </div>
            
            {listLoading ? (
              <div className="list-loading">
                <div className="loading-spinner"></div>
                <p>جاري تحميل طلبات الاهتمام...</p>
              </div>
            ) : interests.length === 0 ? (
              <div className="empty-state">
                <FiHeart className="empty-icon" />
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
                  {interests.map((interest) => (
                    <div 
                      key={interest.id} 
                      className={`user-card ${selectedInterest?.id === interest.id ? 'active' : ''}`}
                      onClick={() => setSelectedInterest(interest)}
                    >
                      <div className="user-avatar">
                        <FiUser />
                      </div>
                      <div className="user-info">
                        <h4>{interest.full_name}</h4>
                        <span className="user-type">{interest.property?.title}</span>
                        <span className="user-date">
                          <FiCalendar />
                          {formatDate(interest.created_at)}
                        </span>
                        <div className="user-message-preview">
                          <FiMessageSquare />
                          {interest.message?.substring(0, 50)}...
                        </div>
                      </div>
                      <div className={`user-status ${getStatusColor(interest.status)}`}>
                        {getStatusText(interest.status)}
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

          {/* Interest Details */}
          <div className="user-details">
            {selectedInterest ? (
              <div className="details-card">
                <div className="details-header">
                  <h3>تفاصيل طلب الاهتمام</h3>
                  <span className="user-id">ID: {selectedInterest.id}</span>
                </div>
                
                <div className="details-content">
                  <div className="detail-item">
                    <div className="detail-label">
                      <FiUser />
                      اسم المهتم
                    </div>
                    <div className="detail-value">{selectedInterest.full_name}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiMail />
                      البريد الإلكتروني
                    </div>
                    <div className="detail-value">{selectedInterest.email}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiPhone />
                      رقم الهاتف
                    </div>
                    <div className="detail-value">{selectedInterest.phone}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiHome />
                      العقار المهتم به
                    </div>
                    <div className="detail-value">
                      <span className="property-badge">
                        {selectedInterest.property?.title}
                      </span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      الحالة
                    </div>
                    <div className="detail-value">
                      {getStatusBadge(selectedInterest.status)}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiCalendar />
                      تاريخ الاهتمام
                    </div>
                    <div className="detail-value">{formatDate(selectedInterest.created_at)}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiCalendar />
                      آخر تحديث
                    </div>
                    <div className="detail-value">{formatDate(selectedInterest.updated_at)}</div>
                  </div>

                  <div className="detail-item full-width">
                    <div className="detail-label">
                      <FiMessageSquare />
                      رسالة المهتم
                    </div>
                    <div className="detail-value message-text">{selectedInterest.message}</div>
                  </div>

                  {selectedInterest.admin_notes && (
                    <div className="detail-item full-width">
                      <div className="detail-label">
                        <FiEdit />
                        ملاحظات المسؤول
                      </div>
                      <div className="detail-value admin-notes">{selectedInterest.admin_notes}</div>
                    </div>
                  )}
                </div>

                <div className="details-actions">
                  <div className="status-actions">
                    <button 
                      className="btn btn-success"
                      onClick={() => openStatusModal(selectedInterest.id, 'تمت المراجعة')}
                      disabled={selectedInterest.status === 'تمت المراجعة'}
                    >
                      <FiCheck />
                      تمت المراجعة
                    </button>
                    
                    {/* <button 
                      className="btn btn-info"
                      onClick={() => openStatusModal(selectedInterest.id, 'تم التواصل')}
                      disabled={selectedInterest.status === 'تم التواصل'}
                    >
                      <FiPhone />
                      تم التواصل
                    </button> */}
                    
                    <button 
                      className="btn btn-warning"
                      onClick={() => openStatusModal(selectedInterest.id, 'قيد المراجعة')}
                      disabled={selectedInterest.status === 'قيد المراجعة'}
                    >
                      <FiFileText />
                      قيد المراجعة
                    </button>
                    
                    <button 
                      className="btn btn-danger"
                      onClick={() => openStatusModal(selectedInterest.id, 'ملغي')}
                      disabled={selectedInterest.status === 'ملغي'}
                    >
                      <FiX />
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <FiHeart className="no-selection-icon" />
                <p>اختر طلب اهتمام لعرض التفاصيل</p>
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
                تغيير حالة الاهتمام
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
                <label>رسالة / ملاحظات إضافية</label>
                <textarea
                  value={statusModal.adminNote}
                  onChange={(e) => setStatusModal(prev => ({
                    ...prev,
                    adminNote: e.target.value
                  }))}
                  className="form-input"
                  rows="4"
                  placeholder={getStatusMessagePlaceholder(statusModal.newStatus)}
                />
                <div className="form-hint">
                  هذه الرسالة ستظهر للمستخدم كتفسير لتغيير الحالة
                </div>
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

export default AllInterests;