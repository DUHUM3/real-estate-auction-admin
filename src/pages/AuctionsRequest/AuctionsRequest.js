// pages/MarketingRequestsPage.jsx
// Main orchestrator for the Marketing Requests feature
// Manages filters, selected request, and coordinates child components

import React, { useState, useEffect } from "react";
import { Target, RefreshCw } from "lucide-react";
import MarketingFilters from "../../pages/AuctionsRequest/AuctionsMarketingFilters";
import RequestsList from "../../features/auctionrequest/components/RequestsList";
import RequestDetailsPanel from "../../features/auctionrequest/components/RequestDetailsPanel";
import StatusUpdateModal from "../../features/auctionrequest/components/StatusUpdateModal";
import ImageViewerModal from "../../features/auctionrequest/components/ImageViewerModal";
import { useMarketingRequests } from "../../features/auctionrequest/hooks/useMarketingRequests";
import { useStatusUpdate } from "../../features/auctionrequest/hooks/useStatusUpdate";
import { useImageModal } from "../../features/auctionrequest/hooks/useImageModal";
import { filtersManager } from "../../services/marketingRequestsApi";

const MarketingRequestsPage = () => {
  const [filters, setFilters] = useState(filtersManager.getInitialFilters());
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusModal, setStatusModal] = useState({
    show: false,
    requestId: null,
    newStatus: "",
    rejectionMessage: "",
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const { imageModal, openImageModal, closeImageModal, nextImage, prevImage } =
    useImageModal();

  const { marketingRequestsData, isLoading, refetch } = useMarketingRequests(
    filters,
    refreshKey
  );

  const { statusMutation, handleStatusUpdate: performStatusUpdate } =
    useStatusUpdate(filters, () => {
      setSelectedRequest(null);
      closeStatusModal();
    });

  useEffect(() => {
    filtersManager.saveFilters(filters);
  }, [filters]);

  useEffect(() => {
    refetch();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = () => {
    refetch();
  };

  const clearFilters = () => {
    const defaultFilters = filtersManager.clearFilters();
    setFilters(defaultFilters);
    setTimeout(() => {
      refetch();
    }, 0);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const openStatusModal = (requestId, newStatus) => {
    setStatusModal({
      show: true,
      requestId,
      newStatus,
      rejectionMessage: "",
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      show: false,
      requestId: null,
      newStatus: "",
      rejectionMessage: "",
    });
  };

  const handleStatusUpdate = async () => {
    await performStatusUpdate(statusModal);
  };

  const updatePagination = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const requests = marketingRequestsData?.data || [];
  const pagination = marketingRequestsData?.pagination || {
    current_page: filters.page,
    last_page: 1,
    per_page: filters.per_page,
    total: 0,
    from: 0,
    to: 0,
  };
  const filtersData = marketingRequestsData?.filtersData || {
    regions: [],
    cities: [],
    statuses: [],
    property_roles: [],
  };

  const loading = isLoading || statusMutation.isLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      <MarketingFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClearFilters={clearFilters}
        filtersData={filtersData}
        loading={loading}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2">
          <RequestsList
            requests={requests}
            pagination={pagination}
            loading={loading}
            selectedRequest={selectedRequest}
            onSelectRequest={setSelectedRequest}
            onUpdatePagination={updatePagination}
          />
        </div>

        <div className="xl:col-span-1">
          <RequestDetailsPanel
            selectedRequest={selectedRequest}
            loading={loading}
            onOpenStatusModal={openStatusModal}
            onOpenImageModal={openImageModal}
          />
        </div>
      </div>

      <StatusUpdateModal
        statusModal={statusModal}
        loading={loading}
        onClose={closeStatusModal}
        onConfirm={handleStatusUpdate}
        onMessageChange={(message) =>
          setStatusModal((prev) => ({
            ...prev,
            rejectionMessage: message,
          }))
        }
      />

      <ImageViewerModal
        imageModal={imageModal}
        onClose={closeImageModal}
        onNext={nextImage}
        onPrev={prevImage}
      />
    </div>
  );
};

export default MarketingRequestsPage;
