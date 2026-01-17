// Hook for managing property details modal and fetching property data
import { useState } from "react";
import { useInterestsAPI } from "../../../services/interestsAPI";

export const usePropertyDetails = () => {
  const { fetchPropertyDetails } = useInterestsAPI();

  const [propertyModal, setPropertyModal] = useState({
    show: false,
    property: null,
    loading: false,
  });

  const openPropertyModal = async (propertyId) => {
    if (!propertyId) {
      alert("لا يوجد معرف للعقار");
      return;
    }

    setPropertyModal({
      show: true,
      property: null,
      loading: true,
    });

    try {
      const propertyDetails = await fetchPropertyDetails(propertyId);
      setPropertyModal({
        show: true,
        property: propertyDetails,
        loading: false,
      });
    } catch (error) {
      console.error("خطأ في جلب تفاصيل العقار:", error);
      alert("حدث خطأ أثناء جلب تفاصيل العقار: " + error.message);
      setPropertyModal({
        show: false,
        property: null,
        loading: false,
      });
    }
  };

  const closePropertyModal = () => {
    setPropertyModal({
      show: false,
      property: null,
      loading: false,
    });
  };

  return {
    propertyModal,
    openPropertyModal,
    closePropertyModal,
  };
};