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
    if (!file) return <span className="text-gray-800 font-medium">غير محدد</span>;
    
    const fileUrl = file.startsWith('http') ? file : `${STORAGE_BASE_URL}/${file}`;
    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline inline-flex items-center gap-2"
      >
        <FiFileText />
        عرض الملف
      </a>
    );
  };

  const renderFieldWithCopy = (label, value, key, icon) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-800 font-medium">{value || 'غير محدد'}</span>
        {value && (
          <button
            className={`p-1 rounded transition-colors ${
              copyStatus[key]
                ? 'bg-green-100 text-green-600'
                : 'hover:bg-gray-100 text-gray-500'
            }`}
            onClick={() => copyToClipboard(value, key)}
            title={`نسخ ${label}`}
          >
            <FiCopy size={16} />
          </button>
        )}
      </div>
    </div>
  );

  // مالك أرض
  if (userType === 2 && user.land_owner) {
    const owner = user.land_owner;
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <FiUser className="text-red-500" />
          <h4 className="text-lg font-semibold text-gray-800">تفاصيل مالك الأرض</h4>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderFieldWithCopy('رقم الهوية', owner.national_id, 'owner_national_id', <FiFileText className="text-gray-400" />)}
        </div>
      </div>
    );
  }

  // وسيط عقاري
  if (userType === 5 && user.real_estate_broker) {
    const broker = user.real_estate_broker;
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition hover:shadow-md">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <FiUser className="text-purple-500" />
          <h4 className="text-lg font-semibold text-gray-800">تفاصيل الوسيط العقاري</h4>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderFieldWithCopy('رقم الهوية', broker.national_id, 'broker_national_id', <FiFileText className="text-gray-400" />)}
          {renderFieldWithCopy('رقم الرخصة', broker.license_number, 'broker_license', <FiHash className="text-gray-400" />)}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiFileText className="text-gray-400" />
              <span>ملف الرخصة</span>
            </div>
            <div className="flex items-center justify-between">
              {renderFileLink(broker.license_file)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // شركة مزادات
  if (userType === 6 && user.auction_company) {
    const auction = user.auction_company;
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiUser className="text-indigo-500" />
            تفاصيل شركة المزادات
          </h4>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderFieldWithCopy('السجل التجاري', auction.commercial_register, 'auction_commercial', <FiFileText className="text-gray-400" />)}
          {renderFieldWithCopy('اسم شركة المزاد', auction.auction_name, 'auction_name', <FiFileText className="text-gray-400" />)}
          {renderFieldWithCopy('رقم الهوية', auction.national_id, 'auction_national_id', <FiFileText className="text-gray-400" />)}
          {renderFieldWithCopy('رقم الرخصة', auction.license_number, 'auction_license_number', <FiFileText className="text-gray-400" />)}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiFileText className="text-gray-400" />
              <span>ملف السجل التجاري</span>
            </div>
            {renderFileLink(auction.commercial_file)}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiFileText className="text-gray-400" />
              <span>ملف الرخصة</span>
            </div>
            {renderFileLink(auction.license_file)}
          </div>
        </div>
      </div>
    );
  }

  // جهة تجارية
  if (userType === 4 && user.business_entity) {
    const entity = user.business_entity;
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiUser className="text-amber-500" />
            تفاصيل الجهة التجارية
          </h4>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderFieldWithCopy('السجل التجاري', entity.commercial_register, 'business_commercial', <FiHash className="text-gray-400" />)}
          {renderFieldWithCopy('اسم المنشأة', entity.business_name, 'business_name', <FiFileText className="text-gray-400" />)}
          {renderFieldWithCopy('رقم الهوية الوطنية', entity.national_id, 'business_national_id', <FiFileText className="text-gray-400" />)}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiFileText className="text-gray-400" />
              <span>ملف السجل التجاري</span>
            </div>
            {renderFileLink(entity.commercial_file)}
          </div>
        </div>
      </div>
    );
  }

  // وكيل شرعي
  if (userType === 3 && user.legal_agent) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FiUser className="text-emerald-500" />
            تفاصيل الوكيل الشرعي
          </h4>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderFieldWithCopy('رقم الوكالة', user.legal_agent.agency_number, 'agent_agency', <FiHash className="text-gray-400" />)}
          {renderFieldWithCopy('رقم الهوية', user.legal_agent.national_id, 'agent_national_id', <FiFileText className="text-gray-400" />)}
        </div>
      </div>
    );
  }

  return null;
};

export default UserTypeDetails;