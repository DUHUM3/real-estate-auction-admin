import React, { useState, useEffect } from 'react';
import { FiUser, FiUsers, FiCheck,FiRefreshCw, FiX, FiMail, FiPhone, FiCalendar, FiFileText, FiHash, FiFilter, FiChevronRight, FiChevronLeft, FiSearch, FiSlash } from 'react-icons/fi';
import '../../styles/PendingUsers.css';
import { useData } from '../../contexts/DataContext';

const AllUsers = () => {
  const { state, dispatch } = useData();
  const [localLoading, setLocalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // استخدام البيانات من Context
  const users = state.users.data || [];
  const pagination = state.users.pagination || {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  };
  const filters = state.users.filters;

  useEffect(() => {
    // إذا البيانات غير موجودة أو قديمة، قم بجلبها
    if (!state.users.data || state.users.data.length === 0 || isUsersDataStale()) {
      fetchAllUsers();
    }
  }, [filters, pagination.current_page]);

  const isUsersDataStale = () => {
    if (!state.users.lastUpdated) return true;
    const now = new Date();
    const lastUpdate = new Date(state.users.lastUpdated);
    const diffInMinutes = (now - lastUpdate) / (1000 * 60);
    return diffInMinutes > 10; // تحديث إذا مرت أكثر من 10 دقائق
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (filters.search.trim()) params.append('search', filters.search.trim());
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.user_type_id !== 'all') params.append('user_type_id', filters.user_type_id);
    if (filters.sort_field) params.append('sort_field', filters.sort_field);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);
    
    params.append('page', pagination.current_page);
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  const fetchAllUsers = async (forceRefresh = false) => {
    // إذا البيانات موجودة وليست forced refresh، لا تعيد الجلب
    if (state.users.data && state.users.data.length > 0 && !forceRefresh && !isUsersDataStale()) {
      return;
    }

    try {
      dispatch({ type: 'SET_USERS_LOADING', payload: true });
      setLocalLoading(true);
      
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
        window.location.href = '/login';
        return;
      }

      const queryString = buildQueryString();
      const url = `https://shahin-tqay.onrender.com/api/admin/users${queryString}`;

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
        
        if (result.success && result.data) {
          dispatch({
            type: 'SET_USERS_DATA',
            payload: {
              data: result.data,
              pagination: result.pagination || {
                current_page: 1,
                last_page: 1,
                per_page: 10,
                total: result.data.length,
                from: 1,
                to: result.data.length
              },
              filters: filters
            }
          });
        } else {
          console.error('هيكل البيانات غير متوقع:', result);
          dispatch({
            type: 'SET_USERS_DATA',
            payload: {
              data: [],
              pagination: {
                current_page: 1,
                last_page: 1,
                per_page: 10,
                total: 0,
                from: 0,
                to: 0
              },
              filters: filters
            }
          });
        }
      } else {
        const errorText = await response.text();
        console.error('فشل في جلب المستخدمين:', errorText);
        alert('فشل في جلب بيانات المستخدمين');
      }
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
      alert('حدث خطأ أثناء جلب البيانات: ' + error.message);
    } finally {
      dispatch({ type: 'SET_USERS_LOADING', payload: false });
      setLocalLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    
    dispatch({ type: 'UPDATE_USERS_FILTERS', payload: newFilters });
    
    // تحديث الباجينيشن في الـ state المحلي
    if (pagination.current_page !== 1) {
      // سنقوم بتحديث الباجينيشن في fetchAllUsers
      fetchAllUsers();
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAllUsers();
  };

  const clearFilters = () => {
    const defaultFilters = {
      search: '',
      status: 'all',
      user_type_id: 'all',
      sort_field: 'created_at',
      sort_direction: 'desc',
      page: 1
    };
    
    dispatch({ type: 'UPDATE_USERS_FILTERS', payload: defaultFilters });
    fetchAllUsers();
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('هل أنت متأكد من قبول هذا المستخدم؟')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // إعادة جلب البيانات لتحديث القائمة
        fetchAllUsers(true); // forced refresh
        setSelectedUser(null);
        alert('تم قبول المستخدم بنجاح');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'فشل في قبول المستخدم');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('حدث خطأ أثناء قبول المستخدم');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا المستخدم؟')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // إعادة جلب البيانات لتحديث القائمة
        fetchAllUsers(true); // forced refresh
        setSelectedUser(null);
        alert('تم رفض المستخدم بنجاح');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'فشل في رفض المستخدم');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('حدث خطأ أثناء رفض المستخدم');
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
      case 'pending':
        return <span className="status-badge pending">قيد المراجعة</span>;
      case 'approved':
        return <span className="status-badge approved">مقبول</span>;
      case 'rejected':
        return <span className="status-badge rejected">مرفوض</span>;
      default:
        return <span className="status-badge unknown">غير معروف</span>;
    }
  };
  const getUserStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'قيد المراجعة';
      case 'approved':
        return 'مقبول';
      case 'rejected':
        return 'مرفوض';
      default:
        return 'غير معروف';
    }
  };

  const renderUserDetails = (user) => {
    if (!user.details) {
      return (
        <div className="no-details">
          <FiFileText className="no-details-icon" />
          <p>لا توجد تفاصيل إضافية</p>
        </div>
      );
    }

    switch (user.user_type) {
      case 'وكيل شرعي':
        return (
          <div className="additional-details">
            <h4>تفاصيل الوكيل الشرعي</h4>
            <div className="detail-item">
              <div className="detail-label">
                <FiHash />
                رقم الوكالة
              </div>
              <div className="detail-value">{user.details.agency_number || 'غير محدد'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <FiFileText />
                رقم الهوية
              </div>
              <div className="detail-value">{user.details.national_id || 'غير محدد'}</div>
            </div>
          </div>
        );

      case 'وسيط عقاري':
        return (
          <div className="additional-details">
            <h4>تفاصيل الوسيط العقاري</h4>
            <div className="detail-item">
              <div className="detail-label">
                <FiHash />
                رقم الرخصة
              </div>
              <div className="detail-value">{user.details.license_number || 'غير محدد'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <FiFileText />
                رقم الهوية
              </div>
              <div className="detail-value">{user.details.national_id || 'غير محدد'}</div>
            </div>
          </div>
        );

      case 'مالك أرض':
        return (
          <div className="additional-details">
            <h4>تفاصيل مالك الأرض</h4>
            <div className="detail-item">
              <div className="detail-label">
                <FiFileText />
                رقم الهوية
              </div>
              <div className="detail-value">{user.details.national_id || 'غير محدد'}</div>
            </div>
          </div>
        );

      case 'جهة تجارية':
        return (
          <div className="additional-details">
            <h4>تفاصيل الجهة التجارية</h4>
            <div className="detail-item">
              <div className="detail-label">
                <FiHash />
                السجل التجاري
              </div>
              <div className="detail-value">{user.details.commercial_register || 'غير محدد'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <FiFileText />
                اسم المنشأة
              </div>
              <div className="detail-value">{user.details.business_name || 'غير محدد'}</div>
            </div>
          </div>
        );

      case 'شركة مزادات':
        return (
          <div className="additional-details">
            <h4>تفاصيل شركة المزادات</h4>
            <div className="detail-item">
              <div className="detail-label">
                <FiHash />
                السجل التجاري
              </div>
              <div className="detail-value">{user.details.commercial_register || 'غير محدد'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <FiFileText />
                اسم المزاد
              </div>
              <div className="detail-value">{user.details.auction_name || 'غير محدد'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <FiHash />
                رقم الرخصة
              </div>
              <div className="detail-value">{user.details.license_number || 'غير محدد'}</div>
            </div>
          </div>
        );

      default:
        return (
          <div className="additional-details">
            <h4>تفاصيل إضافية</h4>
            <div className="detail-item">
              <div className="detail-label">
                <FiFileText />
                رقم الهوية
              </div>
              <div className="detail-value">{user.details.national_id || 'غير محدد'}</div>
            </div>
          </div>
        );
    }
  };

  // إنشاء أزرار الباجينيشن
 const renderPagination = () => {
    if (pagination.last_page <= 1) return null;

    const pages = [];
    const currentPage = pagination.current_page;
    const lastPage = pagination.last_page;
    
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
    showPages.push(1);
    
    if (currentPage > 3) {
      showPages.push('ellipsis-start');
    }
    
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(lastPage - 1, currentPage + 1); i++) {
      showPages.push(i);
    }
    
    if (currentPage < lastPage - 2) {
      showPages.push('ellipsis-end');
    }
    
    if (lastPage > 1) {
      showPages.push(lastPage);
    }
    
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
  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.user_type_id !== 'all';
  const loading = state.users.isLoading || localLoading;

   return (
    <div className="pending-users-container">
      <div className="content-header">
        <h1>
          <FiUsers className="header-icon" />
          إدارة جميع المستخدمين
        </h1>
        <p>عرض وإدارة جميع المستخدمين في النظام - العدد الإجمالي: {pagination.total}</p>
      <div className="dashboard-header-actions">
        <button 
          className="dashboard-refresh-btn" 
          onClick={() => fetchAllUsers(true)}
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
              placeholder="ابحث بالاسم أو البريد الإلكتروني..."
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
              <option value="pending">قيد المراجعة</option>
              <option value="approved">مقبول</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>

          <div className="filter-group">
            <label>نوع المستخدم:</label>
            <select 
              value={filters.user_type_id} 
              onChange={(e) => handleFilterChange('user_type_id', e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع الأنواع</option>
              <option value="1">مستخدم عام</option>
              <option value="2">مالك أرض</option>
              <option value="3">شركة مزادات</option>
              <option value="4">وسيط عقاري</option>
              <option value="5">وكيل شرعي</option>
              <option value="6">جهة تجارية</option>
            </select>
          </div>

          <div className="filter-group">
            <label>ترتيب حسب:</label>
            <select 
              value={filters.sort_field} 
              onChange={(e) => handleFilterChange('sort_field', e.target.value)}
              className="filter-select"
            >
              <option value="created_at">تاريخ التسجيل</option>
              <option value="full_name">الاسم</option>
              <option value="email">البريد الإلكتروني</option>
            </select>
          </div>

          <div className="filter-group">
            <label>الاتجاه:</label>
            <select 
              value={filters.sort_direction} 
              onChange={(e) => handleFilterChange('sort_direction', e.target.value)}
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
          {/* Users List */}
          <div className="users-list">
            <div className="list-header">
              <h3>قائمة المستخدمين ({users.length})</h3>
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
          <p>جاري تحميل المستخدمين...</p>
        </div>
            ) : users.length === 0 ? (
              <div className="empty-state">
                <FiUser className="empty-icon" />
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
                  {users.map((user) => (
                    <div 
                      key={user.id} 
                      className={`user-card ${selectedUser?.id === user.id ? 'active' : ''}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="user-avatar">
                        <FiUser />
                      </div>
                      <div className="user-info">
                        <h4>{user.full_name}</h4>
                        <span className="user-type">{user.user_type}</span>
                        <span className="user-date">
                          <FiCalendar />
                          {formatDate(user.created_at)}
                        </span>
                      </div>
                      <div className={`user-status ${user.status}`}>
                        {getUserStatusText(user.status)}
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

          {/* User Details */}
          <div className="user-details">
            {selectedUser ? (
              <div className="details-card">
                <div className="details-header">
                  <h3>تفاصيل المستخدم</h3>
                  <span className="user-id">ID: {selectedUser.id}</span>
                </div>
                
                <div className="details-content">
                  <div className="detail-item">
                    <div className="detail-label">
                      <FiUser />
                      الاسم الكامل
                    </div>
                    <div className="detail-value">{selectedUser.full_name}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiMail />
                      البريد الإلكتروني
                    </div>
                    <div className="detail-value">{selectedUser.email}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiPhone />
                      رقم الهاتف
                    </div>
                    <div className="detail-value">{selectedUser.phone}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      نوع المستخدم
                    </div>
                    <div className="detail-value">
                      <span className={`user-type-badge ${selectedUser.user_type.replace(/\s+/g, '-')}`}>
                        {selectedUser.user_type}
                      </span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiCalendar />
                      تاريخ التسجيل
                    </div>
                    <div className="detail-value">{formatDate(selectedUser.created_at)}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      الحالة
                    </div>
                    <div className="detail-value">
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>

                  {/* Additional Details Based on User Type */}
                  {renderUserDetails(selectedUser)}
                </div>

                <div className="details-actions">
                  {selectedUser.status === 'pending' && (
                    <>
                      <button 
                        className="btn btn-success"
                        onClick={() => handleApprove(selectedUser.id)}
                        disabled={actionLoading}
                      >
                        <FiCheck />
                        {actionLoading ? 'جاري المعالجة...' : 'قبول المستخدم'}
                      </button>
                      
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleReject(selectedUser.id)}
                        disabled={actionLoading}
                      >
                        <FiX />
                        {actionLoading ? 'جاري المعالجة...' : 'رفض المستخدم'}
                      </button>
                    </>
                  )}
                  {selectedUser.status === 'approved' && (
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleReject(selectedUser.id)}
                      disabled={actionLoading}
                    >
                      <FiX />
                      {actionLoading ? 'جاري المعالجة...' : 'رفض المستخدم'}
                    </button>
                  )}
                  {selectedUser.status === 'rejected' && (
                    <button 
                      className="btn btn-success"
                      onClick={() => handleApprove(selectedUser.id)}
                      disabled={actionLoading}
                    >
                      <FiCheck />
                      {actionLoading ? 'جاري المعالجة...' : 'قبول المستخدم'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <FiUser className="no-selection-icon" />
                <p>اختر مستخدمًا لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllUsers;