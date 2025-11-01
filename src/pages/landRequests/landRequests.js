import React, { useState, useEffect } from 'react';
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
  FiEye,
  FiNavigation,
  FiTarget,
  FiLayers,
  FiDollarSign,
  FiUsers,
  FiGitPullRequest,
  FiBriefcase,
  FiAward,
  FiInfo
} from 'react-icons/fi';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import '../../styles/PendingUsers.css';

// مكونات أيقونات إضافية
const FiGift = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-2h14a2 2 0 110 2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
);

const LandRequests = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // استرجاع الفلاتر المحفوظة أو استخدام القيم الافتراضية
  const getInitialFilters = () => {
    const savedFilters = localStorage.getItem('landRequestsFilters');
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return {
      search: '',
      status: 'all',
      region: 'all',
      city: 'all',
      purpose: 'all',
      type: 'all',
      area_min: '',
      area_max: '',
      date_from: '',
      date_to: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    };
  };
  
  const [filters, setFilters] = useState(getInitialFilters());
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('landRequestsCurrentPage');
    return savedPage ? parseInt(savedPage) : 1;
  });
  const [statusModal, setStatusModal] = useState({
    show: false,
    requestId: null,
    newStatus: '',
    adminNote: ''
  });

    const [isRefreshing, setIsRefreshing] = useState(false);


      const handleRefresh = async () => {
    console.log('بدء تحديث بيانات طلبات الأراضي...');
    setIsRefreshing(true);
    
    try {
      await refetch();
      console.log('تم تحديث بيانات طلبات الأراضي بنجاح');
    } catch (error) {
      console.error('خطأ في التحديث:', error);
      alert('حدث خطأ أثناء تحديث البيانات: ' + error.message);
    } finally {
      setIsRefreshing(false);
    }
  };


  // حالة المودال لعرض تفاصيل المستخدم
  const [userModal, setUserModal] = useState({
    show: false,
    user: null,
    loading: false
  });

  // حالة المودال لعرض العروض
  const [offersModal, setOffersModal] = useState({
    show: false,
    offers: [],
    loading: false
  });

  // حفظ الفلاتر والصفحة في localStorage عند تغييرها
  useEffect(() => {
    localStorage.setItem('landRequestsFilters', JSON.stringify(filters));
  }, [filters]);
  
  useEffect(() => {
    localStorage.setItem('landRequestsCurrentPage', currentPage.toString());
  }, [currentPage]);
  
  // استعادة الطلب المحدد من localStorage إذا كان موجوداً
  useEffect(() => {
    const savedSelectedRequest = localStorage.getItem('selectedLandRequest');
    if (savedSelectedRequest) {
      setSelectedRequest(JSON.parse(savedSelectedRequest));
    }
  }, []);
  
  // حفظ الطلب المحدد في localStorage
  useEffect(() => {
    if (selectedRequest) {
      localStorage.setItem('selectedLandRequest', JSON.stringify(selectedRequest));
    } else {
      localStorage.removeItem('selectedLandRequest');
    }
  }, [selectedRequest]);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (filters.search.trim()) params.append('search', filters.search.trim());
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.region !== 'all') params.append('region', filters.region);
    if (filters.city !== 'all') params.append('city', filters.city);
    if (filters.purpose !== 'all') params.append('purpose', filters.purpose);
    if (filters.type !== 'all') params.append('type', filters.type);
    if (filters.area_min) params.append('area_min', filters.area_min);
    if (filters.area_max) params.append('area_max', filters.area_max);
    if (filters.date_from) params.append('start_date', filters.date_from);
    if (filters.date_to) params.append('end_date', filters.date_to);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);
    
    params.append('page', currentPage);
    params.append('per_page', 10);
    
    return params.toString();
  };

  // استخدام React Query لجلب بيانات طلبات الأراضي
  const fetchLandRequests = async () => {
    const token = localStorage.getItem('access_token');
      
    if (!token) {
      navigate('/login');
      throw new Error('لم يتم العثور على رمز الدخول');
    }

    const queryString = buildQueryString();
    const url = `https://shahin-tqay.onrender.com/api/admin/land-requests?${queryString}`;

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
      throw new Error(`فشل في جلب طلبات الأراضي: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return {
        data: result.data,
        pagination: result.meta || {
          current_page: currentPage,
          last_page: 1,
          per_page: 10,
          total: result.data.length,
          from: 1,
          to: result.data.length
        },
        filtersData: {
          regions: result.meta?.filters?.regions || [],
          cities: result.meta?.filters?.cities || [],
          purposes: ['sale', 'investment'],
          types: ['residential', 'commercial', 'industrial', 'agricultural'],
          statuses: ['open', 'in_progress', 'completed', 'cancelled']
        }
      };
    } else {
      throw new Error(result.message || 'هيكل البيانات غير متوقع');
    }
  };

  const { 
    data: landRequestsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery(
    ['landRequests', filters, currentPage],
    fetchLandRequests,
    {
      staleTime: 5 * 60 * 1000, // 5 دقائق
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('خطأ في جلب طلبات الأراضي:', error);
        alert('حدث خطأ أثناء جلب البيانات: ' + error.message);
      }
    }
  );

  // دالة لجلب تفاصيل المستخدم
  const fetchUserDetails = async (userId) => {
    const token = localStorage.getItem('access_token');
      
    if (!token) {
      navigate('/login');
      throw new Error('لم يتم العثور على رمز الدخول');
    }

    const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/users/${userId}`, {
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
      throw new Error(`فشل في جلب تفاصيل المستخدم: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || 'هيكل البيانات غير متوقع');
    }
  };

  // فتح مودال تفاصيل المستخدم
  const openUserModal = async (userId) => {
    if (!userId) {
      alert('لا يوجد معرف للمستخدم');
      return;
    }

    setUserModal({
      show: true,
      user: null,
      loading: true
    });

    try {
      const userDetails = await fetchUserDetails(userId);
      setUserModal({
        show: true,
        user: userDetails,
        loading: false
      });
    } catch (error) {
      console.error('خطأ في جلب تفاصيل المستخدم:', error);
      alert('حدث خطأ أثناء جلب تفاصيل المستخدم: ' + error.message);
      setUserModal({
        show: false,
        user: null,
        loading: false
      });
    }
  };

  // إغلاق مودال تفاصيل المستخدم
  const closeUserModal = () => {
    setUserModal({
      show: false,
      user: null,
      loading: false
    });
  };

  // فتح مودال عرض العروض
  const openOffersModal = (offers) => {
    setOffersModal({
      show: true,
      offers: offers || [],
      loading: false
    });
  };

  // إغلاق مودال العروض
  const closeOffersModal = () => {
    setOffersModal({
      show: false,
      offers: [],
      loading: false
    });
  };

  // استخدام useMutation لتحديث حالة طلب الأرض
  const statusMutation = useMutation(
    async ({ requestId, status, adminNote }) => {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/land-requests/${requestId}/status`, {
        method: 'PATCH',
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
        throw new Error(errorData.message || 'فشل في تحديث حالة الطلب');
      }

      return await response.json();
    },
    {
      onSuccess: () => {
        alert('تم تحديث حالة الطلب بنجاح');
        refetch(); // إعادة تحميل البيانات
        setSelectedRequest(null);
        closeStatusModal();
        queryClient.invalidateQueries(['landRequests']);
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
      purpose: 'all',
      type: 'all',
      area_min: '',
      area_max: '',
      date_from: '',
      date_to: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const openStatusModal = (requestId, newStatus) => {
    setStatusModal({
      show: true,
      requestId,
      newStatus,
      adminNote: ''
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      show: false,
      requestId: null,
      newStatus: '',
      adminNote: ''
    });
  };

  const handleStatusUpdate = async () => {
    if (!statusModal.requestId || !statusModal.newStatus) {
      alert('بيانات غير مكتملة');
      return;
    }

    statusMutation.mutate({
      requestId: statusModal.requestId,
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
      case 'open':
        return <span className="status-badge pending">مفتوح</span>;
      case 'in_progress':
        return <span className="status-badge in-progress">قيد المعالجة</span>;
      case 'completed':
        return <span className="status-badge approved">مكتمل</span>;
      case 'cancelled':
        return <span className="status-badge rejected">ملغي</span>;
      default:
        return <span className="status-badge unknown">{status}</span>;
    }
  };

  const getUserStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="status-badge approved">نشط</span>;
      case 'pending':
        return <span className="status-badge pending">قيد المراجعة</span>;
      case 'suspended':
        return <span className="status-badge rejected">موقوف</span>;
      default:
        return <span className="status-badge unknown">{status}</span>;
    }
  };

  const getUserTypeBadge = (userType) => {
    switch (userType) {
      case 'مالك':
        return <span className="type-badge owner">مالك</span>;
      case 'وكيل شرعي':
        return <span className="type-badge legal-agent">وكيل شرعي</span>;
      case 'شركة':
        return <span className="type-badge company">شركة</span>;
      case 'وسيط عقاري':
        return <span className="type-badge broker">وسيط عقاري</span>;
      case 'شركة مزاد':
        return <span className="type-badge auction">شركة مزاد</span>;
      default:
        return <span className="type-badge unknown">{userType}</span>;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return 'مفتوح';
      case 'in_progress':
        return 'قيد المعالجة';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'pending';
      case 'in_progress':
        return 'in-progress';
      case 'completed':
        return 'approved';
      case 'cancelled':
        return 'rejected';
      default:
        return 'unknown';
    }
  };

  const getPurposeText = (purpose) => {
    switch (purpose) {
      case 'sale':
        return 'بيع';
      // case 'rent':
      //   return 'إيجار';
      case 'investment':
        return 'استثمار';
      default:
        return purpose;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'residential':
        return 'سكني';
      case 'commercial':
        return 'تجاري';
      case 'industrial':
        return 'صناعي';
      case 'agricultural':
        return 'زراعي';
      default:
        return type;
    }
  };

  const getStatusMessagePlaceholder = (status) => {
    switch (status) {
      case 'completed':
        return 'اكتب رسالة للمستخدم توضح إتمام الطلب...';
      case 'in_progress':
        return 'اكتب ملاحظات حول عملية المعالجة...';
      case 'cancelled':
        return 'اكتب سبب إلغاء الطلب...';
      case 'open':
        return 'اكتب ملاحظات إضافية حول الطلب...';
      default:
        return 'اكتب ملاحظات إضافية...';
    }
  };

  // دالة لترجمة أسماء الحقول في تفاصيل المستخدم
  const getUserDetailFieldLabel = (fieldName) => {
    const labels = {
      'id': 'رقم المعرف',
      'user_id': 'رقم المستخدم',
      'national_id': 'رقم الهوية',
      'commercial_registration': 'السجل التجاري',
      'license_number': 'رقم الترخيص',
      'agency_number': 'رقم الوكالة',
      'deed_number': 'رقم الصك',
      'bank_account': 'الحساب البنكي',
      'address': 'العنوان',
      'city': 'المدينة',
      'region': 'المنطقة',
      'created_at': 'تاريخ الإنشاء',
      'updated_at': 'تاريخ التحديث'
    };
    
    return labels[fieldName] || fieldName;
  };

  // دالة لعرض تفاصيل المستخدم في المودال بناءً على الهيكل الجديد
  const renderUserDetails = (user) => {
    if (!user) return null;

    // تحديد نوع المستخدم والتفاصيل المرتبطة به
    const getUserTypeDetails = () => {
      const userType = user.user_type;
      const details = user.details || {};
      
      switch (userType) {
        case 'مالك':
          return {
            icon: <FiUser className="detail-icon" />,
            title: 'معلومات المالك',
            data: details.land_owner
          };
        case 'وكيل شرعي':
          return {
            icon: <FiBriefcase className="detail-icon" />,
            title: 'معلومات الوكيل الشرعي',
            data: details.legal_agent
          };
        case 'شركة':
          return {
            icon: <FiAward className="detail-icon" />,
            title: 'معلومات الشركة',
            data: details.business_entity
          };
        case 'وسيط عقاري':
          return {
            icon: <FiAward className="detail-icon" />,
            title: 'معلومات الوسيط العقاري',
            data: details.real_estate_broker
          };
        case 'شركة مزاد':
          return {
            icon: <FiGift className="detail-icon" />,
            title: 'معلومات شركة المزاد',
            data: details.auction_company
          };
        default:
          return {
            icon: <FiUser className="detail-icon" />,
            title: 'معلومات المستخدم',
            data: null
          };
      }
    };

    const userTypeDetails = getUserTypeDetails();

    return (
      <div className="user-details-form">
        <div className="form-section">
          <h4>المعلومات الأساسية</h4>
          <div className="form-row">
            <div className="form-group">
              <label>الاسم الكامل</label>
              <div className="form-value">{user.full_name || 'غير متوفر'}</div>
            </div>
            <div className="form-group">
              <label>البريد الإلكتروني</label>
              
              <div className="form-value">{user.email || 'غير متوفر'}</div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>رقم الهاتف</label>
              <div className="form-value">{user.phone || 'غير متوفر'}</div>
            </div>
            <div className="form-group">
              <label>حالة المستخدم</label>
              <div className="form-value">
                {getUserStatusBadge(user.status)}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>نوع المستخدم</label>
              <div className="form-value">
                {getUserTypeBadge(user.user_type)}
              </div>
            </div>
            <div className="form-group">
              <label>رقم المستخدم</label>
              <div className="form-value">#{user.id}</div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>معلومات التسجيل</h4>
          <div className="form-row">
            <div className="form-group">
              <label>تاريخ التسجيل</label>
              <div className="form-value">{formatDate(user.created_at)}</div>
            </div>
            <div className="form-group">
              <label>آخر تحديث</label>
              <div className="form-value">{formatDate(user.updated_at)}</div>
            </div>
          </div>
        </div>

        {user.admin_message && (
          <div className="form-section">
            <h4>رسالة المسؤول</h4>
            <div className="form-group full-width">
              <div className="form-value admin-message">{user.admin_message}</div>
            </div>
          </div>
        )}

        {/* عرض التفاصيل الخاصة بنوع المستخدم */}
        {userTypeDetails.data && (
          <div className="form-section">
            <h4>
              {userTypeDetails.icon}
              {userTypeDetails.title}
            </h4>
            {Object.entries(userTypeDetails.data).map(([key, value]) => (
              value && (
                <div key={key} className="form-row">
                  <div className="form-group">
                    <label>{getUserDetailFieldLabel(key)}</label>
                    <div className="form-value">{value}</div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* إذا لم تكن هناك تفاصيل إضافية */}
        {!userTypeDetails.data && user.user_type && (
          <div className="form-section">
            <h4>
              {userTypeDetails.icon}
              {userTypeDetails.title}
            </h4>
            <div className="no-details">
              <FiInfo className="no-details-icon" />
              <p>لا توجد تفاصيل إضافية متاحة</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // دالة لعرض العروض في المودال
  const renderOffers = (offers) => {
    if (!offers || offers.length === 0) {
      return (
        <div className="empty-state">
          <FiUsers className="empty-icon" />
          <p>لا توجد عروض لهذا الطلب</p>
        </div>
      );
    }

    return (
      <div className="offers-list">
        {offers.map((offer, index) => (
          <div key={offer.offer_id || index} className="offer-item">
            <div className="offer-header">
              <div className="offer-user">
                <FiUser className="offer-user-icon" />
                <span className="offer-user-name">{offer.offer_user?.name || 'مستخدم غير معروف'}</span>
              </div>
              <span className="offer-date">{formatDate(offer.created_at)}</span>
            </div>
            <div className="offer-message">
              <FiMessageSquare className="offer-message-icon" />
              <p>{offer.message}</p>
            </div>
            <div className="offer-contact">
              <span className="offer-email">
                <FiMail /> {offer.offer_user?.email || 'غير متوفر'}
              </span>
              <span className="offer-phone">
                <FiPhone /> {offer.offer_user?.phone || 'غير متوفر'}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRequestDetails = (request) => {
    return (
      <div className="details-content">
        <div className="detail-item">
          <div className="detail-label">
            <FiUser />
            اسم مقدم الطلب
          </div>
          <div className="detail-value owner-info">
            <span>{request.user?.name || request.user?.full_name || 'غير معروف'}</span>
            {request.user?.id && (
              <button 
                className="owner-view-btn"
                onClick={() => openUserModal(request.user.id)}
                title="عرض تفاصيل المستخدم"
              >
                <FiEye />
              </button>
            )}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiMail />
            البريد الإلكتروني
          </div>
          <div className="detail-value">{request.user?.email || 'غير متوفر'}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiPhone />
            رقم الهاتف
          </div>
          <div className="detail-value">{request.user?.phone || 'غير متوفر'}</div>
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
            <FiTarget />
            الغرض
          </div>
          <div className="detail-value">{getPurposeText(request.purpose)}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiLayers />
            النوع
          </div>
          <div className="detail-value">{getTypeText(request.type)}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            المساحة
          </div>
          <div className="detail-value">{request.area} م²</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            عدد العروض
          </div>
          <div className="detail-value owner-info">
            <span>{request.offers?.length || 0} عرض</span>
            {request.offers && request.offers.length > 0 && (
              <button 
                className="owner-view-btn"
                onClick={() => openOffersModal(request.offers)}
                title="عرض العروض"
              >
                <FiGitPullRequest />
              </button>
            )}
          </div>
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
          <div className="detail-value message-text">{request.description || 'لا يوجد وصف'}</div>
        </div>
      </div>
    );
  };

  // إنشاء أزرار الباجينيشن
  const renderPagination = () => {
    if (!landRequestsData || !landRequestsData.pagination || landRequestsData.pagination.last_page <= 1) return null;

    const pages = [];
    const pagination = landRequestsData.pagination;
    
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
                          filters.city !== 'all' || filters.purpose !== 'all' || filters.type !== 'all' || 
                          filters.area_min || filters.area_max || filters.date_from || filters.date_to;

  // استخراج البيانات من نتيجة الاستعلام
  const requests = landRequestsData?.data || [];
  const pagination = landRequestsData?.pagination || {
    current_page: currentPage,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  };
  const filtersData = landRequestsData?.filtersData || {
    regions: [],
    cities: [],
    purposes: ['sale', 'investment'],
    types: ['residential', 'commercial', 'industrial', 'agricultural'],
    statuses: ['open', 'in_progress', 'completed', 'cancelled']
  };

const loading = isLoading || isRefreshing || statusMutation.isLoading;
  return (
    <div className="pending-users-container">
      {/* <div className="content-header">
        <h1>
          <FiMap className="header-icon" />
          إدارة طلبات الأراضي
        </h1>
        <p>عرض وإدارة جميع طلبات الأراضي - العدد الإجمالي: {pagination.total}</p>
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
    <option value="عفيف">عفيف</option>              {filtersData.cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
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
              {filtersData.purposes.map(purpose => (
                <option key={purpose} value={purpose}>{getPurposeText(purpose)}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>النوع:</label>
            <select 
              value={filters.type} 
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="filter-select"
            >
              <option value="all">جميع الأنواع</option>
              {filtersData.types.map(type => (
                <option key={type} value={type}>{getTypeText(type)}</option>
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
              {filtersData.statuses.map(status => (
                <option key={status} value={status}>{getStatusText(status)}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>المساحة من (م²):</label>
            <input
              type="number"
              value={filters.area_min}
              onChange={(e) => handleFilterChange('area_min', e.target.value)}
              placeholder="أدنى مساحة"
              className="filter-select"
            />
          </div>

          <div className="filter-group">
            <label>المساحة إلى (م²):</label>
            <input
              type="number"
              value={filters.area_max}
              onChange={(e) => handleFilterChange('area_max', e.target.value)}
              placeholder="أقصى مساحة"
              className="filter-select"
            />
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
              <option value="created_at">تاريخ الطلب</option>
              <option value="area">المساحة</option>
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
          {/* Land Requests List */}
          <div className="users-list">
            <div className="list-header">
              <h3>قائمة طلبات الأراضي ({requests.length})</h3>
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
            ) : requests.length === 0 ? (
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
                        <h4>{request.user?.name || request.user?.full_name || 'مستخدم غير معروف'}</h4>
                        <span className="user-type">
                          <FiNavigation />
                          {request.region} - {request.city}
                        </span>
                        <span className="user-type">
                          <FiTarget />
                          {getPurposeText(request.purpose)} - {getTypeText(request.type)}
                        </span>
                        <span className="user-date">
                          <FiCalendar />
                          {formatDate(request.created_at)}
                        </span>
                        <div className="user-message-preview">
                          <FiMessageSquare />
                          {request.description?.substring(0, 50)}...
                        </div>
                        {request.offers && request.offers.length > 0 && (
                          <div className="user-offers-count">
                            <FiGitPullRequest />
                            {request.offers.length} عرض
                          </div>
                        )}
                      </div>
                      <div className={`user-status ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
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
                  <h3>تفاصيل طلب الأرض</h3>
                  <span className="user-id">ID: {selectedRequest.id}</span>
                </div>
                
                {renderRequestDetails(selectedRequest)}

                <div className="details-actions">
                  <div className="status-actions">
                    <button 
                      className="btn btn-success"
                      onClick={() => openStatusModal(selectedRequest.id, 'completed')}
                      disabled={selectedRequest.status === 'completed' || loading}
                    >
                      <FiCheck />
                      إكمال
                    </button>
                    
                    <button 
                      className="btn btn-warning"
                      onClick={() => openStatusModal(selectedRequest.id, 'in_progress')}
                      disabled={selectedRequest.status === 'in_progress' || loading}
                    >
                      <FiFileText />
                      قيد المعالجة
                    </button>
                    
                    <button 
                      className="btn btn-danger"
                      onClick={() => openStatusModal(selectedRequest.id, 'cancelled')}
                      disabled={selectedRequest.status === 'cancelled' || loading}
                    >
                      <FiX />
                      إلغاء
                    </button>

                    <button 
                      className="btn btn-info"
                      onClick={() => openStatusModal(selectedRequest.id, 'open')}
                      disabled={selectedRequest.status === 'open' || loading}
                    >
                      <FiRefreshCw />
                      إعادة فتح
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <FiMap className="no-selection-icon" />
                <p>اختر طلب أرض لعرض التفاصيل</p>
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

      {/* مودال تفاصيل المستخدم */}
      {userModal.show && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h3>
                <FiUser />
                تفاصيل المستخدم
              </h3>
              <button 
                className="close-btn"
                onClick={closeUserModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {userModal.loading ? (
                <div className="dashboard-loading">
                  <div className="dashboard-loading-dots">
                    <div className="dashboard-loading-dot"></div>
                    <div className="dashboard-loading-dot"></div>
                    <div className="dashboard-loading-dot"></div>
                  </div>
                  <p className="dashboard-loading-text">جاري تحميل تفاصيل المستخدم...</p>
                </div>
              ) : (
                renderUserDetails(userModal.user)
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={closeUserModal}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال عرض العروض */}
      {offersModal.show && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h3>
                <FiGitPullRequest />
                العروض المقدمة للطلب
              </h3>
              <button 
                className="close-btn"
                onClick={closeOffersModal}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {renderOffers(offersModal.offers)}
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={closeOffersModal}
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

export default LandRequests;