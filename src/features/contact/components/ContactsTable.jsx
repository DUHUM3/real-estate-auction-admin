import React from 'react';
import { formatDate, truncateText, getStatusConfig } from '../../../services/ContactsApi';

const ContactsTable = ({ contacts, filters, onViewDetails, onDelete }) => {
  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.badgeColor}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الاسم
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                البريد الإلكتروني
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الموضوع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                معاينة الرسالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                التاريخ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  {filters.search || filters.start_date || filters.end_date
                    ? 'لا توجد رسائل تطابق الفلاتر المحددة.'
                    : 'لا توجد رسائل تواصل حالياً.'}
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  onClick={() => onViewDetails(contact.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-end">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {contact.full_name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </span>
                      </div>
                      <div className="mr-4 text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {contact.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contact.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{contact.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {contact.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {getStatusBadge(contact.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {truncateText(contact.message)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatDate(contact.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <div
                      className="flex justify-start space-x-2 space-x-reverse"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onViewDetails(contact.id)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm transition-colors duration-150"
                      >
                        عرض
                      </button>
                      <button
                        onClick={() => onDelete(contact.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-sm transition-colors duration-150"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactsTable;