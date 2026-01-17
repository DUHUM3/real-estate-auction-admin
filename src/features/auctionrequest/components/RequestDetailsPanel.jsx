// components/RequestDetailsPanel.jsx
// Displays detailed information about the selected marketing request
// Shows owner info, applicant info, property info, images, and status update actions

import React from "react";
import {
  Target,
  User,
  Phone,
  Navigation,
  Calendar,
  Image,
  MessageSquare,
  Mail,
  Home,
  UserCheck,
  Clock,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import {
  getImageUrl,
  formatDate,
  getStatusBadge,
  getPropertyRoleText,
} from "../../../services/marketingRequestsApi";

const RequestDetailsPanel = ({
  selectedRequest,
  loading,
  onOpenStatusModal,
  onOpenImageModal,
}) => {
  if (!selectedRequest) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Target className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500">اختر طلب تسويق لعرض التفاصيل</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">تفاصيل الطلب</h3>
          <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
            #{selectedRequest.id}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Owner Information */}
        <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
            <User className="w-4 h-4 ml-2 text-blue-500" />
            معلومات المالك
          </h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">الاسم الكامل</p>
              <p className="font-medium text-gray-900">{selectedRequest.name}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">رقم الهوية</p>
              <p className="font-medium text-gray-900">
                {selectedRequest.id_number}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">صفة العقار</p>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {getPropertyRoleText(selectedRequest.property_role)}
              </span>
            </div>

            {selectedRequest.property_role === "legal_agent" &&
              selectedRequest.agency_number && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">رقم الوكالة</p>
                  <p className="font-medium text-gray-900">
                    {selectedRequest.agency_number}
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Applicant Information */}
        <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
            <UserCheck className="w-4 h-4 ml-2 text-green-500" />
            معلومات مقدم الطلب
          </h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 space-x-reverse">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">الاسم</p>
                <p className="font-medium text-gray-900">
                  {selectedRequest.user?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 space-x-reverse">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                <p className="font-medium text-gray-900 truncate">
                  {selectedRequest.user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 space-x-reverse">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">رقم الهاتف</p>
                <p className="font-medium text-gray-900">
                  {selectedRequest.user?.phone}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">نوع المستخدم</p>
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {selectedRequest.user?.user_type}
              </span>
            </div>
          </div>
        </div>

        {/* Property Information */}
        <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
            <Home className="w-4 h-4 ml-2 text-orange-500" />
            معلومات العقار
          </h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Navigation className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">الموقع</p>
                <p className="font-medium text-gray-900">
                  {selectedRequest.region} - {selectedRequest.city}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">رقم الوثيقة</p>
              <p className="font-medium text-gray-900">
                {selectedRequest.document_number}
              </p>
            </div>

            <div className="flex items-center space-x-3 space-x-reverse">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">تاريخ التقديم</p>
                <p className="font-medium text-gray-900">
                  {formatDate(selectedRequest.created_at)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">الحالة</p>
              <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
            </div>

            {selectedRequest.terms_accepted && (
              <div className="flex items-center space-x-2 space-x-reverse text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-sm">تم قبول الشروط والأحكام</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {selectedRequest.description && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <MessageSquare className="w-4 h-4 ml-2 text-indigo-500" />
              الوصف
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed">
                {selectedRequest.description}
              </p>
            </div>
          </div>
        )}

        {/* Rejection Message */}
        {selectedRequest.rejection_message && (
          <div>
            <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 ml-2" />
              سبب الرفض
            </h4>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-700">{selectedRequest.rejection_message}</p>
            </div>
          </div>
        )}

        {/* Images */}
        {selectedRequest.images && selectedRequest.images.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Image className="w-4 h-4 ml-2 text-pink-500" />
              الصور المرفوعة ({selectedRequest.images.length})
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {selectedRequest.images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border-2 border-gray-200 hover:border-blue-400"
                  onClick={() => onOpenImageModal(selectedRequest.images, index)}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`صورة ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="hidden w-full h-full flex-col items-center justify-center bg-gray-200 text-gray-500">
                    <Image className="w-6 h-6 mb-1" />
                    <span className="text-xs">تعذر تحميل الصورة</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col space-y-3">
          <button
            className="flex items-center justify-center space-x-2 space-x-reverse w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onOpenStatusModal(selectedRequest.id, "under_review")}
            disabled={selectedRequest.status === "under_review" || loading}
          >
            <Clock className="w-4 h-4" />
            <span>قيد المراجعة</span>
          </button>

          <button
            className="flex items-center justify-center space-x-2 space-x-reverse w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onOpenStatusModal(selectedRequest.id, "reviewed")}
            disabled={selectedRequest.status === "reviewed" || loading}
          >
            <Check className="w-4 h-4" />
            <span>تمت المراجعة</span>
          </button>

          <button
            className="flex items-center justify-center space-x-2 space-x-reverse w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onOpenStatusModal(selectedRequest.id, "auctioned")}
            disabled={selectedRequest.status === "auctioned" || loading}
          >
            <Target className="w-4 h-4" />
            <span>تم عرض العقار في شركة المزادات</span>
          </button>

          <button
            className="flex items-center justify-center space-x-2 space-x-reverse w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onOpenStatusModal(selectedRequest.id, "rejected")}
            disabled={selectedRequest.status === "rejected" || loading}
          >
            <X className="w-4 h-4" />
            <span>رفض الطلب</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsPanel;