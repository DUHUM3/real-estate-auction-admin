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
  FiEdit,
  FiRefreshCw,
  FiEye,
  FiMap,
  FiMapPin,
  FiLayers,
  FiDollarSign,
  FiCopy
} from 'react-icons/fi';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import '../../styles/PendingUsers.css';

const AllInterests = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // استرجاع الفلاتر المحفوظة أو استخدام القيم الافتراضية
  const getInitialFilters = () => {
    const savedFilters = localStorage.getItem('interestsFilters');
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return {
      search: '',
      status: 'all',
      property_id: 'all',
      date_from: '',
      date_to: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    };
  };
  
  const [filters, setFilters] = useState(getInitialFilters());
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('interestsCurrentPage');
    return savedPage ? parseInt(savedPage) : 1;
  });
  
  const [statusModal, setStatusModal] = useState({
    show: false,
    interestId: null,
    newStatus: '',
    adminNote: ''
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copyStatus, setCopyStatus] = useState({}); // حالة نسخ البيانات

  // حالة المودال لعرض تفاصيل العقار
  const [propertyModal, setPropertyModal] = useState({
    show: false,
    property: null,
    loading: false
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
    setIsRefreshing(true);
    
    try {
      await refetch();
    } catch (error) {
      console.error('خطأ في التحديث:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // حفظ الفلاتر والصفحة في localStorage عند تغييرها
  useEffect(() => {
    localStorage.setItem('interestsFilters', JSON.stringify(filters));
  }, [filters]);
  
  useEffect(() => {
    localStorage.setItem('interestsCurrentPage', currentPage.toString());
  }, [currentPage]);
  
  // استعادة الاهتمام المحدد من localStorage إذا كان موجوداً
  useEffect(() => {
    const savedSelectedInterest = localStorage.getItem('selectedInterest');
    if (savedSelectedInterest) {
      setSelectedInterest(JSON.parse(savedSelectedInterest));
    }
  }, []);
  
  // حفظ الاهتمام المحدد في localStorage
  useEffect(() => {
    if (selectedInterest) {
      localStorage.setItem('selectedInterest', JSON.stringify(selectedInterest));
    } else {
      localStorage.removeItem('selectedInterest');
    }
  }, [selectedInterest]);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (filters.search.trim()) params.append('search', filters.search.trim());
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.property_id !== 'all') params.append('property_id', filters.property_id);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);
    
    params.append('page', currentPage);
    params.append('per_page', 10);
    
    return params.toString();
  };

  // استخدام React Query لجلب بيانات طلبات الاهتمام
  const fetchInterests = async () => {
    const token = localStorage.getItem('access_token');
      
    if (!token) {
      navigate('/login');
      throw new Error('لم يتم العثور على رمز الدخول');
    }

    const queryString = buildQueryString();
    const url = `https://shahin-tqay.onrender.com/api/admin/interests?${queryString}`;

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
      throw new Error(`فشل في جلب طلبات الاهتمام: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return {
        data: result.data.interests || [],
        pagination: result.data.pagination || {
          current_page: currentPage,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: 0,
          to: 0
        },
        filtersData: result.data.filters || {
          status_options: [],
          properties: []
        }
      };
    } else {
      throw new Error(result.message || 'هيكل البيانات غير متوقع');
    }
  };

  const { 
    data: interestsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery(
    ['interests', filters, currentPage],
    fetchInterests,
    {
      staleTime: 5 * 60 * 1000, // 5 دقائق
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('خطأ في جلب طلبات الاهتمام:', error);
        alert('حدث خطأ أثناء جلب البيانات: ' + error.message);
      }
    }
  );

  // دالة لجلب تفاصيل العقار
  const fetchPropertyDetails = async (propertyId) => {
    const token = localStorage.getItem('access_token');
      
    if (!token) {
      navigate('/login');
      throw new Error('لم يتم العثور على رمز الدخول');
    }

    const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/properties/${propertyId}`, {
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
      throw new Error(`فشل في جلب تفاصيل العقار: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || 'هيكل البيانات غير متوقع');
    }
  };

  // فتح مودال تفاصيل العقار
  const openPropertyModal = async (propertyId) => {
    if (!propertyId) {
      alert('لا يوجد معرف للعقار');
      return;
    }

    setPropertyModal({
      show: true,
      property: null,
      loading: true
    });

    try {
      const propertyDetails = await fetchPropertyDetails(propertyId);
      setPropertyModal({
        show: true,
        property: propertyDetails,
        loading: false
      });
    } catch (error) {
      console.error('خطأ في جلب تفاصيل العقار:', error);
      alert('حدث خطأ أثناء جلب تفاصيل العقار: ' + error.message);
      setPropertyModal({
        show: false,
        property: null,
        loading: false
      });
    }
  };

  // إغلاق مودال تفاصيل العقار
  const closePropertyModal = () => {
    setPropertyModal({
      show: false,
      property: null,
      loading: false
    });
  };

  // استخدام useMutation لتحديث حالة الاهتمام
  const statusMutation = useMutation(
    async ({ interestId, status, adminNote }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/interests/${interestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status,
          admin_note: adminNote.trim() || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في تحديث حالة الاهتمام');
      }

      return await response.json();
    },
    {
      onSuccess: () => {
        alert('تم تحديث حالة الاهتمام بنجاح');
        refetch();
        setSelectedInterest(null);
        closeStatusModal();
        queryClient.invalidateQueries(['interests']);
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
      property_id: 'all',
      date_from: '',
      date_to: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    
    setFilters(defaultFilters);
    setCurrentPage(1);
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

    if (!window.confirm(`هل أنت متأكد من تغيير الحالة إلى "${getStatusText(statusModal.newStatus)}"؟`)) {
      return;
    }

    statusMutation.mutate({
      interestId: statusModal.interestId,
      status: statusModal.newStatus,
      adminNote: statusModal.adminNote
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

  // دالة لعرض تفاصيل العقار في المودال مع إضافة نسخ البيانات
  const renderPropertyDetails = (property) => {
    if (!property) return null;

    return (
      <div className="property-details-form">
        <div className="form-section">
          <h4>المعلومات الأساسية</h4>
          <div className="form-row">
            <div className="form-group">
              <label>عنوان العقار</label>
              <div className="detail-value-with-copy">
                <span>{property.title || 'غير متوفر'}</span>
                {property.title && (
                  <button 
                    className={`copy-btn ${copyStatus['property_title'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(property.title, 'property_title')}
                    title="نسخ عنوان العقار"
                  >
                    <FiCopy />
                    {copyStatus['property_title'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>رقم الإعلان</label>
              <div className="detail-value-with-copy">
                <span>{property.announcement_number || 'غير متوفر'}</span>
                {property.announcement_number && (
                  <button 
                    className={`copy-btn ${copyStatus['announcement_number'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(property.announcement_number, 'announcement_number')}
                    title="نسخ رقم الإعلان"
                  >
                    <FiCopy />
                    {copyStatus['announcement_number'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>نوع الأرض</label>
              <div className="form-value">
                <span className={`type-badge ${property.land_type === 'سكني' ? 'residential' : property.land_type === 'تجاري' ? 'commercial' : 'agricultural'}`}>
                  {property.land_type || 'غير محدد'}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label>الغرض</label>
              <div className="form-value">
                <span className={`purpose-badge ${property.purpose === 'بيع' ? 'sale' : 'investment'}`}>
                  {property.purpose || 'غير محدد'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>الموقع والمساحة</h4>
          <div className="form-row">
            <div className="form-group">
              <label>المنطقة</label>
              <div className="detail-value-with-copy">
                <span>{property.region || 'غير متوفر'}</span>
                {property.region && (
                  <button 
                    className={`copy-btn ${copyStatus['property_region'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(property.region, 'property_region')}
                    title="نسخ المنطقة"
                  >
                    <FiCopy />
                    {copyStatus['property_region'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>المدينة</label>
              <div className="detail-value-with-copy">
                <span>{property.city || 'غير متوفر'}</span>
                {property.city && (
                  <button 
                    className={`copy-btn ${copyStatus['property_city'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(property.city, 'property_city')}
                    title="نسخ المدينة"
                  >
                    <FiCopy />
                    {copyStatus['property_city'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>المساحة الكلية</label>
              <div className="detail-value-with-copy">
                <span>{property.total_area} م²</span>
                <button 
                  className={`copy-btn ${copyStatus['property_area'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(`${property.total_area} م²`, 'property_area')}
                  title="نسخ المساحة الكلية"
                >
                  <FiCopy />
                  {copyStatus['property_area'] && <span className="copy-tooltip">تم النسخ!</span>}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>الإحداثيات</label>
              <div className="detail-value-with-copy">
                <span>{property.geo_location_text || 'غير متوفر'}</span>
                {property.geo_location_text && (
                  <button 
                    className={`copy-btn ${copyStatus['geo_location'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(property.geo_location_text, 'geo_location')}
                    title="نسخ الإحداثيات"
                  >
                    <FiCopy />
                    {copyStatus['geo_location'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>المعلومات المالية</h4>
          <div className="form-row">
            {property.price_per_sqm && (
              <div className="form-group">
                <label>سعر المتر</label>
                <div className="detail-value-with-copy">
                  <span>{property.price_per_sqm} ريال/م²</span>
                  <button 
                    className={`copy-btn ${copyStatus['price_per_sqm'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(`${property.price_per_sqm} ريال/م²`, 'price_per_sqm')}
                    title="نسخ سعر المتر"
                  >
                    <FiCopy />
                    {copyStatus['price_per_sqm'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                </div>
              </div>
            )}
            {property.estimated_investment_value && (
              <div className="form-group">
                <label>القيمة الاستثمارية</label>
                <div className="detail-value-with-copy">
                  <span>{property.estimated_investment_value} ريال</span>
                  <button 
                    className={`copy-btn ${copyStatus['investment_value'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(`${property.estimated_investment_value} ريال`, 'investment_value')}
                    title="نسخ القيمة الاستثمارية"
                  >
                    <FiCopy />
                    {copyStatus['investment_value'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h4>المعلومات القانونية</h4>
          <div className="form-row">
            <div className="form-group">
              <label>رقم الصك</label>
              <div className="detail-value-with-copy">
                <span>{property.deed_number || 'غير متوفر'}</span>
                {property.deed_number && (
                  <button 
                    className={`copy-btn ${copyStatus['deed_number'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(property.deed_number, 'deed_number')}
                    title="نسخ رقم الصك"
                  >
                    <FiCopy />
                    {copyStatus['deed_number'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
            {property.agency_number && (
              <div className="form-group">
                <label>رقم الوكالة</label>
                <div className="detail-value-with-copy">
                  <span>{property.agency_number}</span>
                  <button 
                    className={`copy-btn ${copyStatus['agency_number'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(property.agency_number, 'agency_number')}
                    title="نسخ رقم الوكالة"
                  >
                    <FiCopy />
                    {copyStatus['agency_number'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {property.description && (
          <div className="form-section">
            <h4>الوصف</h4>
            <div className="form-group full-width">
              <div className="detail-value-with-copy">
                <span className="description-text">{property.description}</span>
                <button 
                  className={`copy-btn ${copyStatus['property_description'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(property.description, 'property_description')}
                  title="نسخ الوصف"
                >
                  <FiCopy />
                  {copyStatus['property_description'] && <span className="copy-tooltip">تم النسخ!</span>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* معلومات المالك */}
        {property.user && (
          <div className="form-section">
            <h4>معلومات المالك</h4>
            <div className="form-row">
              <div className="form-group">
                <label>اسم المالك</label>
                <div className="detail-value-with-copy">
                  <span>{property.user.full_name || 'غير متوفر'}</span>
                  {property.user.full_name && (
                    <button 
                      className={`copy-btn ${copyStatus['owner_name'] ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(property.user.full_name, 'owner_name')}
                      title="نسخ اسم المالك"
                    >
                      <FiCopy />
                      {copyStatus['owner_name'] && <span className="copy-tooltip">تم النسخ!</span>}
                    </button>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>البريد الإلكتروني</label>
                <div className="detail-value-with-copy">
                  <span>{property.user.email || 'غير متوفر'}</span>
                  {property.user.email && (
                    <button 
                      className={`copy-btn ${copyStatus['owner_email'] ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(property.user.email, 'owner_email')}
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
                  <span>{property.user.phone || 'غير متوفر'}</span>
                  {property.user.phone && (
                    <button 
                      className={`copy-btn ${copyStatus['owner_phone'] ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(property.user.phone, 'owner_phone')}
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
        )}

        {/* الصور */}
        {property.images && property.images.length > 0 && (
          <div className="form-section">
            <h4>صور العقار ({property.images.length})</h4>
            <div className="images-grid">
              {property.images.map((image, index) => (
                <div key={image.id} className="image-item">
                  <FiMap className="image-icon" />
                  <span className="image-name">صورة {index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInterestDetails = (interest) => {
    return (
      <div className="details-content">
        <div className="detail-item">
          <div className="detail-label">
            <FiUser />
            اسم المهتم
          </div>
          <div className="detail-value-with-copy">
            <span>{interest.full_name}</span>
            <button 
              className={`copy-btn ${copyStatus['full_name'] ? 'copied' : ''}`}
              onClick={() => copyToClipboard(interest.full_name, 'full_name')}
              title="نسخ الاسم"
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
            <span>{interest.email}</span>
            <button 
              className={`copy-btn ${copyStatus['email'] ? 'copied' : ''}`}
              onClick={() => copyToClipboard(interest.email, 'email')}
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
            <span>{interest.phone}</span>
            <button 
              className={`copy-btn ${copyStatus['phone'] ? 'copied' : ''}`}
              onClick={() => copyToClipboard(interest.phone, 'phone')}
              title="نسخ رقم الهاتف"
            >
              <FiCopy />
              {copyStatus['phone'] && <span className="copy-tooltip">تم النسخ!</span>}
            </button>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiHome />
            العقار المهتم به
          </div>
          <div className="detail-value owner-info">
            <div className="detail-value-with-copy">
              <span className="property-badge">
                {interest.property?.title || 'غير محدد'}
              </span>
              <div className="owner-actions">
                {interest.property_id && (
                  <button 
                    className="owner-view-btn"
                    onClick={() => openPropertyModal(interest.property_id)}
                    title="عرض تفاصيل العقار"
                  >
                    <FiEye />
                  </button>
                )}
                {interest.property?.title && (
                  <button 
                    className={`copy-btn ${copyStatus['property_title'] ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(interest.property.title, 'property_title')}
                    title="نسخ اسم العقار"
                  >
                    <FiCopy />
                    {copyStatus['property_title'] && <span className="copy-tooltip">تم النسخ!</span>}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            الحالة
          </div>
          <div className="detail-value">
            {getStatusBadge(interest.status)}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiCalendar />
            تاريخ الاهتمام
          </div>
          <div className="detail-value-with-copy">
            <span>{formatDate(interest.created_at)}</span>
            <button 
              className={`copy-btn ${copyStatus['created_at'] ? 'copied' : ''}`}
              onClick={() => copyToClipboard(formatDate(interest.created_at), 'created_at')}
              title="نسخ تاريخ الاهتمام"
            >
              <FiCopy />
              {copyStatus['created_at'] && <span className="copy-tooltip">تم النسخ!</span>}
            </button>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiCalendar />
            آخر تحديث
          </div>
          <div className="detail-value-with-copy">
            <span>{formatDate(interest.updated_at)}</span>
            <button 
              className={`copy-btn ${copyStatus['updated_at'] ? 'copied' : ''}`}
              onClick={() => copyToClipboard(formatDate(interest.updated_at), 'updated_at')}
              title="نسخ تاريخ التحديث"
            >
              <FiCopy />
              {copyStatus['updated_at'] && <span className="copy-tooltip">تم النسخ!</span>}
            </button>
          </div>
        </div>

        <div className="detail-item full-width">
          <div className="detail-label">
            <FiMessageSquare />
            رسالة المهتم
          </div>
          <div className="detail-value message-text">
            <div className="detail-value-with-copy">
              <span>{interest.message || 'لا توجد رسالة'}</span>
              {interest.message && (
                <button 
                  className={`copy-btn ${copyStatus['message'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(interest.message, 'message')}
                  title="نسخ الرسالة"
                >
                  <FiCopy />
                  {copyStatus['message'] && <span className="copy-tooltip">تم النسخ!</span>}
                </button>
              )}
            </div>
          </div>
        </div>

        {interest.admin_notes && (
          <div className="detail-item full-width">
            <div className="detail-label">
              <FiEdit />
              ملاحظات المسؤول
            </div>
            <div className="detail-value admin-notes">
              <div className="detail-value-with-copy">
                <span>{interest.admin_notes}</span>
                <button 
                  className={`copy-btn ${copyStatus['admin_notes'] ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(interest.admin_notes, 'admin_notes')}
                  title="نسخ ملاحظات المسؤول"
                >
                  <FiCopy />
                  {copyStatus['admin_notes'] && <span className="copy-tooltip">تم النسخ!</span>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // إنشاء أزرار الباجينيشن
  const renderPagination = () => {
    if (!interestsData || !interestsData.pagination || interestsData.pagination.last_page <= 1) return null;

    const pages = [];
    const pagination = interestsData.pagination;
    
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
  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.property_id !== 'all' || 
                          filters.date_from || filters.date_to;

  // استخراج البيانات من نتيجة الاستعلام
  const interests = interestsData?.data || [];
  const pagination = interestsData?.pagination || {
    current_page: currentPage,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  };
  const filtersData = interestsData?.filtersData || {
    status_options: [],
    properties: []
  };

  const loading = isLoading || isRefreshing || statusMutation.isLoading;

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
              placeholder="ابحث بالاسم أو البريد الإلكتروني أو الرسالة..."
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
              {filtersData.status_options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
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
            
            {loading ? (
              <div className="dashboard-loading">
                <div className="dashboard-loading-dots">
                  <div className="dashboard-loading-dot"></div>
                  <div className="dashboard-loading-dot"></div>
                  <div className="dashboard-loading-dot"></div>
                </div>
                <p className="dashboard-loading-text">جاري تحميل البيانات...</p>
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
                
                {renderInterestDetails(selectedInterest)}

                <div className="details-actions">
                  <div className="status-actions">
                    <button 
                      className="btn btn-success"
                      onClick={() => openStatusModal(selectedInterest.id, 'تمت المراجعة')}
                      disabled={selectedInterest.status === 'تمت المراجعة' || loading}
                    >
                      <FiCheck />
                      تمت المراجعة
                    </button>
                    
                    <button 
                      className="btn btn-info"
                      onClick={() => openStatusModal(selectedInterest.id, 'تم التواصل')}
                      disabled={selectedInterest.status === 'تم التواصل' || loading}
                    >
                      <FiPhone />
                      تم التواصل
                    </button>
                    
                    <button 
                      className="btn btn-warning"
                      onClick={() => openStatusModal(selectedInterest.id, 'قيد المراجعة')}
                      disabled={selectedInterest.status === 'قيد المراجعة' || loading}
                    >
                      <FiFileText />
                      قيد المراجعة
                    </button>
                    
                    <button 
                      className="btn btn-danger"
                      onClick={() => openStatusModal(selectedInterest.id, 'ملغي')}
                      disabled={selectedInterest.status === 'ملغي' || loading}
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
                disabled={loading}
              >
                إلغاء
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleStatusUpdate}
                disabled={loading}
              >
                <FiCheck />
                {loading ? 'جاري الحفظ...' : 'تأكيد التغيير'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال تفاصيل العقار */}
      {propertyModal.show && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h3>
                <FiMap />
                تفاصيل العقار
              </h3>
              <button 
                className="close-btn"
                onClick={closePropertyModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {propertyModal.loading ? (
                <div className="dashboard-loading">
                  <div className="dashboard-loading-dots">
                    <div className="dashboard-loading-dot"></div>
                    <div className="dashboard-loading-dot"></div>
                    <div className="dashboard-loading-dot"></div>
                  </div>
                  <p className="dashboard-loading-text">جاري تحميل تفاصيل العقار...</p>
                </div>
              ) : (
                renderPropertyDetails(propertyModal.property)
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={closePropertyModal}
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

export default AllInterests;