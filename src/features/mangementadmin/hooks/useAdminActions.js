// Responsibility: Handle all admin CRUD operations (fetch, delete, register, update, etc.)
import { useState, useCallback } from "react";
import {
  fetchAdminsAPI,
  fetchProfileAPI,
  deleteAdminAPI,
  registerAdminAPI,
  updateProfileAPI,
  changePasswordAPI,
} from "../../../services/AdminApi";

export const useAdminActions = () => {
  const [admins, setAdmins] = useState([]);
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 3000);
  }, []);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    const result = await fetchAdminsAPI();

    if (result.success) {
      setAdmins(result.data);
    } else {
      showMessage("error", result.error);
    }

    setLoading(false);
  }, [showMessage]);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    const result = await fetchProfileAPI();

    if (result.success) {
      setProfileData(result.data);
      return result.data;
    } else {
      showMessage("error", result.error);
    }

    setLoading(false);
    return null;
  }, [showMessage]);

  const deleteAdmin = useCallback(
    async (adminId) => {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const result = await deleteAdminAPI(adminId);

      if (result.success) {
        showMessage("success", "تم حذف المدير بنجاح! ✅");
        fetchAdmins();
      } else {
        showMessage("error", result.error);
      }

      setLoading(false);
    },
    [fetchAdmins, showMessage]
  );

  const registerAdmin = useCallback(
    async (formData) => {
      if (formData.password !== formData.password_confirmation) {
        showMessage("error", "كلمات المرور غير متطابقة");
        return { success: false };
      }

      setLoading(true);
      const result = await registerAdminAPI(formData);

      if (result.success) {
        showMessage("success", "تم تسجيل المدير بنجاح! 🎉");
        fetchAdmins();
        setLoading(false);
        return { success: true };
      } else {
        showMessage("error", result.error);
        setLoading(false);
        return { success: false };
      }
    },
    [fetchAdmins, showMessage]
  );

  const updateProfile = useCallback(
    async (updatedFields) => {
      setLoading(true);

      const result = await updateProfileAPI(updatedFields);

      if (result.success) {
        showMessage("success", "تم تحديث البيانات بنجاح! ✨");
        setProfileData((prev) => ({ ...prev, ...updatedFields }));
        setLoading(false);
        return { success: true, data: updatedFields };
      } else {
        showMessage("error", result.error);
        setLoading(false);
        return { success: false };
      }
    },
    [showMessage]
  );

  const changePassword = useCallback(
    async (passwordData) => {
      if (
        passwordData.new_password !== passwordData.new_password_confirmation
      ) {
        showMessage("error", "كلمات المرور الجديدة غير متطابقة");
        return { success: false };
      }

      setLoading(true);
      const result = await changePasswordAPI(passwordData);

      if (result.success) {
        showMessage("success", "تم تغيير كلمة المرور بنجاح! 🔐");
        setLoading(false);
        return { success: true };
      } else {
        showMessage("error", result.error);
        setLoading(false);
        return { success: false };
      }
    },
    [showMessage]
  );

  return {
    admins,
    profileData,
    loading,
    message,
    fetchAdmins,
    fetchProfile,
    deleteAdmin,
    registerAdmin,
    updateProfile,
    changePassword,
  };
};