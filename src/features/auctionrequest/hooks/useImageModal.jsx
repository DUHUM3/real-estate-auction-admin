// hooks/useImageModal.jsx
// Custom hook for managing image modal state
// Handles image navigation and modal open/close

import { useState } from "react";

export const useImageModal = () => {
  const [imageModal, setImageModal] = useState({
    show: false,
    images: [],
    currentIndex: 0,
  });

  const openImageModal = (images, index = 0) => {
    setImageModal({
      show: true,
      images: images,
      currentIndex: index,
    });
  };

  const closeImageModal = () => {
    setImageModal({
      show: false,
      images: [],
      currentIndex: 0,
    });
  };

  const nextImage = () => {
    setImageModal((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length,
    }));
  };

  const prevImage = () => {
    setImageModal((prev) => ({
      ...prev,
      currentIndex:
        prev.currentIndex === 0
          ? prev.images.length - 1
          : prev.currentIndex - 1,
    }));
  };

  return {
    imageModal,
    openImageModal,
    closeImageModal,
    nextImage,
    prevImage,
  };
};