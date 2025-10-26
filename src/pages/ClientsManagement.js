import React, { useState, useEffect } from 'react';
import { FiUser, FiClock, FiCheck, FiX, FiMail, FiPhone, FiCalendar, FiFileText, FiHash, FiGlobe, FiImage, FiPlus, FiTrash2 } from 'react-icons/fi';
import '../styles/PendingUsers.css';

const ClientsManagement = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    logo: null
  });
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  // جلب العملاء المميزين
  const fetchClients = async () => {
    try {
      const response = await fetch('https://shahin-tqay.onrender.com/api/clients/Featured', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('حالة استجابة العملاء:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('بيانات العملاء المستلمة:', result);
        
        // تحديث بناءً على شكل الرد الجديد
        if (Array.isArray(result)) {
          setClients(result);
        } else if (result.data && Array.isArray(result.data)) {
          setClients(result.data);
        } else {
          console.error('هيكل البيانات غير متوقع:', result);
          setClients([]);
        }
      } else {
        console.error('فشل في جلب العملاء:', response.status);
        alert('فشل في جلب بيانات العملاء');
      }
    } catch (error) {
      console.error('خطأ في جلب العملاء:', error);
      alert('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  // إضافة عميل جديد
  const handleAddClient = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('يرجى إدخال اسم العميل');
      return;
    }

    setUploadLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      if (formData.website) {
        formDataToSend.append('website', formData.website);
      }
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }

      const response = await fetch('https://shahin-tqay.onrender.com/api/admin/clients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      console.log('حالة إضافة العميل:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('نتيجة الإضافة:', result);
        
        alert('تم إضافة العميل بنجاح');
        setFormData({ name: '', website: '', logo: null });
        setShowAddForm(false);
        fetchClients(); // تحديث القائمة
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'فشل في إضافة العميل');
      }
    } catch (error) {
      console.error('Error adding client:', error);
      alert('حدث خطأ أثناء إضافة العميل');
    } finally {
      setUploadLoading(false);
    }
  };

  // حذف عميل
  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`https://shahin-tqay.onrender.com/api/admin/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('حالة حذف العميل:', response.status);

      if (response.ok) {
        setClients(clients.filter(client => client.id !== clientId));
        setSelectedClient(null);
        alert('تم حذف العميل بنجاح');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'فشل في حذف العميل');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('حدث خطأ أثناء حذف العميل');
    } finally {
      setActionLoading(false);
    }
  };

  // معالجة اختيار ملف اللوجو
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        alert('يرجى اختيار ملف صورة فقط');
        return;
      }
      
      // التحقق من حجم الملف (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الملف يجب أن يكون أقل من 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        logo: file
      }));
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

  const renderClientDetails = (client) => {
    return (
      <div className="additional-details">
        <h4>تفاصيل العميل</h4>
        
        {client.logo && (
          <div className="detail-item">
            <div className="detail-label">
              <FiImage />
              الشعار
            </div>
            <div className="detail-value">
              <img 
                src={client.logo} 
                alt={`شعار ${client.name}`}
                style={{ 
                  maxWidth: '150px', 
                  maxHeight: '80px', 
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none', color: '#5d6d7e' }}>
                <FiImage /> لا يمكن تحميل الصورة
              </div>
            </div>
          </div>
        )}

        {client.website && (
          <div className="detail-item">
            <div className="detail-label">
              <FiGlobe />
              الموقع الإلكتروني
            </div>
            <div className="detail-value">
              <a 
                href={client.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="link"
              >
                {client.website}
              </a>
            </div>
          </div>
        )}

        <div className="detail-item">
          <div className="detail-label">
            <FiCalendar />
            تاريخ الإضافة
          </div>
          <div className="detail-value">
            {client.created_at ? formatDate(client.created_at) : 'غير محدد'}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <FiCalendar />
            آخر تحديث
          </div>
          <div className="detail-value">
            {client.updated_at ? formatDate(client.updated_at) : 'غير محدد'}
          </div>
        </div>
      </div>
    );
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
          <FiUser className="header-icon" />
          إدارة العملاء المميزين
        </h1>
        <p>إدارة قائمة العملاء المميزين - العدد الإجمالي: {clients.length}</p>
        
        <button 
          className="btn btn-success2"
          onClick={() => setShowAddForm(true)}
          style={{ marginTop: '10px' }}
        >
          <FiPlus />
          إضافة عميل جديد
        </button>
      </div>

      {/* نموذج إضافة عميل جديد */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>إضافة عميل جديد</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddClient} className="add-client-form">
              <div className="form-group">
                <label className="form-label">اسم العميل *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="أدخل اسم العميل"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">الموقع الإلكتروني</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">شعار العميل</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="file-input"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="file-label">
                    <FiImage />
                    {formData.logo ? formData.logo.name : 'اختر ملف الشعار'}
                  </label>
                </div>
                {formData.logo && (
                  <div className="file-preview">
                    <img 
                      src={URL.createObjectURL(formData.logo)} 
                      alt="معاينة الشعار"
                      style={{ 
                        maxWidth: '100px', 
                        maxHeight: '60px',
                        marginTop: '10px',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                  disabled={uploadLoading}
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploadLoading}
                >
                  {uploadLoading ? 'جاري الإضافة...' : 'إضافة العميل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="content-body">
        <div className="users-grid">
          {/* قائمة العملاء */}
          <div className="users-list">
            <div className="list-header">
              <h3>قائمة العملاء ({clients.length})</h3>
            </div>
            
            {clients.length === 0 ? (
              <div className="empty-state">
                <FiUser className="empty-icon" />
                <p>لا توجد عملاء مميزين</p>
              </div>
            ) : (
              <div className="users-cards">
                {clients.map((client) => (
                  <div 
                    key={client.id} 
                    className={`user-card ${selectedClient?.id === client.id ? 'active' : ''}`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="user-avatar">
                      {client.logo ? (
                        <img 
                          src={client.logo} 
                          alt={client.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : null}
                      {!client.logo && <FiUser />}
                    </div>
                    <div className="user-info">
                      <h4>{client.name}</h4>
                      {/* {client.website && (
                        <span className="user-type">
                          <FiGlobe />
                          {client.website}
                        </span>
                      )} */}
                      {client.created_at && (
                        <span className="user-date">
                          <FiCalendar />
                          {formatDate(client.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="user-status approved">
                      مميز
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* تفاصيل العميل */}
          <div className="user-details">
            {selectedClient ? (
              <div className="details-card">
                <div className="details-header">
                  <h3>تفاصيل العميل</h3>
                  <span className="user-id">ID: {selectedClient.id}</span>
                </div>
                
                <div className="details-content">
                  <div className="detail-item">
                    <div className="detail-label">
                      <FiUser />
                      اسم العميل
                    </div>
                    <div className="detail-value">{selectedClient.name}</div>
                  </div>

                  {selectedClient.website && (
                    <div className="detail-item">
                      <div className="detail-label">
                        <FiGlobe />
                        الموقع الإلكتروني
                      </div>
                      <div className="detail-value">
                        <a 
                          href={selectedClient.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="link"
                        >
                          {selectedClient.website}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="detail-item">
                    <div className="detail-label">
                      الحالة
                    </div>
                    <div className="detail-value">
                      <span className="status-badge approved">مميز</span>
                    </div>
                  </div>

                  {/* تفاصيل إضافية */}
                  {renderClientDetails(selectedClient)}
                </div>

                <div className="details-actions">
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteClient(selectedClient.id)}
                    disabled={actionLoading}
                  >
                    <FiTrash2 />
                    {actionLoading ? 'جاري المعالجة...' : 'حذف العميل'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <FiUser className="no-selection-icon" />
                <p>اختر عميلاً لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsManagement;