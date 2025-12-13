import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthController from '../utils/authController';

/*
=================================================================================
                            فهرس محتويات المكون
=================================================================================
1. إعدادات الحالة والمتغيرات (State & Variables)
2. دوال الحماية والفلترة (Security & Validation)
3. دوال الخلفية والمثلثات (Background & Triangles)
4. دوال التعامل مع النموذج (Form Handlers)
5. الواجهة الرئيسية (Main UI)
6. قسم الشعار والترحيب (Logo & Welcome Section)
7. قسم النموذج (Form Section)
=================================================================================
*/

function LoginPage({ onLoginSuccess }) {
  // ==================== 1. إعدادات الحالة والمتغيرات ====================
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const trianglesCreated = useRef(false);
  const attemptCount = useRef(0);
  const lastAttemptTime = useRef(0);
  
  const navigate = useNavigate();

  // ==================== 2. دوال الحماية والفلترة ====================
  
  // فلترة النصوص من الرموز الخطيرة
  const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/[<>]/g, '') // إزالة HTML tags
      .replace(/javascript:/gi, '') // إزالة JavaScript URLs
      .replace(/on\w+=/gi, '') // إزالة event handlers
      .trim();
  };

  // التحقق من صحة البريد الإلكتروني
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 100;
  };

  // التحقق من قوة كلمة المرور
  const validatePassword = (password) => {
    return password.length >= 6 && password.length <= 128;
  };

  // حماية من هجمات Brute Force
  const checkRateLimit = () => {
    const now = Date.now();
    const timeDiff = now - lastAttemptTime.current;
    
    if (timeDiff < 1000) { // أقل من ثانية واحدة
      return false;
    }
    
    if (attemptCount.current >= 5 && timeDiff < 300000) { // 5 محاولات في 5 دقائق
      return false;
    }
    
    if (timeDiff > 300000) { // إعادة تعيين بعد 5 دقائق
      attemptCount.current = 0;
    }
    
    return true;
  };

  // فلترة وتنظيف البيانات المدخلة
  const cleanFormData = (data) => {
    return {
      email: sanitizeInput(data.email).toLowerCase(),
      password: sanitizeInput(data.password)
    };
  };

  // ==================== 3. دوال الخلفية والمثلثات ====================
  
  const createTriangles = () => {
    if (trianglesCreated.current) return;
    
    const trianglesContainer = document.getElementById('triangles-background');
    if (!trianglesContainer) return;
    
    trianglesContainer.innerHTML = '';
    
    const triangleCount = 25;
    const colors = [
      '#5DA7E1', '#4A90E2', '#357ABD', 
      '#2A5D84', '#1E4A6D', '#16354d',
      '#E3F2FD', '#BBDEFB', '#90CAF9'
    ];
    
    for (let i = 0; i < triangleCount; i++) {
      const triangle = document.createElement('div');
      triangle.className = 'absolute opacity-20 pointer-events-none';
      
      const size = Math.random() * 100 + 30;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const rotation = Math.random() * 360;
      
      triangle.style.width = '0';
      triangle.style.height = '0';
      triangle.style.borderLeft = `${size/2}px solid transparent`;
      triangle.style.borderRight = `${size/2}px solid transparent`;
      triangle.style.borderBottom = `${size}px solid ${color}`;
      triangle.style.left = `${left}%`;
      triangle.style.top = `${top}%`;
      triangle.style.transform = `rotate(${rotation}deg)`;
      
      trianglesContainer.appendChild(triangle);
    }
    
    trianglesCreated.current = true;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      createTriangles();
    }, 100);
    
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

  // ==================== 4. دوال التعامل مع النموذج ====================
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: cleanValue
    }));
    
    // إزالة رسائل الخطأ عند التعديل
    setError('');
    setValidationErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = (data) => {
    const errors = {};
    
    if (!data.email) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!validateEmail(data.email)) {
      errors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    if (!data.password) {
      errors.password = 'كلمة المرور مطلوبة';
    } else if (!validatePassword(data.password)) {
      errors.password = 'كلمة المرور يجب أن تكون بين 6-128 حرف';
    }
    
    return errors;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  // التحقق من Rate Limiting
  if (!checkRateLimit()) {
    setError('تم تجاوز عدد المحاولات المسموح. يرجى المحاولة بعد 5 دقائق.');
    return;
  }

  setLoading(true);
  setError('');
  setValidationErrors({});

  // تنظيف البيانات
  const cleanedData = cleanFormData(formData);

  // التحقق من صحة البيانات
  const errors = validateForm(cleanedData);
  if (Object.keys(errors).length > 0) {
    setValidationErrors(errors);
    setLoading(false);
    return;
  }

  // تسجيل محاولة جديدة
  attemptCount.current += 1;
  lastAttemptTime.current = Date.now();

  try {
    console.log("بيانات التسجيل:", { email: cleanedData.email, password: '***' });

    const result = await AuthController.login(cleanedData.email, cleanedData.password);

    console.log("نتيجة تسجيل الدخول:", result);

    if (result.success) {
      
      // 💥 أهم خطوة: تخزين التوكنات
      localStorage.setItem("admin_token", result.token);
      localStorage.setItem("admin_refresh_token", result.refreshToken);

      console.log("تم تخزين التوكن:", result.token);

      // إعادة تعيين محاولات الفشل
      attemptCount.current = 0;

      // تنفيذ حدث نجاح تسجيل الدخول إن وجد
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // توجيه إلى لوحة التحكم
      window.location.href = "/dashboard";

    } else {
      setError(result.error || "حدث خطأ في تسجيل الدخول");
    }

  } catch (error) {
    console.error("خطأ في تسجيل الدخول:", error);
    setError("حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.");
  } finally {
    setLoading(false);
  }
};

  // ==================== 5. الواجهة الرئيسية ====================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col lg:flex-row relative overflow-hidden">
      {/* خلفية المثلثات */}
      <div id="triangles-background" className="absolute inset-0 z-0"></div>
      
      {/* ==================== 6. قسم الشعار والترحيب ==================== */}
      <div className="relative z-10 lg:w-1/2 h-auto lg:h-screen flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-lg text-center space-y-8">
          {/* الشعار */}
          <div className="mb-8 transform transition-transform duration-500 hover:scale-105">
            <img
              src={process.env.PUBLIC_URL + "/images/logo.webp"}
              alt="شاهين بلس Logo"
              className="h-28 md:h-40 w-auto mx-auto drop-shadow-2xl"
              onError={(e) => {
                e.target.style.display = 'none';
                // عرض بديل نصي إذا فشل تحميل الصورة
                const altDiv = document.createElement('div');
                altDiv.className = "text-4xl font-bold text-blue-700";
                altDiv.textContent = "شاهين+";
                e.target.parentNode.appendChild(altDiv);
              }}
            />
          </div>

          {/* رسالة الترحيب */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
              مرحباً بك في
              <span className="block text-blue-600 mt-2">
                شاهين بلس
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
              نظام إدارة متطور وآمن يُمكّنك من التحكم الكامل في عملياتك
            </p>
            
            <div className="pt-6 border-t border-gray-200">
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">آمن 100%</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">مشفر</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">سهل الاستخدام</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 7. قسم النموذج ==================== */}
      <div className="relative z-10 lg:w-1/2 h-auto lg:h-screen bg-white flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 transform transition-all duration-300 hover:shadow-3xl">
            
            {/* رأس النموذج */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                تسجيل الدخول
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
                أدخل بياناتك للمتابعة إلى لوحة التحكم
              </p>
            </div>

            {/* رسائل الخطأ العامة */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center animate-pulse">
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* النموذج */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              
              {/* حقل البريد الإلكتروني */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  maxLength="100"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left ${
                    validationErrors.email 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 bg-gray-50 hover:bg-white focus:bg-white'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                  autoComplete="email"
                  dir="ltr"
                />
                {validationErrors.email && (
                  <p className="text-red-600 text-xs mt-1 flex items-center space-x-1 space-x-reverse">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{validationErrors.email}</span>
                  </p>
                )}
              </div>

              {/* حقل كلمة المرور */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="أدخل كلمة المرور"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  maxLength="128"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    validationErrors.password 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 bg-gray-50 hover:bg-white focus:bg-white'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading}
                  autoComplete="current-password"
                />
                {validationErrors.password && (
                  <p className="text-red-600 text-xs mt-1 flex items-center space-x-1 space-x-reverse">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{validationErrors.password}</span>
                  </p>
                )}
              </div>

              {/* خيارات النموذج */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 space-x-reverse text-sm">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-600">تذكرني</span>
                </label>
              </div>

              {/* زر الإرسال */}
              <button 
                type="submit" 
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 transform ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
                }`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري تسجيل الدخول...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 space-x-reverse">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>تسجيل الدخول</span>
                  </div>
                )}
              </button>
            </form>

            {/* معلومات إضافية */}
            <div className="mt-8 text-center border-t border-gray-100 pt-6">
              <p className="text-xs text-gray-500 mb-2">
                محمي بواسطة تشفير SSL وأحدث بروتوكولات الأمان
              </p>
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} شاهين بلس. جميع الحقوق محفوظة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;