import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiVideo,
  FiImage,
  FiFilter,
  FiChevronRight,
  FiChevronLeft,
  FiExternalLink,
  FiSearch,
  FiSlash,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiEye,
  FiEdit,
  FiCopy,
} from "react-icons/fi";
import { useQueryClient, useQuery, useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

/**
 * =============================================
 * فهرس المكون - Component Index
 * =============================================
 *
 * 1. State Management - إدارة الحالة
 * 2. Effects - التأثيرات الجانبية
 * 3. Clipboard Functions - دوال الحافظة
 * 4. Modal Handlers - معالجات النوافذ المنبثقة
 * 5. API Functions - دوال API
 * 6. Filter Functions - دوال التصفية
 * 7. Action Handlers - معالجات الأحداث
 * 8. Helper Functions - الدوال المساعدة
 * 9. Render Functions - دوال التصيير
 * 10. Main Component Return - العنصر الرئيسي
 *
 * =============================================
 */

const AllAuctions = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ===============================
  // 1. State Management - إدارة الحالة
  // ===============================

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

  // ===============================
  // 2. Effects - التأثيرات الجانبية
  // ===============================

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

  // ===============================
  // 3. Clipboard Functions - دوال الحافظة
  // ===============================

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

  // ===============================
  // 4. Modal Handlers - معالجات النوافذ المنبثقة
  // ===============================

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

  // ===============================
  // 5. API Functions - دوال API
  // ===============================

  const buildQueryString = () => {
    const params = new URLSearchParams();

    if (filters.search.trim()) params.append("search", filters.search.trim());
    if (filters.status !== "all") params.append("status", filters.status);
    if (filters.region !== "all") params.append("region", filters.region);
    if (filters.city !== "all") params.append("city", filters.city);
    if (filters.date) params.append("date", filters.date);
    if (filters.sort_field) params.append("sort_field", filters.sort_field);
    if (filters.sort_direction)
      params.append("sort_direction", filters.sort_direction);

    params.append("page", currentPage);
    params.append("per_page", filters.per_page); // ⚠️ استخدام القيمة من الفلاتر

    return params.toString();
  };

  const fetchAuctions = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      throw new Error("لم يتم العثور على رمز الدخول");
    }

    const queryString = buildQueryString();
    const url = `http://72.61.119.194/api/admin/auctions?${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("access_token");
      navigate("/login");
      throw new Error("انتهت جلسة الدخول أو التوكن غير صالح");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`فشل في جلب المزادات: ${errorText}`);
    }

    const result = await response.json();

    console.log("API Response:", result);

    // التعديل الرئيسي هنا
    if (result.success) {
      return {
        data: result.data || [],
        pagination: result.pagination || {
          current_page: currentPage,
          last_page: 1,
          per_page: 10,
          total: result.data?.length || 0,
          from: 1,
          to: result.data?.length || 0,
        },
      };
    } else {
      throw new Error(result.message || "فشل في جلب البيانات");
    }
  };
  const {
    data: auctionsData,
    isLoading,
    error,
    refetch,
  } = useQuery(["auctions", filters, currentPage], fetchAuctions, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error("خطأ في جلب المزادات:", error);
      alert("حدث خطأ أثناء جلب البيانات: " + error.message);
    },
  });
  // طلب قبول المزاد
  const approveMutation = useMutation(
    async (auctionId) => {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("لم يتم العثور على رمز الدخول");

      const response = await fetch(
        `http://72.61.119.194/api/admin/auctions/${auctionId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error("خطأ في تحليل JSON:", jsonError);
        throw new Error("استجابة غير صالحة من الخادم");
      }

      if (!response.ok) {
        throw new Error(result.message || "فشل في قبول المزاد");
      }
      if (!result.success) {
        throw new Error(result.message || "فشل في قبول المزاد");
      }

      return result;
    },
    {
      onSuccess: () => {
        alert("تم قبول المزاد بنجاح");
        setSelectedAuction(null);
        closeRejectModal?.();
        queryClient.invalidateQueries(["auctions"]); // هذا يكفي للتحديث الفوري
      },
      onError: (error) => {
        alert(error.message);
      },
    }
  );

  // طلب رفض المزاد
  const rejectMutation = useMutation(
    async ({ auctionId, reason }) => {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("لم يتم العثور على رمز الدخول");

      const response = await fetch(
        `http://72.61.119.194/api/admin/auctions/${auctionId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: reason || "سبب الرفض غير محدد",
          }),
        }
      );

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error("خطأ في تحليل JSON:", jsonError);
        throw new Error("استجابة غير صالحة من الخادم");
      }

      if (!response.ok) {
        throw new Error(result.message || "فشل في رفض المزاد");
      }
      if (!result.success) {
        throw new Error(result.message || "فشل في رفض المزاد");
      }

      return result;
    },
    {
      onSuccess: () => {
        alert("تم رفض المزاد بنجاح");
        refetch(); // تحديث البيانات فوراً
        setSelectedAuction(null);
        closeRejectModal();
        queryClient.invalidateQueries(["auctions"]); // مسح الكاش والتحديث الفوري
      },
      onError: (error) => {
        alert(error.message);
      },
    }
  );
  // ===============================
  // 6. Filter Functions - دوال التصفية
  // ===============================

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

  // ===============================
  // 7. Action Handlers - معالجات الأحداث
  // ===============================

  const handleApprove = async (auctionId) => {
    if (!window.confirm("هل أنت متأكد من قبول هذا المزاد؟")) {
      return;
    }
    approveMutation.mutate(auctionId);
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) {
      alert("يرجى إدخال سبب الرفض");
      return;
    }

    if (!window.confirm("هل أنت متأكد من رفض هذا المزاد؟")) {
      return;
    }

    rejectMutation.mutate({
      auctionId: rejectModal.auctionId,
      reason: rejectModal.reason,
    });
  };

  const updatePagination = (newPage) => {
    setCurrentPage(newPage);
  };

  // ===============================
  // 8. Helper Functions - الدوال المساعدة
  // ===============================

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
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

  // ===============================
  // 9. Render Functions - دوال التصيير
  // ===============================

  const renderOwnerDetails = (owner) => {
    if (!owner) return null;

    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            معلومات الشركة
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم الشركة
              </label>
              <div className="flex items-center justify-between bg-white p-2 rounded border">
                <span className="text-gray-800">
                  {owner.auction_name || "غير متوفر"}
                </span>
                {owner.auction_name && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["company_name"]
                        ? "text-green-600 bg-green-50"
                        : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <div className="flex items-center justify-between bg-white p-2 rounded border">
                <span className="text-gray-800">
                  {owner.user?.email || "غير متوفر"}
                </span>
                {owner.user?.email && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["company_email"]
                        ? "text-green-600 bg-green-50"
                        : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الهاتف
              </label>
              <div className="flex items-center justify-between bg-white p-2 rounded border">
                <span className="text-gray-800">
                  {owner.user?.phone || "غير متوفر"}
                </span>
                {owner.user?.phone && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["company_phone"]
                        ? "text-green-600 bg-green-50"
                        : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم المسؤول
              </label>
              <div className="flex items-center justify-between bg-white p-2 rounded border">
                <span className="text-gray-800">
                  {owner.user?.full_name || "غير متوفر"}
                </span>
                {owner.user?.full_name && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["company_contact"]
                        ? "text-green-600 bg-green-50"
                        : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              المعلومات التجارية
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  السجل التجاري
                </label>
                <div className="flex items-center justify-between bg-white p-2 rounded border">
                  <span className="text-gray-800">
                    {owner.commercial_register}
                  </span>
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["commercial_register"]
                        ? "text-green-600 bg-green-50"
                        : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الترخيص
                  </label>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <span className="text-gray-800">
                      {owner.license_number}
                    </span>
                    <button
                      className={`p-1 rounded transition-colors ${
                        copyStatus["license_number"]
                          ? "text-green-600 bg-green-50"
                          : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
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
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              العنوان
            </label>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-800">
                {auction.title || "غير محدد"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FiUser size={16} />
              الشركة المنظمة
            </label>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-800">
                {auction.company?.auction_name ||
                  auction.company?.user?.full_name ||
                  "غير محدد"}
              </span>
              <div className="flex gap-1">
                <button
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  onClick={() => openOwnerModal(auction.company)}
                  title="عرض تفاصيل الشركة"
                >
                  <FiEye size={16} />
                </button>
                <button
                  className={`p-1 rounded transition-colors ${
                    copyStatus["company_info"]
                      ? "text-green-600 bg-green-50"
                      : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
                  }`}
                  onClick={() =>
                    copyToClipboard(
                      auction.company?.auction_name ||
                        auction.company?.user?.full_name,
                      "company_info"
                    )
                  }
                  title="نسخ اسم الشركة"
                >
                  <FiCopy size={16} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              البريد الإلكتروني
            </label>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-800">
                {auction.company?.user?.email || "غير محدد"}
              </span>
              {auction.company?.user?.email && (
                <button
                  className={`p-1 rounded transition-colors ${
                    copyStatus["auction_email"]
                      ? "text-green-600 bg-green-50"
                      : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
                  }`}
                  onClick={() =>
                    copyToClipboard(auction.company.user.email, "auction_email")
                  }
                  title="نسخ البريد الإلكتروني"
                >
                  <FiCopy size={16} />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الهاتف
            </label>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-800">
                {auction.company?.user?.phone || "غير محدد"}
              </span>
              {auction.company?.user?.phone && (
                <button
                  className={`p-1 rounded transition-colors ${
                    copyStatus["auction_phone"]
                      ? "text-green-600 bg-green-50"
                      : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
                  }`}
                  onClick={() =>
                    copyToClipboard(auction.company.user.phone, "auction_phone")
                  }
                  title="نسخ رقم الهاتف"
                >
                  <FiCopy size={16} />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الحالة
            </label>
            <div className="bg-gray-50 p-2 rounded">
              {getStatusBadge(auction.status)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FiCalendar size={16} />
              تاريخ المزاد
            </label>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-800">
                {formatDate(auction.auction_date)}
              </span>
              {auction.auction_date && (
                <button
                  className={`p-1 rounded transition-colors ${
                    copyStatus["auction_date"]
                      ? "text-green-600 bg-green-50"
                      : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FiClock size={16} />
              وقت البدء
            </label>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-800">
                {formatTime(auction.start_time)}
              </span>
              {auction.start_time && (
                <button
                  className={`p-1 rounded transition-colors ${
                    copyStatus["start_time"]
                      ? "text-green-600 bg-green-50"
                      : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
                  }`}
                  onClick={() =>
                    copyToClipboard(auction.start_time, "start_time")
                  }
                  title="نسخ وقت البدء"
                >
                  <FiCopy size={16} />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FiMapPin size={16} />
              العنوان
            </label>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-800">
                {auction.address || "غير محدد"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المنطقة
            </label>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-800">
                {auction.region || "غير محدد"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المدينة
            </label>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-800">
                {auction.city || "غير محدد"}
              </span>
            </div>
          </div>

          {auction.latitude && auction.longitude && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الإحداثيات
              </label>
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-gray-800">
                  {auction.latitude}, {auction.longitude}
                </span>
                <button
                  className={`p-1 rounded transition-colors ${
                    copyStatus["coordinates"]
                      ? "text-green-600 bg-green-50"
                      : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
                  }`}
                  onClick={() =>
                    copyToClipboard(
                      `${auction.latitude}, ${auction.longitude}`,
                      "coordinates"
                    )
                  }
                  title="نسخ الإحداثيات"
                >
                  <FiCopy size={16} />
                </button>
              </div>
            </div>
          )}

          {auction.intro_link && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <FiExternalLink size={16} />
                رابط التعريف
              </label>
              <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <a
                  href={auction.intro_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 truncate"
                >
                  {auction.intro_link}
                </a>
                <button
                  className={`p-1 rounded transition-colors ${
                    copyStatus["intro_link"]
                      ? "text-green-600 bg-green-50"
                      : "text-gray-500 hover:text-blue-600 hover:bg-gray-100"
                  }`}
                  onClick={() =>
                    copyToClipboard(auction.intro_link, "intro_link")
                  }
                  title="نسخ رابط التعريف"
                >
                  <FiCopy size={16} />
                </button>
              </div>
            </div>
          )}

          {auction.rejection_reason && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                سبب الرفض
              </label>
              <div className="flex items-center justify-between bg-red-50 p-2 rounded border border-red-200">
                <span className="text-red-800">{auction.rejection_reason}</span>
                <button
                  className={`p-1 rounded transition-colors ${
                    copyStatus["rejection_reason"]
                      ? "text-green-600 bg-green-50"
                      : "text-red-500 hover:text-red-700 hover:bg-red-100"
                  }`}
                  onClick={() =>
                    copyToClipboard(
                      auction.rejection_reason,
                      "rejection_reason"
                    )
                  }
                  title="نسخ سبب الرفض"
                >
                  <FiCopy size={16} />
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FiCalendar size={16} />
              تاريخ الإنشاء
            </label>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-800">
                {formatDate(auction.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الوصف
          </label>
          <div className="bg-gray-50 p-3 rounded border">
            <p className="text-gray-800">
              {auction.description || "لا يوجد وصف"}
            </p>
          </div>
        </div>

        {auction.images && auction.images.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              صور المزاد ({auction.images.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {auction.images.map((image, index) => (
                <div
                  key={image.id || index}
                  className="flex flex-col items-center p-3 bg-white rounded border"
                >
                  <FiImage className="text-gray-500 mb-1" size={24} />
                  <span className="text-sm text-gray-700">
                    صورة {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {auction.videos && auction.videos.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              فيديوهات المزاد ({auction.videos.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {auction.videos.map((video, index) => (
                <div
                  key={video.id || index}
                  className="flex flex-col items-center p-3 bg-white rounded border"
                >
                  <FiVideo className="text-gray-500 mb-1" size={24} />
                  <span className="text-sm text-gray-700">
                    فيديو {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPagination = () => {
    if (
      !auctionsData ||
      !auctionsData.pagination ||
      auctionsData.pagination.last_page <= 1
    ) {
      console.log("No pagination data:", auctionsData?.pagination);
      return null;
    }

    const pages = [];
    const pagination = auctionsData.pagination;

    console.log("Pagination data:", pagination); // للتتبع

    // زر السابق
    pages.push(
      <button
        key="prev"
        className={`p-2 rounded border ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
        }`}
        onClick={() => currentPage > 1 && updatePagination(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FiChevronRight size={18} />
      </button>
    );

    // أزرار الصفحات
    const totalPages = pagination.last_page;
    const current = currentPage;
    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(totalPages, current + 2);

    // تأكد من عرض 5 أزرار إن أمكن
    if (endPage - startPage < 4) {
      if (current < 3) {
        endPage = Math.min(totalPages, 5);
      } else {
        startPage = Math.max(1, totalPages - 4);
      }
    }

    // الصفحة الأولى
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          className={`p-2 min-w-[40px] rounded border ${
            currentPage === 1
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
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

    // الصفحات الوسيطة
    for (let i = startPage; i <= endPage; i++) {
      if (i === 1 && startPage > 1) continue; // تجنب تكرار الصفحة الأولى

      pages.push(
        <button
          key={i}
          className={`p-2 min-w-[40px] rounded border ${
            currentPage === i
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
          }`}
          onClick={() => updatePagination(i)}
        >
          {i}
        </button>
      );
    }

    // الصفحة الأخيرة
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
          className={`p-2 min-w-[40px] rounded border ${
            currentPage === totalPages
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
          }`}
          onClick={() => updatePagination(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    // زر التالي
    pages.push(
      <button
        key="next"
        className={`p-2 rounded border ${
          currentPage === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
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
  // ===============================
  // 10. Main Component Return - العنصر الرئيسي
  // ===============================

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.region !== "all" ||
    filters.city !== "all" ||
    filters.date;

  const auctions = auctionsData?.data || [];
  const pagination = auctionsData?.pagination || {
    current_page: currentPage,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  };

  // الآن يمكنك استخدام console.log بعد التعريف
  console.log("=== DEBUG INFO ===");
  console.log("Auctions data:", auctionsData);
  console.log("Pagination object:", auctionsData?.pagination);
  console.log("Last page:", auctionsData?.pagination?.last_page);
  console.log("Current page:", currentPage);
  console.log("Auctions count:", auctions.length); // ✅ الآن آمن
  console.log("==================");

  const loading =
    isLoading ||
    isRefreshing ||
    approveMutation.isLoading ||
    rejectMutation.isLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        {/* الخلفية الخاصة بشريط الأدوات فقط */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiFilter className="text-blue-600" size={22} />
            <span className="text-lg font-semibold text-gray-800">
              أدوات البحث والتصفية:
            </span>
          </div>
          {hasActiveFilters && (
            <button
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 transition-colors"
              onClick={clearFilters}
            >
              <FiSlash size={16} />
              مسح الفلاتر
            </button>
          )}
        </div>
        <form onSubmit={handleSearch} className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <FiSearch
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="ابحث باسم المزاد أو الوصف..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              بحث
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
            >
              <FiRefreshCw
                className={isRefreshing ? "animate-spin" : ""}
                size={18}
              />
              {isRefreshing ? "جاري التحديث..." : "تحديث البيانات"}
            </button>
          </div>
        </form>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الحالة:
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="مفتوح">مفتوح</option>
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="مغلق">مغلق</option>
              <option value="مرفوض">مرفوض</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المنطقة:
            </label>
            <select
              value={filters.region}
              onChange={(e) => handleFilterChange("region", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع المناطق</option>
              <option value="الرياض">الرياض</option>
              <option value="مكة المكرمة">مكة المكرمة</option>
              <option value="المدينة المنورة">المدينة المنورة</option>
              <option value="القصيم">القصيم</option>
              <option value="الشرقية">الشرقية</option>
              <option value="عسير">عسير</option>
              <option value="تبوك">تبوك</option>
              <option value="حائل">حائل</option>
              <option value="الحدود الشمالية">الحدود الشمالية</option>
              <option value="جازان">جازان</option>
              <option value="نجران">نجران</option>
              <option value="الباحة">الباحة</option>
              <option value="الجوف">الجوف</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المدينة:
            </label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange("city", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع المدن</option>
              <option value="الرياض">الرياض</option>
              <option value="جدة">جدة</option>
              <option value="مكة المكرمة">مكة المكرمة</option>
              <option value="المدينة المنورة">المدينة المنورة</option>
              <option value="الدمام">الدمام</option>
              <option value="الخبر">الخبر</option>
              <option value="الظهران">الظهران</option>
              <option value="الجبيل">الجبيل</option>
              <option value="القطيف">القطيف</option>
              <option value="تبوك">تبوك</option>
              <option value="حائل">حائل</option>
              <option value="بريدة">بريدة</option>
              <option value="عنيزة">عنيزة</option>
              <option value="الرس">الرس</option>
              <option value="خميس مشيط">خميس مشيط</option>
              <option value="أبها">أبها</option>
              <option value="نجران">نجران</option>
              <option value="جازان">جازان</option>
              <option value="بيشة">بيشة</option>
              <option value="الباحة">الباحة</option>
              <option value="سكاكا">سكاكا</option>
              <option value="عرعر">عرعر</option>
              <option value="القريات">القريات</option>
              <option value="ينبع">ينبع</option>
              <option value="رابغ">رابغ</option>
              <option value="الطائف">الطائف</option>
              <option value="محايل عسير">محايل عسير</option>
              <option value="بلجرشي">بلجرشي</option>
              <option value="صبيا">صبيا</option>
              <option value="أحد رفيدة">أحد رفيدة</option>
              <option value="تثليث">تثليث</option>
              <option value="المجمعة">المجمعة</option>
              <option value="الزلفي">الزلفي</option>
              <option value="حوطة بني تميم">حوطة بني تميم</option>
              <option value="الأحساء">الأحساء</option>
              <option value="بقيق">بقيق</option>
              <option value="رأس تنورة">رأس تنورة</option>
              <option value="سيهات">سيهات</option>
              <option value="صفوى">صفوى</option>
              <option value="تاروت">تاروت</option>
              <option value="النعيرية">النعيرية</option>
              <option value="قرية العليا">قرية العليا</option>
              <option value="الخرج">الخرج</option>
              <option value="الدوادمي">الدوادمي</option>
              <option value="القويعية">القويعية</option>
              <option value="وادي الدواسر">وادي الدواسر</option>
              <option value="الافلاج">الأفلاج</option>
              <option value="رنية">رنية</option>
              <option value="بيش">بيش</option>
              <option value="الدرب">الدرب</option>
              <option value="العارضة">العارضة</option>
              <option value="أملج">أملج</option>
              <option value="ضباء">ضباء</option>
              <option value="الوجه">الوجه</option>
              <option value="العلا">العلا</option>
              <option value="خيبر">خيبر</option>
              <option value="البدائع">البدائع</option>
              <option value="الأسياح">الأسياح</option>
              <option value="رياض الخبراء">رياض الخبراء</option>
              <option value="النبهانية">النبهانية</option>
              <option value="ضرما">ضرما</option>
              <option value="حوطة سدير">حوطة سدير</option>
              <option value="تمير">تمير</option>
              <option value="الحوطة">الحوطة</option>
              <option value="الحريق">الحريق</option>
              <option value="شقراء">شقراء</option>
              <option value="عفيف">عفيف</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تاريخ المزاد:
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ترتيب حسب:
            </label>
            <select
              value={filters.sort_field}
              onChange={(e) => handleFilterChange("sort_field", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created_at">تاريخ الإنشاء</option>
              <option value="auction_date">تاريخ المزاد</option>
              <option value="title">اسم المزاد</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الاتجاه:
            </label>
            <select
              value={filters.sort_direction}
              onChange={(e) =>
                handleFilterChange("sort_direction", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">تنازلي</option>
              <option value="asc">تصاعدي</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Auctions List */}
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* شريط العنوان مع الخلفية الزرقاء */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
              قائمة المزادات ({pagination.total || 0})
            </h3>
            <div className="flex flex-col sm:items-end">
              <span className="text-sm text-gray-600">
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
                <span className="text-xs text-gray-500 mt-1">
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
              <p className="text-gray-600">جاري تحميل البيانات...</p>
            </div>
          ) : auctions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FiCalendar className="text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 text-lg mb-4">لا توجد مزادات</p>
              {hasActiveFilters && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedAuction?.id === auction.id
                        ? "bg-blue-50 border-r-4 border-blue-600"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedAuction(auction)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiCalendar className="text-blue-600" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                          {auction.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {auction.company?.auction_name || "غير محدد"}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiCalendar size={14} />
                            {formatDate(auction.auction_date)} -{" "}
                            {formatTime(auction.start_time)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiMapPin size={14} />
                            {auction.address || "غير محدد"}
                          </span>
                          {auction.region && (
                            <span className="flex items-center gap-1">
                              <FiMapPin size={14} />
                              {auction.region}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          auction.status === "مفتوح"
                            ? "bg-green-100 text-green-800"
                            : auction.status === "مرفوض"
                            ? "bg-red-100 text-red-800"
                            : auction.status === "مغلق"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {getStatusText(auction.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-sm text-gray-600">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {selectedAuction ? (
            <div className="h-full flex flex-col">
              {/* شريط عنوان المزاد باللون الأزرق المتدرج */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  تفاصيل المزاد
                </h3>
                <span className="text-sm text-gray-500">
                  ID: {selectedAuction.id}
                </span>
              </div>

              {/* محتوى تفاصيل المزاد مع scroll عند الحاجة */}
              <div className="flex-1 overflow-y-auto p-4">
                {renderAuctionDetails(selectedAuction)}
              </div>

              {/* أزرار التحكم حسب حالة المزاد */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {selectedAuction.status === "قيد المراجعة" && (
                    <>
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        onClick={() => handleApprove(selectedAuction.id)}
                        disabled={loading}
                      >
                        <FiCheck size={18} />
                        {loading ? "جاري المعالجة..." : "قبول المزاد"}
                      </button>

                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
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
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      onClick={() => handleApprove(selectedAuction.id)}
                      disabled={loading}
                    >
                      <FiCheck size={18} />
                      {loading ? "جاري المعالجة..." : "قبول المزاد"}
                    </button>
                  )}
                  {selectedAuction.status === "مفتوح" && (
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
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
              <FiCalendar className="text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 text-lg">اختر مزادًا لعرض التفاصيل</p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FiEdit size={20} />
                رفض المزاد
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600 text-xl"
                onClick={closeRejectModal}
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  placeholder="اكتب سبب رفض المزاد هنا..."
                />
                <div className="text-xs text-gray-500 mt-1">
                  هذا السبب سيظهر للشركة كتفسير لرفض مزادها
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                onClick={closeRejectModal}
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
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
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FiUser size={20} />
                تفاصيل الشركة
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600 text-xl"
                onClick={closeOwnerModal}
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {renderOwnerDetails(ownerModal.owner)}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
