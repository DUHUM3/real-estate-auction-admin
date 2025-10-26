// src/utils/authController.js

class AuthController {
  // التحقق من وجود token صالح
  static isAuthenticated() {
    const token = localStorage.getItem('access_token');
    return !!token; // بسيط - إذا يوجد token يعتبر مسجل دخول
  }

  // تسجيل الدخول
// في AuthController.js - تحديث دالة login
static async login(email, password) {
  try {
    console.log('جاري محاولة تسجيل الدخول...', { email });
    
    const response = await fetch('https://shahin-tqay.onrender.com/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    console.log('استجابة الخادم:', response.status);

    const data = await response.json();
    console.log('بيانات الاستجابة:', data);

    // تحقق من الهيكل المختلف للاستجابة
    if (response.ok) {
      // الخيار 1: إذا كان الهيكل يحتوي على data.token
      if (data.data && data.data.token) {
        const userData = {
          token: data.data.token,
          email: email,
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('access_token', data.data.token);
        
        console.log('تم تسجيل الدخول بنجاح وتخزين البيانات');
        return { success: true, data: userData };
      }
      // الخيار 2: إذا كان الهيكل مختلفاً
      else if (data.token) {
        const userData = {
          token: data.token,
          email: email,
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('access_token', data.token);
        
        console.log('تم تسجيل الدخول بنجاح وتخزين البيانات');
        return { success: true, data: userData };
      }
      else {
        console.error('هيكل الاستجابة غير معروف:', data);
        return { success: false, error: 'هيكل الاستجابة غير معروف' };
      }
    } else {
      const errorMessage = data.message || 'حدث خطأ أثناء تسجيل الدخول';
      console.error('خطأ في تسجيل الدخول:', errorMessage);
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error('خطأ في الاتصال:', error);
    return { success: false, error: 'حدث خطأ في الاتصال بالخادم' };
  }
}

  // تسجيل الخروج
  static logout() {
    // مسح جميع بيانات المستخدم
    localStorage.removeItem('userData');
    localStorage.removeItem('access_token');
    
    console.log('تم تسجيل الخروج');
    // إعادة التوجيه إلى صفحة تسجيل الدخول
    window.location.href = '/login';
  }

  // الحصول على بيانات المستخدم الحالي
  static getCurrentUser() {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('خطأ في تحليل بيانات المستخدم:', error);
      return null;
    }
  }

  // الحصول على الـ token
  static getToken() {
    return localStorage.getItem('access_token');
  }

  // التحقق من صلاحية المستخدم
  static hasRole(requiredRole) {
    const user = this.getCurrentUser();
    return user && user.user_type === requiredRole;
  }
}

export default AuthController;