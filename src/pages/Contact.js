import React, { useState, useEffect, useMemo } from 'react';
import { useContactsData } from '../features/contact/hooks/useContactsData';
import { useContactFilters } from '../features/contact/hooks/useContactFilters';
import ContactsFilters from '../features/contact/components/ContactsFilters';
import ContactsTable from '../features/contact/components/ContactsTable';
import ContactsPagination from '../features/contact/components/ContactsPagination';
import ContactDetailsModal from '../features/contact/components/ContactDetailsModal';

const ContactsPage = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Custom hooks
  const {
    contacts,
    loading,
    error,
    refreshing,
    pagination,
    fetchContactsData,
    handleRefresh,
    handleDelete,
    handleViewDetails,
    handleMarkAsContacted,
    handlePageChange,
  } = useContactsData();

  const {
    filters,
    handleFilterChange,
    handleResetFilters,
    handleApplyFilters,
  } = useContactFilters((updatedFilters, page) => {
    fetchContactsData(updatedFilters, page);
  });

  // Initial load
  useEffect(() => {
    fetchContactsData(filters, 1);
  }, []);

  // Computed pagination info
  const paginationInfo = useMemo(() => {
    const start = pagination.total > 0 ? (pagination.current_page - 1) * pagination.per_page + 1 : 0;
    const end = Math.min(pagination.current_page * pagination.per_page, pagination.total);
    return { start, end };
  }, [pagination]);

  // View contact details
  const handleViewDetailsClick = async (id) => {
    const contactData = await handleViewDetails(id, filters);
    if (contactData) {
      setSelectedContact(contactData);
      setShowModal(true);
    }
  };

  // Delete contact
  const handleDeleteClick = (id) => {
    handleDelete(id, filters, () => {
      if (selectedContact && selectedContact.id === id) {
        setShowModal(false);
      }
    });
  };

  // Mark as contacted
  const handleMarkAsContactedClick = (id) => {
    handleMarkAsContacted(id, filters, () => {
      if (selectedContact && selectedContact.id === id) {
        setSelectedContact((prev) => ({
          ...prev,
          status: 'تم التواصل',
        }));
      }
    });
  };

  // Loading state
  if (loading && contacts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-red-800 font-medium">خطأ</h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => fetchContactsData(filters, 1)}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Filters Section */}
      <ContactsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        onRefresh={() => handleRefresh(filters)}
        refreshing={refreshing}
        paginationInfo={paginationInfo}
        total={pagination.total}
      />

      {/* Table Section */}
      <ContactsTable
        contacts={contacts}
        filters={filters}
        onViewDetails={handleViewDetailsClick}
        onDelete={handleDeleteClick}
      />

      {/* Pagination */}
      <ContactsPagination
        pagination={pagination}
        paginationInfo={paginationInfo}
        onPageChange={(page) => handlePageChange(filters, page)}
      />

      {/* Contact Details Modal */}
      {showModal && selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          onClose={() => setShowModal(false)}
          onMarkAsContacted={handleMarkAsContactedClick}
          onDelete={handleDeleteClick}
        />
      )}
    </div>
  );
};

export default ContactsPage;