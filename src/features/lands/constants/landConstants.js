/**
 * Constants and helper functions for lands feature
 * Includes status badges, land type badges, user type mapping, and utility functions
 */

import { FiCheck, FiX, FiClock, FiShoppingCart } from "react-icons/fi";

// User type mapping
export const userTypeMap = {
  1: "مستخدم عادي",
  2: "مسوق عقاري",
  3: "مستثمر",
};

// Status badge component
export const getStatusBadge = (status) => {
  const badges = {
    "مفتوح": { bg: "bg-green-100", text: "text-green-800", icon: FiCheck },
    "مرفوض": { bg: "bg-red-100", text: "text-red-800", icon: FiX },
    "تم البيع": { bg: "bg-purple-100", text: "text-purple-800", icon: FiShoppingCart },
    "قيد المراجعة": { bg: "bg-yellow-100", text: "text-yellow-800", icon: FiClock },
  };

  const badge = badges[status] || badges["قيد المراجعة"];
  const Icon = badge.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
      <Icon className="text-xs" />
      {status}
    </span>
  );
};

// Status text
export const getStatusText = (status) => status;

// Land type badge
export const getLandTypeBadge = (landType) => {
  const badges = {
    "سكني": { bg: "bg-blue-100", text: "text-blue-800" },
    "تجاري": { bg: "bg-green-100", text: "text-green-800" },
    "زراعي": { bg: "bg-yellow-100", text: "text-yellow-800" },
    "صناعي": { bg: "bg-gray-100", text: "text-gray-800" },
  };

  const badge = badges[landType] || { bg: "bg-gray-100", text: "text-gray-800" };

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
      {landType}
    </span>
  );
};

// Purpose badge
export const getPurposeBadge = (purpose) => {
  const badges = {
    "بيع": { bg: "bg-indigo-100", text: "text-indigo-800" },
    "إيجار": { bg: "bg-orange-100", text: "text-orange-800" },
  };

  const badge = badges[purpose] || { bg: "bg-gray-100", text: "text-gray-800" };

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
      {purpose}
    </span>
  );
};

// Date formatter
export const formatDate = (dateString) => {
  if (!dateString) return "غير متوفر";
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
// Copy text to clipboard
export const copyText = (text, setCopyStatus, fieldName) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      setCopyStatus((prev) => ({ ...prev, [fieldName]: true }));
      setTimeout(() => {
        setCopyStatus((prev) => ({ ...prev, [fieldName]: false }));
      }, 2000);
    })
    .catch((err) => {
      console.error("فشل النسخ:", err);
      alert("فشل نسخ النص");
    });
};