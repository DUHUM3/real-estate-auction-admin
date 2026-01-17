/**
 * Single land card component
 * Displays land summary in the list
 */

import React from "react";
import { FiMap, FiCalendar } from "react-icons/fi";
import {
  getLandTypeBadge,
  getPurposeBadge,
  formatDate,
  getStatusText,
} from "../constants/landConstants";
import { getImageUrl, openImageInNewWindow } from "../../../services/landsAPI"; // أو المسار الحقيقي لملف API

const LandCard = ({ land, isSelected, onClick }) => {
  return (
    <div
      className={`p-4 cursor-pointer transition-colors ${
        isSelected
          ? "bg-blue-50 border-r-4 border-blue-500"
          : "hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {land.cover_image ? (
            <img
              src={getImageUrl(land.cover_image)}
              alt={land.title}
              className="w-full h-full object-cover cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                openImageInNewWindow(land.cover_image);
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/48?text=صورة";
              }}
            />
          ) : (
            <FiMap className="text-blue-600 text-xl" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{land.title}</h4>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">
              {land.region} - {land.city}
            </span>
            <span className="flex items-center text-sm text-gray-500">
              <FiCalendar className="ml-1 text-xs" />
              {formatDate(land.created_at)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {getLandTypeBadge(land.land_type)}
            {getPurposeBadge(land.purpose)}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              land.status === "مفتوح"
                ? "bg-green-100 text-green-800"
                : land.status === "مرفوض"
                ? "bg-red-100 text-red-800"
                : land.status === "تم البيع"
                ? "bg-purple-100 text-purple-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {getStatusText(land.status)}
          </div>
          <div className="mt-2 text-sm font-medium text-gray-700">
            {land.total_area} م²
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandCard;
