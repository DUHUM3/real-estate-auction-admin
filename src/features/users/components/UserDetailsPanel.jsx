// components/UserDetailsPanel.jsx
// مسؤول عن: لوحة عرض تفاصيل المستخدم المحدد

import React, { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiFileText, FiInfo, FiCopy, FiCheck, FiX } from 'react-icons/fi';
import UserTypeDetails from './UserTypeDetails';
import { USER_TYPE_NAMES } from '../constants/usersConstants';

const UserDetailsPanel = ({ user, onApprove, onReject, isLoading }) => {
  const [copyStatus, setCopyStatus] = useState({});

  const copyToClipboard = async (text, fieldName) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text.toString());
      setCopyStatus((prev) => ({ ...prev, [fieldName]: true }));
      setTimeout(() => {
        setCopyStatus((prev) => ({ ...prev, [fieldName]: false }));
      }, 2000);
    } catch (err) {
      console.error('فشل في نسخ النص: ', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';
    switch (status) {
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>قيد المراجعة</span>;
      case 'approved':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>مقبول</span>;
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>مرفوض</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>غير معروف</span>;
    }
  };

  const getUserTypeName = (user) => {
    return user.user_type?.type_name || USER_TYPE_NAMES[user.user_type_id] || 'مستخدم عام';
  };

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-12 text-center">
        <FiUser className="text-gray-400 mb-4" size={64} />
        <p className="text-gray-600">اختر مستخدمًا لعرض التفاصيل الكاملة</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800">تفاصيل المستخدم الكاملة</h3>
          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">ID: {user.id}</span>
        </div>
      </div>

      <div className="p-6 overflow-y-auto max-h-[80vh] min-h-[100px]">
        <div className="space-y-6">
          {/* المعلومات الأساسية */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FiInfo className="text-blue-500" />
                المعلومات الأساسية
              </h4>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiUser className="text-gray-400" />
                  <span>الاسم الكامل</span>
                </div>
                <div className="text-gray-800 font-medium">{user.full_name}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiMail className="text-gray-400" />
                  <span>البريد الإلكتروني</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-medium">{user.email}</span>
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus['email'] ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    onClick={() => copyToClipboard(user.email, 'email')}
                    title="نسخ البريد الإلكتروني"
                  >
                    <FiCopy size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiPhone className="text-gray-400" />
                  <span>رقم الهاتف</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-medium">{user.phone}</span>
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus['phone'] ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    onClick={() => copyToClipboard(user.phone, 'phone')}
                    title="نسخ رقم الهاتف"
                  >
                    <FiCopy size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-600">نوع المستخدم</div>
                <div className="text-gray-800 font-medium">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getUserTypeName(user)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiCalendar className="text-gray-400" />
                  <span>تاريخ التسجيل</span>
                </div>
                <div className="text-gray-800 font-medium">{formatDate(user.created_at)}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiCalendar className="text-gray-400" />
                  <span>آخر تحديث</span>
                </div>
                <div className="text-gray-800 font-medium">{formatDate(user.updated_at)}</div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-600">الحالة</div>
                <div className="text-gray-800 font-medium">{getStatusBadge(user.status)}</div>
              </div>

              {user.admin_message && (
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiFileText className="text-gray-400" />
                    <span>رسالة المسؤول</span>
                  </div>
                  <div className="flex items-start justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-800">{user.admin_message}</span>
                    <button
                      className={`p-1 rounded transition-colors flex-shrink-0 ${
                        copyStatus['admin_message'] ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-500'
                      }`}
                      onClick={() => copyToClipboard(user.admin_message, 'admin_message')}
                      title="نسخ رسالة المسؤول"
                    >
                      <FiCopy size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* التفاصيل الخاصة بنوع المستخدم */}
          <UserTypeDetails user={user} />
        </div>
      </div>

      {/* أزرار القبول/الرفض */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-3">
          {user.status === 'pending' && (
            <>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onApprove(user.id)}
                disabled={isLoading}
              >
                <FiCheck size={18} />
                {isLoading ? 'جاري المعالجة...' : 'قبول المستخدم'}
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onReject(user.id)}
                disabled={isLoading}
              >
                <FiX size={18} />
                {isLoading ? 'جاري المعالجة...' : 'رفض المستخدم'}
              </button>
            </>
          )}
          {user.status === 'approved' && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onReject(user.id)}
              disabled={isLoading}
            >
              <FiX size={18} />
              {isLoading ? 'جاري المعالجة...' : 'رفض المستخدم'}
            </button>
          )}
          {user.status === 'rejected' && (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => onApprove(user.id)}
              disabled={isLoading}
            >
              <FiCheck size={18} />
              {isLoading ? 'جاري المعالجة...' : 'قبول المستخدم'}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default UserDetailsPanel;