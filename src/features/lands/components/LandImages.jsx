/**
 * Land images display component
 * Shows cover image and additional images with horizontal scroll
 */

import React from "react";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { getImageUrl, openImageInNewWindow } from "../../../services/landsAPI";

const LandImages = ({ land }) => {
  if (!land.cover_image && (!land.images || land.images.length === 0)) {
    return null;
  }

  return (
    <div className="space-y-4">
      {land.cover_image && (
        <div className="relative rounded-lg overflow-hidden">
          <img
            src={getImageUrl(land.cover_image)}
            alt={land.title}
            className="w-full h-56 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => openImageInNewWindow(land.cover_image)}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/600x300?text=صورة+رئيسية";
            }}
          />
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            الصورة الرئيسية
          </div>
        </div>
      )}

      {land.images && land.images.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-2">
            الصور الإضافية ({land.images.length})
          </h4>

          <div className="relative">
            {land.images.length > 4 && (
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 shadow-md"
                onClick={() =>
                  document
                    .getElementById("images-scroll")
                    .scrollBy({ left: -150, behavior: "smooth" })
                }
              >
                <FiChevronRight className="text-gray-700 text-lg" />
              </button>
            )}

            <div
              id="images-scroll"
              className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {land.images.map((img, index) => (
                <div key={img.id} className="flex-shrink-0 w-32">
                  <div className="relative">
                    <img
                      src={getImageUrl(img.image_path)}
                      alt={`صورة ${index + 1} - ${land.title}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openImageInNewWindow(img.image_path)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/128x96?text=صورة+إضافية";
                      }}
                    />
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {land.images.length > 4 && (
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-1 shadow-md"
                onClick={() =>
                  document
                    .getElementById("images-scroll")
                    .scrollBy({ left: 150, behavior: "smooth" })
                }
              >
                <FiChevronLeft className="text-gray-700 text-lg" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandImages;