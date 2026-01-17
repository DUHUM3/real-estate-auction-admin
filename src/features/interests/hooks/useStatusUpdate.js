// Hook for managing status update modal and logic
import { useState } from "react";
import { useInterestsAPI } from "../../../services/interestsAPI";

export const useStatusUpdate = (refetch, setSelectedInterest) => {
  const { updateInterestStatus, getStatusText } = useInterestsAPI();

  const [statusModal, setStatusModal] = useState({
    show: false,
    interestId: null,
    newStatus: "",
    adminNote: "",
  });

  const openStatusModal = (interestId, newStatus) => {
    setStatusModal({
      show: true,
      interestId,
      newStatus,
      adminNote: "",
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      show: false,
      interestId: null,
      newStatus: "",
      adminNote: "",
    });
  };

  const handleStatusUpdate = async () => {
    if (!statusModal.interestId || !statusModal.newStatus) {
      alert("بيانات غير مكتملة");
      return;
    }

    if (
      !window.confirm(
        `هل أنت متأكد من تغيير الحالة إلى "${getStatusText(
          statusModal.newStatus
        )}"؟`
      )
    ) {
      return;
    }

    updateInterestStatus.mutate(
      {
        interestId: statusModal.interestId,
        status: statusModal.newStatus,
        adminNote: statusModal.adminNote,
      },
      {
        onSuccess: () => {
          alert("تم تحديث حالة الاهتمام بنجاح");
          refetch();
          setSelectedInterest(null);
          closeStatusModal();
        },
        onError: (error) => {
          alert(error.message);
        },
      }
    );
  };

  return {
    statusModal,
    setStatusModal,
    openStatusModal,
    closeStatusModal,
    handleStatusUpdate,
    isUpdating: updateInterestStatus.isLoading,
  };
};