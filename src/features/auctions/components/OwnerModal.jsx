import React from "react";
import { FiUser, FiEdit, FiCopy } from "react-icons/fi";
import useCopyToClipboard from "../hooks/useCopyToClipboard";

const CopyableField = ({ label, value, fieldName, copyToClipboard, copyStatus }) => {
  if (!value) return null;

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">{label}</label>
      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <span className="text-gray-900 font-medium truncate">{value}</span>
        <button
          className={`p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 mr-2 ${
            copyStatus[fieldName]
              ? "text-green-600 bg-green-50 scale-110"
              : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
          }`}
          onClick={() => copyToClipboard(value, fieldName)}
          title={`نسخ ${label}`}
        >
          <FiCopy size={16} />
        </button>
      </div>
    </div>
  );
};

const OwnerModal = ({ isOpen, owner, onClose }) => {
  const { copyStatus, copyToClipboard } = useCopyToClipboard();

  if (!isOpen || !owner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FiUser className="text-white" size={16} />
            </div>
            تفاصيل الشركة
          </h3>
          <button className="text-white hover:text-gray-200 text-xl transition-colors" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Company Information */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-blue-200 pb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FiUser className="text-white" size={16} />
                </div>
                معلومات الشركة
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CopyableField
                  label="اسم الشركة"
                  value={owner.auction_name}
                  fieldName="company_name"
                  copyToClipboard={copyToClipboard}
                  copyStatus={copyStatus}
                />
                <CopyableField
                  label="البريد الإلكتروني"
                  value={owner.user?.email}
                  fieldName="company_email"
                  copyToClipboard={copyToClipboard}
                  copyStatus={copyStatus}
                />
                <CopyableField
                  label="رقم الهاتف"
                  value={owner.user?.phone}
                  fieldName="company_phone"
                  copyToClipboard={copyToClipboard}
                  copyStatus={copyStatus}
                />
                <CopyableField
                  label="اسم المسؤول"
                  value={owner.user?.full_name}
                  fieldName="company_contact"
                  copyToClipboard={copyToClipboard}
                  copyStatus={copyStatus}
                />
              </div>
            </div>

            {/* Commercial Information */}
            {owner.commercial_register && (
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-300 pb-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <FiEdit className="text-white" size={16} />
                  </div>
                  المعلومات التجارية
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CopyableField
                    label="السجل التجاري"
                    value={owner.commercial_register}
                    fieldName="commercial_register"
                    copyToClipboard={copyToClipboard}
                    copyStatus={copyStatus}
                  />
                  {owner.license_number && (
                    <CopyableField
                      label="رقم الترخيص"
                      value={owner.license_number}
                      fieldName="license_number"
                      copyToClipboard={copyToClipboard}
                      copyStatus={copyStatus}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end bg-gray-50 rounded-b-xl">
          <button
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
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