// src/utils/authController.js

class AuthController {
  // التحقق من وجود token صالح
  static isAuthenticated() {
    const token = localStorage.getItem('access_token');
    const tokenExpiry = localStorage.getItem('token_expiry');
    
    if (!token || !tokenExpiry) {
      return false;
    }
    
    // التحقق من انتهاء الصلاحية
    const now = new Date().getTime();
    return now < parseInt(tokenExpiry);
  }

  // تسجيل الدخول - محدث للهيكل الجديد
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

      if (response.ok && data.status === true) {
        // الهيكل الجديد للاستجابة
        const authData = data.data;
        
        // حساب وقت انتهاء الصلاحية
        const now = new Date().getTime();
        const accessTokenExpiry = now + (authData.access_token_expires_in * 1000);
        const refreshTokenExpiry = now + (authData.refresh_token_expires_in * 1000);
        
        // تخزين بيانات المستخدم
        const userData = {
          access_token: authData.access_token,
          refresh_token: authData.refresh_token,
          token_type: authData.access_token_type,
          email: email,
          loginTime: new Date().toISOString(),
          access_token_expires_in: authData.access_token_expires_in,
          refresh_token_expires_in: authData.refresh_token_expires_in
        };
        
        // تخزين في localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('access_token', authData.access_token);
        localStorage.setItem('refresh_token', authData.refresh_token);
        localStorage.setItem('token_expiry', accessTokenExpiry.toString());
        localStorage.setItem('refresh_token_expiry', refreshTokenExpiry.toString());
        
        console.log('تم تسجيل الدخول بنجاح وتخزين البيانات');
        return { 
          success: true, 
          data: userData,
          message: data.message 
        };
      } else {
        const errorMessage = data.message || 'حدث خطأ أثناء تسجيل الدخول';
        console.error('خطأ في تسجيل الدخول:', errorMessage);
        return { 
          success: false, 
          error: errorMessage,
          status: data.status 
        };
      }
    } catch (error) {
      console.error('خطأ في الاتصال:', error);
      return { 
        success: false, 
        error: 'حدث خطأ في الاتصال بالخادم' 
      };
    }
  }

  // تجديد الـ token
  static async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('لا يوجد refresh token');
      }
      
      const response = await fetch('https://shahin-tqay.onrender.com/api/admin/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.status === true) {
        const authData = data.data;
        const now = new Date().getTime();
        const accessTokenExpiry = now + (authData.access_token_expires_in * 1000);
        
        // تحديث البيانات
        localStorage.setItem('access_token', authData.access_token);
        localStorage.setItem('token_expiry', accessTokenExpiry.toString());
        
        // تحديث userData
        const userData = this.getCurrentUser();
        if (userData) {
          userData.access_token = authData.access_token;
          userData.access_token_expires_in = authData.access_token_expires_in;
          localStorage.setItem('userData', JSON.stringify(userData));
        }
        
        return { success: true, data: authData };
      } else {
        this.logout();
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('خطأ في تجديد الـ token:', error);
      this.logout();
      return { success: false, error: 'فشل في تجديد الجلسة' };
    }
  }

  // تسجيل الخروج
  static logout() {
    // مسح جميع بيانات المستخدم
    localStorage.removeItem('userData');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('refresh_token_expiry');
    
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

  // الحصول على الـ refresh token
  static getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  // التحقق من صلاحية الـ token
  static isTokenExpired() {
    const tokenExpiry = localStorage.getItem('token_expiry');
    if (!tokenExpiry) return true;
    
    const now = new Date().getTime();
    return now >= parseInt(tokenExpiry);
  }

  // إضافة token إلى headers للطلبات
  static getAuthHeaders() {
    const token = this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }
}

export default AuthController;