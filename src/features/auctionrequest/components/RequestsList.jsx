// components/RequestsList.jsx
// Displays the list of marketing requests with pagination
// Handles request selection and renders individual request cards

import React from "react";
import {
  Target,
  User,
  Phone,
  Navigation,
  FileText,
  Calendar,
  Image,
  MessageSquare,
} from "lucide-react";
import Pagination from "./Pagination";
import {
  formatDate,
  getStatusColor,
  getStatusText,
  getPropertyRoleText,
} from "../../../services/marketingRequestsApi";

const RequestsList = ({
  requests,
  pagination,
  loading,
  selectedRequest,
  onSelectRequest,
  onUpdatePagination,
}) => {
  return (
   <div className="bg-white rounded-xl shadow-sm border border-gray-200">
  <div className="p-6 border-b border-gray-200 bg-white">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">
        قائمة طلبات التسويق ({requests.length})
      </h3>
      <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
            {pagination.total > 0 ? (
              <>
                عرض {pagination.from} إلى {pagination.to} من {pagination.total}
              </>
            ) : (
              "لا توجد نتائج"
            )}
          </span>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex space-x-2 space-x-reverse mb-4">
              <div
                className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.3s" }}
              ></div>
            </div>
            <p className="text-gray-600">جاري تحميل طلبات التسويق...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">لا توجد طلبات تسويق</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedRequest?.id === request.id
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm"
                  }`}
                  onClick={() => onSelectRequest(request)}
                >
                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                          {request.name}
                        </h4>
                        <div
                          className={
                            getStatusColor(request.status) +
                            " px-3 py-1 rounded-full text-sm font-medium border shadow-sm"
                          }
                        >
                          {request.status_ar || getStatusText(request.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">
                            {request.user?.name}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Phone className="w-4 h-4 text-green-500" />
                          <span>{request.user?.phone}</span>
                        </div>

                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Navigation className="w-4 h-4 text-purple-500" />
                          <span>
                            {request.region} - {request.city}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 space-x-reverse">
                          <FileText className="w-4 h-4 text-orange-500" />
                          <span>
                            {getPropertyRoleText(request.property_role)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Calendar className="w-4 h-4 text-indigo-500" />
                          <span>{formatDate(request.created_at)}</span>
                        </div>

                        {request.images && request.images.length > 0 && (
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Image className="w-4 h-4 text-pink-500" />
                            <span>{request.images.length} صورة</span>
                          </div>
                        )}
                      </div>

                      {request.description && (
                        <div className="mt-3 flex items-start space-x-2 space-x-reverse">
                          <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                          <span className="text-sm text-gray-600 line-clamp-2">
                            {request.description}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.last_page > 1 && (
              <div className="flex items-center justify-center space-x-2 space-x-reverse mt-6 pt-6 border-t border-gray-200">
                <Pagination
                  pagination={pagination}
                  onPageChange={onUpdatePagination}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RequestsList;