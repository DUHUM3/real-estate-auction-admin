import React, { useState } from 'react';

const AdminManagement = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: ''
  });
  
  const [changePasswordData, setChangePasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  const [loading, setLoading] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [changePasswordMessage, setChangePasswordMessage] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePasswordInput = (e) => {
    const { name, value } = e.target;
    setChangePasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://72.61.119.194/api/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('تم إنشاء حساب الأدمن بنجاح!');
        setFormData({
          full_name: '',
          email: '',
          password: '',
          password_confirmation: '',
          phone: ''
        });
      } else {
        setError(data.message || 'حدث خطأ أثناء إنشاء الحساب');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordLoading(true);
    setChangePasswordMessage('');
    setChangePasswordError('');

    // تحقق من تطابق كلمة المرور الجديدة
    if (changePasswordData.new_password !== changePasswordData.new_password_confirmation) {
      setChangePasswordError('كلمة المرور الجديدة غير متطابقة');
      setChangePasswordLoading(false);
      return;
    }

    // تحقق من أن كلمة المرور الجديدة مختلفة عن القديمة
    if (changePasswordData.current_password === changePasswordData.new_password) {
      setChangePasswordError('كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية');
      setChangePasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('http://core-api-x41.shaheenplus.sa/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // إذا كنت تحتاج token للمصادقة أضفه هنا
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(changePasswordData)
      });

      const data = await response.json();

      if (response.ok) {
        setChangePasswordMessage('تم تغيير كلمة المرور بنجاح!');
        setChangePasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
      } else {
        setChangePasswordError(data.message || 'حدث خطأ أثناء تغيير كلمة المرور');
      }
    } catch (err) {
      setChangePasswordError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const tabs = [
    { id: 'create', label: 'إنشاء حساب أدمن' },
    { id: 'changePassword', label: 'تغيير كلمة المرور' },
    { id: 'manage', label: 'إدارة الحسابات' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          إدارة حسابات الأدمن
        </h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Create Admin Tab */}
            {activeTab === 'create' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                  إنشاء حساب أدمن جديد
                </h2>
                
                {message && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الاسم الكامل
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="أدخل الاسم الكامل"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="أدخل البريد الإلكتروني"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الهاتف
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="أدخل رقم الهاتف"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        كلمة المرور
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        minLength="8"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="أدخل كلمة المرور"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تأكيد كلمة المرور
                      </label>
                      <input
                        type="password"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleInputChange}
                        required
                        minLength="8"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="أكد كلمة المرور"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Change Password Tab */}
            {activeTab === 'changePassword' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                  تغيير كلمة المرور
                </h2>

                {changePasswordMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                    {changePasswordMessage}
                  </div>
                )}

                {changePasswordError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {changePasswordError}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-6 max-w-2xl">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        كلمة المرور الحالية
                      </label>
                      <input
                        type="password"
                        name="current_password"
                        value={changePasswordData.current_password}
                        onChange={handleChangePasswordInput}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="أدخل كلمة المرور الحالية"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        name="new_password"
                        value={changePasswordData.new_password}
                        onChange={handleChangePasswordInput}
                        required
                        minLength="8"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="أدخل كلمة المرور الجديدة"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        يجب أن تكون كلمة المرور 8 أحرف على الأقل
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تأكيد كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        name="new_password_confirmation"
                        value={changePasswordData.new_password_confirmation}
                        onChange={handleChangePasswordInput}
                        required
                        minLength="8"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="أكد كلمة المرور الجديدة"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={changePasswordLoading}
                      className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changePasswordLoading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Manage Accounts Tab */}
            {activeTab === 'manage' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                  إدارة حسابات الأدمن
                </h2>
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                  هذه الصفحة قيد التطوير. سيتم إضافة وظيفة إدارة الحسابات قريباً.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;