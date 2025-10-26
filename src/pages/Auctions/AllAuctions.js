import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiVideo, FiImage, FiFilter, FiChevronRight, FiChevronLeft, FiExternalLink, FiSearch, FiSlash, FiCheck, FiX } from 'react-icons/fi';
import '../../styles/PendingUsers.css';

const AllAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // حالة التصفية والترتيب
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    region: 'all',
    date: '',
    sort_field: 'created_at',
    sort_direction: 'desc'
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
    fetchAuctions();
  }, [filters, pagination.current_page]);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    // إضافة معاملات البحث والتصفية فقط إذا كانت محددة
    if (filters.search.trim()) params.append('search', filters.search.trim());
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.region !== 'all') params.append('region', filters.region);
    if (filters.date) params.append('date', filters.date);
    if (filters.sort_field) params.append('sort_field', filters.sort_field);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);
    
    // إضافة معاملات الباجينيشن
    params.append('page', pagination.current_page);
    params.append('per_page', pagination.per_page);
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  const fetchAuctions = async () => {
    try {
      setListLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
        window.location.href = '/login';
        return;
      }

      const queryString = buildQueryString();
      const url = `https://shahin-tqay.onrender.com/api/admin/auctions${queryString}`;

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
          // تعديل حسب هيكل الاستجابة
          const auctionsData = result.data.data || result.data || [];
          setAuctions(auctionsData);
          
          // استخدام البيانات من الاستجابة مباشرة
          setPagination(result.data || result.pagination || {
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: auctionsData.length,
            from: 1,
            to: auctionsData.length
          });
        } else {
          console.error('هيكل البيانات غير متوقع:', result);
          setAuctions([]);
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
        console.error('فشل في جلب المزادات:', errorText);
        alert('فشل في جلب بيانات المزادات');
      }
    } catch (error) {
      console.error('خطأ في جلب المزادات:', error);
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
    fetchAuctions();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      region: 'all',
      date: '',
      sort_field: 'created_at',
      sort_direction: 'desc'
    });
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleApprove = async (auctionId) => {
    if (!window.confirm('هل أنت متأكد من قبول هذا المزاد؟')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/auctions/${auctionId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // إعادة جلب البيانات لتحديث القائمة
        fetchAuctions();
        setSelectedAuction(null);
        alert('تم قبول المزاد بنجاح');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'فشل في قبول المزاد');
      }
    } catch (error) {
      console.error('Error approving auction:', error);
      alert('حدث خطأ أثناء قبول المزاد');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (auctionId) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا المزاد؟')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/auctions/${auctionId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // إعادة جلب البيانات لتحديث القائمة
        fetchAuctions();
        setSelectedAuction(null);
        alert('تم رفض المزاد بنجاح');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'فشل في رفض المزاد');
      }
    } catch (error) {
      console.error('Error rejecting auction:', error);
      alert('حدث خطأ أثناء رفض المزاد');
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
        return 'غير معروف';
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
              disabled={actionLoading}
            >
              <FiCheck />
              {actionLoading ? 'جاري المعالجة...' : 'قبول المزاد'}
            </button>
            
            <button 
              className="btn btn-danger"
              onClick={() => handleReject(auction.id)}
              disabled={actionLoading}
            >
              <FiX />
              {actionLoading ? 'جاري المعالجة...' : 'رفض المزاد'}
            </button>
          </>
        );
      
      case 'مرفوض':
        return (
          <button 
            className="btn btn-success"
            onClick={() => handleApprove(auction.id)}
            disabled={actionLoading}
          >
            <FiCheck />
            {actionLoading ? 'جاري المعالجة...' : 'قبول المزاد'}
          </button>
        );
      
      case 'مفتوح':
        return (
          <button 
            className="btn btn-danger"
            onClick={() => handleReject(auction.id)}
            disabled={actionLoading}
          >
            <FiX />
            {actionLoading ? 'جاري المعالجة...' : 'رفض المزاد'}
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
              disabled={actionLoading}
            >
              <FiCheck />
              {actionLoading ? 'جاري المعالجة...' : 'قبول المزاد'}
            </button>
            
            <button 
              className="btn btn-danger"
              onClick={() => handleReject(auction.id)}
              disabled={actionLoading}
            >
              <FiX />
              {actionLoading ? 'جاري المعالجة...' : 'رفض المزاد'}
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
          <div className="detail-value">{auction.title}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiUser />
            الشركة المنظمة
          </div>
          <div className="detail-value">
            {auction.company?.auction_name || 'غير محدد'} - {auction.company?.user?.full_name || 'غير محدد'}
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
  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.region !== 'all' || filters.date;

  return (
    <div className="pending-users-container">
      <div className="content-header">
        <h1>
          <FiCalendar className="header-icon" />
          إدارة جميع المزادات
        </h1>
        <p>عرض وإدارة جميع المزادات في النظام - العدد الإجمالي: {pagination.total}</p>
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
              placeholder="ابحث باسم المزاد أو الوصف..."
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
              <option value="تعز">تعز</option>
              <option value="حضرموت">حضرموت</option>
              <option value="الحديدة">الحديدة</option>
              <option value="إب">إب</option>
              <option value="ذمار">ذمار</option>
              <option value="المكلا">المكلا</option>
              <option value="سيئون">سيئون</option>
              <option value="شبوة">شبوة</option>
              <option value="حجة">حجة</option>
              <option value="المهرة">المهرة</option>
              <option value="الضالع">الضالع</option>
              <option value="لحج">لحج</option>
              <option value="أبين">أبين</option>
              <option value="عمران">عمران</option>
              <option value="البيضاء">البيضاء</option>
              <option value="صعدة">صعدة</option>
              <option value="الجوف">الجوف</option>
              <option value="المحويت">المحويت</option>
              <option value="ريمة">ريمة</option>
              <option value="أرخبيل سقطرى">أرخبيل سقطرى</option>
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
            
            {listLoading ? (
              <div className="list-loading">
                <div className="loading-spinner"></div>
                <p>جاري تحميل المزادات...</p>
              </div>
            ) : auctions.length === 0 ? (
              <div className="empty-state">
                <FiCalendar className="empty-icon" />
                <p>لا توجد مزادات</p>
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
                        <div className={`user-status ${auction.status.replace(/\s+/g, '-')}`}>
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