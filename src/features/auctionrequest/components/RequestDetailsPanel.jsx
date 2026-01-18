// components/RequestDetailsPanel.jsx
// Redesigned to match the enterprise SaaS admin dashboard design system

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
  Copy,
  ChevronLeft,
} from "lucide-react";
import {
  getImageUrl,
  formatDate,
  getStatusBadge,
  getPropertyRoleText,
} from "../../../services/marketingRequestsApi";

// Reusable Section Header Component
const SectionHeader = ({ title, icon: Icon, className = "" }) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>
    <div className="flex items-center">
      {Icon && <Icon className="w-5 h-5 ml-3 text-gray-400" />}
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
    </div>
  </div>
);

// Reusable Info Card Component
const InfoCard = ({ label, value, icon: Icon, copyable = false, className = "", valueClassName = "" }) => (
  <div className={`bg-gray-50 rounded-lg p-3 border border-gray-200 ${className}`}>
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
    </div>
    <div className="flex items-center justify-between">
      <span className={`text-sm font-semibold text-gray-900 truncate ${valueClassName}`}>
        {value || "—"}
      </span>
      {copyable && value && (
        <button className="mr-2 text-gray-400 hover:text-gray-600">
          <Copy className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  </div>
);

const RequestDetailsPanel = ({
  selectedRequest,
  loading,
  onOpenStatusModal,
  onOpenImageModal,
}) => {
  if (!selectedRequest) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 sticky top-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
            <Target className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">لا يوجد طلب محدد</h3>
          <p className="text-gray-500 text-sm">اختر طلب تسويق لعرض التفاصيل</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 sticky top-6 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-l from-gray-50 to-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <ChevronLeft className="w-5 h-5 text-gray-400 ml-3" />
            <h2 className="text-xl font-bold text-gray-900">تفاصيل الطلب</h2>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            {getStatusBadge(selectedRequest.status)}
            <span className="px-3 py-1.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300">
              # {selectedRequest.id}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Overview Section */}
        <div className="bg-gradient-to-l from-blue-50/50 to-white rounded-xl border border-blue-100 p-5">
          <SectionHeader title="نظرة عامة" icon={Target} />
          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              label="اسم المالك"
              value={selectedRequest.name}
              icon={User}
              copyable
            />
            <InfoCard
              label="رقم الهوية"
              value={selectedRequest.id_number}
              icon={User}
              copyable
            />
            <InfoCard
              label="صفة صاحب العقار"
              value={getPropertyRoleText(selectedRequest.property_role)}
              className="col-span-2"
            />
            {selectedRequest.property_role === "legal_agent" && selectedRequest.agency_number && (
              <InfoCard
                label="رقم الوكالة"
                value={selectedRequest.agency_number}
                icon={User}
                copyable
                className="col-span-2"
              />
            )}
          </div>
        </div>

        {/* Applicant Information */}
        <div className="space-y-4">
          <SectionHeader title="مقدم الطلب" icon={UserCheck} />
          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              label="الاسم الكامل"
              value={selectedRequest.user?.name}
              icon={User}
              copyable
            />
            <InfoCard
              label="البريد الإلكتروني"
              value={selectedRequest.user?.email}
              icon={Mail}
              copyable
              className="col-span-2"
              valueClassName="text-sm"
            />
            <InfoCard
              label="رقم الهاتف"
              value={selectedRequest.user?.phone}
              icon={Phone}
              copyable
            />
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-500">نوع المستخدم</span>
                <UserCheck className="w-4 h-4 text-gray-400" />
              </div>
              <span className="inline-flex px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                {selectedRequest.user?.user_type}
              </span>
            </div>
          </div>
        </div>

        {/* Property Information */}
        <div className="space-y-4">
          <SectionHeader title="معلومات العقار" icon={Home} />
          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              label="المنطقة"
              value={selectedRequest.region}
              icon={Navigation}
            />
            <InfoCard
              label="المدينة"
              value={selectedRequest.city}
              icon={Navigation}
            />
            <InfoCard
              label="رقم الوثيقة"
              value={selectedRequest.document_number}
              icon={User}
              copyable
              className="col-span-2"
            />
            <InfoCard
              label="تاريخ التقديم"
              value={formatDate(selectedRequest.created_at)}
              icon={Calendar}
            />
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">الحالة</span>
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
            </div>
          </div>
          {selectedRequest.terms_accepted && (
            <div className="flex items-center space-x-2 space-x-reverse text-green-600 bg-green-50 px-4 py-3 rounded-lg border border-green-200">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">تم قبول الشروط والأحكام</span>
            </div>
          )}
        </div>

        {/* Description */}
        {selectedRequest.description && (
          <div className="space-y-4">
            <SectionHeader title="وصف الطلب" icon={MessageSquare} />
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-gray-700 text-sm leading-relaxed">
                {selectedRequest.description}
              </p>
            </div>
          </div>
        )}

        {/* Rejection Message */}
        {selectedRequest.rejection_message && (
          <div className="space-y-4">
            <SectionHeader title="سبب الرفض" icon={AlertCircle} className="text-red-700" />
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <p className="text-red-700 text-sm">{selectedRequest.rejection_message}</p>
            </div>
          </div>
        )}

        {/* Images */}
        {selectedRequest.images && selectedRequest.images.length > 0 && (
          <div className="space-y-4">
            <SectionHeader title="الصور المرفوعة" icon={Image} />
            <div className="grid grid-cols-3 gap-3">
              {selectedRequest.images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer group relative border border-gray-300 hover:border-blue-400 transition-colors"
                  onClick={() => onOpenImageModal(selectedRequest.images, index)}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`صورة ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="hidden absolute inset-0 w-full h-full flex-col items-center justify-center bg-gray-200 text-gray-500">
                    <Image className="w-8 h-8 mb-2" />
                    <span className="text-xs">تعذر تحميل الصورة</span>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center">
              {selectedRequest.images.length} صورة • اضغط على أي صورة للتكبير
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons - Fixed at Bottom */}
      <div className="p-6 border-t border-gray-200 bg-gray-50/80 backdrop-blur-sm">
        <div className="grid grid-cols-2 gap-3">
          <button
            className="flex items-center justify-center space-x-2 space-x-reverse px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 focus:ring-2 focus:ring-amber-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            onClick={() => onOpenStatusModal(selectedRequest.id, "under_review")}
            disabled={selectedRequest.status === "under_review" || loading}
          >
            <Clock className="w-4 h-4" />
            <span>قيد المراجعة</span>
          </button>

          <button
            className="flex items-center justify-center space-x-2 space-x-reverse px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            onClick={() => onOpenStatusModal(selectedRequest.id, "reviewed")}
            disabled={selectedRequest.status === "reviewed" || loading}
          >
            <Check className="w-4 h-4" />
            <span>تمت المراجعة</span>
          </button>

          <button
            className="flex items-center justify-center space-x-2 space-x-reverse px-4 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            onClick={() => onOpenStatusModal(selectedRequest.id, "auctioned")}
            disabled={selectedRequest.status === "auctioned" || loading}
          >
            <Target className="w-4 h-4" />
            <span>عرض بالمزاد</span>
          </button>

          <button
            className="flex items-center justify-center space-x-2 space-x-reverse px-4 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 focus:ring-2 focus:ring-rose-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            onClick={() => onOpenStatusModal(selectedRequest.id, "rejected")}
            disabled={selectedRequest.status === "rejected" || loading}
          >
            <X className="w-4 h-4" />
            <span>رفض الطلب</span>
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-300/50">
          <p className="text-xs text-gray-500 text-center">
            يتم تحديث حالة الطلب فوراً بعد الإجراء
          </p>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsPanel;