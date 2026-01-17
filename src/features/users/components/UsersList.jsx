// components/UsersList.jsx
// مسؤول عن: عرض قائمة المستخدمين

import React from 'react';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { USER_TYPE_NAMES } from '../constants/usersConstants';

const UsersList = ({ users, selectedUser, onSelectUser, isLoading }) => {
  const getUserTypeName = (user) => {
    return user.user_type?.type_name || USER_TYPE_NAMES[user.user_type_id] || 'مستخدم عام';
  };

  const getUserStatusText = (status) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'approved': return 'مقبول';
      case 'rejected': return 'مرفوض';
      default: return 'غير معروف';
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex space-x-2 mb-4">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <p className="text-gray-600">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FiUser className="text-gray-400 mb-4" size={64} />
        <p className="text-gray-600 mb-4">لا توجد نتائج</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          className={`p-4 border rounded-xl transition-all cursor-pointer ${
            selectedUser?.id === user.id
              ? 'border-blue-500 bg-blue-50 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onSelectUser(user)}
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
              <FiUser size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="text-lg font-semibold text-gray-800 truncate">
                  {user.full_name}
                </h4>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getUserTypeName(user)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiCalendar size={14} />
                <span>{formatDate(user.created_at)}</span>
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : user.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {getUserStatusText(user.status)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsersList;