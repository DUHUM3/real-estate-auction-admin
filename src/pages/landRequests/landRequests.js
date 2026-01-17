// pages/LandRequestsPage.jsx
import React, { useState, useEffect } from "react";
import { useQueryClient } from "react-query";
import FiltersBar from "../../features/landrequest/components/FiltersBar";
import LandRequestsList from "../../features/landrequest/components/LandRequestsList";
import RequestDetailsPanel from "../../features/landrequest/components/RequestDetailsPanel";
import StatusChangeModal from "../../features/landrequest/components/StatusChangeModal";
import UserDetailsModal from "../../features/landrequest/components/UserDetailsModal";
import OffersModal from "../../features/landrequest/components/OffersModal";
import { useLandRequests } from "../../features/landrequest/hooks/useLandRequests";
import { useUserDetails } from "../../features/landrequest/hooks/useUserDetails";
import { useStatusUpdate } from "../../features/landrequest/hooks/useStatusUpdate";
import { DEFAULT_FILTERS } from "../../features/landrequest/constants/landRequestsConstants";

const LandRequestsPage = () => {
  const queryClient = useQueryClient();

  // Get initial filters from localStorage
  const getInitialFilters = () => {
    const savedFilters = localStorage.getItem("landRequestsFilters");
    return savedFilters ? JSON.parse(savedFilters) : DEFAULT_FILTERS;
  };

  // State
  const [filters, setFilters] = useState(getInitialFilters());
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("landRequestsCurrentPage");
    return savedPage ? parseInt(savedPage) : 1;
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [offersModal, setOffersModal] = useState({ show: false, offers: [] });

  // Custom hooks
  const { data: landRequestsData, isLoading, refetch } = useLandRequests(filters, currentPage);
  const { userModal, openUserModal, closeUserModal } = useUserDetails();
  const {
    statusModal,
    setStatusModal,
    openStatusModal,
    closeStatusModal,
    handleStatusUpdate,
    isLoading: statusLoading,
  } = useStatusUpdate(() => {
    refetch();
    setSelectedRequest(null);
  });

  // Persist filters and page to localStorage
  useEffect(() => {
    localStorage.setItem("landRequestsFilters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem("landRequestsCurrentPage", currentPage.toString());
  }, [currentPage]);

  // Restore selected request from localStorage
  useEffect(() => {
    const savedSelectedRequest = localStorage.getItem("selectedLandRequest");
    if (savedSelectedRequest) {
      setSelectedRequest(JSON.parse(savedSelectedRequest));
    }
  }, []);

  // Save selected request to localStorage
  useEffect(() => {
    if (selectedRequest) {
      localStorage.setItem("selectedLandRequest", JSON.stringify(selectedRequest));
    } else {
      localStorage.removeItem("selectedLandRequest");
    }
  }, [selectedRequest]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key !== "page" && currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    queryClient.invalidateQueries(["landRequests"]);
    refetch();
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
    queryClient.invalidateQueries(["landRequests"]);
  };

  const handleRefresh = async () => {
    console.log("بدء تحديث بيانات طلبات الأراضي...");
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries(["landRequests"]);
      await queryClient.refetchQueries(["landRequests"], { active: true, exact: false });
      console.log("تم تحديث بيانات طلبات الأراضي بنجاح");
    } catch (error) {
      console.error("خطأ في التحديث:", error);
      alert("حدث خطأ أثناء تحديث البيانات: " + error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const openOffersModal = (offers) => {
    setOffersModal({ show: true, offers: offers || [] });
  };

  const closeOffersModal = () => {
    setOffersModal({ show: false, offers: [] });
  };

  // Check if any filter is active
  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.region !== "all" ||
    filters.city !== "all" ||
    filters.purpose !== "all" ||
    filters.type !== "all" ||
    filters.area_min ||
    filters.area_max ||
    filters.date_from ||
    filters.date_to;

  // Extract data
  const requests = landRequestsData?.data || [];
  const pagination = landRequestsData?.pagination || {
    current_page: currentPage,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  };
  const filtersData = landRequestsData?.filtersData || {
    regions: [],
    cities: [],
    purposes: ["sale", "investment"],
    types: ["residential", "commercial", "industrial", "agricultural"],
    statuses: ["open", "close", "completed", "pending"],
  };

  const loading = isLoading || isRefreshing || statusLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Filters Bar */}
      <FiltersBar
        filters={filters}
        filtersData={filtersData}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClearFilters={clearFilters}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Requests List */}
        <div className="xl:col-span-2">
          <LandRequestsList
            requests={requests}
            pagination={pagination}
            selectedRequestId={selectedRequest?.id}
            onSelectRequest={setSelectedRequest}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            loading={loading}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Request Details Panel */}
        <div className="xl:col-span-1">
          <RequestDetailsPanel
            request={selectedRequest}
            onOpenUserModal={openUserModal}
            onOpenOffersModal={openOffersModal}
            onOpenStatusModal={openStatusModal}
            loading={loading}
          />
        </div>
      </div>

      {/* Modals */}
      <StatusChangeModal
        statusModal={statusModal}
        setStatusModal={setStatusModal}
        onConfirm={handleStatusUpdate}
        onClose={closeStatusModal}
        loading={statusLoading}
      />

      <UserDetailsModal userModal={userModal} onClose={closeUserModal} />

      <OffersModal offersModal={offersModal} onClose={closeOffersModal} />
    </div>
  );
};

export default LandRequestsPage;