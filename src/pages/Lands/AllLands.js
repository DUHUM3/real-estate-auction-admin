import React, { useState, useEffect } from 'react';
import { FiMap, FiMapPin, FiUser, FiCalendar, FiDollarSign, FiLayers, FiFilter, FiChevronRight, FiChevronLeft, FiImage } from 'react-icons/fi';
import '../../styles/PendingUsers.css';

const AllLands = () => {
  const [lands, setLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchLands();
  }, [currentPage]);

  const fetchLands = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/properties?page=${currentPage}`, {
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
        console.log('بيانات الأراضي:', result);
        
        if (result.success && result.data) {
          setLands(result.data.data || []);
          setCurrentPage(result.data.current_page);
          setLastPage(result.data.last_page);
          setPerPage(result.data.per_page);
          setTotal(result.data.total);
        } else {
          console.error('هيكل البيانات غير متوقع:', result);
          setLands([]);
        }
      } else {
        console.error('فشل في جلب الأراضي:', response.status);
        alert('فشل في جلب بيانات الأراضي');
      }
    } catch (error) {
      console.error('خطأ في جلب الأراضي:', error);
      alert('حدث خطأ أثناء جلب البيانات: ' + error.message);
    } finally {
      setLoading(false);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'مفتوح':
        return <span className="status-badge open">مفتوح</span>;
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

  const renderLandDetails = (land) => {
    return (
      <div className="details-content">
        <div className="detail-item">
          <div className="detail-label">
            <FiMapPin />
            العنوان
          </div>
          <div className="detail-value">{land.title}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiUser />
            المالك
          </div>
          <div className="detail-value">
            {land.user?.full_name} ({land.user?.email})
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

  // تصفية الأراضي حسب الحالة
  const filteredLands = lands.filter(land => {
    if (filterStatus === 'all') return true;
    return land.status === filterStatus;
  });

  const openCount = lands.filter(land => land.status === 'مفتوح').length;
  const rejectedCount = lands.filter(land => land.status === 'مرفوض').length;
  const soldCount = lands.filter(land => land.status === 'تم البيع').length;
  const pendingCount = lands.filter(land => land.status === 'قيد المراجعة').length;

  // إنشاء أزرار الباجينيشن
  const renderPagination = () => {
    const pages = [];
    
    // زر الصفحة السابقة
    pages.push(
      <button
        key="prev"
        className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FiChevronRight />
      </button>
    );

    // أزرار الصفحات
    for (let i = 1; i <= lastPage; i++) {
      if (i === 1 || i === lastPage || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(
          <button
            key={i}
            className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push(<span key={i} className="pagination-ellipsis">...</span>);
      }
    }

    // زر الصفحة التالية
    pages.push(
      <button
        key="next"
        className={`pagination-btn ${currentPage === lastPage ? 'disabled' : ''}`}
        onClick={() => currentPage < lastPage && setCurrentPage(currentPage + 1)}
        disabled={currentPage === lastPage}
      >
        <FiChevronLeft />
      </button>
    );

    return pages;
  };

  if (loading) {
    return (
      <div className="pending-users-container">
        <div className="loading">
          <FiMap className="loading-icon" />
          جاري تحميل البيانات...
        </div>
      </div>
    );
  }

  return (
    <div className="pending-users-container">
      <div className="content-header">
        <h1>
          <FiMap className="header-icon" />
          إدارة جميع الأراضي
        </h1>
        <p>عرض وإدارة جميع الأراضي في النظام - العدد الإجمالي: {total}</p>
      </div>

      {/* فلتر الحالة */}
      <div className="filter-section">
        <div className="filter-header">
          <FiFilter className="filter-icon" />
          <span>تصفية حسب الحالة:</span>
        </div>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            الكل ({lands.length})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'مفتوح' ? 'active' : ''}`}
            onClick={() => setFilterStatus('مفتوح')}
          >
            مفتوح ({openCount})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'مرفوض' ? 'active' : ''}`}
            onClick={() => setFilterStatus('مرفوض')}
          >
            مرفوض ({rejectedCount})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'تم البيع' ? 'active' : ''}`}
            onClick={() => setFilterStatus('تم البيع')}
          >
            تم البيع ({soldCount})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'قيد المراجعة' ? 'active' : ''}`}
            onClick={() => setFilterStatus('قيد المراجعة')}
          >
            قيد المراجعة ({pendingCount})
          </button>
        </div>
      </div>

      <div className="content-body">
        <div className="users-grid">
          {/* Lands List */}
          <div className="users-list">
            <div className="list-header">
              <h3>قائمة الأراضي ({filteredLands.length})</h3>
              <span className="page-info">
                الصفحة {currentPage} من {lastPage} - إجمالي {total} أرض
              </span>
            </div>
            
            {filteredLands.length === 0 ? (
              <div className="empty-state">
                <FiMap className="empty-icon" />
                <p>لا توجد أراضي</p>
              </div>
            ) : (
              <div className="users-cards">
                {filteredLands.map((land) => (
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
                    <div className="user-status-container">
                      {getStatusBadge(land.status)}
                      <div className="land-area">{land.total_area} م²</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* الباجينيشن */}
            {lastPage > 1 && (
              <div className="pagination">
                {renderPagination()}
              </div>
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
    </div>
  );
};

export default AllLands;