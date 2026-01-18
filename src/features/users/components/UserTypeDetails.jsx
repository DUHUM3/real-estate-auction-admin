// components/UserTypeDetails.jsx
// مسؤول عن: عرض التفاصيل الخاصة بكل نوع مستخدم

import React, { useState } from 'react';
import { FiUser, FiFileText, FiHash, FiCopy } from 'react-icons/fi';
import { STORAGE_BASE_URL } from '../constants/usersConstants';

const UserTypeDetails = ({ user }) => {
  const [copyStatus, setCopyStatus] = useState({});
  const userType = user.user_type_id;

  const copyToClipboard = async (text, fieldName) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text.toString());
      setCopyStatus((prev) => ({ ...prev, [fieldName]: true }));
      setTimeout(() => {
        setCopyStatus((prev) => ({ ...prev, [fieldName]: false }));
      }, 2000);
    } catch (err) {
      console.error('فشل في نسخ النص: ', err);
    }
  };

  const renderFileLink = (file) => {
    if (!file) {
      return <span className="text-gray-800 font-medium">غير محدد</span>;
    }

    const fileUrl = file.startsWith('http')
      ? file
      : `${STORAGE_BASE_URL}/${file}`;

    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-blue-600 hover:underline"
      >
        <FiFileText />
        عرض الملف
      </a>
    );
  };

  const InfoCard = ({ label, value, fieldKey, icon }) => (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {icon}
          <span>{label}</span>
        </div>
        <div className="text-sm font-medium text-gray-800">
          {value || 'غير محدد'}
        </div>
      </div>

      {value && (
        <button
          onClick={() => copyToClipboard(value, fieldKey)}
          title={`نسخ ${label}`}
          className={`p-1.5 rounded-md transition ${
            copyStatus[fieldKey]
              ? 'bg-green-100 text-green-600'
              : 'text-gray-400 hover:bg-gray-100'
          }`}
        >
          <FiCopy size={14} />
        </button>
      )}
    </div>
  );

  const SectionWrapper = ({ title, icon, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
        {icon}
        <h4 className="text-base font-semibold text-gray-800">{title}</h4>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );

  // مالك أرض
  if (userType === 2 && user.land_owner) {
    const owner = user.land_owner;
    return (
      <SectionWrapper
        title="تفاصيل مالك الأرض"
        icon={<FiUser className="text-red-500" />}
      >
        <InfoCard
          label="رقم الهوية"
          value={owner.national_id}
          fieldKey="owner_national_id"
          icon={<FiFileText />}
        />
      </SectionWrapper>
    );
  }

  // وسيط عقاري
  if (userType === 5 && user.real_estate_broker) {
    const broker = user.real_estate_broker;
    return (
      <SectionWrapper
        title="تفاصيل الوسيط العقاري"
        icon={<FiUser className="text-purple-500" />}
      >
        <InfoCard
          label="رقم الهوية"
          value={broker.national_id}
          fieldKey="broker_national_id"
          icon={<FiFileText />}
        />
        <InfoCard
          label="رقم الرخصة"
          value={broker.license_number}
          fieldKey="broker_license"
          icon={<FiHash />}
        />

        <div className="md:col-span-2 space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FiFileText />
            <span>ملف الرخصة</span>
          </div>
          {renderFileLink(broker.license_file)}
        </div>
      </SectionWrapper>
    );
  }

  // شركة مزادات
  if (userType === 6 && user.auction_company) {
    const auction = user.auction_company;
    return (
      <SectionWrapper
        title="تفاصيل شركة المزادات"
        icon={<FiUser className="text-indigo-500" />}
      >
        <InfoCard
          label="السجل التجاري"
          value={auction.commercial_register}
          fieldKey="auction_commercial"
          icon={<FiFileText />}
        />
        <InfoCard
          label="اسم شركة المزاد"
          value={auction.auction_name}
          fieldKey="auction_name"
          icon={<FiFileText />}
        />
        <InfoCard
          label="رقم الهوية"
          value={auction.national_id}
          fieldKey="auction_national_id"
          icon={<FiFileText />}
        />
        <InfoCard
          label="رقم الرخصة"
          value={auction.license_number}
          fieldKey="auction_license_number"
          icon={<FiFileText />}
        />

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FiFileText />
            <span>ملف السجل التجاري</span>
          </div>
          {renderFileLink(auction.commercial_file)}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FiFileText />
            <span>ملف الرخصة</span>
          </div>
          {renderFileLink(auction.license_file)}
        </div>
      </SectionWrapper>
    );
  }

  // جهة تجارية
  if (userType === 4 && user.business_entity) {
    const entity = user.business_entity;
    return (
      <SectionWrapper
        title="تفاصيل الجهة التجارية"
        icon={<FiUser className="text-amber-500" />}
      >
        <InfoCard
          label="السجل التجاري"
          value={entity.commercial_register}
          fieldKey="business_commercial"
          icon={<FiHash />}
        />
        <InfoCard
          label="اسم المنشأة"
          value={entity.business_name}
          fieldKey="business_name"
          icon={<FiFileText />}
        />
        <InfoCard
          label="رقم الهوية الوطنية"
          value={entity.national_id}
          fieldKey="business_national_id"
          icon={<FiFileText />}
        />

        <div className="md:col-span-2 space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FiFileText />
            <span>ملف السجل التجاري</span>
          </div>
          {renderFileLink(entity.commercial_file)}
        </div>
      </SectionWrapper>
    );
  }

  // وكيل شرعي
  if (userType === 3 && user.legal_agent) {
    const agent = user.legal_agent;
    return (
      <SectionWrapper
        title="تفاصيل الوكيل الشرعي"
        icon={<FiUser className="text-emerald-500" />}
      >
        <InfoCard
          label="رقم الوكالة"
          value={agent.agency_number}
          fieldKey="agent_agency"
          icon={<FiHash />}
        />
        <InfoCard
          label="رقم الهوية"
          value={agent.national_id}
          fieldKey="agent_national_id"
          icon={<FiFileText />}
        />
      </SectionWrapper>
    );
  }

  return null;
};

export default UserTypeDetails;
