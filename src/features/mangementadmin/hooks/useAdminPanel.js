import { useState, useCallback, useEffect } from "react";
import {
  fetchAdminsAPI,
  fetchProfileAPI,
  deleteAdminAPI,
  registerAdminAPI,
  updateProfileAPI,
  changePasswordAPI,
} from "../../../services/AdminApi";

export const useAdminPanel = (activeTab, showMessage) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const [editProfileData, setEditProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Fetch admins list
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    const result = await fetchAdminsAPI();
    if (result.success) {
      setAdmins(result.data);
    } else {
      showMessage("error", result.error);
    }
    setLoading(false);
  }, [showMessage]);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const result = await fetchProfileAPI();
    if (result.success) {
      setProfileData(result.data);
      setEditProfileData(result.data);
    } else {
      showMessage("error", result.error);
    }
    setLoading(false);
  }, [showMessage]);

  // Auto-fetch data when tab changes
  useEffect(() => {
    if (activeTab === "profile") {
      fetchProfile();
    } else if (activeTab === "admins") {
      fetchAdmins();
    }
  }, [activeTab, fetchProfile, fetchAdmins]);

  // Delete admin
  const handleDeleteAdmin = useCallback(
    async (adminId) => {
      setLoading(true);
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

  // Register new admin
  const handleRegisterSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (formData.password !== formData.password_confirmation) {
        showMessage("error", "كلمات المرور غير متطابقة");
        return;
      }

      setLoading(true);
      const result = await registerAdminAPI(formData);
      if (result.success) {
        showMessage("success", "تم تسجيل المدير بنجاح! 🎉");
        setFormData({
          full_name: "",
          email: "",
          phone: "",
          password: "",
          password_confirmation: "",
        });
        fetchAdmins();
      } else {
        showMessage("error", result.error);
      }
      setLoading(false);
    },
    [formData, fetchAdmins, showMessage]
  );

  // Update profile
  const handleProfileUpdate = useCallback(
    async (e) => {
      e.preventDefault();

      const updatedFields = {};
      Object.keys(editProfileData).forEach((key) => {
        if (
          editProfileData[key] !== profileData[key] &&
          editProfileData[key] !== ""
        ) {
          updatedFields[key] = editProfileData[key];
        }
      });

      if (Object.keys(updatedFields).length === 0) {
        showMessage("error", "لم يتم تعديل أي بيانات.");
        return;
      }

      setLoading(true);
      const result = await updateProfileAPI(updatedFields);
      if (result.success) {
        showMessage("success", "تم تحديث البيانات بنجاح! ✨");
        setProfileData((prev) => ({ ...prev, ...updatedFields }));
        setIsEditingProfile(false);
      } else {
        showMessage("error", result.error);
      }
      setLoading(false);
    },
    [editProfileData, profileData, showMessage]
  );

  // Change password
  const handlePasswordChangeSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (
        passwordData.new_password !== passwordData.new_password_confirmation
      ) {
        showMessage("error", "كلمات المرور الجديدة غير متطابقة");
        return;
      }

      setLoading(true);
      const result = await changePasswordAPI(passwordData);
      if (result.success) {
        showMessage("success", "تم تغيير كلمة المرور بنجاح! 🔐");
        setPasswordData({
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
      } else {
        showMessage("error", result.error);
      }
      setLoading(false);
    },
    [passwordData, showMessage]
  );

  // Form change handlers
  const handleRegisterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleProfileChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditProfileData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  }, []);

  return {
    formData,
    profileData,
    editProfileData,
    passwordData,
    admins,
    loading,
    isEditingProfile,
    setIsEditingProfile,
    fetchAdmins,
    fetchProfile,
    handleDeleteAdmin,
    handleRegisterSubmit,
    handleProfileUpdate,
    handlePasswordChangeSubmit,
    handleRegisterChange,
    handleProfileChange,
    handlePasswordChange,
    setEditProfileData,
  };
};