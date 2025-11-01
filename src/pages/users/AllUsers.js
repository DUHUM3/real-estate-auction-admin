import React, { useState, useEffect } from 'react';
import { FiUser, FiUsers, FiCheck, FiRefreshCw, FiX, FiMail, FiPhone, FiCalendar, FiFileText, FiHash, FiFilter, FiChevronRight, FiChevronLeft, FiSearch, FiSlash, FiEdit, FiCopy } from 'react-icons/fi';
import '../../styles/PendingUsers.css';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import { useNavigate, useLocation } from 'react-router-dom';

const AllUsers = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  
  // استرجاع الفلاتر المحفوظة أو استخدام القيم الافتراضية
  const getInitialFilters = () => {
    const savedFilters = localStorage.getItem('usersFilters');
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return {
      search: '',
      status: 'all',
      user_type_id: 'all',
      sort_field: 'created_at',
      sort_direction: 'desc'
    };
  };
  
  const [filters, setFilters] = useState(getInitialFilters());
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('usersCurrentPage');
    return savedPage ? parseInt(savedPage) : 1;
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copyStatus, setCopyStatus] = useState({}); // حالة نسخ البيانات

  // حالة المودال للرفض
  const [rejectModal, setRejectModal] = useState({
    show: false,
    userId: null,
    adminMessage: ''
  });
  
  // حفظ الفلاتر والصفحة في localStorage عند تغييرها
  useEffect(() => {
    localStorage.setItem('usersFilters', JSON.stringify(filters));
  }, [filters]);
  
  useEffect(() => {
    localStorage.setItem('usersCurrentPage', currentPage.toString());
  }, [currentPage]);
  
  // استعادة المستخدم المحدد من localStorage إذا كان موجوداً
  useEffect(() => {
    const savedSelectedUser = localStorage.getItem('selectedUser');
    if (savedSelectedUser) {
      setSelectedUser(JSON.parse(savedSelectedUser));
    }
  }, []);
  
  // حفظ المستخدم المحدد في localStorage
  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem('selectedUser', JSON.stringify(selectedUser));
    } else {
      localStorage.removeItem('selectedUser');
    }
  }, [selectedUser]);

  // دالة نسخ النص إلى الحافظة
  const copyToClipboard = async (text, fieldName) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text.toString());
      
      // تحديث حالة النسخ
      setCopyStatus(prev => ({
        ...prev,
        [fieldName]: true
      }));
      
      // إخفاء رسالة النجاح بعد 2 ثانية
      setTimeout(() => {
        setCopyStatus(prev => ({
          ...prev,
          [fieldName]: false
        }));
      }, 2000);
      
    } catch (err) {
      console.error('فشل في نسخ النص: ', err);
      // استخدام الطريقة القديمة كبديل
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopyStatus(prev => ({
        ...prev,
        [fieldName]: true
      }));
      
      setTimeout(() => {
        setCopyStatus(prev => ({
          ...prev,
          [fieldName]: false
        }));
      }, 2000);
    }
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (filters.search.trim()) params.append('search', filters.search.trim());
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.user_type_id !== 'all') params.append('user_type_id', filters.user_type_id);
    if (filters.sort_field) params.append('sort_field', filters.sort_field);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);
    
    params.append('page', currentPage);
    
    return params.toString();
  };

  // استخدام React Query لجلب البيانات
  const fetchUsers = async () => {
    const token = localStorage.getItem('access_token');
      
    if (!token) {
      navigate('/login');
      throw new Error('لم يتم العثور على رمز الدخول');
    }

    const queryString = buildQueryString();
    const url = `https://shahin-tqay.onrender.com/api/admin/users?${queryString}`;

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
      throw new Error(`فشل في جلب المستخدمين: ${errorText}`);
    }

    const result = await response.json();
    return result;
  };

  const { data: usersData, isLoading, error, refetch } = useQuery(
    ['users', filters, currentPage],
    fetchUsers,
    {
      staleTime: 5 * 60 * 1000, // 5 دقائق
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('خطأ في جلب المستخدمين:', error);
        alert('حدث خطأ أثناء جلب البيانات: ' + error.message);
      }
    }
  );

  const handleRefresh = async () => {
    console.log('بدء تحديث البيانات...');
    setIsRefreshing(true);
    setActionLoading(true);
    
    try {
      await refetch();
    } catch (error) {
      console.error('خطأ في التحديث:', error);
      alert('حدث خطأ أثناء تحديث البيانات: ' + error.message);
    } finally {
      setIsRefreshing(false);
      setActionLoading(false);
    }
  };

  // فتح مودال الرفض
  const openRejectModal = (userId) => {
    setRejectModal({
      show: true,
      userId,
      adminMessage: ''
    });
  };

  // إغلاق مودال الرفض
  const closeRejectModal = () => {
    setRejectModal({
      show: false,
      userId: null,
      adminMessage: ''
    });
  };

  // تنفيذ عمليات الموافقة والرفض باستخدام useMutation
  const approveMutation = useMutation(
    async (userId) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في قبول المستخدم');
      }

      return await response.json();
    },
    {
      onSuccess: () => {
        alert('تم قبول المستخدم بنجاح');
        refetch(); // إعادة تحميل البيانات
        setSelectedUser(null);
      },
      onError: (error) => {
        alert(error.message);
      }
    }
  );

  const rejectMutation = useMutation(
    async ({ userId, adminMessage }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          admin_message: adminMessage
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في رفض المستخدم');
      }

      return await response.json();
    },
    {
      onSuccess: () => {
        alert('تم رفض المستخدم بنجاح');
        refetch(); // إعادة تحميل البيانات
        setSelectedUser(null);
        closeRejectModal();
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
    
    // إعادة ضبط الصفحة عند تغيير الفلاتر
    if (key !== 'page' && currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const clearFilters = () => {
    const defaultFilters = {
      search: '',
      status: 'all',
      user_type_id: 'all',
      sort_field: 'created_at',
      sort_direction: 'desc'
    };
    
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('هل أنت متأكد من قبول هذا المستخدم؟')) {
      return;
    }
    approveMutation.mutate(userId);
  };

  const handleReject = async () => {
    if (!rejectModal.adminMessage.trim()) {
      alert('يرجى إدخال سبب الرفض');
      return;
    }

    if (!window.confirm('هل أنت متأكد من رفض هذا المستخدم؟')) {
      return;
    }
    
    rejectMutation.mutate({
      userId: rejectModal.userId,
      adminMessage: rejectModal.adminMessage
    });
  };

  // تحديث الصفحة الحالية
  const updatePagination = (newPage) => {
    setCurrentPage(newPage);
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

  // دالة محسنة لاستخراج نوع المستخدم من البيانات
  const getUserTypeName = (user) => {
    return user.user_type?.type_name || 'مستخدم عام';
  };

  // دالة محسنة لاستخراج التفاصيل الإضافية بناءً على نوع المستخدم
  const getUserDetails = (user) => {
    if (user.user_type_id === 2 && user.land_owner) {
      return user.land_owner;
    }
    if (user.user_type_id === 3 && user.auction_company) {
      return user.auction_company;
    }
    if (user.user_type_id === 4 && user.real_estate_broker) {
      return user.real_estate_broker;
    }
    if (user.user_type_id === 5 && user.legal_agent) {
      return user.legal_agent;
    }
    if (user.user_type_id === 6 && user.business_entity) {
      return user.business_entity;
    }
    return null;
  };

  // دالة محسنة لعرض تفاصيل المستخدم مع إضافة أيقونات النسخ
  const renderUserDetails = (user) => {
    const userDetails = getUserDetails(user);
    const userTypeName = getUserTypeName(user);

    if (!userDetails) {
      return (
        <div className="no-details">
          <FiFileText className="no-details-icon" />
          <p>لا توجد تفاصيل إضافية</p>
        </div>
      );
    }

    switch (user.user_type_id) {
      case 2: // مالك أرض
        return (
          <div className="additional-details">
            <h4>تفاصيل مالك الأرض</h4>
            <div className="detail-item">
              <div className="detail-label">
                <FiFileText />
                رقم الهوية
              </div>
              <div className="detail-value-with-copy">
                <span>{userDetails.national_id || 'غير محدد'}</span>
                {userDetails.national_id && (
                  <button 
                    className={`copy-btn ${copyStatus['land_owner_national_id'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(userDetails.national_id, 'land_owner_national_id')}
                    title="نسخ رقم الهوية"
                  >
                    <FiCopy />
                    {copyStatus['land_owner_national_id'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      case 3: // شركة مزادات
        return (
          <div className="additional-details">
            <h4>تفاصيل شركة المزادات</h4>
            <div className="detail-item">
              <div className="detail-label">
                <FiHash />
                السجل التجاري
              </div>
              <div className="detail-value-with-copy">
                <span>{userDetails.commercial_register || 'غير محدد'}</span>
                {userDetails.commercial_register && (
                  <button 
                    className={`copy-btn ${copyStatus['auction_commercial_register'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(userDetails.commercial_register, 'auction_commercial_register')}
                    title="نسخ السجل التجاري"
                  >
                    <FiCopy />
                    {copyStatus['auction_commercial_register'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <FiFileText />
                اسم المزاد
              </div>
              <div className="detail-value-with-copy">
                <span>{userDetails.auction_name || 'غير محدد'}</span>
                {userDetails.auction_name && (
                  <button 
                    className={`copy-btn ${copyStatus['auction_name'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(userDetails.auction_name, 'auction_name')}
                    title="نسخ اسم المزاد"
                  >
                    <FiCopy />
                    {copyStatus['auction_name'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <FiHash />
                رقم الرخصة
              </div>
              <div className="detail-value-with-copy">
                <span>{userDetails.license_number || 'غير محدد'}</span>
                {userDetails.license_number && (
                  <button 
                    className={`copy-btn ${copyStatus['auction_license'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(userDetails.license_number, 'auction_license')}
                    title="نسخ رقم الرخصة"
                  >
                    <FiCopy />
                    {copyStatus['auction_license'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      case 4: // وسيط عقاري
        return (
          <div className="additional-details">
            <h4>تفاصيل الوسيط العقاري</h4>
            <div className="detail-item">
              <div className="detail-label">
                <FiHash />
                رقم الرخصة
              </div>
              <div className="detail-value-with-copy">
                <span>{userDetails.license_number || 'غير محدد'}</span>
                {userDetails.license_number && (
                  <button 
                    className={`copy-btn ${copyStatus['broker_license'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(userDetails.license_number, 'broker_license')}
                    title="نسخ رقم الرخصة"
                  >
                    <FiCopy />
                    {copyStatus['broker_license'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <FiFileText />
                رقم الهوية
              </div>
              <div className="detail-value-with-copy">
                <span>{userDetails.national_id || 'غير محدد'}</span>
                {userDetails.national_id && (
                  <button 
                    className={`copy-btn ${copyStatus['broker_national_id'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(userDetails.national_id, 'broker_national_id')}
                    title="نسخ رقم الهوية"
                  >
                    <FiCopy />
                    {copyStatus['broker_national_id'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      case 5: // وكيل شرعي
        return (
          <div className="additional-details">
            <h4>تفاصيل الوكيل الشرعي</h4>
            <div className="detail-item">
              <div className="detail-label">
                <FiHash />
                رقم الوكالة
              </div>
              <div className="detail-value-with-copy">
                <span>{userDetails.agency_number || 'غير محدد'}</span>
                {userDetails.agency_number && (
                  <button 
                    className={`copy-btn ${copyStatus['agent_agency'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(userDetails.agency_number, 'agent_agency')}
                    title="نسخ رقم الوكالة"
                  >
                    <FiCopy />
                    {copyStatus['agent_agency'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <FiFileText />
                رقم الهوية
              </div>
              <div className="detail-value-with-copy">
                <span>{userDetails.national_id || 'غير محدد'}</span>
                {userDetails.national_id && (
                  <button 
                    className={`copy-btn ${copyStatus['agent_national_id'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(userDetails.national_id, 'agent_national_id')}
                    title="نسخ رقم الهوية"
                  >
                    <FiCopy />
                    {copyStatus['agent_national_id'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
          </div>
        );

      case 6: // جهة تجارية
        return (
          <div className="additional-details">
            <h4>تفاصيل الجهة التجارية</h4>
            <div className="detail-item">
              <div className="detail-label">
                <FiHash />
                السجل التجاري
              </div>
              <div className="detail-value-with-copy">
                <span>{userDetails.commercial_register || 'غير محدد'}</span>
                {userDetails.commercial_register && (
                  <button 
                    className={`copy-btn ${copyStatus['business_commercial_register'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(userDetails.commercial_register, 'business_commercial_register')}
                    title="نسخ السجل التجاري"
                  >
                    <FiCopy />
                    {copyStatus['business_commercial_register'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <FiFileText />
                اسم المنشأة
              </div>
              <div className="detail-value-with-copy">
                <span>{userDetails.business_name || 'غير محدد'}</span>
                {userDetails.business_name && (
                  <button 
                    className={`copy-btn ${copyStatus['business_name'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(userDetails.business_name, 'business_name')}
                    title="نسخ اسم المنشأة"
                  >
                    <FiCopy />
                    {copyStatus['business_name'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
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
              <div className="detail-value-with-copy">
                <span>{userDetails.national_id || 'غير محدد'}</span>
                {userDetails.national_id && (
                  <button 
                    className={`copy-btn ${copyStatus['default_national_id'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(userDetails.national_id, 'default_national_id')}
                    title="نسخ رقم الهوية"
                  >
                    <FiCopy />
                    {copyStatus['default_national_id'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  // إنشاء أزرار الباجينيشن
  const renderPagination = () => {
    if (!usersData || !usersData.pagination || usersData.pagination.last_page <= 1) return null;

    const pages = [];
    const pagination = usersData.pagination;
    
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
    
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(pagination.last_page - 1, currentPage + 1); i++) {
      showPages.push(i);
    }
    
    if (currentPage < pagination.last_page - 2) {
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
        className={`pagination-btn ${currentPage === pagination.last_page ? 'disabled' : ''}`}
        onClick={() => currentPage < pagination.last_page && updatePagination(currentPage + 1)}
        disabled={currentPage === pagination.last_page}
      >
        <FiChevronLeft />
      </button>
    );

    return pages;
  };

  // التحقق إذا كان هناك أي فلتر نشط
  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.user_type_id !== 'all';
  const loading = isLoading || actionLoading || approveMutation.isLoading || rejectMutation.isLoading;
  
  // استخراج البيانات من نتيجة الاستعلام
  const users = usersData?.data || [];
  const pagination = usersData?.pagination || {
    current_page: currentPage,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  };

  return (
    <div className="pending-users-container">
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
            <button 
              type="button"
              className="dashboard-refresh-btn" 
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
            >
              <FiRefreshCw className={isRefreshing ? 'spinning' : ''} />
              {isRefreshing ? 'جاري التحديث...' : 'تحديث البيانات'}
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
              <h3>قائمة المستخدمين ({pagination.total || users.length})</h3>
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
                <p className="dashboard-loading-text">جاري تحميل البيانات...</p>
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
                        <span className="user-type">{getUserTypeName(user)}</span>
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
                    <div className="detail-value-with-copy">
                      <span>{selectedUser.full_name}</span>
                      <button 
                        className={`copy-btn ${copyStatus['full_name'] ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(selectedUser.full_name, 'full_name')}
                        title="نسخ الاسم الكامل"
                      >
                        <FiCopy />
                        {copyStatus['full_name'] && <span className="copy-tooltip">تم النسخ!</span>}
                      </button>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiMail />
                      البريد الإلكتروني
                    </div>
                    <div className="detail-value-with-copy">
                      <span>{selectedUser.email}</span>
                      <button 
                        className={`copy-btn ${copyStatus['email'] ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(selectedUser.email, 'email')}
                        title="نسخ البريد الإلكتروني"
                      >
                        <FiCopy />
                        {copyStatus['email'] && <span className="copy-tooltip">تم النسخ!</span>}
                      </button>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiPhone />
                      رقم الهاتف
                    </div>
                    <div className="detail-value-with-copy">
                      <span>{selectedUser.phone}</span>
                      <button 
                        className={`copy-btn ${copyStatus['phone'] ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(selectedUser.phone, 'phone')}
                        title="نسخ رقم الهاتف"
                      >
                        <FiCopy />
                        {copyStatus['phone'] && <span className="copy-tooltip">تم النسخ!</span>}
                      </button>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      نوع المستخدم
                    </div>
                    <div className="detail-value">
                      <span className={`user-type-badge ${getUserTypeName(selectedUser).replace(/\s+/g, '-')}`}>
                        {getUserTypeName(selectedUser)}
                      </span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiCalendar />
                      تاريخ التسجيل
                    </div>
                    <div className="detail-value-with-copy">
                      <span>{formatDate(selectedUser.created_at)}</span>
                      <button 
                        className={`copy-btn ${copyStatus['created_at'] ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(formatDate(selectedUser.created_at), 'created_at')}
                        title="نسخ تاريخ التسجيل"
                      >
                        <FiCopy />
                        {copyStatus['created_at'] && <span className="copy-tooltip">تم النسخ!</span>}
                      </button>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      الحالة
                    </div>
                    <div className="detail-value">
                      {getStatusBadge(selectedUser.status)}
                    </div>
                  </div>

                  {selectedUser.admin_message && selectedUser.status === 'rejected' && (
                    <div className="detail-item">
                      <div className="detail-label">
                        <FiFileText />
                        سبب الرفض
                      </div>
                      <div className="detail-value-with-copy admin-message">
                        <span>{selectedUser.admin_message}</span>
                        <button 
                          className={`copy-btn ${copyStatus['admin_message'] ? 'copied' : ''}`}
                          onClick={() => copyToClipboard(selectedUser.admin_message, 'admin_message')}
                          title="نسخ سبب الرفض"
                        >
                          <FiCopy />
                          {copyStatus['admin_message'] && <span className="copy-tooltip">تم النسخ!</span>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Additional Details Based on User Type */}
                  {renderUserDetails(selectedUser)}
                </div>

                <div className="details-actions">
                  {selectedUser.status === 'pending' && (
                    <>
                      <button 
                        className="btn btn-success"
                        onClick={() => handleApprove(selectedUser.id)}
                        disabled={loading}
                      >
                        <FiCheck />
                        {loading ? 'جاري المعالجة...' : 'قبول المستخدم'}
                      </button>
                      
                      <button 
                        className="btn btn-danger"
                        onClick={() => openRejectModal(selectedUser.id)}
                        disabled={loading}
                      >
                        <FiX />
                        {loading ? 'جاري المعالجة...' : 'رفض المستخدم'}
                      </button>
                    </>
                  )}
                  {selectedUser.status === 'approved' && (
                    <button 
                      className="btn btn-danger"
                      onClick={() => openRejectModal(selectedUser.id)}
                      disabled={loading}
                    >
                      <FiX />
                      {loading ? 'جاري المعالجة...' : 'رفض المستخدم'}
                    </button>
                  )}
                  {selectedUser.status === 'rejected' && (
                    <button 
                      className="btn btn-success"
                      onClick={() => handleApprove(selectedUser.id)}
                      disabled={loading}
                    >
                      <FiCheck />
                      {loading ? 'جاري المعالجة...' : 'قبول المستخدم'}
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

      {/* مودال الرفض */}
      {rejectModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <FiEdit />
                رفض المستخدم
              </h3>
              <button 
                className="close-btn"
                onClick={closeRejectModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>سبب الرفض</label>
                <textarea
                  value={rejectModal.adminMessage}
                  onChange={(e) => setRejectModal(prev => ({
                    ...prev,
                    adminMessage: e.target.value
                  }))}
                  className="form-input"
                  rows="4"
                  placeholder="اكتب سبب رفض المستخدم هنا..."
                />
                <div className="form-hint">
                  هذا السبب سيظهر للمستخدم كتفسير لرفض طلبه
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={closeRejectModal}
                disabled={loading}
              >
                إلغاء
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleReject}
                disabled={loading}
              >
                <FiX />
                {loading ? 'جاري الحفظ...' : 'تأكيد الرفض'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;