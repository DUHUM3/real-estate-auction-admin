// hooks/useStatusUpdate.js
import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { landRequestsApi } from "../services/landRequestsApi";

export const useStatusUpdate = (onSuccess) => {
  const queryClient = useQueryClient();
  const [statusModal, setStatusModal] = useState({
    show: false,
    requestId: null,
    newStatus: "",
    adminNote: "",
  });

  const mutation = useMutation(
    ({ requestId, status, adminNote }) =>
      landRequestsApi.updateRequestStatus(requestId, status, adminNote),
    {
      onSuccess: async () => {
        alert("تم تحديث حالة الطلب بنجاح");
        await queryClient.invalidateQueries(["landRequests"]);
        onSuccess();
        closeStatusModal();
      },
      onError: (error) => {
        alert(error.message);
      },
    }
  );

  const openStatusModal = (requestId, newStatus) => {
    setStatusModal({ show: true, requestId, newStatus, adminNote: "" });
  };

  const closeStatusModal = () => {
    setStatusModal({ show: false, requestId: null, newStatus: "", adminNote: "" });
  };

  const handleStatusUpdate = () => {
    if (!statusModal.requestId || !statusModal.newStatus) {
      alert("بيانات غير مكتملة");
      return;
    }
    mutation.mutate({
      requestId: statusModal.requestId,
      status: statusModal.newStatus,
      adminNote: statusModal.adminNote,
    });
  };

  return {
    statusModal,
    setStatusModal,
    openStatusModal,
    closeStatusModal,
    handleStatusUpdate,
    isLoading: mutation.isLoading,
  };
};