import React from "react";
import { FiChevronRight, FiChevronLeft, FiVideo } from "react-icons/fi";

const MediaModal = ({ isOpen, type, items, currentIndex, onClose, onIndexChange }) => {
  if (!isOpen) return null;

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    onIndexChange(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    onIndexChange(newIndex);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-5xl h-full max-h-screen flex flex-col">
        <div className="flex items-center justify-between p-6 bg-black bg-opacity-50 rounded-t-xl">
          <h3 className="text-white text-lg font-bold">
            {type === "image" ? "الصور" : "الفيديوهات"} ({currentIndex + 1} / {items.length})
          </h3>
          <button className="text-white hover:text-gray-300 text-3xl transition-colors" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          {items.length > 1 && (
            <>
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full z-10 transition-all shadow-lg"
                onClick={handlePrevious}
              >
                <FiChevronRight size={24} />
              </button>
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full z-10 transition-all shadow-lg"
                onClick={handleNext}
              >
                <FiChevronLeft size={24} />
              </button>
            </>
          )}

          <div className="w-full h-full flex items-center justify-center p-8">
            {type === "image" ? (
              <img
                src={items[currentIndex]?.url}
                alt={`صورة ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/800x600?text=صورة+غير+متوفرة";
                }}
              />
            ) : (
              <video
                src={items[currentIndex]?.url}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-xl shadow-2xl"
                onError={(e) => console.error("Video load error:", e)}
              >
                متصفحك لا يدعم تشغيل الفيديو
              </video>
            )}
          </div>
        </div>

        {items.length > 1 && (
          <div className="p-4 bg-black bg-opacity-50 overflow-x-auto rounded-b-xl">
            <div className="flex gap-2 justify-center">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex-shrink-0 w-20 h-20 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex ? "border-blue-500 shadow-lg scale-110" : "border-transparent hover:border-gray-400"
                  }`}
                  onClick={() => onIndexChange(index)}
                >
                  {type === "image" ? (
                    <img src={item.url} alt={`صورة مصغرة ${index + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <FiVideo className="text-white" size={24} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaModal;