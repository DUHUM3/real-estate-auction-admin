import React, { useState } from 'react';
import { FiUser } from 'react-icons/fi';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { fetchClients } from '../services/ClientsManagementApi';
import { useClientFilters } from '../features/clientsmanagement/hooks/useClientFilters';
import { useClientMutations } from '../features/clientsmanagement/hooks/useClientMutations';
import ClientFilters from '../features/clientsmanagement/components/ClientFilters';
import AddClientModal from '../features/clientsmanagement/components/AddClientModal';
import ClientsList from '../features/clientsmanagement/components/ClientsList';
import ClientDetails from '../features/clientsmanagement/components/ClientDetails';

const ClientsManagement = () => {
  const navigate = useNavigate();
  
  // State Management
  const { 
    filters, 
    handleFilterChange, 
    clearFilters, 
    hasActiveFilters 
  } = useClientFilters();
  
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // React Query - Fetch Clients
  const { 
    data: clientsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery(
    ['clients', filters],
    () => fetchClients(filters, navigate),
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('خطأ في جلب العملاء:', error);
        alert('حدث خطأ أثناء جلب البيانات: ' + error.message);
      }
    }
  );

  // Mutations
  const { addClientMutation, deleteClientMutation } = useClientMutations();

  // Event Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const handleAddClient = async (formData) => {
    await addClientMutation.mutateAsync(formData);
    setShowAddForm(false);
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      return;
    }

    await deleteClientMutation.mutateAsync(clientId);
    setSelectedClient(null);
  };

  // Derived State
  const clients = clientsData?.data || [];
  const count = clientsData?.count || 0;
  const loading = isLoading || addClientMutation.isLoading || deleteClientMutation.isLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <FiUser className="text-2xl text-blue-600 ml-3" />
          <h1 className="text-2xl font-bold text-gray-800">إدارة العملاء المميزين</h1>
        </div>
        <p className="text-gray-600">إدارة قائمة العملاء المميزين - العدد الإجمالي: {count}</p>
      </div>

      {/* Filter Section */}
      <ClientFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClearFilters={clearFilters}
        onRefresh={refetch}
        onAddClient={() => setShowAddForm(true)}
        hasActiveFilters={hasActiveFilters}
        loading={loading}
      />

      {/* Add Client Modal */}
      <AddClientModal 
        show={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAddClient}
        isLoading={addClientMutation.isLoading}
      />

      {/* Clients List and Details */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          
          {/* Clients List */}
          <ClientsList 
            clients={clients}
            selectedClient={selectedClient}
            onSelectClient={setSelectedClient}
            loading={isLoading}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />

          {/* Client Details */}
          <ClientDetails 
            client={selectedClient}
            onDelete={handleDeleteClient}
            isDeleting={deleteClientMutation.isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientsManagement;