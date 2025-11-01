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
  FiRefreshCw,
  FiEye,
  FiEdit,
  FiCopy
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

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copyStatus, setCopyStatus] = useState({}); // حالة نسخ البيانات
  const [rejectModal, setRejectModal] = useState({
    show: false,
    auctionId: null,
    reason: ''
  });

  const [ownerModal, setOwnerModal] = useState({
    show: false,
    owner: null
  });

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

  const handleRefresh = async () => {
    console.log('بدء تحديث بيانات المزادات...');
    setIsRefreshing(true);
    
    try {
      await refetch();
    } catch (error) {
      console.error('خطأ في التحديث:', error);
      alert('حدث خطأ أثناء تحديث البيانات: ' + error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // فتح مودال الرفض
  const openRejectModal = (auctionId) => {
    setRejectModal({
      show: true,
      auctionId,
      reason: ''
    });
  };

  // إغلاق مودال الرفض
  const closeRejectModal = () => {
    setRejectModal({
      show: false,
      auctionId: null,
      reason: ''
    });
  };

  // فتح مودال تفاصيل الشركة
  const openOwnerModal = (owner) => {
    setOwnerModal({
      show: true,
      owner
    });
  };

  // إغلاق مودال تفاصيل الشركة
  const closeOwnerModal = () => {
    setOwnerModal({
      show: false,
      owner: null
    });
  };

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
        refetch();
        setSelectedAuction(null);
        queryClient.invalidateQueries(['auctions']);
      },
      onError: (error) => {
        alert(error.message);
      }
    }
  );

  const rejectMutation = useMutation(
    async ({ auctionId, reason }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/auctions/${auctionId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason || "التصريح غير مقبول او غير معتمد"
        })
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
        refetch();
        setSelectedAuction(null);
        closeRejectModal();
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

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) {
      alert('يرجى إدخال سبب الرفض');
      return;
    }

    if (!window.confirm('هل أنت متأكد من رفض هذا المزاد؟')) {
      return;
    }
    
    rejectMutation.mutate({
      auctionId: rejectModal.auctionId,
      reason: rejectModal.reason
    });
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
        return <span className="status-badge approved">مفتوح</span>;
      case 'مرفوض':
        return <span className="status-badge rejected">مرفوض</span>;
      case 'مغلق':
        return <span className="status-badge sold">مغلق</span>;
      case 'قيد المراجعة':
        return <span className="status-badge pending">قيد المراجعة</span>;
      default:
        return <span className="status-badge unknown">{status}</span>;
    }
  };

  const getStatusText = (status) => {
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

  // دالة لعرض تفاصيل الشركة في الفورم مع إضافة نسخ البيانات
  const renderOwnerDetails = (owner) => {
    if (!owner) return null;

    return (
      <div className="owner-details-form">
        <div className="form-section">
          <h4>معلومات الشركة</h4>
          <div className="form-row">
            <div className="form-group">
              <label>اسم الشركة</label>
              <div className="detail-value-with-copy">
                <span>{owner.auction_name || 'غير متوفر'}</span>
                {owner.auction_name && (
                  <button 
                    className={`copy-btn ${copyStatus['company_name'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(owner.auction_name, 'company_name')}
                    title="نسخ اسم الشركة"
                  >
                    <FiCopy />
                    {copyStatus['company_name'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>البريد الإلكتروني</label>
              <div className="detail-value-with-copy">
                <span>{owner.user?.email || 'غير متوفر'}</span>
                {owner.user?.email && (
                  <button 
                    className={`copy-btn ${copyStatus['company_email'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(owner.user.email, 'company_email')}
                    title="نسخ البريد الإلكتروني"
                  >
                    <FiCopy />
                    {copyStatus['company_email'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>رقم الهاتف</label>
              <div className="detail-value-with-copy">
                <span>{owner.user?.phone || 'غير متوفر'}</span>
                {owner.user?.phone && (
                  <button 
                    className={`copy-btn ${copyStatus['company_phone'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(owner.user.phone, 'company_phone')}
                    title="نسخ رقم الهاتف"
                  >
                    <FiCopy />
                    {copyStatus['company_phone'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>اسم المسؤول</label>
              <div className="detail-value-with-copy">
                <span>{owner.user?.full_name || 'غير متوفر'}</span>
                {owner.user?.full_name && (
                  <button 
                    className={`copy-btn ${copyStatus['company_contact'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(owner.user.full_name, 'company_contact')}
                    title="نسخ اسم المسؤول"
                  >
                    <FiCopy />
                    {copyStatus['company_contact'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {owner.commercial_register && (
          <div className="form-section">
            <h4>المعلومات التجارية</h4>
            <div className="form-row">
              <div className="form-group">
                <label>السجل التجاري</label>
                <div className="detail-value-with-copy">
                  <span>{owner.commercial_register}</span>
                  <button 
                    className={`copy-btn ${copyStatus['commercial_register'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(owner.commercial_register, 'commercial_register')}
                    title="نسخ السجل التجاري"
                  >
                    <FiCopy />
                    {copyStatus['commercial_register'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                </div>
              </div>
              {owner.license_number && (
                <div className="form-group">
                  <label>رقم الترخيص</label>
                  <div className="detail-value-with-copy">
                    <span>{owner.license_number}</span>
                    <button 
                      className={`copy-btn ${copyStatus['license_number'] ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(owner.license_number, 'license_number')}
                      title="نسخ رقم الترخيص"
                    >
                      <FiCopy />
                      {copyStatus['license_number'] && <span className="copy-tooltip">تم النسخ!</span>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAuctionDetails = (auction) => {
    return (
      <div className="details-content">
        <div className="detail-item">
          <div className="detail-label">
            العنوان
          </div>
          <div className="detail-value-with-copy">
            <span>{auction.title || 'غير محدد'}</span>
            {/* {auction.title && (
              <button 
                className={`copy-btn ${copyStatus['auction_title'] ? 'copied' : ''}`}
                onClick={() => copyToClipboard(auction.title, 'auction_title')}
                title="نسخ العنوان"
              >
                <FiCopy />
                {copyStatus['auction_title'] && <span className="copy-tooltip">تم النسخ!</span>}
              </button>
            )} */}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiUser />
            الشركة المنظمة
          </div>
          <div className="detail-value owner-info">
            <div className="detail-value-with-copy">
              <span>{auction.company?.auction_name || auction.company?.user?.full_name || 'غير محدد'}</span>
              <div className="owner-actions">
                <button 
                  className="owner-view-btn"
                  onClick={() => openOwnerModal(auction.company)}
                  title="عرض تفاصيل الشركة"
                >
                  <FiEye />
                </button>
                <button 
                  className={`copy-btn ${copyStatus['company_info'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(auction.company?.auction_name || auction.company?.user?.full_name, 'company_info')}
                  title="نسخ اسم الشركة"
                >
                  <FiCopy />
                  {copyStatus['company_info'] && <span className="copy-tooltip">تم النسخ!</span>}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            البريد الإلكتروني
          </div>
          <div className="detail-value-with-copy">
            <span>{auction.company?.user?.email || 'غير محدد'}</span>
            {auction.company?.user?.email && (
              <button 
                className={`copy-btn ${copyStatus['auction_email'] ? 'copied' : ''}`}
                onClick={() => copyToClipboard(auction.company.user.email, 'auction_email')}
                title="نسخ البريد الإلكتروني"
              >
                <FiCopy />
                {copyStatus['auction_email'] && <span className="copy-tooltip">تم النسخ!</span>}
              </button>
            )}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            الهاتف
          </div>
          <div className="detail-value-with-copy">
            <span>{auction.company?.user?.phone || 'غير محدد'}</span>
            {auction.company?.user?.phone && (
              <button 
                className={`copy-btn ${copyStatus['auction_phone'] ? 'copied' : ''}`}
                onClick={() => copyToClipboard(auction.company.user.phone, 'auction_phone')}
                title="نسخ رقم الهاتف"
              >
                <FiCopy />
                {copyStatus['auction_phone'] && <span className="copy-tooltip">تم النسخ!</span>}
              </button>
            )}
          </div>
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
          <div className="detail-value-with-copy">
            <span>{formatDate(auction.auction_date)}</span>
            {auction.auction_date && (
              <button 
                className={`copy-btn ${copyStatus['auction_date'] ? 'copied' : ''}`}
                onClick={() => copyToClipboard(formatDate(auction.auction_date), 'auction_date')}
                title="نسخ تاريخ المزاد"
              >
                <FiCopy />
                {copyStatus['auction_date'] && <span className="copy-tooltip">تم النسخ!</span>}
              </button>
            )}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiClock />
            وقت البدء
          </div>
          <div className="detail-value-with-copy">
            <span>{formatTime(auction.start_time)}</span>
            {auction.start_time && (
              <button 
                className={`copy-btn ${copyStatus['start_time'] ? 'copied' : ''}`}
                onClick={() => copyToClipboard(auction.start_time, 'start_time')}
                title="نسخ وقت البدء"
              >
                <FiCopy />
                {copyStatus['start_time'] && <span className="copy-tooltip">تم النسخ!</span>}
              </button>
            )}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiMapPin />
            العنوان
          </div>
          <div className="detail-value-with-copy">
            <span>{auction.address || 'غير محدد'}</span>
            {/* {auction.address && (
              <button 
                className={`copy-btn ${copyStatus['auction_address'] ? 'copied' : ''}`}
                onClick={() => copyToClipboard(auction.address, 'auction_address')}
                title="نسخ العنوان"
              >
                <FiCopy />
                {copyStatus['auction_address'] && <span className="copy-tooltip">تم النسخ!</span>}
              </button>
            )} */}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            المنطقة
          </div>
          <div className="detail-value-with-copy">
            <span>{auction.region || 'غير محدد'}</span>
            {/* {auction.region && (
              <button 
                className={`copy-btn ${copyStatus['auction_region'] ? 'copied' : ''}`}
                onClick={() => copyToClipboard(auction.region, 'auction_region')}
                title="نسخ المنطقة"
              >
                <FiCopy />
                {copyStatus['auction_region'] && <span className="copy-tooltip">تم النسخ!</span>}
              </button>
            )} */}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            المدينة
          </div>
          <div className="detail-value-with-copy">
            <span>{auction.city || 'غير محدد'}</span>
            {/* {auction.city && (
              <button 
                className={`copy-btn ${copyStatus['auction_city'] ? 'copied' : ''}`}
                onClick={() => copyToClipboard(auction.city, 'auction_city')}
                title="نسخ المدينة"
              >
                <FiCopy />
                {copyStatus['auction_city'] && <span className="copy-tooltip">تم النسخ!</span>}
              </button>
            )} */}
          </div>
        </div>

        {auction.latitude && auction.longitude && (
          <div className="detail-item">
            <div className="detail-label">
              الإحداثيات
            </div>
            <div className="detail-value-with-copy">
              <span>{auction.latitude}, {auction.longitude}</span>
              <button 
                className={`copy-btn ${copyStatus['coordinates'] ? 'copied' : ''}`}
                onClick={() => copyToClipboard(`${auction.latitude}, ${auction.longitude}`, 'coordinates')}
                title="نسخ الإحداثيات"
              >
                <FiCopy />
                {copyStatus['coordinates'] && <span className="copy-tooltip">تم النسخ!</span>}
              </button>
            </div>
          </div>
        )}

        {auction.intro_link && (
          <div className="detail-item">
            <div className="detail-label">
              <FiExternalLink />
              رابط التعريف
            </div>
            <div className="detail-value-with-copy">
              <a href={auction.intro_link} target="_blank" rel="noopener noreferrer" className="link">
                {auction.intro_link}
              </a>
              <button 
                className={`copy-btn ${copyStatus['intro_link'] ? 'copied' : ''}`}
                onClick={() => copyToClipboard(auction.intro_link, 'intro_link')}
                title="نسخ رابط التعريف"
              >
                <FiCopy />
                {copyStatus['intro_link'] && <span className="copy-tooltip">تم النسخ!</span>}
              </button>
            </div>
          </div>
        )}

        {auction.rejection_reason && (
          <div className="detail-item">
            <div className="detail-label">
              سبب الرفض
            </div>
            <div className="detail-value-with-copy rejection-reason">
              <span>{auction.rejection_reason}</span>
              <button 
                className={`copy-btn ${copyStatus['rejection_reason'] ? 'copied' : ''}`}
                onClick={() => copyToClipboard(auction.rejection_reason, 'rejection_reason')}
                title="نسخ سبب الرفض"
              >
                <FiCopy />
                {copyStatus['rejection_reason'] && <span className="copy-tooltip">تم النسخ!</span>}
              </button>
            </div>
          </div>
        )}

        <div className="detail-item">
          <div className="detail-label">
            <FiCalendar />
            تاريخ الإنشاء
          </div>
          <div className="detail-value-with-copy">
            <span>{formatDate(auction.created_at)}</span>
            {/* {auction.created_at && (
              <button 
                className={`copy-btn ${copyStatus['created_at'] ? 'copied' : ''}`}
                onClick={() => copyToClipboard(formatDate(auction.created_at), 'created_at')}
                title="نسخ تاريخ الإنشاء"
              >
                <FiCopy />
                {copyStatus['created_at'] && <span className="copy-tooltip">تم النسخ!</span>}
              </button>
            )} */}
          </div>
        </div>

        <div className="detail-item full-width">
          <div className="detail-label">
            الوصف
          </div>
          <div className="detail-value description-text">
            <div className="detail-value-with-copy">
              <span>{auction.description || 'لا يوجد وصف'}</span>
              {/* {auction.description && (
                <button 
                  className={`copy-btn ${copyStatus['description'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(auction.description, 'description')}
                  title="نسخ الوصف"
                >
                  <FiCopy />
                  {copyStatus['description'] && <span className="copy-tooltip">تم النسخ!</span>}
                </button>
              )} */}
            </div>
          </div>
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

  const loading = isLoading || isRefreshing || approveMutation.isLoading || rejectMutation.isLoading;

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
            <button 
              type="button"
              className="dashboard-refresh-btn" 
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
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
              <option value="الرياض">الرياض</option>
              <option value="مكة المكرمة">مكة المكرمة</option>
              <option value="المدينة المنورة">المدينة المنورة</option>
              <option value="القصيم">القصيم</option>
              <option value="الشرقية">الشرقية</option>
              <option value="عسير">عسير</option>
              <option value="تبوك">تبوك</option>
              <option value="حائل">حائل</option>
              <option value="الحدود الشمالية">الحدود الشمالية</option>
              <option value="جازان">جازان</option>
              <option value="نجران">نجران</option>
              <option value="الباحة">الباحة</option>
              <option value="الجوف">الجوف</option>
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
    <option value="الرياض">الرياض</option>
    <option value="جدة">جدة</option>
    <option value="مكة المكرمة">مكة المكرمة</option>
    <option value="المدينة المنورة">المدينة المنورة</option>
    <option value="الدمام">الدمام</option>
    <option value="الخبر">الخبر</option>
    <option value="الظهران">الظهران</option>
    <option value="الجبيل">الجبيل</option>
    <option value="القطيف">القطيف</option>
    <option value="تبوك">تبوك</option>
    <option value="حائل">حائل</option>
    <option value="بريدة">بريدة</option>
    <option value="عنيزة">عنيزة</option>
    <option value="الرس">الرس</option>
    <option value="خميس مشيط">خميس مشيط</option>
    <option value="أبها">أبها</option>
    <option value="نجران">نجران</option>
    <option value="جازان">جازان</option>
    <option value="بيشة">بيشة</option>
    <option value="الباحة">الباحة</option>
    <option value="سكاكا">سكاكا</option>
    <option value="عرعر">عرعر</option>
    <option value="القريات">القريات</option>
    <option value="ينبع">ينبع</option>
    <option value="رابغ">رابغ</option>
    <option value="الطائف">الطائف</option>
    <option value="محايل عسير">محايل عسير</option>
    <option value="بلجرشي">بلجرشي</option>
    <option value="صبيا">صبيا</option>
    <option value="أحد رفيدة">أحد رفيدة</option>
    <option value="تثليث">تثليث</option>
    <option value="المجمعة">المجمعة</option>
    <option value="الزلفي">الزلفي</option>
    <option value="حوطة بني تميم">حوطة بني تميم</option>
    <option value="الأحساء">الأحساء</option>
    <option value="بقيق">بقيق</option>
    <option value="رأس تنورة">رأس تنورة</option>
    <option value="سيهات">سيهات</option>
    <option value="صفوى">صفوى</option>
    <option value="تاروت">تاروت</option>
    <option value="النعيرية">النعيرية</option>
    <option value="قرية العليا">قرية العليا</option>
    <option value="الخرج">الخرج</option>
    <option value="الدوادمي">الدوادمي</option>
    <option value="القويعية">القويعية</option>
    <option value="وادي الدواسر">وادي الدواسر</option>
    <option value="الافلاج">الأفلاج</option>
    <option value="رنية">رنية</option>
    <option value="بيش">بيش</option>
    <option value="الدرب">الدرب</option>
    <option value="العارضة">العارضة</option>
    <option value="أملج">أملج</option>
    <option value="ضباء">ضباء</option>
    <option value="الوجه">الوجه</option>
    <option value="العلا">العلا</option>
    <option value="خيبر">خيبر</option>
    <option value="البدائع">البدائع</option>
    <option value="الأسياح">الأسياح</option>
    <option value="رياض الخبراء">رياض الخبراء</option>
    <option value="النبهانية">النبهانية</option>
    <option value="ضرما">ضرما</option>
    <option value="حوطة سدير">حوطة سدير</option>
    <option value="تمير">تمير</option>
    <option value="الحوطة">الحوطة</option>
    <option value="الحريق">الحريق</option>
    <option value="شقراء">شقراء</option>
    <option value="عفيف">عفيف</option>
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
                      <div className="user-avatar">
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
                      <div className={`user-status ${auction.status?.replace(/\s+/g, '-') || 'unknown'}`}>
                        {getStatusText(auction.status)}
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
                  {selectedAuction.status === 'قيد المراجعة' && (
                    <>
                      <button 
                        className="btn btn-success"
                        onClick={() => handleApprove(selectedAuction.id)}
                        disabled={loading}
                      >
                        <FiCheck />
                        {loading ? 'جاري المعالجة...' : 'قبول المزاد'}
                      </button>
                      
                      <button 
                        className="btn btn-danger"
                        onClick={() => openRejectModal(selectedAuction.id)}
                        disabled={loading}
                      >
                        <FiX />
                        {loading ? 'جاري المعالجة...' : 'رفض المزاد'}
                      </button>
                    </>
                  )}
                  {selectedAuction.status === 'مرفوض' && (
                    <button 
                      className="btn btn-success"
                      onClick={() => handleApprove(selectedAuction.id)}
                      disabled={loading}
                    >
                      <FiCheck />
                      {loading ? 'جاري المعالجة...' : 'قبول المزاد'}
                    </button>
                  )}
                  {selectedAuction.status === 'مفتوح' && (
                    <button 
                      className="btn btn-danger"
                      onClick={() => openRejectModal(selectedAuction.id)}
                      disabled={loading}
                    >
                      <FiX />
                      {loading ? 'جاري المعالجة...' : 'رفض المزاد'}
                    </button>
                  )}
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

      {/* مودال الرفض */}
      {rejectModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <FiEdit />
                رفض المزاد
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
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                  className="form-input"
                  rows="4"
                  placeholder="اكتب سبب رفض المزاد هنا..."
                />
                <div className="form-hint">
                  هذا السبب سيظهر للشركة كتفسير لرفض مزادها
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

      {/* مودال تفاصيل الشركة */}
      {ownerModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <FiUser />
                تفاصيل الشركة
              </h3>
              <button 
                className="close-btn"
                onClick={closeOwnerModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {renderOwnerDetails(ownerModal.owner)}
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={closeOwnerModal}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAuctions;