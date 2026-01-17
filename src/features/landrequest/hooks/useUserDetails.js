// hooks/useUserDetails.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { landRequestsApi } from "../services/landRequestsApi";

export const useUserDetails = () => {
  const navigate = useNavigate();
  const [userModal, setUserModal] = useState({
    show: false,
    user: null,
    loading: false,
  });

  const openUserModal = async (userId) => {
    if (!userId) {
      alert("لا يوجد معرف للمستخدم");
      return;
    }

    setUserModal({ show: true, user: null, loading: true });

    try {
      const userDetails = await landRequestsApi.fetchUserDetails(userId, navigate);
      setUserModal({ show: true, user: userDetails, loading: false });
    } catch (error) {
      console.error("خطأ في جلب تفاصيل المستخدم:", error);
      alert("حدث خطأ أثناء جلب تفاصيل المستخدم: " + error.message);
      setUserModal({ show: false, user: null, loading: false });
    }
  };

  const closeUserModal = () => {
    setUserModal({ show: false, user: null, loading: false });
  };

  return { userModal, openUserModal, closeUserModal };
};