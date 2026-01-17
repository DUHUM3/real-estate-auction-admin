import React from 'react';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { formatDate } from '../../../services/ClientsManagementApi';

const ClientsList = ({ 
  clients, 
  selectedClient, 
  onSelectClient, 
  loading, 
  hasActiveFilters, 
  onClearFilters 
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <p className="mt-4 text-gray-600">جاري تحميل العملاء...</p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FiUser className="text-4xl text-gray-400 mb-3" />
        <p className="text-gray-500 mb-4">لا توجد عملاء مميزين</p>
        {hasActiveFilters && (
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={onClearFilters}
          >
            مسح الفلاتر
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">قائمة العملاء ({clients.length})</h3>
      </div>
      
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {clients.map((client) => (
          <div 
            key={client.id} 
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
              selectedClient?.id === client.id 
                ? 'border-blue-500 bg-blue-50 shadow-sm' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onSelectClient(client)}
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-300">
              {client.logo ? (
                <img 
                  src={client.logo} 
                  alt={client.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : null}
              {!client.logo && <FiUser className="text-gray-400" />}
            </div>
            <div className="flex-1 mr-4">
              <h4 className="font-medium text-gray-800">{client.name}</h4>
              {client.created_at && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <FiCalendar className="ml-1" />
                  <span>{formatDate(client.created_at)}</span>
                </div>
              )}
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              مميز
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientsList;