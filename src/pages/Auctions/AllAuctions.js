import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchFilters from "../../pages/Auctions/AuctionFilters"; 
import { useAuctionQueries } from "../../services/AuctionApi";
import AuctionsList from "../../features/auctions/components/AuctionsList";
import AuctionDetails from "../../features/auctions/components/AuctionDetails";
import AuctionActions from "../../features/auctions/components/AuctionActions";
import MediaModal from "../../features/auctions/components/MediaModal";
import RejectModal from "../../features/auctions/components/RejectModal";
import OwnerModal from "../../features/auctions/components/OwnerModal";
import useAuctionFilters from "../../features/auctions/hooks/useAuctionFilters";
import useAuctionSelection from "../../features/auctions/hooks/useAuctionSelection";
import useMediaModal from "../../features/auctions/hooks/useMediaModal";

const AllAuctions = () => {
  const navigate = useNavigate();
  const { useFetchAuctions, useApproveAuction, useRejectAuction } = useAuctionQueries();

  // Custom hooks for state management
  const { filters, currentPage, setFilters, setCurrentPage, clearFilters } = useAuctionFilters();
  const { selectedAuction, setSelectedAuction } = useAuctionSelection();
  const { mediaModal, openMediaModal, closeMediaModal, updateMediaIndex } = useMediaModal();

  // Local state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rejectModal, setRejectModal] = useState({ show: false, auctionId: null, reason: "" });
  const [ownerModal, setOwnerModal] = useState({ show: false, owner: null });

  // API queries
  const { data: auctionsData, isLoading, refetch } = useFetchAuctions(filters, currentPage);
  const approveMutation = useApproveAuction();
  const rejectMutation = useRejectAuction();

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    if (key !== "page" && currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("خطأ في التحديث:", error);
      alert("حدث خطأ أثناء تحديث البيانات: " + error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApprove = async (auctionId) => {
    if (!window.confirm("هل أنت متأكد من قبول هذا المزاد؟")) return;

    try {
      await approveMutation.mutateAsync(auctionId);
      alert("تم قبول المزاد بنجاح");
      setSelectedAuction(null);
      setRejectModal({ show: false, auctionId: null, reason: "" });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) {
      alert("يرجى إدخال سبب الرفض");
      return;
    }

    if (!window.confirm("هل أنت متأكد من رفض هذا المزاد؟")) return;

    try {
      await rejectMutation.mutateAsync({
        auctionId: rejectModal.auctionId,
        reason: rejectModal.reason,
      });
      alert("تم رفض المزاد بنجاح");
      refetch();
      setSelectedAuction(null);
      setRejectModal({ show: false, auctionId: null, reason: "" });
    } catch (error) {
      alert(error.message);
    }
  };

  const openRejectModal = (auctionId) => {
    setRejectModal({ show: true, auctionId, reason: "" });
  };

  const closeRejectModal = () => {
    setRejectModal({ show: false, auctionId: null, reason: "" });
  };

  const openOwnerModal = (owner) => {
    setOwnerModal({ show: true, owner });
  };

  const closeOwnerModal = () => {
    setOwnerModal({ show: false, owner: null });
  };

  // Data extraction
  const auctions = auctionsData?.data || [];
  const pagination = auctionsData?.pagination || {
    current_page: currentPage,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  };

  const loading = isLoading || isRefreshing || approveMutation.isLoading || rejectMutation.isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <SearchFilters
        filters={filters}
        handleFilterChange={handleFilterChange}
        handleSearch={handleSearch}
        handleRefresh={handleRefresh}
        clearFilters={clearFilters}
        isRefreshing={isRefreshing}
        loading={loading}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Auctions List */}
        <AuctionsList
          auctions={auctions}
          pagination={pagination}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          selectedAuction={selectedAuction}
          setSelectedAuction={setSelectedAuction}
          loading={loading}
          filters={filters}
          clearFilters={clearFilters}
        />

        {/* Auction Details */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {selectedAuction ? (
            <div className="h-full flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">تفاصيل المزاد</h3>
                <span className="text-sm text-blue-100 font-medium bg-blue-700 px-3 py-1 rounded-full">
                  ID: {selectedAuction.id}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <AuctionDetails
                  auction={selectedAuction}
                  openOwnerModal={openOwnerModal}
                  openMediaModal={openMediaModal}
                />
              </div>

              <AuctionActions
                auction={selectedAuction}
                loading={loading}
                onApprove={handleApprove}
                onReject={openRejectModal}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-600 text-2xl">📅</span>
              </div>
              <p className="text-gray-600 text-lg font-medium">اختر مزادًا لعرض التفاصيل</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <MediaModal
        isOpen={mediaModal.show}
        type={mediaModal.type}
        items={mediaModal.items}
        currentIndex={mediaModal.currentIndex}
        onClose={closeMediaModal}
        onIndexChange={updateMediaIndex}
      />

      <RejectModal
        isOpen={rejectModal.show}
        reason={rejectModal.reason}
        loading={loading}
        onReasonChange={(reason) => setRejectModal((prev) => ({ ...prev, reason }))}
        onConfirm={handleReject}
        onClose={closeRejectModal}
      />

      <OwnerModal
        isOpen={ownerModal.show}
        owner={ownerModal.owner}
        onClose={closeOwnerModal}
      />
    </div>
  );
};

export default AllAuctions;