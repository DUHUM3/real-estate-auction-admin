/**
 * Reject modal component
 * Handles rejection reason input
 */

import React from "react";
import { FiEdit, FiX } from "react-icons/fi";

const RejectModal = ({ show, reason, loading, onChange, onConfirm, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="flex items-center font-semibold text-lg text-gray-800">
            <FiEdit className="ml-2" />
            رفض الإعلان
          </h3>
          <button
            className="text-gray-400 hover:text-gray-500 text-xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              سبب الرفض
            </label>
            <textarea
              value={reason}
              onChange={(e) => onChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              rows="4"
              placeholder="اكتب سبب رفض الإعلان هنا..."
            />
            <div className="text-xs text-gray-500">
              هذا السبب سيظهر للمستخدم كتفسير لرفض إعلانه
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            <FiX />
            {loading ? "جاري الحفظ..." : "تأكيد الرفض"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;