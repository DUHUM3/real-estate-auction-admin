import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthController from '../utils/authController';
import '../styles/Login.css';

function LoginPage({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // تحقق من صحة البيانات الأساسية
    if (!formData.email || !formData.password) {
      setError('يرجى ملء جميع الحقول');
      setLoading(false);
      return;
    }

    console.log('بيانات التسجيل:', formData);

    const result = await AuthController.login(formData.email, formData.password);

    console.log('نتيجة تسجيل الدخول:', result);

    if (result.success) {
      console.log('تم تسجيل الدخول بنجاح، التوجيه إلى Dashboard...');
      
      // تحديث حالة المصادقة في App.js
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      // استخدام window.location.href للتأكد من إعادة التحميل
      window.location.href = '/dashboard';
      
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* قسم الصورة في النصف العلوي */}
      <div className="login-image-section">
        <div className="image-container">
          <img 
            src={process.env.PUBLIC_URL + "/images/3.jpg"} 
            alt="صورة ترحيبية" 
            className="welcome-image"
          />
          <div className="image-overlay">
            <div className="welcome-text">
              <h1 className="welcome-title">SHAHIN</h1>
              {/* <p className="welcome-subtitle">نحن سعداء بعودتك. تفضل بتسجيل الدخول للوصول إلى حسابك.</p> */}
            </div>
          </div>
        </div>
      </div>

      {/* قسم نموذج تسجيل الدخول في النصف السفلي */}
      <div className="login-form-section">
        <div className="login-container">
          <div className="login-content">
            <div className="login-header">
              <h1>تسجيل الدخول</h1>
              <p>أدخل بياناتك للمتابعة إلى لوحة التحكم</p>
            </div>

            {/* عرض رسالة الخطأ */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* نموذج تسجيل الدخول */}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">كلمة المرور</label>
                <input
                  type="password"
                  name="password"
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>تذكرني</span>
                </label>
                <a href="#forgot" className="forgot-password">
                  نسيت كلمة المرور؟
                </a>
              </div>

              <button 
                type="submit" 
                className="btn-login-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;