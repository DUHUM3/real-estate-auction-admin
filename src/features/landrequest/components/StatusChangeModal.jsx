// components/StatusChangeModal.jsx
import React from "react";
import { FiEdit, FiCheck } from "react-icons/fi";
import { STATUS_CONFIG, STATUS_MESSAGE_PLACEHOLDERS } from "../constants/landRequestsConstants";

const StatusChangeModal = ({ statusModal, setStatusModal, onConfirm, onClose, loading }) => {
  if (!statusModal.show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <FiEdit className="w-5 h-5 text-gray-500" />
            تغيير حالة الطلب
          </h3>
          <button className="text-gray-400 hover:text-gray-500 transition-colors" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة الجديدة</label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  STATUS_CONFIG[statusModal.newStatus]?.color || "bg-gray-100 text-gray-800"
                }`}
              >
                {STATUS_CONFIG[statusModal.newStatus]?.text || statusModal.newStatus}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رسالة / ملاحظات إضافية
            </label>
            <textarea
              value={statusModal.adminNote}
              onChange={(e) =>
                setStatusModal((prev) => ({ ...prev, adminNote: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              rows="4"
              placeholder={
                STATUS_MESSAGE_PLACEHOLDERS[statusModal.newStatus] || "اكتب ملاحظات إضافية..."
              }
            />
            <div className="mt-1 text-xs text-gray-500">
              هذه الرسالة ستظهر للمستخدم كتفسير لتغيير الحالة
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            <FiCheck className="w-4 h-4" />
            {loading ? "جاري الحفظ..." : "تأكيد التغيير"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;