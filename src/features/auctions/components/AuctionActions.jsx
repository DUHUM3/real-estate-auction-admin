import React from "react";
import { FiCheck, FiX } from "react-icons/fi";

const AuctionActions = ({ auction, loading, onApprove, onReject }) => {
  const status = auction.status;

  return (
    <div className="p-6 border-t border-gray-200 bg-gray-50">
      <div className="flex flex-wrap gap-3">
        {status === "قيد المراجعة" && (
          <>
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50"
              onClick={() => onApprove(auction.id)}
              disabled={loading}
            >
              <FiCheck size={18} />
              {loading ? "جاري المعالجة..." : "قبول المزاد"}
            </button>

            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50"
              onClick={() => onReject(auction.id)}
              disabled={loading}
            >
              <FiX size={18} />
              {loading ? "جاري المعالجة..." : "رفض المزاد"}
            </button>
          </>
        )}

        {status === "مرفوض" && (
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50"
            onClick={() => onApprove(auction.id)}
            disabled={loading}
          >
            <FiCheck size={18} />
            {loading ? "جاري المعالجة..." : "قبول المزاد"}
          </button>
        )}

        {status === "مفتوح" && (
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50"
            onClick={() => onReject(auction.id)}
            disabled={loading}
          >
            <FiX size={18} />
            {loading ? "جاري المعالجة..." : "رفض المزاد"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuctionActions;