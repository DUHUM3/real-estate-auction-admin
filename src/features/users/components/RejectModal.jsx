// components/RejectModal.jsx
// مسؤول عن: مودال إدخال سبب الرفض

import React, { useState } from 'react';
import { FiEdit, FiX } from 'react-icons/fi';

const RejectModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [adminMessage, setAdminMessage] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(adminMessage);
    setAdminMessage('');
  };

  const handleClose = () => {
    setAdminMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FiEdit className="text-red-600" />
              رفض المستخدم
            </h3>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
              onClick={handleClose}
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              سبب الرفض
            </label>
            <textarea
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              rows="4"
              placeholder="اكتب سبب رفض المستخدم هنا..."
            />
            <div className="text-sm text-gray-500">
              هذا السبب سيظهر للمستخدم كتفسير لرفض طلبه
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
          <div className="flex gap-3 justify-end">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
              onClick={handleClose}
              disabled={isLoading}
            >
              إلغاء
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              <FiX size={18} />
              {isLoading ? 'جاري الحفظ...' : 'تأكيد الرفض'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;