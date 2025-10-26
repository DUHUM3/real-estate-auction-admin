import React, { useState, useEffect } from 'react';
import { FiUser, FiClock, FiCheck, FiX, FiMail, FiPhone, FiCalendar, FiFileText, FiHash } from 'react-icons/fi';
import '../../styles/PendingUsers.css';
const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

 const fetchPendingUsers = async () => {
  try {
    const token = localStorage.getItem('access_token');
    
    // تحقق من وجود التوكن
    console.log('التوكن المخزن:', token);
    
    if (!token) {
      alert('لم يتم العثور على رمز الدخول. يرجى تسجيل الدخول مرة أخرى.');
      window.location.href = '/login';
      return;
    }

    // استخدم نفس النطاق المستخدم في تسجيل الدخول
    const response = await fetch('https://shahin-tqay.onrender.com/api/admin/users/pending', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('حالة الاستجابة:', response.status);
    
    if (response.status === 401) {
      alert('انتهت جلسة الدخول أو التوكن غير صالح');
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      return;
    }

    if (response.ok) {
      const result = await response.json();
      console.log('بيانات المستخدمين:', result);
      
      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        console.error('هيكل البيانات غير متوقع:', result);
        setUsers([]);
      }
    } else {
      console.error('فشل في جلب المستخدمين:', response.status);
      const errorText = await response.text();
      console.error('تفاصيل الخطأ:', errorText);
      alert('فشل في جلب بيانات المستخدمين');
    }
  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error);
    alert('حدث خطأ أثناء جلب البيانات: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  const handleApprove = async (userId) => {
    if (!window.confirm('هل أنت متأكد من قبول هذا المستخدم؟')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        setSelectedUser(null);
        alert('تم قبول المستخدم بنجاح');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'فشل في قبول المستخدم');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('حدث خطأ أثناء قبول المستخدم');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا المستخدم؟')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        setSelectedUser(null);
        alert('تم رفض المستخدم بنجاح');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'فشل في رفض المستخدم');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('حدث خطأ أثناء رفض المستخدم');
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderUserDetails = (user) => {
    if (!user.details) {
      return (
        <div className="no-details">
          <FiFileText className="no-details-icon" />
          <p>لا توجد تفاصيل إضافية</p>
        </div>
      );
    }

    switch (user.user_type) {
      case 'وكيل شرعي':
        return (
          <div className="additional-details">
            <h4>تفاصيل الوكيل الشرعي</h4>
            <div className="detail-item">
              <div className="detail-label">
                <FiHash />
                رقم الوكالة
              </div>
              <div className="detail-value">{user.details.agency_number || 'غير محدد'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <FiFileText />
                رقم الهوية
              </div>
              <div className="detail-value">{user.details.national_id || 'غير محدد'}</div>
            </div>
          </div>
        );

      case 'وسيط عقاري':
        return (
          <div className="additional-details">
            <h4>تفاصيل الوسيط العقاري</h4>
            <div className="detail-item">
              <div className="detail-label">
                <FiHash />
                رقم الرخصة
              </div>
              <div className="detail-value">{user.details.license_number || 'غير محدد'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <FiFileText />
                رقم الهوية
              </div>
              <div className="detail-value">{user.details.national_id || 'غير محدد'}</div>
            </div>
          </div>
        );

      case 'مالك أرض':
        return (
          <div className="additional-details">
            <h4>تفاصيل مالك الأرض</h4>
            <div className="detail-item">
              <div className="detail-label">
                <FiFileText />
                رقم الهوية
              </div>
              <div className="detail-value">{user.details.national_id || 'غير محدد'}</div>
            </div>
          </div>
        );

      case 'جهة تجارية':
        return (
          <div className="additional-details">
            <h4>تفاصيل الجهة التجارية</h4>
            <div className="detail-item">
              <div className="detail-label">
                <FiHash />
                السجل التجاري
              </div>
              <div className="detail-value">{user.details.commercial_register || 'غير محدد'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">
                <FiFileText />
                اسم المنشأة
              </div>
              <div className="detail-value">{user.details.business_name || 'غير محدد'}</div>
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
              <div className="detail-value">{user.details.national_id || 'غير محدد'}</div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="pending-users-container">
        <div className="loading">
          <FiClock className="loading-icon" />
          جاري تحميل البيانات...
        </div>
      </div>
    );
  }

  return (
    <div className="pending-users-container">
      <div className="content-header">
        <h1>
          <FiClock className="header-icon" />
          المستخدمين قيد المراجعة
        </h1>
        <p>إدارة طلبات التسجيل الجديدة للمستخدمين - العدد الإجمالي: {users.length}</p>
      </div>

      <div className="content-body">
        <div className="users-grid">
          {/* Users List */}
          <div className="users-list">
            <div className="list-header">
              <h3>قائمة المستخدمين ({users.length})</h3>
            </div>
            
            {users.length === 0 ? (
              <div className="empty-state">
                <FiUser className="empty-icon" />
                <p>لا توجد طلبات تسجيل قيد المراجعة</p>
              </div>
            ) : (
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
                      <span className="user-type">{user.user_type}</span>
                      <span className="user-date">
                        <FiCalendar />
                        {formatDate(user.created_at)}
                      </span>
                    </div>
                    <div className="user-status pending">
                      قيد المراجعة
                    </div>
                  </div>
                ))}
              </div>
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
                    <div className="detail-value">{selectedUser.full_name}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiMail />
                      البريد الإلكتروني
                    </div>
                    <div className="detail-value">{selectedUser.email}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiPhone />
                      رقم الهاتف
                    </div>
                    <div className="detail-value">{selectedUser.phone}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      نوع المستخدم
                    </div>
                    <div className="detail-value">
                      <span className={`user-type-badge ${selectedUser.user_type.replace(/\s+/g, '-')}`}>
                        {selectedUser.user_type}
                      </span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      <FiCalendar />
                      تاريخ التسجيل
                    </div>
                    <div className="detail-value">{formatDate(selectedUser.created_at)}</div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">
                      الحالة
                    </div>
                    <div className="detail-value">
                      <span className="status-badge pending">قيد المراجعة</span>
                    </div>
                  </div>

                  {/* Additional Details Based on User Type */}
                  {renderUserDetails(selectedUser)}
                </div>

                <div className="details-actions">
                  <button 
                    className="btn btn-success"
                    onClick={() => handleApprove(selectedUser.id)}
                    disabled={actionLoading}
                  >
                    <FiCheck />
                    {actionLoading ? 'جاري المعالجة...' : 'قبول المستخدم'}
                  </button>
                  
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleReject(selectedUser.id)}
                    disabled={actionLoading}
                  >
                    <FiX />
                    {actionLoading ? 'جاري المعالجة...' : 'رفض المستخدم'}
                  </button>
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
    </div>
  );
};

export default PendingUsers;