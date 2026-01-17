/**
 * Custom hook for updating land status
 * Handles approve, reject, mark as sold, reopen operations
 */

import { useMutation, useQueryClient } from "react-query";
import { updateLandStatus } from "../../../services/landsAPI";

export const useLandStatusUpdate = (filters, currentPage, setSelectedLand) => {
  const queryClient = useQueryClient();

  const updateLandStatusMutation = useMutation(
    ({ landId, status, rejection_reason }) =>
      updateLandStatus(landId, status, rejection_reason),
    {
      onSuccess: (data, variables) => {
        const statusText =
          variables.status === "مرفوض"
            ? "الرفض"
            : variables.status === "مفتوح"
            ? "القبول"
            : variables.status === "تم البيع"
            ? "تم البيع"
            : "تحديث الحالة";

        alert(`تم ${statusText} الإعلان بنجاح`);

        queryClient.setQueryData(["lands", filters, currentPage], (oldData) => {
          if (!oldData) return oldData;

          const updatedLands = oldData.data.map((land) =>
            land.id === variables.landId
              ? {
                  ...land,
                  status: variables.status,
                  rejection_reason: variables.rejection_reason || null,
                }
              : land
          );

          return { ...oldData, data: updatedLands };
        });

        setSelectedLand(null);
      },
      onError: (error) => {
        console.error("خطأ في تحديث الحالة:", error);
        alert(`خطأ: ${error.message}`);
      },
    }
  );

  const handleApprove = (landId) => {
    if (
      !window.confirm(
        'هل أنت متأكد من قبول هذا الإعلان وتغيير حالته إلى "مفتوح"؟'
      )
    )
      return;

    updateLandStatusMutation.mutate({ landId, status: "مفتوح" });
  };

  const handleReject = (landId, reason) => {
    if (!reason.trim()) {
      alert("يرجى إدخال سبب الرفض");
      return;
    }

    if (
      !window.confirm(
        'هل أنت متأكد من رفض هذا الإعلان وتغيير حالته إلى "مرفوض"؟'
      )
    )
      return;

    updateLandStatusMutation.mutate({
      landId,
      status: "مرفوض",
      rejection_reason: reason,
    });
  };

  const handleMarkAsSold = (landId) => {
    if (!window.confirm('هل أنت متأكد من تغيير حالة هذه الأرض إلى "تم البيع"؟'))
      return;

    updateLandStatusMutation.mutate({ landId, status: "تم البيع" });
  };

  const handleReopen = (landId) => {
    if (
      !window.confirm(
        'هل أنت متأكد من إعادة فتح هذا الإعلان وتغيير حالته إلى "مفتوح"؟'
      )
    )
      return;

    updateLandStatusMutation.mutate({ landId, status: "مفتوح" });
  };

  const handleReturnToPending = (landId) => {
    if (
      !window.confirm(
        'هل أنت متأكد من إعادة هذه الأرض إلى حالة "قيد المراجعة"؟'
      )
    )
      return;

    updateLandStatusMutation.mutate({ landId, status: "قيد المراجعة" });
  };

  return {
    updateLandStatusMutation,
    handleApprove,
    handleReject,
    handleMarkAsSold,
    handleReopen,
    handleReturnToPending,
  };
};