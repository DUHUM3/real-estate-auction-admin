import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { addClient, deleteClient } from '../../../services/ClientsManagementApi';

export const useClientMutations = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // إضافة عميل جديد
  const addClientMutation = useMutation(
    (formData) => addClient(formData, navigate),
    {
      onSuccess: () => {
        alert('تم إضافة العميل بنجاح');
        queryClient.invalidateQueries(['clients']);
      },
      onError: (error) => {
        alert(error.message);
      }
    }
  );

  // حذف عميل
  const deleteClientMutation = useMutation(
    (clientId) => deleteClient(clientId, navigate),
    {
      onSuccess: () => {
        alert('تم حذف العميل بنجاح');
        queryClient.invalidateQueries(['clients']);
      },
      onError: (error) => {
        alert(error.message);
      }
    }
  );

  return {
    addClientMutation,
    deleteClientMutation
  };
};