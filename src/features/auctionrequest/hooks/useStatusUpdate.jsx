// hooks/useStatusUpdate.jsx
// Custom hook for handling status updates
// Manages mutation logic and optimistic cache updates

import { useMutation, useQueryClient } from "react-query";
import {
  updateRequestStatus,
  getStatusText,
} from "../../../services/marketingRequestsApi";

export const useStatusUpdate = (filters, onSuccess) => {
  const queryClient = useQueryClient();

  const statusMutation = useMutation(
    ({ requestId, status, message }) =>
      updateRequestStatus(requestId, status, message),
    {
      onSuccess: (data) => {
        alert(data.message || "تم تحديث حالة الطلب بنجاح");
        onSuccess();

        queryClient.setQueryData(["marketingRequests", filters], (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: oldData.data.map((req) =>
              req.id === data.auction_request.id ? data.auction_request : req
            ),
          };
        });
      },
      onError: (error) => {
        console.error("❌ خطأ أثناء تحديث الحالة:", error);
        alert(error.message || "فشل في تحديث حالة الطلب");
      },
    }
  );

  const handleStatusUpdate = async (statusModal) => {
    if (!statusModal.requestId || !statusModal.newStatus) {
      alert("بيانات غير مكتملة");
      return;
    }

    if (
      statusModal.newStatus === "rejected" &&
      !statusModal.rejectionMessage.trim()
    ) {
      alert("يرجى إدخال سبب الرفض");
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

    statusMutation.mutate(
      {
        requestId: statusModal.requestId,
        status: statusModal.newStatus,
        message: statusModal.rejectionMessage,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["marketingRequests"]);
        },
      }
    );
  };

  return {
    statusMutation,
    handleStatusUpdate,
  };
};