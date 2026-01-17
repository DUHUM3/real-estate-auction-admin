import { useState, useCallback } from 'react';
import {
  fetchContacts,
  fetchContactDetails,
  deleteContact,
  markAsContacted,
} from '../../../services/ContactsApi';

export const useContactsData = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 8,
    total: 0,
  });

  // Fetch contacts with filters and pagination
  const fetchContactsData = useCallback(async (filters, page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchContacts(filters, page);

      if (result.success) {
        setContacts(result.data);
        setPagination(result.meta);
      }
    } catch (err) {
      setError(err.message);
      console.error('خطأ في جلب جهات الاتصال:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh data manually
  const handleRefresh = useCallback((filters) => {
    setRefreshing(true);
    fetchContactsData(filters, pagination.current_page);
  }, [pagination.current_page, fetchContactsData]);

  // Delete a contact
  const handleDelete = useCallback(async (id, filters, onSuccess) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      try {
        await deleteContact(id);
        fetchContactsData(filters, pagination.current_page);
        
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        setError('فشل في حذف الرسالة');
        console.error('خطأ في حذف الرسالة:', err);
      }
    }
  }, [pagination.current_page, fetchContactsData]);

  // Fetch contact details
  const handleViewDetails = useCallback(async (id, filters) => {
    try {
      const result = await fetchContactDetails(id);

      if (result.success) {
        // Refresh the list to update read status
        fetchContactsData(filters, pagination.current_page);
        return result.data;
      }
    } catch (err) {
      setError('فشل في جلب تفاصيل الرسالة');
      console.error('خطأ في جلب تفاصيل الرسالة:', err);
      return null;
    }
  }, [pagination.current_page, fetchContactsData]);

  // Mark contact as contacted
  const handleMarkAsContacted = useCallback(async (id, filters, onSuccess) => {
    try {
      await markAsContacted(id);
      
      // Refresh the list
      fetchContactsData(filters, pagination.current_page);
      
      if (onSuccess) {
        onSuccess();
      }

      alert('تم تغيير حالة الرسالة إلى "تم التواصل" بنجاح');
    } catch (err) {
      setError('فشل في تغيير حالة الرسالة');
      console.error('خطأ في تغيير حالة الرسالة:', err);
    }
  }, [pagination.current_page, fetchContactsData]);

  // Handle page change
  const handlePageChange = useCallback((filters, page) => {
    fetchContactsData(filters, page);
  }, [fetchContactsData]);

  return {
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
  };
};