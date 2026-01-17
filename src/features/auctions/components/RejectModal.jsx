import React from "react";
import { FiEdit, FiX } from "react-icons/fi";

const RejectModal = ({ isOpen, reason, loading, onReasonChange, onConfirm, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <FiEdit className="text-white" size={16} />
            </div>
            رفض المزاد
          </h3>
          <button className="text-gray-400 hover:text-gray-600 text-xl transition-colors" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">سبب الرفض</label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              rows="4"
              placeholder="اكتب سبب رفض المزاد هنا..."
            />
            <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
              هذا السبب سيظهر للشركة كتفسير لرفض مزادها
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            <FiX size={18} />
            {loading ? "جاري الحفظ..." : "تأكيد الرفض"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;