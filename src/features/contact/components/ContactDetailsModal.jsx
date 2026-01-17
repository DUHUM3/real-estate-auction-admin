import React from 'react';
import { formatDate, getAttachmentUrl, getStatusConfig } from '../../../services/ContactsApi';

const ContactDetailsModal = ({
  contact,
  onClose,
  onMarkAsContacted,
  onDelete
}) => {
  if (!contact) return null;

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.badgeColor}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">تفاصيل الرسالة</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Sender Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">الاسم الكامل</label>
              <p className="mt-1 text-sm text-gray-900">{contact.full_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">البريد الإلكتروني</label>
              <p className="mt-1 text-sm text-gray-900">{contact.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
              <p className="mt-1 text-sm text-gray-900">{contact.phone || 'غير متوفر'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">الحالة</label>
              <p className="mt-1">{getStatusBadge(contact.status)}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-500">الموضوع</label>
              <p className="mt-1">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {contact.reason}
                </span>
              </p>
            </div>
          </div>

          {/* Message Content */}
          <div>
            <label className="text-sm font-medium text-gray-500">محتوى الرسالة</label>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{contact.message}</p>
            </div>
          </div>

          {/* Attachments */}
          {contact.file_path && (
            <div>
              <label className="text-sm font-medium text-gray-500">المرفقات</label>
              <div className="mt-2">
                <a
                  href={getAttachmentUrl(contact.file_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  عرض الملف
                </a>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">تاريخ الاستلام</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(contact.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">آخر تحديث</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(contact.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex justify-between items-center">
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={() => onMarkAsContacted(contact.id)}
                disabled={contact.status === 'تم التواصل'}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {contact.status === 'تم التواصل' ? 'تم التواصل ✓' : 'تم التواصل'}
              </button>
            </div>
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                إغلاق
              </button>
              <button
                onClick={() => onDelete(contact.id)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                حذف الرسالة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetailsModal;