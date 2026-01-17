// Renders the detailed content of a selected interest
import React from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiCalendar,
  FiMessageSquare,
  FiEdit,
  FiCopy,
  FiEye,
} from "react-icons/fi";
import { useInterestsAPI } from "../../../services/interestsAPI";

const InterestDetailsContent = ({
  interest,
  openPropertyModal,
  copyToClipboard,
  copyStatus,
}) => {
  const { formatDate, getStatusBadge } = useInterestsAPI();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <div className="flex items-center">
          <FiUser className="text-gray-500 ml-2" />
          <span className="text-sm font-medium text-gray-700">اسم المهتم</span>
        </div>
        <span className="text-gray-900 font-medium">{interest.full_name}</span>
      </div>

      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <div className="flex items-center">
          <FiMail className="text-gray-500 ml-2" />
          <span className="text-sm font-medium text-gray-700">
            البريد الإلكتروني
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-900 font-medium mr-2">
            {interest.email}
          </span>
          <button
            className={`p-1 rounded hover:bg-gray-200 transition-colors ${
              copyStatus["email"] ? "text-green-600" : "text-gray-500"
            }`}
            onClick={() => copyToClipboard(interest.email, "email")}
            title="نسخ البريد الإلكتروني"
          >
            <FiCopy size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <div className="flex items-center">
          <FiPhone className="text-gray-500 ml-2" />
          <span className="text-sm font-medium text-gray-700">رقم الهاتف</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-900 font-medium mr-2">
            {interest.phone}
          </span>
          <button
            className={`p-1 rounded hover:bg-gray-200 transition-colors ${
              copyStatus["phone"] ? "text-green-600" : "text-gray-500"
            }`}
            onClick={() => copyToClipboard(interest.phone, "phone")}
            title="نسخ رقم الهاتف"
          >
            <FiCopy size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <div className="flex items-center">
          <FiHome className="text-gray-500 ml-2" />
          <span className="text-sm font-medium text-gray-700">
            العقار المهتم به
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-900 font-medium mr-2">
            {interest.property?.title || "غير محدد"}
          </span>
          <div className="flex space-x-1 space-x-reverse">
            {interest.property_id && (
              <button
                className="p-1 rounded hover:bg-gray-200 transition-colors text-blue-600"
                onClick={() => openPropertyModal(interest.property_id)}
                title="عرض تفاصيل العقار"
              >
                <FiEye size={16} />
              </button>
            )}
            {interest.property?.title && (
              <button
                className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                  copyStatus["property_title"]
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
                onClick={() =>
                  copyToClipboard(interest.property.title, "property_title")
                }
                title="نسخ اسم العقار"
              >
                <FiCopy size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <span className="text-sm font-medium text-gray-700">الحالة</span>
        {getStatusBadge(interest.status)}
      </div>

      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <div className="flex items-center">
          <FiCalendar className="text-gray-500 ml-2" />
          <span className="text-sm font-medium text-gray-700">
            تاريخ الاهتمام
          </span>
        </div>
        <span className="text-gray-900">{formatDate(interest.created_at)}</span>
      </div>

      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
        <div className="flex items-center">
          <FiCalendar className="text-gray-500 ml-2" />
          <span className="text-sm font-medium text-gray-700">آخر تحديث</span>
        </div>
        <span className="text-gray-900">{formatDate(interest.updated_at)}</span>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <FiMessageSquare className="text-gray-500 ml-2" />
          <span className="text-sm font-medium text-gray-700">
            رسالة المهتم
          </span>
        </div>
        <div className="bg-white rounded-md p-3 border border-gray-200">
          <p className="text-gray-800">
            {interest.message || "لا توجد رسالة"}
          </p>
        </div>
      </div>

      {interest.admin_notes && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <FiEdit className="text-gray-500 ml-2" />
            <span className="text-sm font-medium text-gray-700">
              ملاحظات المسؤول
            </span>
          </div>
          <div className="flex items-center justify-between bg-white rounded-md p-3 border border-gray-200">
            <p className="text-gray-800 flex-1">{interest.admin_notes}</p>
            <button
              className={`p-1 rounded hover:bg-gray-200 transition-colors ml-2 ${
                copyStatus["admin_notes"] ? "text-green-600" : "text-gray-500"
              }`}
              onClick={() =>
                copyToClipboard(interest.admin_notes, "admin_notes")
              }
              title="نسخ ملاحظات المسؤول"
            >
              <FiCopy size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestDetailsContent;