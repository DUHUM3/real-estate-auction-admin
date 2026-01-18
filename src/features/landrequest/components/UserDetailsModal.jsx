// components/UserDetailsModal.jsx
import React from "react";
import { FiUser, FiInfo, FiCopy } from "react-icons/fi";
import {
  USER_STATUS_CONFIG,
  USER_TYPE_CONFIG,
  USER_TYPE_DETAILS,
  USER_DETAIL_LABELS,
} from "../constants/landRequestsConstants";

const formatDate = (dateString) => {
  if (!dateString) return "غير محدد";
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const CopyableField = ({ value }) => {
  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 p-2 rounded text-gray-900 text-sm break-all">
      <span className="truncate">{value || "غير متوفر"}</span>
      {value && (
        <button
          onClick={handleCopy}
          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="نسخ"
        >
          <FiCopy className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const UserDetailsModal = ({ userModal, onClose }) => {
  if (!userModal.show) return null;

  const renderUserDetails = (user) => {
    if (!user) return null;

    const userTypeConfig = USER_TYPE_DETAILS[user.user_type];
    const details = user.details || {};
    const userTypeData = userTypeConfig ? details[userTypeConfig.key] : null;

    const IconComponent = userTypeConfig?.icon || FiUser;

    return (
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h4 className="text-lg font-medium text-gray-900 mb-4">المعلومات الأساسية</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{user.full_name || "غير متوفر"}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <CopyableField value={user.email} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
              <CopyableField value={user.phone} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">حالة المستخدم</label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    USER_STATUS_CONFIG[user.status]?.color || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {USER_STATUS_CONFIG[user.status]?.text || user.status}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع المستخدم</label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    USER_TYPE_CONFIG[user.user_type]?.color || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {USER_TYPE_CONFIG[user.user_type]?.text || user.user_type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h4 className="text-lg font-medium text-gray-900 mb-4">معلومات التسجيل</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التسجيل</label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{formatDate(user.created_at)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">آخر تحديث</label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{formatDate(user.updated_at)}</div>
            </div>
          </div>
        </div>

        {/* Admin Message */}
        {user.admin_message && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h4 className="text-lg font-medium text-gray-900 mb-4">رسالة المسؤول</h4>
            <div className="text-sm text-gray-900 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              {user.admin_message}
            </div>
          </div>
        )}

        {/* User Type Specific Details */}
        {userTypeData && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <IconComponent className="w-4 h-4" />
              {userTypeConfig.title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(userTypeData).map(
                ([key, value]) =>
                  value && (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {USER_DETAIL_LABELS[key] || key}
                      </label>
                      <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded break-all">{value}</div>
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {!userTypeData && user.user_type && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <IconComponent className="w-4 h-4" />
              {userTypeConfig?.title || "معلومات المستخدم"}
            </h4>
            <div className="text-center py-8">
              <FiInfo className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">لا توجد تفاصيل إضافية متاحة</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <FiUser className="w-5 h-5 text-gray-500" />
            تفاصيل المستخدم
          </h3>
          <button
            className="text-gray-400 hover:text-gray-500 transition-colors text-2xl leading-none"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {userModal.loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
              <p className="mt-4 text-sm text-gray-500">جاري تحميل تفاصيل المستخدم...</p>
            </div>
          ) : (
            renderUserDetails(userModal.user)
          )}
        </div>

        <div className="flex items-center justify-end p-4 border-t border-gray-200">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={onClose}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
