// components/ImageViewerModal.jsx
// Full-screen image gallery modal with navigation
// Supports multiple images with prev/next controls

import React from "react";
import { X, ChevronRight, ChevronLeft, Image } from "lucide-react";
import { getImageUrl } from "../../../services/marketingRequestsApi";

const ImageViewerModal = ({ imageModal, onClose, onNext, onPrev }) => {
  if (!imageModal.show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white text-lg font-medium">
            الصورة {imageModal.currentIndex + 1} من {imageModal.images.length}
          </div>
          <button
            className="text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative bg-white rounded-lg overflow-hidden">
          <img
            src={getImageUrl(imageModal.images[imageModal.currentIndex])}
            alt={`صورة ${imageModal.currentIndex + 1}`}
            className="w-full h-auto max-h-[80vh] object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div className="hidden w-full h-96 flex-col items-center justify-center bg-gray-200 text-gray-500">
            <Image className="w-16 h-16 mb-2" />
            <span>تعذر تحميل الصورة</span>
          </div>

          {imageModal.images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                onClick={onPrev}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                onClick={onNext}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {imageModal.images.length > 1 && (
          <div className="flex justify-center space-x-2 space-x-reverse mt-4">
            {imageModal.images.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === imageModal.currentIndex
                    ? "bg-white w-8"
                    : "bg-gray-500 hover:bg-gray-400"
                }`}
                onClick={() =>
                  imageModal.currentIndex !== index &&
                  (index > imageModal.currentIndex ? onNext() : onPrev())
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewerModal;