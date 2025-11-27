// src/utils/AuthController.js

class AuthController {

  // =========================
  // تسجيل الدخول
  // =========================
  static async login(email, password) {
    try {
      console.log('جاري محاولة تسجيل الدخول...', { email });

      const response = await fetch('https://core-api-x41.shaheenplus.sa/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('بيانات الاستجابة:', data);

      if (response.ok && data.status === true) {
        const auth = data.data;

        // تخزين التوكن والرفرش توكن وصلاحية التوكن بشكل موحد
        localStorage.setItem('access_token', auth.access_token);
        localStorage.setItem('refresh_token', auth.refresh_token);
        const now = new Date().getTime();
        const accessTokenExpiry = now + (auth.access_token_expires_in * 1000);
        localStorage.setItem('token_expiry', accessTokenExpiry.toString());

        // تخزين بيانات المستخدم
        const userData = {
          email: email,
          loginTime: new Date().toISOString(),
          access_token: auth.access_token,
          refresh_token: auth.refresh_token,
          access_token_expires_in: auth.access_token_expires_in,
          refresh_token_expires_in: auth.refresh_token_expires_in
        };
        localStorage.setItem('userData', JSON.stringify(userData));

        console.log("تم تسجيل الدخول وتخزين التوكن بنجاح");
        return { success: true, token: auth.access_token, refreshToken: auth.refresh_token, message: data.message };
      }

      return { success: false, error: data.message || "فشل تسجيل الدخول" };

    } catch (error) {
      console.error("خطأ في الاتصال:", error);
      return { success: false, error: "مشكلة في الاتصال بالسيرفر" };
    }
  }

  // =========================
  // التحقق من تسجيل الدخول
  // =========================
  static isAuthenticated() {
    const token = localStorage.getItem('access_token');
    const tokenExpiry = localStorage.getItem('token_expiry');
    if (!token || !tokenExpiry) return false;
    return Date.now() < parseInt(tokenExpiry);
  }

  // =========================
  // التحقق من انتهاء صلاحية التوكن
  // =========================
  static isTokenExpired() {
    const tokenExpiry = localStorage.getItem('token_expiry');
    if (!tokenExpiry) return true;
    return Date.now() >= parseInt(tokenExpiry);
  }

  // =========================
  // الحصول على التوكن
  // =========================
  static getToken() {
    return localStorage.getItem('access_token');
  }

  static getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  // =========================
  // إضافة التوكن لهيدر الطلبات
  // =========================
  static getAuthHeaders() {
    const token = this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // =========================
  // الحصول على بيانات المستخدم الحالي
  // =========================
  static getCurrentUser() {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('خطأ في تحليل بيانات المستخدم:', error);
      return null;
    }
  }

  // =========================
  // تسجيل الخروج
  // =========================
  static logout() {
    localStorage.removeItem('userData');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expiry');
    console.log('تم تسجيل الخروج');
    window.location.href = '/login';
  }

  // =========================
  // تجديد التوكن تلقائياً
  // =========================
  static async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) throw new Error('لا يوجد refresh token');

      const response = await fetch('https://core-api-x41.shaheenplus.sa/api/admin/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      const data = await response.json();

      if (response.ok && data.status === true) {
        const auth = data.data;
        const now = Date.now();
        const accessTokenExpiry = now + (auth.access_token_expires_in * 1000);

        localStorage.setItem('access_token', auth.access_token);
        localStorage.setItem('token_expiry', accessTokenExpiry.toString());

        const userData = this.getCurrentUser();
        if (userData) {
          userData.access_token = auth.access_token;
          userData.access_token_expires_in = auth.access_token_expires_in;
          localStorage.setItem('userData', JSON.stringify(userData));
        }

        return { success: true, data: auth };
      } else {
        this.logout();
        return { success: false, error: data.message || 'فشل تجديد الجلسة' };
      }

    } catch (error) {
      console.error('خطأ في تجديد التوكن:', error);
      this.logout();
      return { success: false, error: 'فشل في تجديد الجلسة' };
    }
  }

}

export default AuthController;
