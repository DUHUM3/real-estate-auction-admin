import React, { useState, useEffect, useRef } from 'react';
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
  const trianglesCreated = useRef(false);
  
  const navigate = useNavigate();

  // دالة لإنشاء المثلثات العشوائية
  const createTriangles = () => {
    if (trianglesCreated.current) return;
    
    const trianglesContainer = document.getElementById('triangles-background');
    if (!trianglesContainer) return;
    
    // مسح المثلثات القديمة
    trianglesContainer.innerHTML = '';
    
    // عدد المثلثات المراد إنشاؤها
    const triangleCount = 20;
    
    // ألوان المثلثات (درجات من الأزرق)
    const colors = [
      '#5DA7E1', '#4A90E2', '#357ABD', 
      '#2A5D84', '#1E4A6D', '#16354d'
    ];
    
    for (let i = 0; i < triangleCount; i++) {
      const triangle = document.createElement('div');
      triangle.className = 'triangle';
      
      // حجم عشوائي
      const size = Math.random() * 100 + 30; // بين 30 و 130 بكسل
      
      // موقع عشوائي - فقط في المنطقة البيضاء (النصف السفلي)
      const left = Math.random() * 100; // بين 0% و 100%
      const top = 50 + Math.random() * 50; // بين 50% و 100% (النصف السفلي فقط)
      
      // لون عشوائي
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // دوران عشوائي
      const rotation = Math.random() * 360;
      
      // إنشاء المثلث باستخدام CSS borders
      triangle.style.width = '0';
      triangle.style.height = '0';
      triangle.style.borderLeft = `${size/2}px solid transparent`;
      triangle.style.borderRight = `${size/2}px solid transparent`;
      triangle.style.borderBottom = `${size}px solid ${color}`;
      triangle.style.left = `${left}%`;
      triangle.style.top = `${top}%`;
      triangle.style.transform = `rotate(${rotation}deg)`;
      triangle.style.position = 'absolute';
      
      trianglesContainer.appendChild(triangle);
    }
    
    trianglesCreated.current = true;
  };

  useEffect(() => {
    // تأخير إنشاء المثلثات لضمان تحميل DOM
    const timer = setTimeout(() => {
      createTriangles();
    }, 100);
    
    // إعادة إنشاء المثلثات عند تغيير حجم النافذة
    const handleResize = () => {
      trianglesCreated.current = false;
      createTriangles();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      window.location.href = '/dashboard';
      
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* المثلثات العشوائية في الخلفية البيضاء */}
      <div id="triangles-background" className="triangles-background"></div>
      
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
              <div className="logo-container">
                <img 
                  src={process.env.PUBLIC_URL + "/images/logo.png"} 
                  alt="شاهين Logo" 
                  className="brand-logo"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* قسم نموذج التسجيل في النصف السفلي */}
      <div className="login-form-section">
        <div className="login-container">
          <div className="login-content">
            <div className="login-header">
              <h1>تسجيل الدخول</h1>
              <p>أدخل بياناتك للمتابعة إلى لوحة التحكم</p>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

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