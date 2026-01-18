// components/UserDetailsPanel.jsx
// مسؤول عن: لوحة عرض تفاصيل المستخدم المحدد
// UI/UX: Enterprise SaaS Admin – RTL-first, Card-based, consistent with Land Details design system

import React, { useState } from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiFileText,
  FiInfo,
  FiCopy,
  FiCheck,
  FiX,
} from 'react-icons/fi';
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
    const base =
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'pending':
        return (
          <span className={`${base} bg-yellow-100 text-yellow-800`}>
            قيد المراجعة
          </span>
        );
      case 'approved':
        return (
          <span className={`${base} bg-green-100 text-green-800`}>
            مقبول
          </span>
        );
      case 'rejected':
        return (
          <span className={`${base} bg-red-100 text-red-800`}>
            مرفوض
          </span>
        );
      default:
        return (
          <span className={`${base} bg-gray-100 text-gray-800`}>
            غير معروف
          </span>
        );
    }
  };

  const getUserTypeName = (user) => {
    return (
      user.user_type?.type_name ||
      USER_TYPE_NAMES[user.user_type_id] ||
      'مستخدم عام'
    );
  };

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-16 text-center">
        <FiUser className="text-gray-300 mb-4" size={56} />
        <p className="text-gray-500 text-sm">
          اختر مستخدمًا لعرض التفاصيل
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ===== Overview Header ===== */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiUser className="text-gray-400" size={20} />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {user.full_name}
              </h2>
              <p className="text-xs text-gray-500">
                ID: {user.id}
              </p>
            </div>
          </div>
          {getStatusBadge(user.status)}
        </div>
      </div>

      {/* ===== Content ===== */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* ===== Basic Information ===== */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <FiInfo className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-800">
              المعلومات الأساسية
            </h3>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <p className="text-xs text-gray-500 mb-1">الاسم الكامل</p>
              <p className="text-sm font-medium text-gray-800">
                {user.full_name}
              </p>
            </div>

            {/* User Type */}
            <div>
              <p className="text-xs text-gray-500 mb-1">نوع المستخدم</p>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getUserTypeName(user)}
              </span>
            </div>

            {/* Email */}
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <FiMail /> البريد الإلكتروني
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user.email}
                </p>
                <button
                  onClick={() => copyToClipboard(user.email, 'email')}
                  className={`p-1.5 rounded-md transition ${
                    copyStatus.email
                      ? 'bg-green-100 text-green-600'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <FiCopy size={14} />
                </button>
              </div>
            </div>

            {/* Phone */}
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <FiPhone /> رقم الهاتف
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-800">
                  {user.phone}
                </p>
                <button
                  onClick={() => copyToClipboard(user.phone, 'phone')}
                  className={`p-1.5 rounded-md transition ${
                    copyStatus.phone
                      ? 'bg-green-100 text-green-600'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <FiCopy size={14} />
                </button>
              </div>
            </div>

            {/* Created At */}
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <FiCalendar /> تاريخ التسجيل
              </p>
              <p className="text-sm text-gray-800">
                {formatDate(user.created_at)}
              </p>
            </div>

            {/* Updated At */}
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <FiCalendar /> آخر تحديث
              </p>
              <p className="text-sm text-gray-800">
                {formatDate(user.updated_at)}
              </p>
            </div>

            {/* Admin Message */}
            {user.admin_message && (
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <FiFileText /> رسالة المسؤول
                </p>
                <div className="flex items-start justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-800">
                    {user.admin_message}
                  </p>
                  <button
                    onClick={() =>
                      copyToClipboard(user.admin_message, 'admin_message')
                    }
                    className={`p-1.5 rounded-md transition ${
                      copyStatus.admin_message
                        ? 'bg-green-100 text-green-600'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <FiCopy size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===== User Type Details ===== */}
        <UserTypeDetails user={user} />
      </div>

      {/* ===== Actions ===== */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex gap-3 flex-wrap">
          {user.status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(user.id)}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
              >
                <FiCheck size={16} />
                قبول
              </button>
              <button
                onClick={() => onReject(user.id)}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                <FiX size={16} />
                رفض
              </button>
            </>
          )}

          {user.status === 'approved' && (
            <button
              onClick={() => onReject(user.id)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
            >
              <FiX size={16} />
              رفض
            </button>
          )}

          {user.status === 'rejected' && (
            <button
              onClick={() => onApprove(user.id)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
            >
              <FiCheck size={16} />
              قبول
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPanel;
