import React from 'react';
import { 
  FiUser, 
  FiGlobe, 
  FiCalendar, 
  FiImage, 
  FiTrash2 
} from 'react-icons/fi';
import { formatDate } from '../../../services/ClientsManagementApi';

const ClientDetails = ({ client, onDelete, isDeleting }) => {
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <FiUser className="text-4xl text-gray-400 mb-3" />
        <p className="text-gray-500">اختر عميلاً لعرض التفاصيل</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">تفاصيل العميل</h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">ID: {client.id}</span>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex items-center text-gray-600 w-32">
            <FiUser className="ml-2" />
            <span>اسم العميل</span>
          </div>
          <div className="flex-1 text-gray-800 font-medium">{client.name}</div>
        </div>

        {client.website && (
          <div className="flex items-start">
            <div className="flex items-center text-gray-600 w-32">
              <FiGlobe className="ml-2" />
              <span>الموقع الإلكتروني</span>
            </div>
            <div className="flex-1">
              <a 
                href={client.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {client.website}
              </a>
            </div>
          </div>
        )}

        <div className="flex items-start">
          <div className="flex items-center text-gray-600 w-32">
            <span>الحالة</span>
          </div>
          <div className="flex-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              مميز
            </span>
          </div>
        </div>

        {/* تفاصيل إضافية */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">تفاصيل العميل</h4>
          
          {client.logo && (
            <div className="flex items-start mb-4">
              <div className="flex items-center text-gray-600 w-32">
                <FiImage className="ml-2" />
                <span>الشعار</span>
              </div>
              <div className="flex-1">
                <img 
                  src={client.logo} 
                  alt={`شعار ${client.name}`}
                  className="max-w-[150px] max-h-[80px] rounded border border-gray-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden text-gray-600">
                  <FiImage className="inline ml-1" /> لا يمكن تحميل الصورة
                </div>
              </div>
            </div>
          )}

          {client.website && (
            <div className="flex items-start mb-4">
              <div className="flex items-center text-gray-600 w-32">
                <FiGlobe className="ml-2" />
                <span>الموقع الإلكتروني</span>
              </div>
              <div className="flex-1">
                <a 
                  href={client.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {client.website}
                </a>
              </div>
            </div>
          )}

          <div className="flex items-start mb-4">
            <div className="flex items-center text-gray-600 w-32">
              <FiCalendar className="ml-2" />
              <span>تاريخ الإضافة</span>
            </div>
            <div className="flex-1 text-gray-800">
              {formatDate(client.created_at)}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center text-gray-600 w-32">
              <FiCalendar className="ml-2" />
              <span>آخر تحديث</span>
            </div>
            <div className="flex-1 text-gray-800">
              {formatDate(client.updated_at)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <button 
          className="flex items-center justify-center w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          onClick={() => onDelete(client.id)}
          disabled={isDeleting}
        >
          <FiTrash2 className="ml-2" />
          {isDeleting ? 'جاري المعالجة...' : 'حذف العميل'}
        </button>
      </div>
    </div>
  );
};

export default ClientDetails;