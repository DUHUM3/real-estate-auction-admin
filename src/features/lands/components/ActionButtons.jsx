/**
 * Action buttons component for land status updates
 * Shows different buttons based on land status
 */

import React from "react";
import { FiCheck, FiX, FiRefreshCw, FiShoppingCart } from "react-icons/fi";

const ActionButtons = ({
  land,
  loading,
  onApprove,
  onReject,
  onMarkAsSold,
  onReturnToPending,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {land.status === "قيد المراجعة" && (
        <>
          <button
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onApprove(land.id)}
            disabled={loading}
          >
            <FiCheck />
            {loading ? "جاري المعالجة..." : "قبول (مفتوح)"}
          </button>

          <button
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onReject(land.id)}
            disabled={loading}
          >
            <FiX />
            {loading ? "جاري المعالجة..." : "رفض"}
          </button>
        </>
      )}

      {land.status === "مرفوض" && (
        <>
          <button
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onApprove(land.id)}
            disabled={loading}
          >
            <FiCheck />
            {loading ? "جاري المعالجة..." : "قبول (مفتوح)"}
          </button>

          <button
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onReturnToPending(land.id)}
            disabled={loading}
          >
            <FiRefreshCw />
            {loading ? "جاري المعالجة..." : "إعادة للمراجعة"}
          </button>
        </>
      )}

      {land.status === "مفتوح" && (
        <>
          <button
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onReject(land.id)}
            disabled={loading}
          >
            <FiX />
            {loading ? "جاري المعالجة..." : "رفض"}
          </button>

          <button
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onMarkAsSold(land.id)}
            disabled={loading}
          >
            <FiShoppingCart />
            {loading ? "جاري المعالجة..." : "تحديد كمباعة"}
          </button>

          <button
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onReturnToPending(land.id)}
            disabled={loading}
          >
            <FiRefreshCw />
            {loading ? "جاري المعالجة..." : "إعادة للمراجعة"}
          </button>
        </>
      )}

      {land.status === "تم البيع" && (
        <>
          <button
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onApprove(land.id)}
            disabled={loading}
          >
            <FiCheck />
            {loading ? "جاري المعالجة..." : "إعادة فتح"}
          </button>

          <button
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onReturnToPending(land.id)}
            disabled={loading}
          >
            <FiRefreshCw />
            {loading ? "جاري المعالجة..." : "إعادة للمراجعة"}
          </button>
        </>
      )}
    </div>
  );
};

export default ActionButtons;