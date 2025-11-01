import React, { useState, useEffect } from 'react';
import { 
  FiMap, 
  FiMapPin, 
  FiUser, 
  FiCalendar, 
  FiDollarSign, 
  FiLayers, 
  FiFilter, 
  FiChevronRight, 
  FiChevronLeft, 
  FiImage, 
  FiSearch, 
  FiSlash,
  FiCheck,
  FiX,
  FiEdit,
  FiRefreshCw,
  FiHome,
  FiEye,
  FiCopy
} from 'react-icons/fi';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import '../../styles/PendingUsers.css';

const AllLands = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // استرجاع الفلاتر المحفوظة أو استخدام القيم الافتراضية
  const getInitialFilters = () => {
    const savedFilters = localStorage.getItem('landsFilters');
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return {
      search: '',
      status: 'all',
      region: 'all',
      city: 'all',
      land_type: 'all',
      purpose: 'all',
      user_type_id: 'all',
      min_area: '',
      max_area: '',
      sort_field: 'created_at',
      sort_direction: 'desc'
    };
  };
  
  const [filters, setFilters] = useState(getInitialFilters());
  const [selectedLand, setSelectedLand] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('landsCurrentPage');
    return savedPage ? parseInt(savedPage) : 1;
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copyStatus, setCopyStatus] = useState({}); // حالة نسخ البيانات

  // حالة المودال للرفض
  const [rejectModal, setRejectModal] = useState({
    show: false,
    landId: null,
    reason: ''
  });

  // حالة المودال لعرض تفاصيل المالك
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

  const handleRefresh = async () => {
    console.log('بدء تحديث بيانات الأراضي...');
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

  // حفظ الفلاتر والصفحة في localStorage عند تغييرها
  useEffect(() => {
    localStorage.setItem('landsFilters', JSON.stringify(filters));
  }, [filters]);
  
  useEffect(() => {
    localStorage.setItem('landsCurrentPage', currentPage.toString());
  }, [currentPage]);
  
  // استعادة الأرض المحددة من localStorage إذا كانت موجودة
  useEffect(() => {
    const savedSelectedLand = localStorage.getItem('selectedLand');
    if (savedSelectedLand) {
      setSelectedLand(JSON.parse(savedSelectedLand));
    }
  }, []);
  
  // حفظ الأرض المحددة في localStorage
  useEffect(() => {
    if (selectedLand) {
      localStorage.setItem('selectedLand', JSON.stringify(selectedLand));
    } else {
      localStorage.removeItem('selectedLand');
    }
  }, [selectedLand]);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (filters.search.trim()) params.append('search', filters.search.trim());
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.region !== 'all') params.append('region', filters.region);
    if (filters.city !== 'all') params.append('city', filters.city);
    if (filters.land_type !== 'all') params.append('land_type', filters.land_type);
    if (filters.purpose !== 'all') params.append('purpose', filters.purpose);
    if (filters.user_type_id !== 'all') params.append('user_type_id', filters.user_type_id);
    if (filters.min_area) params.append('min_area', filters.min_area);
    if (filters.max_area) params.append('max_area', filters.max_area);
    if (filters.sort_field) params.append('sort_field', filters.sort_field);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);
    
    params.append('page', currentPage);
    
    return params.toString();
  };

  // استخدام React Query لجلب بيانات الأراضي
  const fetchLands = async () => {
    const token = localStorage.getItem('access_token');
      
    if (!token) {
      navigate('/login');
      throw new Error('لم يتم العثور على رمز الدخول');
    }

    const queryString = buildQueryString();
    const url = `https://shahin-tqay.onrender.com/api/admin/properties?${queryString}`;

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
      throw new Error(`فشل في جلب الأراضي: ${errorText}`);
    }

    const result = await response.json();
    return result;
  };

  const { 
    data: landsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery(
    ['lands', filters, currentPage],
    fetchLands,
    {
      staleTime: 5 * 60 * 1000, // 5 دقائق
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('خطأ في جلب الأراضي:', error);
        alert('حدث خطأ أثناء جلب البيانات: ' + error.message);
      }
    }
  );

  // فتح مودال الرفض
  const openRejectModal = (landId) => {
    setRejectModal({
      show: true,
      landId,
      reason: ''
    });
  };

  // إغلاق مودال الرفض
  const closeRejectModal = () => {
    setRejectModal({
      show: false,
      landId: null,
      reason: ''
    });
  };

  // فتح مودال تفاصيل المالك
  const openOwnerModal = (owner) => {
    setOwnerModal({
      show: true,
      owner
    });
  };

  // إغلاق مودال تفاصيل المالك
  const closeOwnerModal = () => {
    setOwnerModal({
      show: false,
      owner: null
    });
  };

  // استخدام useMutation لعمليات الموافقة والرفض
  const approveMutation = useMutation(
    async (landId) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/properties/${landId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في قبول الإعلان');
      }

      return await response.json();
    },
    {
      onSuccess: () => {
        alert('تم قبول الإعلان بنجاح');
        refetch();
        setSelectedLand(null);
        queryClient.invalidateQueries(['lands']);
      },
      onError: (error) => {
        alert(error.message);
      }
    }
  );

  const rejectMutation = useMutation(
    async ({ landId, reason }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/properties/${landId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في رفض الإعلان');
      }

      return await response.json();
    },
    {
      onSuccess: () => {
        alert('تم رفض الإعلان بنجاح');
        refetch();
        setSelectedLand(null);
        closeRejectModal();
        queryClient.invalidateQueries(['lands']);
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
      land_type: 'all',
      purpose: 'all',
      user_type_id: 'all',
      min_area: '',
      max_area: '',
      sort_field: 'created_at',
      sort_direction: 'desc'
    };
    
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handleApprove = async (landId) => {
    if (!window.confirm('هل أنت متأكد من قبول هذا الإعلان؟')) {
      return;
    }
    approveMutation.mutate(landId);
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) {
      alert('يرجى إدخال سبب الرفض');
      return;
    }

    if (!window.confirm('هل أنت متأكد من رفض هذا الإعلان؟')) {
      return;
    }
    
    rejectMutation.mutate({
      landId: rejectModal.landId,
      reason: rejectModal.reason
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
      case 'مفتوح':
        return <span className="status-badge approved">مفتوح</span>;
      case 'مرفوض':
        return <span className="status-badge rejected">مرفوض</span>;
      case 'تم البيع':
        return <span className="status-badge sold">تم البيع</span>;
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
      case 'تم البيع':
        return 'تم البيع';
      case 'قيد المراجعة':
        return 'قيد المراجعة';
      default:
        return status;
    }
  };

  const getLandTypeBadge = (landType) => {
    switch (landType) {
      case 'سكني':
        return <span className="type-badge residential">سكني</span>;
      case 'تجاري':
        return <span className="type-badge commercial">تجاري</span>;
      case 'زراعي':
        return <span className="type-badge agricultural">زراعي</span>;
      default:
        return <span className="type-badge unknown">{landType}</span>;
    }
  };

  const getPurposeBadge = (purpose) => {
    switch (purpose) {
      case 'بيع':
        return <span className="purpose-badge sale">بيع</span>;
      case 'استثمار':
        return <span className="purpose-badge investment">استثمار</span>;
      default:
        return <span className="purpose-badge unknown">{purpose}</span>;
    }
  };

  // دالة لعرض تفاصيل المالك في الفورم مع إضافة نسخ البيانات
  const renderOwnerDetails = (owner) => {
    if (!owner) return null;

    return (
      <div className="owner-details-form">
        <div className="form-section">
          <h4>المعلومات الشخصية</h4>
          <div className="form-row">
            <div className="form-group">
              <label>الاسم الكامل</label>
              <div className="detail-value-with-copy">
                <span>{owner.full_name || 'غير متوفر'}</span>
                {owner.full_name && (
                  <button 
                    className={`copy-btn ${copyStatus['owner_full_name'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(owner.full_name, 'owner_full_name')}
                    title="نسخ الاسم الكامل"
                  >
                    <FiCopy />
                    {copyStatus['owner_full_name'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>البريد الإلكتروني</label>
              <div className="detail-value-with-copy">
                <span>{owner.email || 'غير متوفر'}</span>
                {owner.email && (
                  <button 
                    className={`copy-btn ${copyStatus['owner_email'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(owner.email, 'owner_email')}
                    title="نسخ البريد الإلكتروني"
                  >
                    <FiCopy />
                    {copyStatus['owner_email'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>رقم الهاتف</label>
              <div className="detail-value-with-copy">
                <span>{owner.phone || 'غير متوفر'}</span>
                {owner.phone && (
                  <button 
                    className={`copy-btn ${copyStatus['owner_phone'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(owner.phone, 'owner_phone')}
                    title="نسخ رقم الهاتف"
                  >
                    <FiCopy />
                    {copyStatus['owner_phone'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLandDetails = (land) => {
    return (
      <div className="details-content">
        <div className="detail-item">
          <div className="detail-label">
            <FiHome />
            العنوان
          </div>
          <div className="detail-value-with-copy">
            <span>{land.title}</span>
            <button 
              className={`copy-btn ${copyStatus['land_title'] ? 'copied' : ''}`}
              onClick={() => copyToClipboard(land.title, 'land_title')}
              title="نسخ العنوان"
            >
              <FiCopy />
              {copyStatus['land_title'] && <span className="copy-tooltip">تم النسخ!</span>}
            </button>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiUser />
            المالك
          </div>
          <div className="detail-value owner-info">
            <div className="detail-value-with-copy">
              {/* <span>{land.user?.full_name} ({land.user?.email}) - {land.user?.phone}</span> */}
              <div className="owner-actions">
                <button 
                  className="owner-view-btn"
                  onClick={() => openOwnerModal(land.user)}
                  title="عرض تفاصيل المالك"
                >
                  <FiEye />
                </button>
                <button 
                  className={`copy-btn ${copyStatus['owner_info'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(`${land.user?.full_name} - ${land.user?.email} - ${land.user?.phone}`, 'owner_info')}
                  title="نسخ معلومات المالك"
                >
                  <FiCopy />
                  {copyStatus['owner_info'] && <span className="copy-tooltip">تم النسخ!</span>}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            رقم الإعلان
          </div>
          <div className="detail-value-with-copy">
            <span>{land.announcement_number}</span>
            <button 
              className={`copy-btn ${copyStatus['announcement_number'] ? 'copied' : ''}`}
              onClick={() => copyToClipboard(land.announcement_number, 'announcement_number')}
              title="نسخ رقم الإعلان"
            >
              <FiCopy />
              {copyStatus['announcement_number'] && <span className="copy-tooltip">تم النسخ!</span>}
            </button>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiMapPin />
            الموقع
          </div>
          <div className="detail-value-with-copy">
            <span>{land.region} - {land.city}</span>
            <button 
              className={`copy-btn ${copyStatus['location'] ? 'copied' : ''}`}
              onClick={() => copyToClipboard(`${land.region} - ${land.city}`, 'location')}
              title="نسخ الموقع"
            >
              <FiCopy />
              {copyStatus['location'] && <span className="copy-tooltip">تم النسخ!</span>}
            </button>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            نوع الأرض
          </div>
          <div className="detail-value">
            {getLandTypeBadge(land.land_type)}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            الغرض
          </div>
          <div className="detail-value">
            {getPurposeBadge(land.purpose)}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            الحالة
          </div>
          <div className="detail-value">
            {getStatusBadge(land.status)}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiLayers />
            المساحة الكلية
          </div>
          <div className="detail-value-with-copy">
            <span>{land.total_area} م²</span>
            <button 
              className={`copy-btn ${copyStatus['total_area'] ? 'copied' : ''}`}
              onClick={() => copyToClipboard(`${land.total_area} م²`, 'total_area')}
              title="نسخ المساحة الكلية"
            >
              <FiCopy />
              {copyStatus['total_area'] && <span className="copy-tooltip">تم النسخ!</span>}
            </button>
          </div>
        </div>

        {land.price_per_sqm && (
          <div className="detail-item">
            <div className="detail-label">
              <FiDollarSign />
              سعر المتر
            </div>
            <div className="detail-value-with-copy">
              <span>{land.price_per_sqm} ريال/م²</span>
              <button 
                className={`copy-btn ${copyStatus['price_per_sqm'] ? 'copied' : ''}`}
                onClick={() => copyToClipboard(`${land.price_per_sqm} ريال/م²`, 'price_per_sqm')}
                title="نسخ سعر المتر"
              >
                <FiCopy />
                {copyStatus['price_per_sqm'] && <span className="copy-tooltip">تم النسخ!</span>}
              </button>
            </div>
          </div>
        )}

        {land.estimated_investment_value && (
          <div className="detail-item">
            <div className="detail-label">
              <FiDollarSign />
              القيمة الاستثمارية
            </div>
            <div className="detail-value-with-copy">
              <span>{land.estimated_investment_value} ريال</span>
              <button 
                className={`copy-btn ${copyStatus['investment_value'] ? 'copied' : ''}`}
                onClick={() => copyToClipboard(`${land.estimated_investment_value} ريال`, 'investment_value')}
                title="نسخ القيمة الاستثمارية"
              >
                <FiCopy />
                {copyStatus['investment_value'] && <span className="copy-tooltip">تم النسخ!</span>}
              </button>
            </div>
          </div>
        )}

        <div className="detail-item">
          <div className="detail-label">
            رقم الصك
          </div>
          <div className="detail-value-with-copy">
            <span>{land.deed_number}</span>
            <button 
              className={`copy-btn ${copyStatus['deed_number'] ? 'copied' : ''}`}
              onClick={() => copyToClipboard(land.deed_number, 'deed_number')}
              title="نسخ رقم الصك"
            >
              <FiCopy />
              {copyStatus['deed_number'] && <span className="copy-tooltip">تم النسخ!</span>}
            </button>
          </div>
        </div>

        {land.agency_number && (
          <div className="detail-item">
            <div className="detail-label">
              رقم الوكالة
            </div>
            <div className="detail-value-with-copy">
              <span>{land.agency_number}</span>
              <button 
                className={`copy-btn ${copyStatus['agency_number'] ? 'copied' : ''}`}
                onClick={() => copyToClipboard(land.agency_number, 'agency_number')}
                title="نسخ رقم الوكالة"
              >
                <FiCopy />
                {copyStatus['agency_number'] && <span className="copy-tooltip">تم النسخ!</span>}
              </button>
            </div>
          </div>
        )}

        <div className="detail-item">
          <div className="detail-label">
            الإحداثيات
          </div>
          <div className="detail-value-with-copy">
            <span>{land.geo_location_text}</span>
            <button 
              className={`copy-btn ${copyStatus['geo_location'] ? 'copied' : ''}`}
              onClick={() => copyToClipboard(land.geo_location_text, 'geo_location')}
              title="نسخ الإحداثيات"
            >
              <FiCopy />
              {copyStatus['geo_location'] && <span className="copy-tooltip">تم النسخ!</span>}
            </button>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiCalendar />
            تاريخ الإضافة
          </div>
          <div className="detail-value-with-copy">
            <span>{formatDate(land.created_at)}</span>
            <button 
              className={`copy-btn ${copyStatus['created_at'] ? 'copied' : ''}`}
              onClick={() => copyToClipboard(formatDate(land.created_at), 'created_at')}
              title="نسخ تاريخ الإضافة"
            >
              <FiCopy />
              {copyStatus['created_at'] && <span className="copy-tooltip">تم النسخ!</span>}
            </button>
          </div>
        </div>

        <div className="detail-item full-width">
          <div className="detail-label">
            الوصف
          </div>
          <div className="detail-value description-text">
            <div className="detail-value-with-copy">
              <span>{land.description}</span>
              {land.description && (
                <button 
                  className={`copy-btn ${copyStatus['description'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(land.description, 'description')}
                  title="نسخ الوصف"
                >
                  <FiCopy />
                  {copyStatus['description'] && <span className="copy-tooltip">تم النسخ!</span>}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* الأبعاد */}
        <div className="dimensions-section">
          <h4>أبعاد الأرض</h4>
          <div className="dimensions-grid">
            <div className="dimension-item">
              <span className="dimension-label">الشمال</span>
              <div className="detail-value-with-copy">
                <span className="dimension-value">{land.length_north} م</span>
                <button 
                  className={`copy-btn small ${copyStatus['length_north'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(`${land.length_north} م`, 'length_north')}
                  title="نسخ طول الشمال"
                >
                  <FiCopy />
                  {copyStatus['length_north'] && <span className="copy-tooltip">تم النسخ!</span>}
                </button>
              </div>
            </div>
            <div className="dimension-item">
              <span className="dimension-label">الجنوب</span>
              <div className="detail-value-with-copy">
                <span className="dimension-value">{land.length_south} م</span>
                <button 
                  className={`copy-btn small ${copyStatus['length_south'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(`${land.length_south} م`, 'length_south')}
                  title="نسخ طول الجنوب"
                >
                  <FiCopy />
                  {copyStatus['length_south'] && <span className="copy-tooltip">تم النسخ!</span>}
                </button>
              </div>
            </div>
            <div className="dimension-item">
              <span className="dimension-label">الشرق</span>
              <div className="detail-value-with-copy">
                <span className="dimension-value">{land.length_east} م</span>
                <button 
                  className={`copy-btn small ${copyStatus['length_east'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(`${land.length_east} م`, 'length_east')}
                  title="نسخ طول الشرق"
                >
                  <FiCopy />
                  {copyStatus['length_east'] && <span className="copy-tooltip">تم النسخ!</span>}
                </button>
              </div>
            </div>
            <div className="dimension-item">
              <span className="dimension-label">الغرب</span>
              <div className="detail-value-with-copy">
                <span className="dimension-value">{land.length_west} م</span>
                <button 
                  className={`copy-btn small ${copyStatus['length_west'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(`${land.length_west} م`, 'length_west')}
                  title="نسخ طول الغرب"
                >
                  <FiCopy />
                  {copyStatus['length_west'] && <span className="copy-tooltip">تم النسخ!</span>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* الصور */}
        {land.images && land.images.length > 0 && (
          <div className="images-section">
            <h4>صور الأرض ({land.images.length})</h4>
            <div className="images-grid">
              {land.images.map((image, index) => (
                <div key={image.id} className="image-item">
                  <FiImage className="image-icon" />
                  <span className="image-name">صورة {index + 1}</span>
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
    if (!landsData || !landsData.pagination || landsData.pagination.last_page <= 1) return null;

    const pages = [];
    const pagination = landsData.pagination;
    
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
                          filters.city !== 'all' || filters.land_type !== 'all' || filters.purpose !== 'all' ||
                          filters.user_type_id !== 'all' || filters.min_area || filters.max_area;

  // استخراج البيانات من نتيجة الاستعلام
  const lands = landsData?.data || [];
  const pagination = landsData?.pagination || {
    current_page: currentPage,
    last_page: 1,
    per_page: 15,
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
              placeholder="ابحث بالعنوان أو رقم الإعلان أو وصف الأرض..."
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
                onClick={handleRefresh}
                disabled={isRefreshing || loading}
              >
                <FiRefreshCw className={isRefreshing ? 'spinning' : ''} />
                {isRefreshing ? 'جاري التحديث...' : 'تحديث البيانات'}
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
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="مفتوح">مفتوح</option>
              <option value="مرفوض">مرفوض</option>
              <option value="تم البيع">تم البيع</option>
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
              {/* المدن موجودة في الكود الأصلي */}
            </select>
          </div>

          <div className="filter-group">
            <label>نوع الأرض:</label>
            <select 
              value={filters.land_type} 
              onChange={(e) => handleFilterChange('land_type', e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع الأنواع</option>
              <option value="سكني">سكني</option>
              <option value="تجاري">تجاري</option>
              <option value="زراعي">زراعي</option>
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
              <option value="بيع">بيع</option>
              <option value="استثمار">استثمار</option>
            </select>
          </div>

          <div className="filter-group">
            <label>أقل مساحة:</label>
            <input
              type="number"
              value={filters.min_area}
              onChange={(e) => handleFilterChange('min_area', e.target.value)}
              className="filter-select"
              placeholder="0"
            />
          </div>

          <div className="filter-group">
            <label>أكبر مساحة:</label>
            <input
              type="number"
              value={filters.max_area}
              onChange={(e) => handleFilterChange('max_area', e.target.value)}
              className="filter-select"
              placeholder="10000"
            />
          </div>

          <div className="filter-group">
            <label>ترتيب حسب:</label>
            <select 
              value={filters.sort_field} 
              onChange={(e) => handleFilterChange('sort_field', e.target.value)}
              className="filter-select"
            >
              <option value="created_at">تاريخ الإضافة</option>
              <option value="title">العنوان</option>
              <option value="total_area">المساحة</option>
              <option value="price_per_sqm">سعر المتر</option>
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
          {/* Lands List */}
          <div className="users-list">
            <div className="list-header">
              <h3>قائمة الأراضي ({lands.length})</h3>
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
            ) : lands.length === 0 ? (
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
                  {lands.map((land) => (
                    <div 
                      key={land.id} 
                      className={`user-card ${selectedLand?.id === land.id ? 'active' : ''}`}
                      onClick={() => setSelectedLand(land)}
                    >
                      <div className="user-avatar">
                        <FiMap />
                      </div>
                      <div className="user-info">
                        <h4>{land.title}</h4>
                        <span className="user-type">{land.region} - {land.city}</span>
                        <span className="user-date">
                          <FiCalendar />
                          {formatDate(land.created_at)}
                        </span>
                        <div className="land-badges">
                          {getLandTypeBadge(land.land_type)}
                          {getPurposeBadge(land.purpose)}
                        </div>
                      </div>
                      <div className={`user-status ${land.status.replace(/\s+/g, '-')}`}>
                        {getStatusText(land.status)}
                        <div className="land-area">{land.total_area} م²</div>
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

          {/* Land Details */}
          <div className="user-details">
            {selectedLand ? (
              <div className="details-card">
                <div className="details-header">
                  <h3>تفاصيل الأرض</h3>
                  <span className="user-id">ID: {selectedLand.id}</span>
                </div>
                
                {renderLandDetails(selectedLand)}

                <div className="details-actions">
                  {selectedLand.status === 'قيد المراجعة' && (
                    <>
                      <button 
                        className="btn btn-success"
                        onClick={() => handleApprove(selectedLand.id)}
                        disabled={loading}
                      >
                        <FiCheck />
                        {loading ? 'جاري المعالجة...' : 'قبول الإعلان'}
                      </button>
                      
                      <button 
                        className="btn btn-danger"
                        onClick={() => openRejectModal(selectedLand.id)}
                        disabled={loading}
                      >
                        <FiX />
                        {loading ? 'جاري المعالجة...' : 'رفض الإعلان'}
                      </button>
                    </>
                  )}
                  {(selectedLand.status === 'مرفوض') && (
                    <button 
                      className="btn btn-success"
                      onClick={() => handleApprove(selectedLand.id)}
                      disabled={loading}
                    >
                      <FiCheck />
                      {loading ? 'جاري المعالجة...' : 'قبول الإعلان'}
                    </button>
                  )}
                  {(selectedLand.status === 'مفتوح' || selectedLand.status === 'مرفوض') && (
                    <button 
                      className="btn btn-danger"
                      onClick={() => openRejectModal(selectedLand.id)}
                      disabled={loading}
                    >
                      <FiX />
                      {loading ? 'جاري المعالجة...' : 'رفض الإعلان'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <FiMap className="no-selection-icon" />
                <p>اختر أرضًا لعرض التفاصيل</p>
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
                رفض الإعلان
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
                  placeholder="اكتب سبب رفض الإعلان هنا..."
                />
                <div className="form-hint">
                  هذا السبب سيظهر للمستخدم كتفسير لرفض إعلانه
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

      {/* مودال تفاصيل المالك */}
      {ownerModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <FiUser />
                تفاصيل المالك
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

export default AllLands;