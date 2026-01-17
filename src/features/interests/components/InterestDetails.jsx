// Interest details sidebar with action buttons
import React from "react";
import {
  FiHeart,
  FiCheck,
  FiPhone,
  FiFileText,
  FiX,
} from "react-icons/fi";
import InterestDetailsContent from "./InterestDetailsContent";

const InterestDetails = ({
  selectedInterest,
  openStatusModal,
  loading,
  openPropertyModal,
  copyToClipboard,
  copyStatus,
}) => {
  return (
    <div className="xl:col-span-1">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
        {selectedInterest ? (
          <div>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  تفاصيل طلب الاهتمام
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  ID: {selectedInterest.id}
                </span>
              </div>
            </div>

            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <InterestDetailsContent
                interest={selectedInterest}
                openPropertyModal={openPropertyModal}
                copyToClipboard={copyToClipboard}
                copyStatus={copyStatus}
              />
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="grid grid-cols-2 gap-3">
                <button
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() =>
                    openStatusModal(selectedInterest.id, "تمت المراجعة")
                  }
                  disabled={
                    selectedInterest.status === "تمت المراجعة" || loading
                  }
                >
                  <FiCheck className="ml-1" size={16} />
                  تمت المراجعة
                </button>

                <button
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() =>
                    openStatusModal(selectedInterest.id, "تم التواصل")
                  }
                  disabled={
                    selectedInterest.status === "تم التواصل" || loading
                  }
                >
                  <FiPhone className="ml-1" size={16} />
                  تم التواصل
                </button>

                <button
                  className="flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() =>
                    openStatusModal(selectedInterest.id, "قيد المراجعة")
                  }
                  disabled={
                    selectedInterest.status === "قيد المراجعة" || loading
                  }
                >
                  <FiFileText className="ml-1" size={16} />
                  قيد المراجعة
                </button>

                <button
                  className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => openStatusModal(selectedInterest.id, "ملغي")}
                  disabled={selectedInterest.status === "ملغي" || loading}
                >
                  <FiX className="ml-1" size={16} />
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FiHeart className="text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">
              اختر طلب اهتمام لعرض التفاصيل
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestDetails;