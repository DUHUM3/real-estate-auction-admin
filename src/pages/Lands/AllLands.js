/**
 * Main AllLands page component
 * Orchestrates all lands feature functionality
 */

import React, { useState, useEffect } from "react";
import LandsFilters from "../../pages/Lands/LandsFilters";
import LandsList from "../../features/lands/components/LandsList";
import LandDetails from "../../features/lands/components/LandDetails";
import RejectModal from "../../features/lands/components/RejectModal";
import OwnerModal from "../../features/lands/components/OwnerModal";
import { useLandFilters } from "../../features/lands/hooks/useLandFilters";
import { useLandsData } from "../../features/lands/hooks/useLandsData";
import { useLandStatusUpdate } from "../../features/lands/hooks/useLandStatusUpdate";
import { useCopyToClipboard } from "../../features/lands/hooks/useCopyToClipboard";

const AllLands = () => {
  // Filter state management
  const {
    filters,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearFilters,
    hasActiveFilters,
  } = useLandFilters();

  // Selected land state
  const [selectedLand, setSelectedLand] = useState(null);

  // Fetch lands data
  const { landsData, isLoading, refetch, isRefreshing, handleRefresh } =
    useLandsData(filters, currentPage);

  // Status update mutations
  const {
    updateLandStatusMutation,
    handleApprove,
    handleReject: handleRejectStatus,
    handleMarkAsSold,
    handleReturnToPending,
  } = useLandStatusUpdate(filters, currentPage, setSelectedLand);

  // Copy to clipboard
  const { copyStatus, copyToClipboard } = useCopyToClipboard();

  // Modal states
  const [rejectModal, setRejectModal] = useState({
    show: false,
    landId: null,
    reason: "",
  });

  const [ownerModal, setOwnerModal] = useState({
    show: false,
    owner: null,
  });

  // Restore selected land from localStorage
  useEffect(() => {
    const savedSelectedLand = localStorage.getItem("selectedLand");
    if (savedSelectedLand) {
      setSelectedLand(JSON.parse(savedSelectedLand));
    }
  }, []);

  // Save selected land to localStorage
  useEffect(() => {
    if (selectedLand) {
      localStorage.setItem("selectedLand", JSON.stringify(selectedLand));
    } else {
      localStorage.removeItem("selectedLand");
    }
  }, [selectedLand]);

  // Modal handlers
  const openRejectModal = (landId) => {
    setRejectModal({ show: true, landId, reason: "" });
  };

  const closeRejectModal = () => {
    setRejectModal({ show: false, landId: null, reason: "" });
  };

  const handleRejectConfirm = () => {
    handleRejectStatus(rejectModal.landId, rejectModal.reason);
    closeRejectModal();
  };

  const openOwnerModal = (owner) => {
    setOwnerModal({ show: true, owner });
  };

  const closeOwnerModal = () => {
    setOwnerModal({ show: false, owner: null });
  };

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  // Prepare data
  const lands = landsData?.data || [];
  const pagination = landsData?.pagination || {
    current_page: currentPage,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  };

  const loading =
    isLoading || isRefreshing || updateLandStatusMutation.isLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <LandsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClearFilters={clearFilters}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        handleRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LandsList
            lands={lands}
            pagination={pagination}
            loading={loading}
            selectedLandId={selectedLand?.id}
            hasActiveFilters={hasActiveFilters}
            onSelectLand={setSelectedLand}
            onPageChange={setCurrentPage}
            onClearFilters={clearFilters}
          />
        </div>

        <div className="lg:col-span-1">
          <LandDetails
            land={selectedLand}
            loading={loading}
            copyStatus={copyStatus}
            onCopy={copyToClipboard}
            onShowOwner={openOwnerModal}
            onApprove={handleApprove}
            onReject={openRejectModal}
            onMarkAsSold={handleMarkAsSold}
            onReturnToPending={handleReturnToPending}
          />
        </div>
      </div>

      <RejectModal
        show={rejectModal.show}
        reason={rejectModal.reason}
        loading={loading}
        onChange={(value) =>
          setRejectModal((prev) => ({ ...prev, reason: value }))
        }
        onConfirm={handleRejectConfirm}
        onClose={closeRejectModal}
      />

      <OwnerModal
        show={ownerModal.show}
        owner={ownerModal.owner}
        copyStatus={copyStatus}
        onCopy={copyToClipboard}
        onClose={closeOwnerModal}
      />
    </div>
  );
};

export default AllLands;