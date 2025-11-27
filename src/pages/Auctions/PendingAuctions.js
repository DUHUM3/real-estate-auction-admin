import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiVideo, FiImage, FiCheck, FiX, FiExternalLink } from 'react-icons/fi';
import '../../styles/PendingUsers.css';

const PendingAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingAuctions();
  }, []);

  const fetchPendingAuctions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        alert('لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
        window.location.href = '/login';
        return;
      }

      const response = await fetch('https://core-api-x41.shaheenplus.sa/api/admin/auctions/pending/list', {
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
        console.log('بيانات المزادات قيد المراجعة:', result);
        
        if (result.success && result.data) {
          setAuctions(result.data || []);
        } else {
          console.error('هيكل البيانات غير متوقع:', result);
          setAuctions([]);
        }
      } else {
        console.error('فشل في جلب المزادات:', response.status);
        alert('فشل في جلب بيانات المزادات قيد المراجعة');
      }
    } catch (error) {
      console.error('خطأ في جلب المزادات:', error);
      alert('حدث خطأ أثناء جلب البيانات: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (auctionId) => {
    if (!window.confirm('هل أنت متأكد من قبول هذا المزاد؟')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://core-api-x41.shaheenplus.sa/api/admin/auctions/${auctionId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // إزالة المزاد من القائمة بعد القبول
        setAuctions(auctions.filter(auction => auction.id !== auctionId));
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
      const response = await fetch(`https://core-api-x41.shaheenplus.sa/api/admin/auctions/${auctionId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // إزالة المزاد من القائمة بعد الرفض
        setAuctions(auctions.filter(auction => auction.id !== auctionId));
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
    return timeString;
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
            {auction.company?.auction_name} - {auction.company?.user?.full_name}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            البريد الإلكتروني
          </div>
          <div className="detail-value">{auction.company?.user?.email}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            الهاتف
          </div>
          <div className="detail-value">{auction.company?.user?.phone}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            الحالة
          </div>
          <div className="detail-value">
            <span className="status-badge pending">قيد المراجعة</span>
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
          <div className="detail-value">{auction.address}</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            الإحداثيات
          </div>
          <div className="detail-value">
            {auction.latitude}, {auction.longitude}
          </div>
        </div>

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
          <div className="detail-value description-text">{auction.description}</div>
        </div>

        {/* معلومات إضافية يمكن إضافتها إذا كانت متوفرة في الرد */}
        {auction.images && auction.images.length > 0 && (
          <div className="images-section">
            <h4>صور المزاد ({auction.images.length})</h4>
            <div className="images-grid">
              {auction.images.map((image, index) => (
                <div key={image.id} className="image-item">
                  <FiImage className="image-icon" />
                  <span className="image-name">صورة {index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {auction.videos && auction.videos.length > 0 && (
          <div className="videos-section">
            <h4>فيديوهات المزاد ({auction.videos.length})</h4>
            <div className="videos-grid">
              {auction.videos.map((video, index) => (
                <div key={video.id} className="video-item">
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

  if (loading) {
    return (
      <div className="pending-users-container">
        <div className="loading">
          <FiCalendar className="loading-icon" />
          جاري تحميل البيانات...
        </div>
      </div>
    );
  }

  return (
    <div className="pending-users-container">
      <div className="content-header">
        <h1>
          <FiCalendar className="header-icon" />
          المزادات قيد المراجعة
        </h1>
        <p>مراجعة واعتماد طلبات المزادات الجديدة - العدد الإجمالي: {auctions.length}</p>
      </div>

      <div className="content-body">
        <div className="users-grid">
          {/* Auctions List */}
          <div className="users-list">
            <div className="list-header">
              <h3>قائمة المزادات ({auctions.length})</h3>
            </div>
            
            {auctions.length === 0 ? (
              <div className="empty-state">
                <FiCalendar className="empty-icon" />
                <p>لا توجد مزادات قيد المراجعة</p>
              </div>
            ) : (
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
                      <span className="user-type">{auction.company?.auction_name}</span>
                      <span className="user-date">
                        <FiCalendar />
                        {formatDate(auction.auction_date)} - {formatTime(auction.start_time)}
                      </span>
                      <div className="auction-address">
                        <FiMapPin />
                        {auction.address}
                      </div>
                    </div>
                    <div className="user-status-container">
                      <span className="status-badge pending">قيد المراجعة</span>
                    </div>
                  </div>
                ))}
              </div>
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
                  <button 
                    className="btn btn-success"
                    onClick={() => handleApprove(selectedAuction.id)}
                    disabled={actionLoading}
                  >
                    <FiCheck />
                    {actionLoading ? 'جاري المعالجة...' : 'قبول المزاد'}
                  </button>
                  
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleReject(selectedAuction.id)}
                    disabled={actionLoading}
                  >
                    <FiX />
                    {actionLoading ? 'جاري المعالجة...' : 'رفض المزاد'}
                  </button>
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

export default PendingAuctions;