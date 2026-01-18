/**
 * Land details panel component
 * Shows selected land details with action buttons
 */

import React from "react";
import { FiMap } from "react-icons/fi";
import LandImages from "./LandImages";
import LandDetailsInfo from "./LandDetailsInfo";
import ActionButtons from "./ActionButtons";

const LandDetails = ({
  land,
  loading,
  copyStatus,
  onCopy,
  onShowOwner,
  onApprove,
  onReject,
  onMarkAsSold,
  onReturnToPending,
}) => {
  if (!land) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FiMap className="text-gray-400 text-4xl mb-4" />
          <p className="text-gray-500">اختر أرضًا لعرض التفاصيل</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-gray-800">تفاصيل الأرض</h3>
          <span className="text-sm text-gray-500">ID: {land.id}</span>
        </div>
      </div>

      <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <LandImages land={land} />
        <LandDetailsInfo
          land={land}
          copyStatus={copyStatus}
          onCopy={onCopy}
          onShowOwner={onShowOwner}
        />
      </div>

      <div className="p-4 border-t border-gray-200">
        <ActionButtons
          land={land}
          loading={loading}
          onApprove={onApprove}
          onReject={onReject}
          onMarkAsSold={onMarkAsSold}
          onReturnToPending={onReturnToPending}
        />
      </div>
    </div>
  );
};

export default LandDetails;
