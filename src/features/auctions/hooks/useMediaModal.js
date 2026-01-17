import { useState } from "react";

const useMediaModal = () => {
  const [mediaModal, setMediaModal] = useState({
    show: false,
    type: null,
    items: [],
    currentIndex: 0,
  });

  const openMediaModal = (type, items, startIndex = 0) => {
    setMediaModal({
      show: true,
      type,
      items,
      currentIndex: startIndex,
    });
  };

  const closeMediaModal = () => {
    setMediaModal({
      show: false,
      type: null,
      items: [],
      currentIndex: 0,
    });
  };

  const updateMediaIndex = (newIndex) => {
    setMediaModal((prev) => ({
      ...prev,
      currentIndex: newIndex,
    }));
  };

  return {
    mediaModal,
    openMediaModal,
    closeMediaModal,
    updateMediaIndex,
  };
};

export default useMediaModal;