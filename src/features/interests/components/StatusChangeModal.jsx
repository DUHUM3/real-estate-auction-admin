// Modal for changing interest status with admin notes
import React from "react";
import { FiEdit, FiCheck } from "react-icons/fi";
import { useInterestsAPI } from "../../../services/interestsAPI";

const StatusChangeModal = ({
  statusModal,
  setStatusModal,
  closeStatusModal,
  handleStatusUpdate,
  loading,
}) => {
  const { getStatusBadge, getStatusMessagePlaceholder } = useInterestsAPI();

  if (!statusModal.show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FiEdit className="ml-2" />
            تغيير حالة الاهتمام
          </h3>
          <button
            className="text-gray-400 hover:text-gray-600 text-2xl"
            onClick={closeStatusModal}
          >
            ×
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحالة الجديدة
            </label>
            <div className="p-3 bg-gray-50 rounded-lg">
              {getStatusBadge(statusModal.newStatus)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رسالة / ملاحظات إضافية
            </label>
            <textarea
              value={statusModal.adminNote}
              onChange={(e) =>
                setStatusModal((prev) => ({
                  ...prev,
                  adminNote: e.target.value,
                }))
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder={getStatusMessagePlaceholder(statusModal.newStatus)}
            />
            <div className="text-sm text-gray-500 mt-1">
              هذه الرسالة ستظهر للمستخدم كتفسير لتغيير الحالة
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-3 space-x-reverse p-6 border-t border-gray-200">
          <button
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            onClick={closeStatusModal}
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleStatusUpdate}
            disabled={loading}
          >
            <FiCheck className="ml-1" />
            {loading ? "جاري الحفظ..." : "تأكيد التغيير"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;