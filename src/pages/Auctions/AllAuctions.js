import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchFilters from "./AuctionFilters";
import { auctionApi, useAuctionQueries } from "../../services/AuctionApi";

import { 
  FiCopy, 
  FiCalendar, 
  FiMapPin, 
  FiEye, 
  FiUser, 
  FiImage, 
  FiVideo, 
  FiMaximize2, 
  FiChevronRight, 
  FiChevronLeft, 
  FiCheck, 
  FiX, 
  FiEdit 
} from 'react-icons/fi';

const AllAuctions = () => {
  const navigate = useNavigate();
  
  const { useFetchAuctions, useApproveAuction, useRejectAuction } = useAuctionQueries();

  const getInitialFilters = () => {
    const savedFilters = localStorage.getItem("auctionsFilters");
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return {
      search: "",
      status: "all",
      region: "all",
      city: "all",
      date: "",
      sort_field: "created_at",
      sort_direction: "desc",
    };
  };
  
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState(getInitialFilters());
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("auctionsCurrentPage");
    return savedPage ? parseInt(savedPage) : 1;
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copyStatus, setCopyStatus] = useState({});
  const [rejectModal, setRejectModal] = useState({
    show: false,
    auctionId: null,
    reason: "",
  });

  const [ownerModal, setOwnerModal] = useState({
    show: false,
    owner: null,
  });

  const [mediaModal, setMediaModal] = useState({
    show: false,
    type: null,
    items: [],
    currentIndex: 0,
  });

  const {
    data: auctionsData,
    isLoading,
    error,
    refetch,
  } = useFetchAuctions(filters, currentPage);

  const approveMutation = useApproveAuction();
  const rejectMutation = useRejectAuction();

  useEffect(() => {
    localStorage.setItem("auctionsFilters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem("auctionsCurrentPage", currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    const savedSelectedAuction = localStorage.getItem("selectedAuction");
    if (savedSelectedAuction) {
      setSelectedAuction(JSON.parse(savedSelectedAuction));
    }
  }, []);

  useEffect(() => {
    if (selectedAuction) {
      localStorage.setItem("selectedAuction", JSON.stringify(selectedAuction));
    } else {
      localStorage.removeItem("selectedAuction");
    }
  }, [selectedAuction]);
  
  const copyToClipboard = async (text, fieldName) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text.toString());

      setCopyStatus((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      setTimeout(() => {
        setCopyStatus((prev) => ({
          ...prev,
          [fieldName]: false,
        }));
      }, 2000);
    } catch (err) {
      console.error("فشل في نسخ النص: ", err);
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopyStatus((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      setTimeout(() => {
        setCopyStatus((prev) => ({
          ...prev,
          [fieldName]: false,
        }));
      }, 2000);
    }
  };

  const handleRefresh = async () => {
    console.log("بدء تحديث بيانات المزادات...");
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

  const openRejectModal = (auctionId) => {
    setRejectModal({
      show: true,
      auctionId,
      reason: "",
    });
  };

  const closeRejectModal = () => {
    setRejectModal({
      show: false,
      auctionId: null,
      reason: "",
    });
  };

  const openOwnerModal = (owner) => {
    setOwnerModal({
      show: true,
      owner,
    });
  };

  const closeOwnerModal = () => {
    setOwnerModal({
      show: false,
      owner: null,
    });
  };

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

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };

    setFilters(newFilters);

    if (key !== "page" && currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const clearFilters = () => {
    const defaultFilters = {
      search: "",
      status: "all",
      region: "all",
      city: "all",
      date: "",
      sort_field: "created_at",
      sort_direction: "desc",
    };

    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const handleApprove = async (auctionId) => {
    if (!window.confirm("هل أنت متأكد من قبول هذا المزاد؟")) {
      return;
    }
    
    try {
      await approveMutation.mutateAsync(auctionId);
      alert("تم قبول المزاد بنجاح");
      setSelectedAuction(null);
      closeRejectModal?.();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) {
      alert("يرجى إدخال سبب الرفض");
      return;
    }

    if (!window.confirm("هل أنت متأكد من رفض هذا المزاد؟")) {
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        auctionId: rejectModal.auctionId,
        reason: rejectModal.reason,
      });
      alert("تم رفض المزاد بنجاح");
      refetch();
      setSelectedAuction(null);
      closeRejectModal();
    } catch (error) {
      alert(error.message);
    }
  };

  const updatePagination = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "غير محدد";
    const date = new Date(dateString);
    return date.toLocaleString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "غير محدد";
    return timeString;
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";

    switch (status) {
      case "مفتوح":
        return (
          <span
            className={`${baseClasses} bg-green-100 text-green-800 border border-green-200`}
          >
            مفتوح
          </span>
        );
      case "مرفوض":
        return (
          <span
            className={`${baseClasses} bg-red-100 text-red-800 border border-red-200`}
          >
            مرفوض
          </span>
        );
      case "مغلق":
        return (
          <span
            className={`${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`}
          >
            مغلق
          </span>
        );
      case "قيد المراجعة":
        return (
          <span
            className={`${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`}
          >
            قيد المراجعة
          </span>
        );
      default:
        return (
          <span
            className={`${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`}
          >
            {status}
          </span>
        );
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "مفتوح":
        return "مفتوح";
      case "مرفوض":
        return "مرفوض";
      case "مغلق":
        return "مغلق";
      case "قيد المراجعة":
        return "قيد المراجعة";
      default:
        return status || "غير معروف";
    }
  };

  const renderOwnerDetails = (owner) => {
    if (!owner) return null;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-blue-200 pb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FiUser className="text-white" size={16} />
            </div>
            معلومات الشركة
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                اسم الشركة
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-gray-900 font-medium">
                  {owner.auction_name || "غير متوفر"}
                </span>
                {owner.auction_name && (
                  <button
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      copyStatus["company_name"]
                        ? "text-green-600 bg-green-50 scale-110"
                        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                    onClick={() =>
                      copyToClipboard(owner.auction_name, "company_name")
                    }
                    title="نسخ اسم الشركة"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                البريد الإلكتروني
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-gray-900 font-medium truncate">
                  {owner.user?.email || "غير متوفر"}
                </span>
                {owner.user?.email && (
                  <button
                    className={`p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 mr-2 ${
                      copyStatus["company_email"]
                        ? "text-green-600 bg-green-50 scale-110"
                        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                    onClick={() =>
                      copyToClipboard(owner.user.email, "company_email")
                    }
                    title="نسخ البريد الإلكتروني"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                رقم الهاتف
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-gray-900 font-medium">
                  {owner.user?.phone || "غير متوفر"}
                </span>
                {owner.user?.phone && (
                  <button
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      copyStatus["company_phone"]
                        ? "text-green-600 bg-green-50 scale-110"
                        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                    onClick={() =>
                      copyToClipboard(owner.user.phone, "company_phone")
                    }
                    title="نسخ رقم الهاتف"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                اسم المسؤول
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-gray-900 font-medium">
                  {owner.user?.full_name || "غير متوفر"}
                </span>
                {owner.user?.full_name && (
                  <button
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      copyStatus["company_contact"]
                        ? "text-green-600 bg-green-50 scale-110"
                        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                    onClick={() =>
                      copyToClipboard(owner.user.full_name, "company_contact")
                    }
                    title="نسخ اسم المسؤول"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {owner.commercial_register && (
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-300 pb-3">
              <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                <FiEdit className="text-white" size={16} />
              </div>
              المعلومات التجارية
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  السجل التجاري
                </label>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <span className="text-gray-900 font-medium">
                    {owner.commercial_register}
                  </span>
                  <button
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      copyStatus["commercial_register"]
                        ? "text-green-600 bg-green-50 scale-110"
                        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        owner.commercial_register,
                        "commercial_register"
                      )
                    }
                    title="نسخ السجل التجاري"
                  >
                    <FiCopy size={16} />
                  </button>
                </div>
              </div>
              {owner.license_number && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    رقم الترخيص
                  </label>
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-gray-900 font-medium">
                      {owner.license_number}
                    </span>
                    <button
                      className={`p-1.5 rounded-lg transition-all duration-200 ${
                        copyStatus["license_number"]
                          ? "text-green-600 bg-green-50 scale-110"
                          : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                      onClick={() =>
                        copyToClipboard(owner.license_number, "license_number")
                      }
                      title="نسخ رقم الترخيص"
                    >
                      <FiCopy size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAuctionDetails = (auction) => {
    return (
      <div className="space-y-6">
        {/* معلومات أساسية */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-blue-200 pb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FiCalendar className="text-white" size={16} />
            </div>
            المعلومات الأساسية
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                رقم المزاد
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-gray-900 font-bold text-lg">
                  #{auction.id}
                </span>
                <button
                  className={`p-1.5 rounded-lg transition-all duration-200 ${
                    copyStatus["auction_id"]
                      ? "text-green-600 bg-green-50 scale-110"
                      : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                  onClick={() => copyToClipboard(auction.id, "auction_id")}
                  title="نسخ رقم المزاد"
                >
                  <FiCopy size={16} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                العنوان
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-gray-900 font-medium">
                  {auction.title || "غير محدد"}
                </span>
                {auction.title && (
                  <button
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      copyStatus["title"]
                        ? "text-green-600 bg-green-50 scale-110"
                        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                    onClick={() => copyToClipboard(auction.title, "title")}
                    title="نسخ العنوان"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                الحالة
              </label>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                {getStatusBadge(auction.status)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide flex items-center gap-1">
                <FiCalendar size={14} />
                تاريخ المزاد
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-gray-900 font-medium">
                  {formatDate(auction.auction_date)}
                </span>
                {auction.auction_date && (
                  <button
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      copyStatus["auction_date"]
                        ? "text-green-600 bg-green-50 scale-110"
                        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        formatDate(auction.auction_date),
                        "auction_date"
                      )
                    }
                    title="نسخ تاريخ المزاد"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* معلومات الموقع */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-emerald-200 pb-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <FiMapPin className="text-white" size={16} />
            </div>
            معلومات الموقع
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                المنطقة
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-gray-900 font-medium">
                  {auction.region || "غير محدد"}
                </span>
                {auction.region && (
                  <button
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      copyStatus["region"]
                        ? "text-green-600 bg-green-50 scale-110"
                        : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                    }`}
                    onClick={() => copyToClipboard(auction.region, "region")}
                    title="نسخ المنطقة"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                المدينة
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-gray-900 font-medium">
                  {auction.city || "غير محدد"}
                </span>
                {auction.city && (
                  <button
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      copyStatus["city"]
                        ? "text-green-600 bg-green-50 scale-110"
                        : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                    }`}
                    onClick={() => copyToClipboard(auction.city, "city")}
                    title="نسخ المدينة"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                العنوان التفصيلي
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-gray-900 font-medium truncate">
                  {auction.address || "غير محدد"}
                </span>
                {auction.address && (
                  <button
                    className={`p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 mr-2 ${
                      copyStatus["address"]
                        ? "text-green-600 bg-green-50 scale-110"
                        : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                    }`}
                    onClick={() => copyToClipboard(auction.address, "address")}
                    title="نسخ العنوان"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* معلومات الشركة */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-purple-200 pb-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <FiUser className="text-white" size={16} />
            </div>
            معلومات الشركة المنظمة
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                اسم الشركة
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-gray-900 font-medium">
                  {auction.company?.auction_name || "غير محدد"}
                </span>
                <div className="flex gap-1">
                  <button
                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                    onClick={() => openOwnerModal(auction.company)}
                    title="عرض تفاصيل الشركة"
                  >
                    <FiEye size={16} />
                  </button>
                  {auction.company?.auction_name && (
                    <button
                      className={`p-1.5 rounded-lg transition-all duration-200 ${
                        copyStatus["company_info"]
                          ? "text-green-600 bg-green-50 scale-110"
                          : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                      }`}
                      onClick={() =>
                        copyToClipboard(
                          auction.company.auction_name,
                          "company_info"
                        )
                      }
                      title="نسخ اسم الشركة"
                    >
                      <FiCopy size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                اسم المسؤول
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-gray-900 font-medium">
                  {auction.company?.user?.full_name || "غير محدد"}
                </span>
                {auction.company?.user?.full_name && (
                  <button
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      copyStatus["user_name"]
                        ? "text-green-600 bg-green-50 scale-110"
                        : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        auction.company.user.full_name,
                        "user_name"
                      )
                    }
                    title="نسخ اسم المسؤول"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                البريد الإلكتروني
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-gray-900 font-medium text-sm truncate">
                  {auction.company?.user?.email || "غير محدد"}
                </span>
                {auction.company?.user?.email && (
                  <button
                    className={`p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 mr-2 ${
                      copyStatus["auction_email"]
                        ? "text-green-600 bg-green-50 scale-110"
                        : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        auction.company.user.email,
                        "auction_email"
                      )
                    }
                    title="نسخ البريد الإلكتروني"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                الهاتف
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-gray-900 font-medium">
                  {auction.company?.user?.phone || "غير محدد"}
                </span>
                {auction.company?.user?.phone && (
                  <button
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      copyStatus["auction_phone"]
                        ? "text-green-600 bg-green-50 scale-110"
                        : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        auction.company.user.phone,
                        "auction_phone"
                      )
                    }
                    title="نسخ رقم الهاتف"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* الوصف */}
        {auction.description && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-amber-200 pb-3">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                <FiEdit className="text-white" size={16} />
              </div>
              الوصف
            </h4>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {auction.description}
              </p>
            </div>
          </div>
        )}

        {/* سبب الرفض */}
        {auction.rejection_reason && (
          <div className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-xl border border-red-200">
            <h4 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2 border-b border-red-300 pb-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <FiX className="text-white" size={16} />
              </div>
              سبب الرفض
            </h4>
            <div className="flex items-start justify-between bg-white p-4 rounded-lg border border-red-200 shadow-sm">
              <p className="text-red-900 leading-relaxed font-medium">
                {auction.rejection_reason}
              </p>
              <button
                className={`p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 mr-2 ${
                  copyStatus["rejection_reason"]
                    ? "text-green-600 bg-green-50 scale-110"
                    : "text-red-500 hover:text-red-700 hover:bg-red-100"
                }`}
                onClick={() =>
                  copyToClipboard(auction.rejection_reason, "rejection_reason")
                }
                title="نسخ سبب الرفض"
              >
                <FiCopy size={16} />
              </button>
            </div>
          </div>
        )}

        {/* الصور */}
        {auction.images && auction.images.length > 0 && (
          <div className="bg-gradient-to-br from-cyan-50 to-sky-50 p-6 rounded-xl border border-cyan-100">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-between border-b border-cyan-200 pb-3">
              <span className="flex items-center gap-2">
                <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
                  <FiImage className="text-white" size={16} />
                </div>
                صور المزاد ({auction.images.length})
              </span>
              <button
                onClick={() =>
                  openMediaModal(
                    "image",
                    auction.images.map((img) => ({
                      url: `https://core-api-x41.shaheenplus.sa/storage/${img.image_path}`,
                      id: img.id,
                    })),
                    0
                  )
                }
                className="text-sm text-cyan-700 hover:text-cyan-900 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-cyan-200 hover:border-cyan-300 transition-all"
              >
                <FiMaximize2 size={14} />
                عرض الكل
              </button>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {auction.images.map((img, index) => (
                <div
                  key={img.id}
                  className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-gray-200 hover:border-cyan-500 transition-all duration-300 shadow-sm hover:shadow-md"
                  onClick={() =>
                    openMediaModal(
                      "image",
                      auction.images.map((img) => ({
                        url: `https://core-api-x41.shaheenplus.sa/storage/${img.image_path}`,
                        id: img.id,
                      })),
                      index
                    )
                  }
                >
                  <img
                    src={`https://core-api-x41.shaheenplus.sa/storage/${img.image_path}`}
                    alt={`صورة ${index + 1}`}
                    className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/200x150?text=صورة+غير+متوفرة";
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <FiMaximize2
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      size={24}
                    />
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-md font-medium">
                    {index + 1} / {auction.images.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* الفيديوهات */}
        {auction.videos && auction.videos.length > 0 && (
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-6 rounded-xl border border-violet-100">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-between border-b border-violet-200 pb-3">
              <span className="flex items-center gap-2">
                <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                  <FiVideo className="text-white" size={16} />
                </div>
                فيديوهات المزاد ({auction.videos.length})
              </span>
              <button
                onClick={() =>
                  openMediaModal(
                    "video",
                    auction.videos.map((vid) => ({
                      url: `https://core-api-x41.shaheenplus.sa/storage/${vid.video_path}`,
                      id: vid.id,
                    })),
                    0
                  )
                }
                className="text-sm text-violet-700 hover:text-violet-900 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-violet-200 hover:border-violet-300 transition-all"
              >
                <FiMaximize2 size={14} />
                عرض الكل
              </button>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {auction.videos.map((video, index) => (
                <div
                  key={video.id}
                  className="relative group rounded-xl overflow-hidden border-2 border-gray-200 hover:border-violet-500 transition-all duration-300 bg-black shadow-sm hover:shadow-md"
                >
                  <video
                    src={`https://core-api-x41.shaheenplus.sa/storage/${video.video_path}`}
                    className="w-full h-48 object-contain"
                    controls
                    preload="metadata"
                    onError={(e) => {
                      console.error("Video load error:", e);
                    }}
                  >
                    متصفحك لا يدعم تشغيل الفيديو
                  </video>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 font-medium">
                    <FiVideo size={12} />
                    فيديو {index + 1}
                  </div>
                  <button
                    onClick={() =>
                      openMediaModal(
                        "video",
                        auction.videos.map((vid) => ({
                          url: `https://core-api-x41.shaheenplus.sa/storage/${vid.video_path}`,
                          id: vid.id,
                        })),
                        index
                      )
                    }
                    className="absolute top-2 right-2 bg-black bg-opacity-75 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    title="تكبير"
                  >
                    <FiMaximize2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* معلومات النظام */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-xl border border-slate-200">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-slate-300 pb-3">
            <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
              <FiCalendar className="text-white" size={16} />
            </div>
            معلومات النظام
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                تاريخ الإنشاء
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-gray-900 font-medium text-sm">
                  {formatDateTime(auction.created_at)}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                آخر تحديث
              </label>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-gray-900 font-medium text-sm">
                  {formatDateTime(auction.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (
      !auctionsData ||
      !auctionsData.pagination ||
      auctionsData.pagination.last_page <= 1
    ) {
      return null;
    }

    const pages = [];
    const pagination = auctionsData.pagination;

    pages.push(
      <button
        key="prev"
        className={`p-2 rounded-lg border transition-all ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
            : "bg-white text-gray-700 hover:bg-blue-50 border-gray-300 hover:border-blue-300"
        }`}
        onClick={() => currentPage > 1 && updatePagination(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FiChevronRight size={18} />
      </button>
    );

    const totalPages = pagination.last_page;
    const current = currentPage;
    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(totalPages, current + 2);

    if (endPage - startPage < 4) {
      if (current < 3) {
        endPage = Math.min(totalPages, 5);
      } else {
        startPage = Math.max(1, totalPages - 4);
      }
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className={`p-2 min-w-[40px] rounded-lg border transition-all ${
            currentPage === 1
              ? "bg-blue-600 text-white border-blue-600 shadow-md"
              : "bg-white text-gray-700 hover:bg-blue-50 border-gray-300 hover:border-blue-300"
          }`}
          onClick={() => updatePagination(1)}
        >
          1
        </button>
      );

      if (startPage > 2) {
        pages.push(
          <span key="ellipsis-start" className="px-3 py-2 text-gray-500">
            ...
          </span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      if (i === 1 && startPage > 1) continue;

      pages.push(
        <button
          key={i}
          className={`p-2 min-w-[40px] rounded-lg border transition-all ${
            currentPage === i
              ? "bg-blue-600 text-white border-blue-600 shadow-md"
              : "bg-white text-gray-700 hover:bg-blue-50 border-gray-300 hover:border-blue-300"
          }`}
          onClick={() => updatePagination(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis-end" className="px-3 py-2 text-gray-500">
            ...
          </span>
        );
      }

      pages.push(
        <button
          key={totalPages}
          className={`p-2 min-w-[40px] rounded-lg border transition-all ${
            currentPage === totalPages
              ? "bg-blue-600 text-white border-blue-600 shadow-md"
              : "bg-white text-gray-700 hover:bg-blue-50 border-gray-300 hover:border-blue-300"
          }`}
          onClick={() => updatePagination(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        className={`p-2 rounded-lg border transition-all ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
            : "bg-white text-gray-700 hover:bg-blue-50 border-gray-300 hover:border-blue-300"
        }`}
        onClick={() =>
          currentPage < totalPages && updatePagination(currentPage + 1)
        }
        disabled={currentPage === totalPages}
      >
        <FiChevronLeft size={18} />
      </button>
    );

    return (
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {pages}
      </div>
    );
  };

  const auctions = auctionsData?.data || [];
  const pagination = auctionsData?.pagination || {
    current_page: currentPage,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  };

  const loading =
    isLoading ||
    isRefreshing ||
    approveMutation.isLoading ||
    rejectMutation.isLoading;

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.region !== "all" ||
    filters.city !== "all" ||
    filters.date;

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
        <div className="xl:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-bold text-white mb-2 sm:mb-0">
              قائمة المزادات ({pagination.total || 0})
            </h3>
            <div className="flex flex-col sm:items-end">
              <span className="text-sm text-blue-100">
                {pagination.total > 0 ? (
                  <>
                    عرض {pagination.from || 1} إلى{" "}
                    {pagination.to || auctions.length} من {pagination.total}{" "}
                    نتيجة
                  </>
                ) : (
                  "لا توجد نتائج"
                )}
              </span>
              {pagination.last_page > 1 && (
                <span className="text-xs text-blue-200 mt-1">
                  الصفحة {currentPage} من {pagination.last_page}
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex space-x-2 mb-4">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                <div
                  className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <p className="text-gray-600 font-medium">جاري تحميل البيانات...</p>
            </div>
          ) : auctions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FiCalendar className="text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 text-lg mb-4 font-medium">لا توجد مزادات</p>
              {hasActiveFilters && (
                <button
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
                  onClick={clearFilters}
                >
                  مسح الفلاتر
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200 max-h-[calc(100vh-300px)] overflow-y-auto">
                {auctions.map((auction) => (
                  <div
                    key={auction.id}
                    className={`p-5 cursor-pointer transition-all duration-200 ${
                      selectedAuction?.id === auction.id
                        ? "bg-blue-50 border-r-4 border-blue-600 shadow-inner"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedAuction(auction)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                        <FiCalendar className="text-blue-600" size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-gray-900 truncate mb-1">
                          {auction.title}
                        </h4>
                        <p className="text-sm text-gray-600 font-medium mb-2">
                          {auction.company?.auction_name || "غير محدد"}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                            <FiCalendar size={14} />
                            {formatDate(auction.auction_date)}
                          </span>
                          <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                            <FiMapPin size={14} />
                            {auction.city || auction.address || "غير محدد"}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(auction.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pagination.last_page > 1 && (
                <div className="p-5 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-sm text-gray-600 font-medium">
                      الصفحة {currentPage} من {pagination.last_page} - إجمالي{" "}
                      {pagination.total} نتيجة
                    </div>
                    <div className="flex items-center gap-1 flex-wrap justify-center">
                      {renderPagination()}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Auction Details */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {selectedAuction ? (
            <div className="h-full flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  تفاصيل المزاد
                </h3>
                <span className="text-sm text-blue-100 font-medium bg-blue-700 px-3 py-1 rounded-full">
                  ID: {selectedAuction.id}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {renderAuctionDetails(selectedAuction)}
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-wrap gap-3">
                  {selectedAuction.status === "قيد المراجعة" && (
                    <>
                      <button
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50"
                        onClick={() => handleApprove(selectedAuction.id)}
                        disabled={loading}
                      >
                        <FiCheck size={18} />
                        {loading ? "جاري المعالجة..." : "قبول المزاد"}
                      </button>

                      <button
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50"
                        onClick={() => openRejectModal(selectedAuction.id)}
                        disabled={loading}
                      >
                        <FiX size={18} />
                        {loading ? "جاري المعالجة..." : "رفض المزاد"}
                      </button>
                    </>
                  )}
                  {selectedAuction.status === "مرفوض" && (
                    <button
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50"
                      onClick={() => handleApprove(selectedAuction.id)}
                      disabled={loading}
                    >
                      <FiCheck size={18} />
                      {loading ? "جاري المعالجة..." : "قبول المزاد"}
                    </button>
                  )}
                  {selectedAuction.status === "مفتوح" && (
                    <button
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50"
                      onClick={() => openRejectModal(selectedAuction.id)}
                      disabled={loading}
                    >
                      <FiX size={18} />
                      {loading ? "جاري المعالجة..." : "رفض المزاد"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FiCalendar className="text-blue-600" size={40} />
              </div>
              <p className="text-gray-600 text-lg font-medium">اختر مزادًا لعرض التفاصيل</p>
            </div>
          )}
        </div>
      </div>

      {/* Media Modal */}
      {mediaModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="relative w-full max-w-5xl h-full max-h-screen flex flex-col">
            <div className="flex items-center justify-between p-6 bg-black bg-opacity-50 rounded-t-xl">
              <h3 className="text-white text-lg font-bold">
                {mediaModal.type === "image" ? "الصور" : "الفيديوهات"} (
                {mediaModal.currentIndex + 1} / {mediaModal.items.length})
              </h3>
              <button
                className="text-white hover:text-gray-300 text-3xl transition-colors"
                onClick={closeMediaModal}
              >
                ×
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center relative">
              {mediaModal.items.length > 1 && (
                <>
                  <button
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full z-10 transition-all shadow-lg"
                    onClick={() =>
                      setMediaModal((prev) => ({
                        ...prev,
                        currentIndex:
                          prev.currentIndex > 0
                            ? prev.currentIndex - 1
                            : prev.items.length - 1,
                      }))
                    }
                  >
                    <FiChevronRight size={24} />
                  </button>
                  <button
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full z-10 transition-all shadow-lg"
                    onClick={() =>
                      setMediaModal((prev) => ({
                        ...prev,
                        currentIndex:
                          prev.currentIndex < prev.items.length - 1
                            ? prev.currentIndex + 1
                            : 0,
                      }))
                    }
                  >
                    <FiChevronLeft size={24} />
                  </button>
                </>
              )}

              <div className="w-full h-full flex items-center justify-center p-8">
                {mediaModal.type === "image" ? (
                  <img
                    src={mediaModal.items[mediaModal.currentIndex]?.url}
                    alt={`صورة ${mediaModal.currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/800x600?text=صورة+غير+متوفرة";
                    }}
                  />
                ) : (
                  <video
                    src={mediaModal.items[mediaModal.currentIndex]?.url}
                    controls
                    autoPlay
                    className="max-w-full max-h-full rounded-xl shadow-2xl"
                    onError={(e) => {
                      console.error("Video load error:", e);
                    }}
                  >
                    متصفحك لا يدعم تشغيل الفيديو
                  </video>
                )}
              </div>
            </div>

            {mediaModal.items.length > 1 && (
              <div className="p-4 bg-black bg-opacity-50 overflow-x-auto rounded-b-xl">
                <div className="flex gap-2 justify-center">
                  {mediaModal.items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex-shrink-0 w-20 h-20 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        index === mediaModal.currentIndex
                          ? "border-blue-500 shadow-lg scale-110"
                          : "border-transparent hover:border-gray-400"
                      }`}
                      onClick={() =>
                        setMediaModal((prev) => ({
                          ...prev,
                          currentIndex: index,
                        }))
                      }
                    >
                      {mediaModal.type === "image" ? (
                        <img
                          src={item.url}
                          alt={`صورة مصغرة ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
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
      )}

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <FiEdit className="text-white" size={16} />
                </div>
                رفض المزاد
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600 text-xl transition-colors"
                onClick={closeRejectModal}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  سبب الرفض
                </label>
                <textarea
                  value={rejectModal.reason}
                  onChange={(e) =>
                    setRejectModal((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  rows="4"
                  placeholder="اكتب سبب رفض المزاد هنا..."
                />
                <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                  هذا السبب سيظهر للشركة كتفسير لرفض مزادها
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
              <button
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium disabled:opacity-50"
                onClick={closeRejectModal}
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50"
                onClick={handleReject}
                disabled={loading}
              >
                <FiX size={18} />
                {loading ? "جاري الحفظ..." : "تأكيد الرفض"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Owner Modal */}
      {ownerModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <FiUser className="text-white" size={16} />
                </div>
                تفاصيل الشركة
              </h3>
              <button
                className="text-white hover:text-gray-200 text-xl transition-colors"
                onClick={closeOwnerModal}
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {renderOwnerDetails(ownerModal.owner)}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end bg-gray-50 rounded-b-xl">
              <button
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
                onClick={closeOwnerModal}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAuctions;