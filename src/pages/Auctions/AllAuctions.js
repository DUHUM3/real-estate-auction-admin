import React, { useState, useEffect } from 'react';
import { 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiUser, 
  FiVideo, 
  FiImage, 
  FiFilter, 
  FiChevronRight, 
  FiChevronLeft, 
  FiExternalLink, 
  FiSearch, 
  FiSlash, 
  FiCheck, 
  FiX, 
  FiRefreshCw 
} from 'react-icons/fi';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import '../../styles/PendingUsers.css';

const AllAuctions = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // استرجاع الفلاتر المحفوظة أو استخدام القيم الافتراضية
  const getInitialFilters = () => {
    const savedFilters = localStorage.getItem('auctionsFilters');
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return {
      search: '',
      status: 'all',
      region: 'all',
      city: 'all',
      date: '',
      sort_field: 'created_at',
      sort_direction: 'desc'
    };
  };
  
  const [filters, setFilters] = useState(getInitialFilters());
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('auctionsCurrentPage');
    return savedPage ? parseInt(savedPage) : 1;
  });

  // حفظ الفلاتر والصفحة في localStorage عند تغييرها
  useEffect(() => {
    localStorage.setItem('auctionsFilters', JSON.stringify(filters));
  }, [filters]);
  
  useEffect(() => {
    localStorage.setItem('auctionsCurrentPage', currentPage.toString());
  }, [currentPage]);
  
  // استعادة المزاد المحدد من localStorage إذا كان موجوداً
  useEffect(() => {
    const savedSelectedAuction = localStorage.getItem('selectedAuction');
    if (savedSelectedAuction) {
      setSelectedAuction(JSON.parse(savedSelectedAuction));
    }
  }, []);
  
  // حفظ المزاد المحدد في localStorage
  useEffect(() => {
    if (selectedAuction) {
      localStorage.setItem('selectedAuction', JSON.stringify(selectedAuction));
    } else {
      localStorage.removeItem('selectedAuction');
    }
  }, [selectedAuction]);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (filters.search.trim()) params.append('search', filters.search.trim());
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.region !== 'all') params.append('region', filters.region);
    if (filters.city !== 'all') params.append('city', filters.city);
    if (filters.date) params.append('date', filters.date);
    if (filters.sort_field) params.append('sort_field', filters.sort_field);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);
    
    params.append('page', currentPage);
    params.append('per_page', 10);
    
    return params.toString();
  };

  // استخدام React Query لجلب بيانات المزادات
  const fetchAuctions = async () => {
    const token = localStorage.getItem('access_token');
      
    if (!token) {
      navigate('/login');
      throw new Error('لم يتم العثور على رمز الدخول');
    }

    const queryString = buildQueryString();
    const url = `https://shahin-tqay.onrender.com/api/admin/auctions?${queryString}`;

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
      throw new Error(`فشل في جلب المزادات: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return {
        data: result.data.data || result.data || [],
        pagination: result.data || result.pagination || {
          current_page: currentPage,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: 0,
          to: 0
        }
      };
    } else {
      throw new Error(result.message || 'هيكل البيانات غير متوقع');
    }
  };

  const { 
    data: auctionsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery(
    ['auctions', filters, currentPage],
    fetchAuctions,
    {
      staleTime: 5 * 60 * 1000, // 5 دقائق
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('خطأ في جلب المزادات:', error);
        alert('حدث خطأ أثناء جلب البيانات: ' + error.message);
      }
    }
  );

  // استخدام useMutation لعمليات الموافقة والرفض
  const approveMutation = useMutation(
    async (auctionId) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/auctions/${auctionId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في قبول المزاد');
      }

      return await response.json();
    },
    {
      onSuccess: () => {
        alert('تم قبول المزاد بنجاح');
        refetch(); // إعادة تحميل البيانات
        setSelectedAuction(null);
        queryClient.invalidateQueries(['auctions']);
      },
      onError: (error) => {
        alert(error.message);
      }
    }
  );

  const rejectMutation = useMutation(
    async (auctionId) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/auctions/${auctionId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في رفض المزاد');
      }

      return await response.json();
    },
    {
      onSuccess: () => {
        alert('تم رفض المزاد بنجاح');
        refetch(); // إعادة تحميل البيانات
        setSelectedAuction(null);
        queryClient.invalidateQueries(['auctions']);
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
      region: 'all',
      city: 'all',
      date: '',
      sort_field: 'created_at',
      sort_direction: 'desc'
    };
    
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handleApprove = async (auctionId) => {
    if (!window.confirm('هل أنت متأكد من قبول هذا المزاد؟')) {
      return;
    }
    approveMutation.mutate(auctionId);
  };

  const handleReject = async (auctionId) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا المزاد؟')) {
      return;
    }
    rejectMutation.mutate(auctionId);
  };

  // تحديث الصفحة الحالية
  const updatePagination = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'غير محدد';
    return timeString;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'مفتوح':
        return <span className="status-badge open">مفتوح</span>;
      case 'مرفوض':
        return <span className="status-badge rejected">مرفوض</span>;
      case 'مغلق':
        return <span className="status-badge closed">مغلق</span>;
      case 'قيد المراجعة':
        return <span className="status-badge pending">قيد المراجعة</span>;
      default:
        return <span className="status-badge unknown">{status}</span>;
    }
  };

  const getAuctionStatusText = (status) => {
    switch (status) {
      case 'مفتوح':
        return 'مفتوح';
      case 'مرفوض':
        return 'مرفوض';
      case 'مغلق':
        return 'مغلق';
      case 'قيد المراجعة':
        return 'قيد المراجعة';
      default:
        return status || 'غير معروف';
    }
  };

  // دالة لتحديد الأزرار المعروضة بناءً على حالة المزاد
  const renderActionButtons = (auction) => {
    switch (auction.status) {
      case 'قيد المراجعة':
        return (
          <>
            <button 
              className="btn btn-success"
              onClick={() => handleApprove(auction.id)}
              disabled={approveMutation.isLoading || rejectMutation.isLoading}
            >
              <FiCheck />
              {approveMutation.isLoading ? 'جاري المعالجة...' : 'قبول المزاد'}
            </button>
            
            <button 
              className="btn btn-danger"
              onClick={() => handleReject(auction.id)}
              disabled={approveMutation.isLoading || rejectMutation.isLoading}
            >
              <FiX />
              {rejectMutation.isLoading ? 'جاري المعالجة...' : 'رفض المزاد'}
            </button>
          </>
        );
      
      case 'مرفوض':
        return (
          <button 
            className="btn btn-success"
            onClick={() => handleApprove(auction.id)}
            disabled={approveMutation.isLoading || rejectMutation.isLoading}
          >
            <FiCheck />
            {approveMutation.isLoading ? 'جاري المعالجة...' : 'قبول المزاد'}
          </button>
        );
      
      case 'مفتوح':
        return (
          <button 
            className="btn btn-danger"
            onClick={() => handleReject(auction.id)}
            disabled={approveMutation.isLoading || rejectMutation.isLoading}
          >
            <FiX />
            {rejectMutation.isLoading ? 'جاري المعالجة...' : 'رفض المزاد'}
          </button>
        );
      
      case 'مغلق':
        return (
          <div className="no-actions">
            <p>لا يمكن تعديل حالة المزاد المغلق</p>
          </div>
        );
      
      default:
        return (
          <>
            <button 
              className="btn btn-success"
              onClick={() => handleApprove(auction.id)}
              disabled={approveMutation.isLoading || rejectMutation.isLoading}
            >
              <FiCheck />
              {approveMutation.isLoading ? 'جاري المعالجة...' : 'قبول المزاد'}
            </button>
            
            <button 
              className="btn btn-danger"
              onClick={() => handleReject(auction.id)}
              disabled={approveMutation.isLoading || rejectMutation.isLoading}
            >
              <FiX />
              {rejectMutation.isLoading ? 'جاري المعالجة...' : 'رفض المزاد'}
            </button>
          </>
        );
    }
  };

  const renderAuctionDetails = (auction) => {
    return (
      <div className="details-content">
        <div className="detail-item">
          <div className="detail-label">
            العنوان
          </div>
          <div className="detail-value">{auction.title || 'غير محدد'}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiUser />
            الشركة المنظمة
          </div>
          <div className="detail-value">
            {auction.company?.auction_name || auction.company?.user?.full_name || 'غير محدد'}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            البريد الإلكتروني
          </div>
          <div className="detail-value">{auction.company?.user?.email || 'غير محدد'}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            الهاتف
          </div>
          <div className="detail-value">{auction.company?.user?.phone || 'غير محدد'}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            الحالة
          </div>
          <div className="detail-value">
            {getStatusBadge(auction.status)}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiCalendar />
            تاريخ المزاد
          </div>
          <div className="detail-value">{formatDate(auction.auction_date)}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiClock />
            وقت البدء
          </div>
          <div className="detail-value">{formatTime(auction.start_time)}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiMapPin />
            العنوان
          </div>
          <div className="detail-value">{auction.address || 'غير محدد'}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            المنطقة
          </div>
          <div className="detail-value">{auction.region || 'غير محدد'}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            المدينة
          </div>
          <div className="detail-value">{auction.city || 'غير محدد'}</div>
        </div>

        {auction.latitude && auction.longitude && (
          <div className="detail-item">
            <div className="detail-label">
              الإحداثيات
            </div>
            <div className="detail-value">
              {auction.latitude}, {auction.longitude}
            </div>
          </div>
        )}

        {auction.intro_link && (
          <div className="detail-item">
            <div className="detail-label">
              <FiExternalLink />
              رابط التعريف
            </div>
            <div className="detail-value">
              <a href={auction.intro_link} target="_blank" rel="noopener noreferrer" className="link">
                {auction.intro_link}
              </a>
            </div>
          </div>
        )}

        {auction.rejection_reason && (
          <div className="detail-item">
            <div className="detail-label">
              سبب الرفض
            </div>
            <div className="detail-value rejection-reason">{auction.rejection_reason}</div>
          </div>
        )}

        <div className="detail-item">
          <div className="detail-label">
            <FiCalendar />
            تاريخ الإنشاء
          </div>
          <div className="detail-value">{formatDate(auction.created_at)}</div>
        </div>

        <div className="detail-item full-width">
          <div className="detail-label">
            الوصف
          </div>
          <div className="detail-value description-text">{auction.description || 'لا يوجد وصف'}</div>
        </div>

        {/* الصور */}
        {auction.images && auction.images.length > 0 && (
          <div className="images-section">
            <h4>صور المزاد ({auction.images.length})</h4>
            <div className="images-grid">
              {auction.images.map((image, index) => (
                <div key={image.id || index} className="image-item">
                  <FiImage className="image-icon" />
                  <span className="image-name">صورة {index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* الفيديوهات */}
        {auction.videos && auction.videos.length > 0 && (
          <div className="videos-section">
            <h4>فيديوهات المزاد ({auction.videos.length})</h4>
            <div className="videos-grid">
              {auction.videos.map((video, index) => (
                <div key={video.id || index} className="video-item">
                  <FiVideo className="video-icon" />
                  <span className="video-name">فيديو {index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // إنشاء أزرار الباجينيشن
  const renderPagination = () => {
    if (!auctionsData || !auctionsData.pagination || auctionsData.pagination.last_page <= 1) return null;

    const pages = [];
    const pagination = auctionsData.pagination;
    
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
  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.region !== 'all' || 
                          filters.city !== 'all' || filters.date;

  // استخراج البيانات من نتيجة الاستعلام
  const auctions = auctionsData?.data || [];
  const pagination = auctionsData?.pagination || {
    current_page: currentPage,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  };

  const loading = isLoading || approveMutation.isLoading || rejectMutation.isLoading;

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
              placeholder="ابحث باسم المزاد أو الوصف..."
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
            <label>الحالة:</label>
            <select 
              value={filters.status} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع الحالات</option>
              <option value="مفتوح">مفتوح</option>
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="مغلق">مغلق</option>
              <option value="مرفوض">مرفوض</option>
            </select>
          </div>

          <div className="filter-group">
            <label>المنطقة:</label>
            <select 
              value={filters.region} 
              onChange={(e) => handleFilterChange('region', e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع المناطق</option>
              <option value="عدن">عدن</option>
              <option value="صنعاء">صنعاء</option>
              {/* ... باقي المناطق */}
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
              <option value="عدن">عدن</option>
              <option value="صنعاء">صنعاء</option>
              {/* ... باقي المدن */}
            </select>
          </div>

          <div className="filter-group">
            <label>تاريخ المزاد:</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="filter-select"
            />
          </div>

          <div className="filter-group">
            <label>ترتيب حسب:</label>
            <select 
              value={filters.sort_field} 
              onChange={(e) => handleFilterChange('sort_field', e.target.value)}
              className="filter-select"
            >
              <option value="created_at">تاريخ الإنشاء</option>
              <option value="auction_date">تاريخ المزاد</option>
              <option value="title">اسم المزاد</option>
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
          {/* Auctions List */}
          <div className="users-list">
            <div className="list-header">
              <h3>قائمة المزادات ({auctions.length})</h3>
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
            ) : auctions.length === 0 ? (
              <div className="empty-state">
                <FiCalendar className="empty-icon" />
                <p>لا توجد مزادات</p>
                {hasActiveFilters && (
                  <button className="btn btn-primary" onClick={clearFilters}>
                    مسح الفلاتر
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="users-cards">
                  {auctions.map((auction) => (
                    <div 
                      key={auction.id} 
                      className={`user-card ${selectedAuction?.id === auction.id ? 'active' : ''}`}
                      onClick={() => setSelectedAuction(auction)}
                    >
                      <div className="user-avatar auction-avatar">
                        <FiCalendar />
                      </div>
                      <div className="user-info">
                        <h4>{auction.title}</h4>
                        <span className="user-type">{auction.company?.auction_name || 'غير محدد'}</span>
                        <span className="user-date">
                          <FiCalendar />
                          {formatDate(auction.auction_date)} - {formatTime(auction.start_time)}
                        </span>
                        <div className="auction-address">
                          <FiMapPin />
                          {auction.address || 'غير محدد'}
                        </div>
                        {auction.region && (
                          <div className="auction-region">
                            <FiMapPin />
                            {auction.region}
                          </div>
                        )}
                      </div>
                      <div className="user-status-container">
                        <div className={`user-status ${auction.status?.replace(/\s+/g, '-') || 'unknown'}`}>
                          {getAuctionStatusText(auction.status)}
                        </div>
                        <div className="media-count">
                          <FiImage /> {auction.images?.length || 0}
                          <FiVideo /> {auction.videos?.length || 0}
                        </div>
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

          {/* Auction Details */}
          <div className="user-details">
            {selectedAuction ? (
              <div className="details-card">
                <div className="details-header">
                  <h3>تفاصيل المزاد</h3>
                  <span className="user-id">ID: {selectedAuction.id}</span>
                </div>
                
                {renderAuctionDetails(selectedAuction)}

                <div className="details-actions">
                  {renderActionButtons(selectedAuction)}
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <FiCalendar className="no-selection-icon" />
                <p>اختر مزادًا لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllAuctions;