// components/OffersModal.jsx
import React from "react";
import { FiGitPullRequest, FiUser, FiMessageSquare, FiMail, FiPhone, FiUsers } from "react-icons/fi";

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

const OffersModal = ({ offersModal, onClose }) => {
  if (!offersModal.show) return null;

  const renderOffers = (offers) => {
    if (!offers || offers.length === 0) {
      return (
        <div className="text-center py-12">
          <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">لا توجد عروض لهذا الطلب</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {offers.map((offer, index) => (
          <div
            key={offer.offer_id || index}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">
                  {offer.offer_user?.name || "مستخدم غير معروف"}
                </span>
              </div>
              <span className="text-xs text-gray-500">{formatDate(offer.created_at)}</span>
            </div>
            <div className="flex items-start gap-2 mb-3">
              <FiMessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
              <p className="text-sm text-gray-700 flex-1">{offer.message}</p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <FiMail className="w-3 h-3" />
                {offer.offer_user?.email || "غير متوفر"}
              </span>
              <span className="flex items-center gap-1">
                <FiPhone className="w-3 h-3" />
                {offer.offer_user?.phone || "غير متوفر"}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <FiGitPullRequest className="w-5 h-5 text-gray-500" />
            العروض المقدمة للطلب
          </h3>
          <button className="text-gray-400 hover:text-gray-500 transition-colors" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {renderOffers(offersModal.offers)}
        </div>

        <div className="flex items-center justify-end p-4 border-t border-gray-200">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={onClose}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default OffersModal;