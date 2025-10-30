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
  FiEye
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
        // لا نرسل أي بيانات في body
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
        refetch(); // إعادة تحميل البيانات
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
        method: 'POST', // تم التغيير من PUT إلى POST
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
        refetch(); // إعادة تحميل البيانات
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

  // دالة لعرض تفاصيل المالك في الفورم
  const renderOwnerDetails = (owner) => {
    if (!owner) return null;

    return (
      <div className="owner-details-form">
        <div className="form-section">
          <h4>المعلومات الشخصية</h4>
          <div className="form-row">
            <div className="form-group">
              <label>الاسم الكامل</label>
              <div className="form-value">{owner.full_name || 'غير متوفر'}</div>
            </div>
            <div className="form-group">
              <label>البريد الإلكتروني</label>
              <div className="form-value">{owner.email || 'غير متوفر'}</div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>رقم الهاتف</label>
              <div className="form-value">{owner.phone || 'غير متوفر'}</div>
            </div>
            {/* <div className="form-group">
              <label>نوع المستخدم</label>
              <div className="form-value">{owner.user_type || 'غير محدد'}</div>
            </div> */}
          </div>
        </div>

        {/* <div className="form-section">
          <h4>المعلومات الإضافية</h4>
          <div className="form-row">
            <div className="form-group">
              <label>تاريخ التسجيل</label>
              <div className="form-value">{owner.created_at ? formatDate(owner.created_at) : 'غير متوفر'}</div>
            </div>
            <div className="form-group">
              <label>حالة الحساب</label>
              <div className="form-value">
                <span className={`status-badge ${owner.status === 'نشط' ? 'approved' : 'pending'}`}>
                  {owner.status || 'غير محدد'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {owner.additional_info && (
          <div className="form-section">
            <h4>معلومات إضافية</h4>
            <div className="form-group full-width">
              <div className="form-value">{owner.additional_info}</div>
            </div>
          </div>
        )} */}
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
          <div className="detail-value">{land.title}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiUser />
            المالك
          </div>
          <div className="detail-value owner-info">
            {/* <span>{land.user?.full_name} ({land.user?.email}) - {land.user?.phone}</span> */}
            <button 
              className="owner-view-btn"
              onClick={() => openOwnerModal(land.user)}
              title="عرض تفاصيل المالك"
            >
              <FiEye />
            </button>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            رقم الإعلان
          </div>
          <div className="detail-value">{land.announcement_number}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiMapPin />
            الموقع
          </div>
          <div className="detail-value">{land.region} - {land.city}</div>
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
          <div className="detail-value">{land.total_area} م²</div>
        </div>

        {land.price_per_sqm && (
          <div className="detail-item">
            <div className="detail-label">
              <FiDollarSign />
              سعر المتر
            </div>
            <div className="detail-value">{land.price_per_sqm} ريال/م²</div>
          </div>
        )}

        {land.estimated_investment_value && (
          <div className="detail-item">
            <div className="detail-label">
              <FiDollarSign />
              القيمة الاستثمارية
            </div>
            <div className="detail-value">{land.estimated_investment_value} ريال</div>
          </div>
        )}

        <div className="detail-item">
          <div className="detail-label">
            رقم الصك
          </div>
          <div className="detail-value">{land.deed_number}</div>
        </div>

        {land.agency_number && (
          <div className="detail-item">
            <div className="detail-label">
              رقم الوكالة
            </div>
            <div className="detail-value">{land.agency_number}</div>
          </div>
        )}

        <div className="detail-item">
          <div className="detail-label">
            الإحداثيات
          </div>
          <div className="detail-value">{land.geo_location_text}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiCalendar />
            تاريخ الإضافة
          </div>
          <div className="detail-value">{formatDate(land.created_at)}</div>
        </div>

        <div className="detail-item full-width">
          <div className="detail-label">
            الوصف
          </div>
          <div className="detail-value description-text">{land.description}</div>
        </div>

        {/* الأبعاد */}
        <div className="dimensions-section">
          <h4>أبعاد الأرض</h4>
          <div className="dimensions-grid">
            <div className="dimension-item">
              <span className="dimension-label">الشمال</span>
              <span className="dimension-value">{land.length_north} م</span>
            </div>
            <div className="dimension-item">
              <span className="dimension-label">الجنوب</span>
              <span className="dimension-value">{land.length_south} م</span>
            </div>
            <div className="dimension-item">
              <span className="dimension-label">الشرق</span>
              <span className="dimension-value">{land.length_east} م</span>
            </div>
            <div className="dimension-item">
              <span className="dimension-label">الغرب</span>
              <span className="dimension-value">{land.length_west} م</span>
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

  const loading = isLoading || approveMutation.isLoading || rejectMutation.isLoading;

  return (
    <div className="pending-users-container">
      {/* <div className="content-header">
        <h1>
          <FiMap className="header-icon" />
          إدارة جميع الأراضي
        </h1>
        <p>عرض وإدارة جميع الأراضي في النظام - العدد الإجمالي: {pagination.total}</p>
      
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

    {/* منطقة الرياض */}
    <option value="الرياض">الرياض</option>
    <option value="الدرعية">الدرعية</option>
    <option value="الخرج">الخرج</option>
    <option value="الدوادمي">الدوادمي</option>
    <option value="المجمعة">المجمعة</option>
    <option value="القويعية">القويعية</option>
    <option value="الأفلاج">الأفلاج</option>
    <option value="وادي الدواسر">وادي الدواسر</option>
    <option value="الزلفي">الزلفي</option>
    <option value="شقراء">شقراء</option>
    <option value="حوطة بني تميم">حوطة بني تميم</option>
    <option value="عفيف">عفيف</option>
    <option value="الغاط">الغاط</option>
    <option value="رماح">رماح</option>
    <option value="الحريق">الحريق</option>
    <option value="ثادق">ثادق</option>

    {/* منطقة مكة المكرمة */}
    <option value="مكة المكرمة">مكة المكرمة</option>
    <option value="جدة">جدة</option>
    <option value="الطائف">الطائف</option>
    <option value="الليث">الليث</option>
    <option value="القنفذة">القنفذة</option>
    <option value="رابغ">رابغ</option>
    <option value="خليص">خليص</option>
    <option value="الجموم">الجموم</option>

    {/* المدينة المنورة */}
    <option value="المدينة المنورة">المدينة المنورة</option>
    <option value="ينبع">ينبع</option>
    <option value="العلا">العلا</option>
    <option value="الحناكية">الحناكية</option>
    <option value="بدر">بدر</option>
    <option value="خيبر">خيبر</option>

    {/* القصيم */}
    <option value="بريدة">بريدة</option>
    <option value="عنيزة">عنيزة</option>
    <option value="الرس">الرس</option>
    <option value="البكيرية">البكيرية</option>
    <option value="المذنب">المذنب</option>
    <option value="البدائع">البدائع</option>
    <option value="رياض الخبراء">رياض الخبراء</option>
    <option value="عقلة الصقور">عقلة الصقور</option>
    <option value="النبهانية">النبهانية</option>

    {/* الشرقية */}
    <option value="الدمام">الدمام</option>
    <option value="الخبر">الخبر</option>
    <option value="الظهران">الظهران</option>
    <option value="الجبيل">الجبيل</option>
    <option value="الاحساء">الاحساء</option>
    <option value="القطيف">القطيف</option>
    <option value="بقيق">بقيق</option>
    <option value="النعيرية">النعيرية</option>
    <option value="قرية العليا">قرية العليا</option>
    <option value="رأس تنورة">رأس تنورة</option>
    <option value="الخفجي">الخفجي</option>
    <option value="حفر الباطن">حفر الباطن</option>

    {/* عسير */}
    <option value="أبها">أبها</option>
    <option value="خميس مشيط">خميس مشيط</option>
    <option value="بيشة">بيشة</option>
    <option value="النماص">النماص</option>
    <option value="محايل عسير">محايل عسير</option>
    <option value="ظهران الجنوب">ظهران الجنوب</option>
    <option value="سراة عبيدة">سراة عبيدة</option>
    <option value="تثليث">تثليث</option>

    {/* تبوك */}
    <option value="تبوك">تبوك</option>
    <option value="الوجه">الوجه</option>
    <option value="ضباء">ضباء</option>
    <option value="أملج">أملج</option>
    <option value="حقل">حقل</option>
    <option value="تيماء">تيماء</option>

    {/* حائل */}
    <option value="حائل">حائل</option>
    <option value="بقعاء">بقعاء</option>
    <option value="الغزالة">الغزالة</option>
    <option value="الشملي">الشملي</option>
    <option value="الشنان">الشنان</option>
    <option value="الحائط">الحائط</option>

    {/* الحدود الشمالية */}
    <option value="عرعر">عرعر</option>
    <option value="رفحاء">رفحاء</option>
    <option value="طريف">طريف</option>
    <option value="العويقيلة">العويقيلة</option>

    {/* جازان */}
    <option value="جازان">جازان</option>
    <option value="صبيا">صبيا</option>
    <option value="صامطة">صامطة</option>
    <option value="أبو عريش">أبو عريش</option>
    <option value="بيش">بيش</option>
    <option value="فرسان">فرسان</option>
    <option value="الدرب">الدرب</option>
    <option value="العارضة">العارضة</option>

    {/* نجران */}
    <option value="نجران">نجران</option>
    <option value="شرورة">شرورة</option>
    <option value="حبونا">حبونا</option>
    <option value="بدر الجنوب">بدر الجنوب</option>

    {/* الباحة */}
    <option value="الباحة">الباحة</option>
    <option value="بلجرشي">بلجرشي</option>
    <option value="المندق">المندق</option>
    <option value="العقيق">العقيق</option>
    <option value="قلوة">قلوة</option>
    <option value="المخواة">المخواة</option>

    {/* الجوف */}
    <option value="سكاكا">سكاكا</option>
    <option value="القريات">القريات</option>
    <option value="دومة الجندل">دومة الجندل</option>
    <option value="طبرجل">طبرجل</option>
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