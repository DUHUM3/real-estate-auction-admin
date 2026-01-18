import React from "react";
import { FiUser, FiEdit, FiCopy } from "react-icons/fi";
import useCopyToClipboard from "../hooks/useCopyToClipboard";

const CopyableField = ({ label, value, fieldName, copyToClipboard, copyStatus }) => {
  if (!value) return null;

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-500">
        {label}
      </label>

      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
        <span className="text-sm font-medium text-gray-800 truncate">
          {value}
        </span>

        <button
          onClick={() => copyToClipboard(value, fieldName)}
          title={`نسخ ${label}`}
          className={`p-1.5 rounded-md transition ${
            copyStatus[fieldName]
              ? "bg-green-100 text-green-600"
              : "text-gray-400 hover:bg-gray-100"
          }`}
        >
          <FiCopy size={14} />
        </button>
      </div>
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
      {icon}
      <h4 className="text-sm font-semibold text-gray-800">
        {title}
      </h4>
    </div>

    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const OwnerModal = ({ isOpen, owner, onClose }) => {
  const { copyStatus, copyToClipboard } = useCopyToClipboard();

  if (!isOpen || !owner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <FiUser className="text-gray-600" />
            <h3 className="text-base font-semibold text-gray-800">
              تفاصيل الشركة
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          
          {/* Company Info */}
          <Section
            title="معلومات الشركة"
            icon={<FiUser className="text-gray-500" />}
          >
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
          </Section>

          {/* Commercial Info */}
          {owner.commercial_register && (
            <Section
              title="المعلومات التجارية"
              icon={<FiEdit className="text-gray-500" />}
            >
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
            </Section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerModal;
