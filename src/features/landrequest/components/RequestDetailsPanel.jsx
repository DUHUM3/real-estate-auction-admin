// components/RequestDetailsPanel.jsx
import React from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiNavigation,
  FiHome,
  FiTarget,
  FiLayers,
  FiCalendar,
  FiMessageSquare,
  FiMap,
  FiCheck,
  FiFileText,
  FiX,
  FiRefreshCw,
  FiEye,
  FiGitPullRequest,
} from "react-icons/fi";
import { STATUS_CONFIG, PURPOSE_TEXT, TYPE_TEXT } from "../constants/landRequestsConstants";

const formatDate = (dateString) => {
  if (!dateString) return "غير محدد";
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const RequestDetailsPanel = ({
  request,
  onOpenUserModal,
  onOpenOffersModal,
  onOpenStatusModal,
  loading,
}) => {
  if (!request) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
        <div className="text-center py-12">
          <FiMap className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">اختر طلب أرض لعرض التفاصيل</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">تفاصيل طلب الأرض</h3>
          <span className="text-sm text-gray-500">ID: {request.id}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User Name */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiUser className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">اسم مقدم الطلب</div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900">
                    {request.user?.name || request.user?.full_name || "غير معروف"}
                  </span>
                  {request.user?.id && (
                    <button
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                      onClick={() => onOpenUserModal(request.user.id)}
                      title="عرض تفاصيل المستخدم"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiMail className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-700">البريد الإلكتروني</div>
                <div className="text-gray-900">{request.user?.email || "غير متوفر"}</div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiPhone className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-700">رقم الهاتف</div>
                <div className="text-gray-900">{request.user?.phone || "غير متوفر"}</div>
              </div>
            </div>

            {/* Region */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiNavigation className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-700">المنطقة</div>
                <div className="text-gray-900">{request.region}</div>
              </div>
            </div>

            {/* City */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiHome className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-700">المدينة</div>
                <div className="text-gray-900">{request.city}</div>
              </div>
            </div>

            {/* Purpose */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiTarget className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-700">الغرض</div>
                <div className="text-gray-900">{PURPOSE_TEXT[request.purpose] || request.purpose}</div>
              </div>
            </div>

            {/* Type */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiLayers className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-700">النوع</div>
                <div className="text-gray-900">{TYPE_TEXT[request.type] || request.type}</div>
              </div>
            </div>

            {/* Area */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-700">المساحة</div>
                <div className="text-gray-900">{request.area} م²</div>
              </div>
            </div>

            {/* Offers Count */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-700">عدد العروض</div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900">{request.offers?.length || 0} عرض</span>
                  {request.offers && request.offers.length > 0 && (
                    <button
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                      onClick={() => onOpenOffersModal(request.offers)}
                      title="عرض العروض"
                    >
                      <FiGitPullRequest className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-700">الحالة</div>
                <div className="text-gray-900">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_CONFIG[request.status]?.color || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {STATUS_CONFIG[request.status]?.text || request.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiCalendar className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-700">تاريخ الطلب</div>
                <div className="text-gray-900">{formatDate(request.created_at)}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FiMessageSquare className="w-5 h-5 text-gray-500" />
              <div className="text-sm font-medium text-gray-700">الوصف</div>
            </div>
            <div className="text-gray-900 bg-white p-3 rounded border">
              {request.description || "لا يوجد وصف"}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          <button
            className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onOpenStatusModal(request.id, "completed")}
            disabled={request.status === "completed" || loading}
          >
            <FiCheck className="w-4 h-4" />
            إكمال
          </button>

          <button
            className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onOpenStatusModal(request.id, "pending")}
            disabled={request.status === "pending" || loading}
          >
            <FiFileText className="w-4 h-4" />
            قيد المراجعة
          </button>

          <button
            className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onOpenStatusModal(request.id, "close")}
            disabled={request.status === "close" || loading}
          >
            <FiX className="w-4 h-4" />
            إغلاق
          </button>

          <button
            className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onOpenStatusModal(request.id, "open")}
            disabled={request.status === "open" || loading}
          >
            <FiRefreshCw className="w-4 h-4" />
            إعادة فتح
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsPanel;