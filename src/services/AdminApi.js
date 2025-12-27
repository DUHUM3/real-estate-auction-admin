// api.js - جميع دوال API المنفصلة

const BASE_URL = "https://core-api-x41.shaheenplus.sa/api";

// الحصول على التوكن من localStorage
const getToken = () => localStorage.getItem("admin_token");

// التعامل مع الأخطاء المشتركة
const handleApiError = (error, defaultMessage) => {
  if (error.message) {
    return error.message;
  }
  return defaultMessage || "حدث خطأ في الاتصال بالخادم";
};

// جلب قائمة المدراء
export const fetchAdminsAPI = async () => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/admin/all-admins`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "حدث خطأ في جلب البيانات");
    }

    return { success: true, data: data.data || data || [] };
  } catch (error) {
    return { success: false, error: handleApiError(error, "حدث خطأ في جلب قائمة المدراء") };
  }
};

// جلب بيانات البروفايل
export const fetchProfileAPI = async () => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/admin/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "حدث خطأ في جلب البيانات");
    }

    const profile = {
      full_name: data.data.full_name || "",
      email: data.data.email || "",
      phone: data.data.phone || "",
    };

    return { success: true, data: profile };
  } catch (error) {
    return { success: false, error: handleApiError(error, "حدث خطأ في جلب بيانات البروفايل") };
  }
};

// حذف مدير
export const deleteAdminAPI = async (adminId) => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/admin/delete-account`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        admin_id: adminId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "حدث خطأ أثناء حذف المدير");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: handleApiError(error, "حدث خطأ أثناء حذف المدير") };
  }
};

// تسجيل مدير جديد
export const registerAdminAPI = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/admin/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: "ADMIN",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errors) {
        const firstErrorKey = Object.keys(data.errors)[0];
        const firstErrorMessage = data.errors[firstErrorKey][0];
        throw new Error(firstErrorMessage);
      }
      throw new Error(data.message || "حدث خطأ أثناء التسجيل");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: handleApiError(error, "حدث خطأ أثناء تسجيل المدير") };
  }
};

// تحديث البروفايل
export const updateProfileAPI = async (updatedFields) => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/admin/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedFields),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errors) {
        const firstErrorKey = Object.keys(data.errors)[0];
        const firstErrorMessage = data.errors[firstErrorKey][0];
        throw new Error(firstErrorMessage);
      }
      throw new Error(data.message || "حدث خطأ أثناء التحديث");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: handleApiError(error, "حدث خطأ أثناء تحديث البروفايل") };
  }
};

// تغيير كلمة المرور
export const changePasswordAPI = async (passwordData) => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/admin/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errors) {
        const firstErrorKey = Object.keys(data.errors)[0];
        const firstErrorMessage = data.errors[firstErrorKey][0];
        throw new Error(firstErrorMessage);
      }
      throw new Error(data.message || "حدث خطأ أثناء تغيير كلمة المرور");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: handleApiError(error, "حدث خطأ أثناء تغيير كلمة المرور") };
  }
};