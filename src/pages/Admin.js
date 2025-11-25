import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [token, setToken] = useState('');
  
  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
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

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://core-api-x41.shaheenplus.sa/api/admin/login', loginData);
      
      if (res.data.access_token) {
        localStorage.setItem('access_token', res.data.access_token);
        setToken(res.data.access_token);
        showMessage('تم تسجيل الدخول بنجاح', 'success');
        setLoginData({ email: '', password: '' });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول';
      showMessage(errorMsg, 'error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://core-api-x41.shaheenplus.sa/api/admin/register', registerData);
      showMessage('تم إنشاء الحساب بنجاح', 'success');
      setRegisterData({
        full_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: ''
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب';
      showMessage(errorMsg, 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/change-password', changePasswordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMessage('تم تغيير كلمة المرور بنجاح', 'success');
      setChangePasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور';
      showMessage(errorMsg, 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('هل أنت متأكد من حذف الحساب؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      return;
    }

    try {
      const res = await axios.delete('/api/admin/delete-account', {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMessage('تم حذف الحساب بنجاح', 'success');
      localStorage.removeItem('access_token');
      setToken('');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'حدث خطأ أثناء حذف الحساب';
      showMessage(errorMsg, 'error');
    }
  };

  const handleGetProfile = async () => {
    try {
      const res = await axios.get('/api/admin/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      showMessage('تم جلب بيانات الملف الشخصي بنجاح', 'success');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'حدث خطأ أثناء جلب بيانات الملف الشخصي';
      showMessage(errorMsg, 'error');
    }
  };

  const tabs = [
    { id: 'login', label: 'تسجيل الدخول' },
    { id: 'register', label: 'تسجيل مشرف' },
    { id: 'profile', label: 'الملف الشخصي' },
    { id: 'change-password', label: 'تغيير كلمة المرور' },
    { id: 'delete-account', label: 'حذف الحساب' }
  ];

  const getMessageClass = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h1 className="text-3xl font-bold text-center">لوحة تحكم المشرفين</h1>
          <p className="text-center text-blue-100 mt-2">إدارة الحساب والصلاحيات</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`border-l-4 ${getMessageClass()} p-4 mx-6 mt-4 rounded-lg`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {message.type === 'success' && (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {message.type === 'error' && (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {message.type === 'info' && (
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message.text}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setMessage({ text: '', type: '' })}
                  className="inline-flex rounded-md p-1.5 hover:bg-gray-100 transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Login Tab */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium"
              >
                تسجيل الدخول
              </button>
            </form>
          )}

          {/* Register Tab */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={registerData.full_name}
                  onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="أدخل الاسم الكامل"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="أدخل رقم الهاتف"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  value={registerData.password_confirmation}
                  onChange={(e) => setRegisterData({ ...registerData, password_confirmation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="أكد كلمة المرور"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all font-medium"
              >
                تسجيل حساب جديد
              </button>
            </form>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 text-sm">استرجاع بيانات الملف الشخصي للمستخدم المسجل حالياً</p>
              </div>
              <button
                onClick={handleGetProfile}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all font-medium"
                disabled={!token}
              >
                {token ? 'جلب بيانات الملف الشخصي' : 'يجب تسجيل الدخول أولاً'}
              </button>
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === 'change-password' && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={changePasswordData.current_password}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, current_password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="أدخل كلمة المرور الحالية"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={changePasswordData.new_password}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, new_password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="أدخل كلمة المرور الجديدة"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={changePasswordData.new_password_confirmation}
                  onChange={(e) => setChangePasswordData({ ...changePasswordData, new_password_confirmation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="أكد كلمة المرور الجديدة"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all font-medium"
                disabled={!token}
              >
                {token ? 'تغيير كلمة المرور' : 'يجب تسجيل الدخول أولاً'}
              </button>
            </form>
          )}

          {/* Delete Account Tab */}
          {activeTab === 'delete-account' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-medium">تحذير: هذا الإجراء لا يمكن التراجع عنه</p>
                <p className="text-red-600 text-sm mt-2">سيتم حذف حسابك وكل البيانات المرتبطة به بشكل نهائي</p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all font-medium"
                disabled={!token}
              >
                {token ? 'حذف الحساب نهائياً' : 'يجب تسجيل الدخول أولاً'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>الحالة: {token ? 'مسجل الدخول' : 'غير مسجل'}</span>
            {token && (
              <button
                onClick={() => {
                  localStorage.removeItem('access_token');
                  setToken('');
                  showMessage('تم تسجيل الخروج بنجاح', 'success');
                }}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                تسجيل الخروج
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;