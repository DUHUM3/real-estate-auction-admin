import { useState, useEffect } from "react";

const useAuctionSelection = () => {
  const [selectedAuction, setSelectedAuction] = useState(() => {
    const savedSelectedAuction = localStorage.getItem("selectedAuction");
    return savedSelectedAuction ? JSON.parse(savedSelectedAuction) : null;
  });

  // Persist selected auction to localStorage
  useEffect(() => {
    if (selectedAuction) {
      localStorage.setItem("selectedAuction", JSON.stringify(selectedAuction));
    } else {
      localStorage.removeItem("selectedAuction");
    }
  }, [selectedAuction]);

  return {
    selectedAuction,
    setSelectedAuction,
  };
};

export default useAuctionSelection;