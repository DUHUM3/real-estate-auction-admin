// Main page component - orchestrates all interests functionality
import React, { useState, useEffect } from "react";
import { useInterestsFilters } from "../../features/interests/hooks/useInterestsFilters";
import { useInterestsData } from "../../features/interests/hooks/useInterestsData";
import { usePropertyDetails } from "../../features/interests/hooks/usePropertyDetails";
import { useStatusUpdate } from "../../features/interests/hooks/useStatusUpdate";
import { useCopyToClipboard } from "../../features/interests/hooks/useCopyToClipboard";
import { STORAGE_KEYS } from "../../features/interests/constants/interestsConstants";

import InterestsFilters from "../../features/interests/components/InterestsFilters";
import InterestsList from "../../features/interests/components/InterestsList";
import InterestDetails from "../../features/interests/components/InterestDetails";
import StatusChangeModal from "../../features/interests/components/StatusChangeModal";
import PropertyDetailsModal from "../../features/interests/components/PropertyDetailsModal";

const AllInterests = () => {
  // Custom hooks for state management
  const {
    filters,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearFilters,
    hasActiveFilters,
  } = useInterestsFilters();

  const {
    interests,
    pagination,
    interestsData,
    isLoading,
    refetch,
    isRefreshing,
    handleRefresh,
  } = useInterestsData(filters, currentPage);

  const { propertyModal, openPropertyModal, closePropertyModal } =
    usePropertyDetails();

  const [selectedInterest, setSelectedInterest] = useState(null);

  const {
    statusModal,
    setStatusModal,
    openStatusModal,
    closeStatusModal,
    handleStatusUpdate,
    isUpdating,
  } = useStatusUpdate(refetch, setSelectedInterest);

  const { copyStatus, copyToClipboard } = useCopyToClipboard();

  // Restore selected interest from localStorage on mount
  useEffect(() => {
    const savedSelectedInterest = localStorage.getItem(
      STORAGE_KEYS.SELECTED_INTEREST
    );
    if (savedSelectedInterest) {
      setSelectedInterest(JSON.parse(savedSelectedInterest));
    }
  }, []);

  // Save selected interest to localStorage when it changes
  useEffect(() => {
    if (selectedInterest) {
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_INTEREST,
        JSON.stringify(selectedInterest)
      );
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_INTEREST);
    }
  }, [selectedInterest]);

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const loading = isLoading || isRefreshing || isUpdating;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Filters Section */}
      <InterestsFilters
        filters={filters}
        handleFilterChange={handleFilterChange}
        handleSearch={handleSearch}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        handleRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        loading={loading}
        filtersData={interestsData?.filtersData}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Interests List */}
        <InterestsList
          interests={interests}
          pagination={pagination}
          selectedInterest={selectedInterest}
          setSelectedInterest={setSelectedInterest}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          loading={loading}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />

        {/* Interest Details */}
        <InterestDetails
          selectedInterest={selectedInterest}
          openStatusModal={openStatusModal}
          loading={loading}
          openPropertyModal={openPropertyModal}
          copyToClipboard={copyToClipboard}
          copyStatus={copyStatus}
        />
      </div>

      {/* Modals */}
      <StatusChangeModal
        statusModal={statusModal}
        setStatusModal={setStatusModal}
        closeStatusModal={closeStatusModal}
        handleStatusUpdate={handleStatusUpdate}
        loading={loading}
      />

      <PropertyDetailsModal
        propertyModal={propertyModal}
        closePropertyModal={closePropertyModal}
        copyToClipboard={copyToClipboard}
        copyStatus={copyStatus}
      />
    </div>
  );
};

export default AllInterests;