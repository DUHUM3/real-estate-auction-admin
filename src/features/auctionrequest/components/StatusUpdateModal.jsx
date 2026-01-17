// components/StatusUpdateModal.jsx
// Modal for updating the status of a marketing request
// Handles rejection messages and status confirmation

import React from "react";
import { Edit, X, Check } from "lucide-react";
import { getStatusText } from "../../../services/marketingRequestsApi";

const StatusUpdateModal = ({
  statusModal,
  loading,
  onClose,
  onConfirm,
  onMessageChange,
}) => {
  if (!statusModal.show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Edit className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              تغيير حالة الطلب
            </h3>
          </div>
          <button
            className="text-gray-400 hover:text-gray-500 transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحالة الجديدة
            </label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  statusModal.newStatus === "reviewed"
                    ? "bg-green-100 text-green-800"
                    : statusModal.newStatus === "auctioned"
                    ? "bg-purple-100 text-purple-800"
                    : statusModal.newStatus === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {getStatusText(statusModal.newStatus)}
              </span>
            </div>
          </div>

          {statusModal.newStatus === "rejected" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سبب الرفض *
              </label>
              <textarea
                value={statusModal.rejectionMessage}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder="يرجى إدخال سبب رفض الطلب..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-blue-700 text-sm">
              هل أنت متأكد من تغيير حالة هذا الطلب إلى{" "}
              <strong>{getStatusText(statusModal.newStatus)}</strong>؟
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 space-x-reverse p-6 border-t border-gray-200 bg-gray-50">
          <button
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 space-x-reverse"
            onClick={onConfirm}
            disabled={
              loading ||
              (statusModal.newStatus === "rejected" &&
                !statusModal.rejectionMessage.trim())
            }
          >
            <Check className="w-4 h-4" />
            <span>{loading ? "جاري الحفظ..." : "تأكيد التغيير"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;