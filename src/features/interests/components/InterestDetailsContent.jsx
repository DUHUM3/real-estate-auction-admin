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

const InfoCard = ({ label, value, copyKey, copyToClipboard, copyStatus, icon, children }) => {
  if (!value && !children) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-800 font-medium truncate">{value}</span>
        {copyKey && value && (
          <button
            onClick={() => copyToClipboard(value, copyKey)}
            title={`نسخ ${label}`}
            className={`p-1 rounded transition ${
              copyStatus[copyKey] ? "bg-green-100 text-green-600" : "text-gray-400 hover:bg-gray-100"
            }`}
          >
            <FiCopy size={16} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
      {icon}
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
    </div>
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const InterestDetailsContent = ({ interest, openPropertyModal, copyToClipboard, copyStatus }) => {
  const { formatDate, getStatusBadge } = useInterestsAPI();

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <Section title="معلومات المهتم" icon={<FiUser className="text-gray-500" />}>
        <InfoCard label="اسم المهتم" value={interest.full_name} icon={<FiUser className="text-gray-400" />} />
        <InfoCard
          label="البريد الإلكتروني"
          value={interest.email}
          copyKey="email"
          copyToClipboard={copyToClipboard}
          copyStatus={copyStatus}
          icon={<FiMail className="text-gray-400" />}
        />
        <InfoCard
          label="رقم الهاتف"
          value={interest.phone}
          copyKey="phone"
          copyToClipboard={copyToClipboard}
          copyStatus={copyStatus}
          icon={<FiPhone className="text-gray-400" />}
        />
        <InfoCard
          label="العقار المهتم به"
          value={interest.property?.title || "غير محدد"}
          copyKey="property_title"
          copyToClipboard={copyToClipboard}
          copyStatus={copyStatus}
          icon={<FiHome className="text-gray-400" />}
        >
          {interest.property_id && (
            <button
              className="p-1 rounded hover:bg-gray-100 text-blue-600 ml-2"
              onClick={() => openPropertyModal(interest.property_id)}
              title="عرض تفاصيل العقار"
            >
              <FiEye size={16} />
            </button>
          )}
        </InfoCard>
        <InfoCard label="الحالة" value={null} icon={null}>
          {getStatusBadge(interest.status)}
        </InfoCard>
        <InfoCard
          label="تاريخ الاهتمام"
          value={formatDate(interest.created_at)}
          icon={<FiCalendar className="text-gray-400" />}
        />
      </Section>

      {/* Message */}
      <Section title="رسالة المهتم" icon={<FiMessageSquare className="text-gray-500" />}>
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <p className="text-gray-800">{interest.message || "لا توجد رسالة"}</p>
        </div>
      </Section>

      {/* Admin Notes */}
      {interest.admin_notes && (
        <Section title="ملاحظات المسؤول" icon={<FiEdit className="text-gray-500" />}>
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-md p-4">
            <p className="text-gray-800 flex-1">{interest.admin_notes}</p>
            <button
              className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                copyStatus["admin_notes"] ? "text-green-600" : "text-gray-400"
              }`}
              onClick={() => copyToClipboard(interest.admin_notes, "admin_notes")}
              title="نسخ ملاحظات المسؤول"
            >
              <FiCopy size={16} />
            </button>
          </div>
        </Section>
      )}
    </div>
  );
};

export default InterestDetailsContent;
