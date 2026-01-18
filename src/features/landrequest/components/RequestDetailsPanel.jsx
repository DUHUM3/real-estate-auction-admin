// components/RequestDetailsPanel.jsx
import React, { useState } from "react";
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
  FiEye,
  FiGitPullRequest,
  FiCheck,
  FiFileText,
  FiX,
  FiRefreshCw,
  FiCopy,
} from "react-icons/fi";
import {
  STATUS_CONFIG,
  PURPOSE_TEXT,
  TYPE_TEXT,
} from "../constants/landRequestsConstants";

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

const InfoCard = ({ icon, label, children, action, className = "" }) => (
  <div className={`flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
    {icon && <div className="text-gray-500">{icon}</div>}
    <div className="flex-1">
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div className="flex items-center gap-2 flex-wrap">
        {children}
        {action && <div>{action}</div>}
      </div>
    </div>
  </div>
);

const RequestDetailsPanel = ({
  request,
  onOpenUserModal,
  onOpenOffersModal,
  onOpenStatusModal,
  loading,
}) => {
  const [copyStatus, setCopyStatus] = useState({ email: false, phone: false });

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopyStatus({ ...copyStatus, [key]: true });
    setTimeout(() => setCopyStatus({ ...copyStatus, [key]: false }), 1500);
  };

  if (!request) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
        <div className="text-center py-12">
          <FiNavigation className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            اختر طلب أرض لعرض التفاصيل
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">تفاصيل طلب الأرض</h3>
          <span className="text-sm text-gray-500">ID: {request.id}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ID - يأخذ عمود كامل في الأعلى */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="text-sm font-medium text-gray-700">رقم الطلب</div>
              <div className="text-gray-900 font-semibold">{request.id}</div>
            </div>
          </div>

          {/* اسم مقدم الطلب */}
          <InfoCard
            icon={<FiUser className="w-5 h-5" />}
            label="اسم مقدم الطلب"
            action={
              request.user?.id && (
                <button
                  onClick={() => onOpenUserModal(request.user.id)}
                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                  title="عرض تفاصيل المستخدم"
                >
                  <FiEye className="w-4 h-4" />
                </button>
              )
            }
          >
            <span className="text-gray-900 truncate">
              {request.user?.name || request.user?.full_name || "غير معروف"}
            </span>
          </InfoCard>

          {/* البريد الإلكتروني - يأخذ مساحة عمود كامل */}
          <div className="md:col-span-2">
            <InfoCard
              icon={<FiMail className="w-5 h-5" />}
              label="البريد الإلكتروني"
            >
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 min-w-0 overflow-hidden">
                  <span className="text-gray-900 truncate block text-right w-full">
                    {request.user?.email || "غير متوفر"}
                  </span>
                </div>
                {request.user?.email && (
                  <button
                    onClick={() => copyToClipboard(request.user.email, "email")}
                    className={`p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0 ${
                      copyStatus.email ? "text-green-600" : "text-gray-500"
                    }`}
                    title="نسخ البريد الإلكتروني"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </InfoCard>
          </div>

          {/* المنطقة */}
          <InfoCard icon={<FiNavigation className="w-5 h-5" />} label="المنطقة">
            <span className="text-gray-900 truncate">{request.region}</span>
          </InfoCard>

          {/* رقم الهاتف */}
          <InfoCard icon={<FiPhone className="w-5 h-5" />} label="رقم الهاتف">
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 min-w-0 overflow-hidden">
                <span className="text-gray-900 truncate block text-right w-full">
                  {request.user?.phone || "غير متوفر"}
                </span>
              </div>
              {request.user?.phone && (
                <button
                  onClick={() => copyToClipboard(request.user.phone, "phone")}
                  className={`p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0 ${
                    copyStatus.phone ? "text-green-600" : "text-gray-500"
                  }`}
                  title="نسخ رقم الهاتف"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
              )}
            </div>
          </InfoCard>

          {/* الغرض */}
          <InfoCard icon={<FiTarget className="w-5 h-5" />} label="الغرض">
            <span className="text-gray-900 truncate">
              {PURPOSE_TEXT[request.purpose] || request.purpose}
            </span>
          </InfoCard>

          {/* المحافظة */}
          <InfoCard icon={<FiHome className="w-5 h-5" />} label="المحافظة">
            <span className="text-gray-900 truncate">{request.city}</span>
          </InfoCard>

          {/* المساحة */}
          <InfoCard label="المساحة">
            <span className="text-gray-900">{request.area} م²</span>
          </InfoCard>

          {/* النوع */}
          <InfoCard icon={<FiLayers className="w-5 h-5" />} label="النوع">
            <span className="text-gray-900 truncate">
              {TYPE_TEXT[request.type] || request.type}
            </span>
          </InfoCard>

          {/* الحالة */}
          <InfoCard label="الحالة">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                STATUS_CONFIG[request.status]?.color ||
                "bg-gray-100 text-gray-800"
              }`}
            >
              {STATUS_CONFIG[request.status]?.text || request.status}
            </span>
          </InfoCard>

          {/* عدد العروض */}
          <InfoCard
            label="عدد العروض"
            action={
              request.offers &&
              request.offers.length > 0 && (
                <button
                  onClick={() => onOpenOffersModal(request.offers)}
                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                  title="عرض العروض"
                >
                  <FiGitPullRequest className="w-4 h-4" />
                </button>
              )
            }
          >
            <span className="text-gray-900">
              {request.offers?.length || 0} عرض
            </span>
          </InfoCard>

          {/* تاريخ الطلب */}
          <InfoCard
            icon={<FiCalendar className="w-5 h-5" />}
            label="تاريخ الطلب"
            className="md:col-span-2"
          >
            <span className="text-gray-900">
              {formatDate(request.created_at)}
            </span>
          </InfoCard>
        </div>

        {/* الوصف */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiMessageSquare className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">الوصف</span>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            {request.description || "لا يوجد وصف"}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 grid grid-cols-2 gap-2">
        <button
          className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onOpenStatusModal(request.id, "completed")}
          disabled={request.status === "completed" || loading}
        >
          <FiCheck className="w-4 h-4" /> إكمال
        </button>

        <button
          className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onOpenStatusModal(request.id, "pending")}
          disabled={request.status === "pending" || loading}
        >
          <FiFileText className="w-4 h-4" /> قيد المراجعة
        </button>

        <button
          className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onOpenStatusModal(request.id, "close")}
          disabled={request.status === "close" || loading}
        >
          <FiX className="w-4 h-4" /> إغلاق
        </button>

        <button
          className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onOpenStatusModal(request.id, "open")}
          disabled={request.status === "open" || loading}
        >
          <FiRefreshCw className="w-4 h-4" /> إعادة فتح
        </button>
      </div>
    </div>
  );
};

export default RequestDetailsPanel;