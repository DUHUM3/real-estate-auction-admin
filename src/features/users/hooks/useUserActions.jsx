// hooks/useUserActions.jsx
// مسؤول عن: إجراءات قبول ورفض المستخدمين

import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { approveUser, rejectUser } from '../services/usersApi';

export const useUserActions = (filters, currentPage, setSelectedUser) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Mutation للقبول
  const approveMutation = useMutation(
    (userId) => approveUser(userId, navigate),
    {
      onSuccess: (data) => {
        alert('تم قبول المستخدم بنجاح');
        
        // تحديث الكاش محلياً
        queryClient.setQueryData(['users', filters, currentPage], (oldData) => {
          if (!oldData) return oldData;
          const updatedUsers = oldData.data.map((user) =>
            user.id === data.data.id ? data.data : user
          );
          return { ...oldData, data: updatedUsers };
        });

        setSelectedUser(null);
      },
      onError: (error) => {
        alert(error.message);
      },
    }
  );

  // Mutation للرفض
  const rejectMutation = useMutation(
    ({ userId, adminMessage }) => rejectUser(userId, adminMessage, navigate),
    {
      onSuccess: (data) => {
        alert('تم رفض المستخدم بنجاح');

        // تحديث الكاش محلياً
        queryClient.setQueryData(['users', filters, currentPage], (oldData) => {
          if (!oldData) return oldData;
          const updatedUsers = oldData.data.map((user) =>
            user.id === data.data.id ? data.data : user
          );
          return { ...oldData, data: updatedUsers };
        });

        setSelectedUser(null);
      },
      onError: (error) => {
        alert(error.message);
      },
    }
  );

  const handleApprove = async (userId) => {
    if (!window.confirm('هل أنت متأكد من قبول هذا المستخدم؟')) return;
    approveMutation.mutate(userId);
  };

  const handleReject = async (userId, adminMessage) => {
    if (!adminMessage.trim()) {
      alert('يرجى إدخال سبب الرفض');
      return;
    }
    if (!window.confirm('هل أنت متأكد من رفض هذا المستخدم؟')) return;
    rejectMutation.mutate({ userId, adminMessage });
  };

  return {
    handleApprove,
    handleReject,
    isLoading: approveMutation.isLoading || rejectMutation.isLoading,
  };
};