// pages/AllUsersPage.jsx
// المكون الرئيسي الذي يجمع كل الأجزاء معاً

import React, { useState } from 'react';
import UsersFilterBar from '../../features/users/components/UsersFilterBar';
import UsersList from '../../features/users/components/UsersList';
import UserDetailsPanel from '../../features/users/components/UserDetailsPanel';
import RejectModal from '../../features/users/components/RejectModal';
import Pagination from '../../features/users/components/Pagination';
import { useUsersFilters } from '../../features/users/hooks/useUsersFilters';
import { useUsersData } from '../../features/users/hooks/useUsersData';
import { useUserActions } from '../../features/users/hooks/useUserActions';

const AllUsersPage = () => {
  const [rejectModalUserId, setRejectModalUserId] = useState(null);

  // استخدام الهوكات المخصصة
  const {
    filters,
    currentPage,
    selectedUser,
    updateFilter,
    setCurrentPage,
    setSelectedUser,
    clearFilters,
    buildQueryString,
    hasActiveFilters,
  } = useUsersFilters();

  const { usersData, isLoading, refetch, isRefreshing, handleRefresh } = useUsersData(
    filters,
    currentPage,
    buildQueryString
  );

  const { handleApprove, handleReject, isLoading: isActionLoading } = useUserActions(
    filters,
    currentPage,
    setSelectedUser
  );

  // معالجات الأحداث
  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const openRejectModal = (userId) => {
    setRejectModalUserId(userId);
  };

  const closeRejectModal = () => {
    setRejectModalUserId(null);
  };

  const confirmReject = (adminMessage) => {
    handleReject(rejectModalUserId, adminMessage);
    closeRejectModal();
  };

  // البيانات المشتقة
  const users = usersData?.data || [];
  const pagination = usersData?.pagination || {
    current_page: currentPage,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  };

  const loading = isLoading || isActionLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* شريط الفلاتر */}
      <UsersFilterBar
        filters={filters}
        onFilterChange={updateFilter}
        onSearch={handleSearch}
        onClearFilters={clearFilters}
        onRefresh={handleRefresh}
        hasActiveFilters={hasActiveFilters}
        isRefreshing={isRefreshing}
        isLoading={isLoading}
      />

      {/* المحتوى الرئيسي */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* قائمة المستخدمين */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-gray-800">
                قائمة المستخدمين ({pagination.total || users.length})
              </h3>
              <span className="text-sm text-gray-600">
                {pagination.total > 0 ? (
                  <>
                    عرض {pagination.from} إلى {pagination.to} من {pagination.total} - الصفحة{' '}
                    {pagination.current_page} من {pagination.last_page}
                  </>
                ) : (
                  'لا توجد نتائج'
                )}
              </span>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
            <UsersList
              users={users}
              selectedUser={selectedUser}
              onSelectUser={setSelectedUser}
              isLoading={loading}
            />
          </div>

          <Pagination pagination={pagination} currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>

        {/* لوحة التفاصيل */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <UserDetailsPanel
            user={selectedUser}
            onApprove={handleApprove}
            onReject={openRejectModal}
            isLoading={loading}
          />
        </div>
      </div>

      {/* مودال الرفض */}
      <RejectModal
        isOpen={!!rejectModalUserId}
        onClose={closeRejectModal}
        onConfirm={confirmReject}
        isLoading={loading}
      />
    </div>
  );
};

export default AllUsersPage;