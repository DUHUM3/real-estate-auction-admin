/**
 * Owner modal component
 * Displays owner details in a modal
 */

import React from "react";
import { FiUser } from "react-icons/fi";
import OwnerDetails from "./OwnerDetails";

const OwnerModal = ({ show, owner, copyStatus, onCopy, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="flex items-center font-semibold text-lg text-gray-800">
            <FiUser className="ml-2" />
            تفاصيل المالك
          </h3>
          <button
            className="text-gray-400 hover:text-gray-500 text-xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto">
          <OwnerDetails owner={owner} copyStatus={copyStatus} onCopy={onCopy} />
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={onClose}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerModal;