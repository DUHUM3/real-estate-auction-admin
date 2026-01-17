/**
 * Owner details display component
 * Shows owner information with copy buttons
 */

import React from "react";
import { FiCopy } from "react-icons/fi";
import { userTypeMap } from "../constants/landConstants";

const OwnerDetails = ({ owner, copyStatus, onCopy }) => {
  if (!owner) return null;

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-3">المعلومات الشخصية</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              الاسم الكامل
            </label>
            <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
              <span className="text-gray-800">
                {owner.full_name || "غير متوفر"}
              </span>
              {owner.full_name && (
                <button
                  className={`p-1 rounded ${
                    copyStatus["owner_full_name"]
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                  onClick={() => onCopy(owner.full_name, "owner_full_name")}
                  title="نسخ الاسم الكامل"
                >
                  <FiCopy className="text-sm" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              البريد الإلكتروني
            </label>
            <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
              <span className="text-gray-800">{owner.email || "غير متوفر"}</span>
              {owner.email && (
                <button
                  className={`p-1 rounded ${
                    copyStatus["owner_email"]
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                  onClick={() => onCopy(owner.email, "owner_email")}
                  title="نسخ البريد الإلكتروني"
                >
                  <FiCopy className="text-sm" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              رقم الهاتف
            </label>
            <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
              <span className="text-gray-800">{owner.phone || "غير متوفر"}</span>
              {owner.phone && (
                <button
                  className={`p-1 rounded ${
                    copyStatus["owner_phone"]
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                  onClick={() => onCopy(owner.phone, "owner_phone")}
                  title="نسخ رقم الهاتف"
                >
                  <FiCopy className="text-sm" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-600">
              نوع المستخدم
            </label>
            <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
              <span className="text-gray-800">
                {owner.user_type_id ? userTypeMap[owner.user_type_id] : "غير متوفر"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDetails;