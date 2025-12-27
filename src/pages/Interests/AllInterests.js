import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiMap,
  FiCheck,
  FiX,
  FiMail,
  FiPhone,
  FiCalendar,
  FiFileText,
  FiHome,
  FiChevronRight,
  FiChevronLeft,
  FiMessageSquare,
  FiEdit,
  FiRefreshCw,
  FiEye,
  FiNavigation,
  FiTarget,
  FiLayers,
  FiUsers,
  FiGitPullRequest,
  FiBriefcase,
  FiAward,
  FiInfo,
} from "react-icons/fi";
import { useQueryClient, useQuery, useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

// استيراد المكونات والدوال من الملفات المنفصلة
import LandRequestsFilters from "./InterestsFilters";
import {
  filtersManager,
  fetchLandRequests,
  fetchUserDetails,
  updateLandRequestStatus,
  formatDate,
  getStatusBadge,
  getUserStatusBadge,
  getUserTypeBadge,
  getStatusText,
  getStatusColor,
  getPurposeText,
  getTypeText,
  getStatusMessagePlaceholder,
  FiGift,
} from "../../services/landRequestsAPI";

const LandRequests = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ========== الحالات والمتغيرات ==========
  const [filters, setFilters] = useState(filtersManager.getInitialFilters());
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("landRequestsCurrentPage");
    return savedPage ? parseInt(savedPage) : 1;
  });

  const [statusModal, setStatusModal] = useState({
    show: false,
    requestId: null,
    newStatus: "",
    adminNote: "",
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // حالة المودال لعرض تفاصيل المستخدم
  const [userModal, setUserModal] = useState({
    show: false,
    user: null,
    loading: false,
  });

  // حالة المودال لعرض العروض
  const [offersModal, setOffersModal] = useState({
    show: false,
    offers: [],
    loading: false,
  });

  // ========== تأثيرات ==========
  // حفظ الفلاتر والصفحة في localStorage عند تغييرها
  useEffect(() => {
    filtersManager.saveFilters(filters);
  }, [filters]);

  useEffect(() => {
    localStorage.setItem("landRequestsCurrentPage", currentPage.toString());
  }, [currentPage]);

  // استعادة الطلب المحدد من localStorage إذا كان موجوداً
  useEffect(() => {
    const savedSelectedRequest = localStorage.getItem("selectedLandRequest");
    if (savedSelectedRequest) {
      setSelectedRequest(JSON.parse(savedSelectedRequest));
    }
  }, []);

  // حفظ الطلب المحدد في localStorage
  useEffect(() => {
    if (selectedRequest) {
      localStorage.setItem(
        "selectedLandRequest",
        JSON.stringify(selectedRequest)
      );
    } else {
      localStorage.removeItem("selectedLandRequest");
    }
  }, [selectedRequest]);

  // ========== دوال التحديث ==========
  const handleRefresh = async () => {
    console.log("بدء تحديث بيانات طلبات الأراضي...");
    setIsRefreshing(true);

    try {
      // إزالة جميع بيانات التخزين المؤقت
      await queryClient.invalidateQueries(["landRequests"]);
      await queryClient.refetchQueries(["landRequests"], { 
        active: true,
        exact: false 
      });
      console.log("تم تحديث بيانات طلبات الأراضي بنجاح");
    } catch (error) {
      console.error("خطأ في التحديث:", error);
      alert("حدث خطأ أثناء تحديث البيانات: " + error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ========== React Query ==========
  const {
    data: landRequestsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ["landRequests", filters, currentPage],
    () => fetchLandRequests(filters, currentPage, navigate),
    {
      cacheTime: 0,
      staleTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      keepPreviousData: false,
      onError: (error) => {
        console.error("خطأ في جلب طلبات الأراضي:", error);
        alert("حدث خطأ أثناء جلب البيانات: " + error.message);
      },
    }
  );

  // ========== دوال التحكم في الفلاتر ==========
  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };

    setFilters(newFilters);

    // إعادة ضبط الصفحة عند تغيير الفلاتر
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
    const defaultFilters = filtersManager.clearFilters();
    setFilters(defaultFilters);
    setCurrentPage(1);
    queryClient.invalidateQueries(["landRequests"]);
  };

  // ========== دوال المودالات ==========
  const openUserModal = async (userId) => {
    if (!userId) {
      alert("لا يوجد معرف للمستخدم");
      return;
    }

    setUserModal({
      show: true,
      user: null,
      loading: true,
    });

    try {
      const userDetails = await fetchUserDetails(userId, navigate);
      setUserModal({
        show: true,
        user: userDetails,
        loading: false,
      });
    } catch (error) {
      console.error("خطأ في جلب تفاصيل المستخدم:", error);
      alert("حدث خطأ أثناء جلب تفاصيل المستخدم: " + error.message);
      setUserModal({
        show: false,
        user: null,
        loading: false,
      });
    }
  };

  const closeUserModal = () => {
    setUserModal({
      show: false,
      user: null,
      loading: false,
    });
  };

  const openOffersModal = (offers) => {
    setOffersModal({
      show: true,
      offers: offers || [],
      loading: false,
    });
  };

  const closeOffersModal = () => {
    setOffersModal({
      show: false,
      offers: [],
      loading: false,
    });
  };

  const openStatusModal = (requestId, newStatus) => {
    setStatusModal({
      show: true,
      requestId,
      newStatus,
      adminNote: "",
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      show: false,
      requestId: null,
      newStatus: "",
      adminNote: "",
    });
  };

  // ========== تحديث الحالة ==========
  const statusMutation = useMutation(
    ({ requestId, status, adminNote }) =>
      updateLandRequestStatus(requestId, status, adminNote),
    {
      onSuccess: async () => {
        alert("تم تحديث حالة الطلب بنجاح");
        // إزالة التخزين المؤقت وإعادة جلب البيانات
        await queryClient.invalidateQueries(["landRequests"]);
        await refetch();
        setSelectedRequest(null);
        closeStatusModal();
      },
      onError: (error) => {
        alert(error.message);
      },
    }
  );

  const handleStatusUpdate = async () => {
    if (!statusModal.requestId || !statusModal.newStatus) {
      alert("بيانات غير مكتملة");
      return;
    }

    statusMutation.mutate({
      requestId: statusModal.requestId,
      status: statusModal.newStatus,
      adminNote: statusModal.adminNote,
    });
  };

  // ========== دالة الباجينيشن ==========
  const updatePagination = (newPage) => {
    setCurrentPage(newPage);
  };

  const renderPagination = () => {
    if (
      !landRequestsData ||
      !landRequestsData.pagination ||
      landRequestsData.pagination.last_page <= 1
    )
      return null;

    const pages = [];
    const pagination = landRequestsData.pagination;

    pages.push(
      <button
        key="prev"
        className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => currentPage > 1 && updatePagination(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FiChevronRight className="w-4 h-4" />
      </button>
    );

    // أزرار الصفحات
    const showPages = [];
    showPages.push(1);

    if (currentPage > 3) {
      showPages.push("ellipsis-start");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(pagination.last_page - 1, currentPage + 1);
      i++
    ) {
      showPages.push(i);
    }

    if (currentPage < pagination.last_page - 2) {
      showPages.push("ellipsis-end");
    }

    if (pagination.last_page > 1) {
      showPages.push(pagination.last_page);
    }

    const uniquePages = [...new Set(showPages)];

    uniquePages.forEach((page) => {
      if (page === "ellipsis-start" || page === "ellipsis-end") {
        pages.push(
          <span
            key={page}
            className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
          >
            ...
          </span>
        );
      } else {
        pages.push(
          <button
            key={page}
            className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
              currentPage === page
                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
            }`}
            onClick={() => updatePagination(page)}
          >
            {page}
          </button>
        );
      }
    });

    // زر الصفحة التالية
    pages.push(
      <button
        key="next"
        className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
          currentPage === pagination.last_page
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() =>
          currentPage < pagination.last_page &&
          updatePagination(currentPage + 1)
        }
        disabled={currentPage === pagination.last_page}
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>
    );

    return pages;
  };

  // ========== دوال المساعدة للعرض ==========
  // دالة لترجمة أسماء الحقول في تفاصيل المستخدم
  const getUserDetailFieldLabel = (fieldName) => {
    const labels = {
      id: "رقم المعرف",
      user_id: "رقم المستخدم",
      national_id: "رقم الهوية",
      commercial_registration: "السجل التجاري",
      license_number: "رقم الترخيص",
      agency_number: "رقم الوكالة",
      deed_number: "رقم الصك",
      bank_account: "الحساب البنكي",
      address: "العنوان",
      city: "المدينة",
      region: "المنطقة",
      created_at: "تاريخ الإنشاء",
      updated_at: "تاريخ التحديث",
    };

    return labels[fieldName] || fieldName;
  };

  // دالة لعرض تفاصيل المستخدم في المودال بناءً على الهيكل الجديد
  const renderUserDetails = (user) => {
    if (!user) return null;

    // تحديد نوع المستخدم والتفاصيل المرتبطة به
    const getUserTypeDetails = () => {
      const userType = user.user_type;
      const details = user.details || {};

      switch (userType) {
        case "مالك":
          return {
            icon: <FiUser className="w-4 h-4" />,
            title: "معلومات المالك",
            data: details.land_owner,
          };
        case "وكيل شرعي":
          return {
            icon: <FiBriefcase className="w-4 h-4" />,
            title: "معلومات الوكيل الشرعي",
            data: details.legal_agent,
          };
        case "شركة":
          return {
            icon: <FiAward className="w-4 h-4" />,
            title: "معلومات الشركة",
            data: details.business_entity,
          };
        case "وسيط عقاري":
          return {
            icon: <FiAward className="w-4 h-4" />,
            title: "معلومات الوسيط العقاري",
            data: details.real_estate_broker,
          };
        case "شركة مزاد":
          return {
            icon: <FiGift className="w-4 h-4" />,
            title: "معلومات شركة المزاد",
            data: details.auction_company,
          };
        default:
          return {
            icon: <FiUser className="w-4 h-4" />,
            title: "معلومات المستخدم",
            data: null,
          };
      }
    };

    const userTypeDetails = getUserTypeDetails();

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            المعلومات الأساسية
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الاسم الكامل
              </label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {user.full_name || "غير متوفر"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {user.email || "غير متوفر"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الهاتف
              </label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {user.phone || "غير متوفر"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                حالة المستخدم
              </label>
              <div className="text-sm text-green-900 bg-gray-50 p-2 rounded">
                {getUserStatusBadge(user.status)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع المستخدم
              </label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {getUserTypeBadge(user.user_type)}
              </div>
            </div>
            <div></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            معلومات التسجيل
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تاريخ التسجيل
              </label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {formatDate(user.created_at)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                آخر تحديث
              </label>
              <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                {formatDate(user.updated_at)}
              </div>
            </div>
          </div>
        </div>

        {user.admin_message && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              رسالة المسؤول
            </h4>
            <div className="text-sm text-gray-900 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              {user.admin_message}
            </div>
          </div>
        )}

        {/* عرض التفاصيل الخاصة بنوع المستخدم */}
        {userTypeDetails.data && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              {userTypeDetails.icon}
              {userTypeDetails.title}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(userTypeDetails.data).map(
                ([key, value]) =>
                  value && (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {getUserDetailFieldLabel(key)}
                      </label>
                      <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {value}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {/* إذا لم تكن هناك تفاصيل إضافية */}
        {!userTypeDetails.data && user.user_type && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              {userTypeDetails.icon}
              {userTypeDetails.title}
            </h4>
            <div className="text-center py-8">
              <FiInfo className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                لا توجد تفاصيل إضافية متاحة
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // دالة لعرض العروض في المودال
  const renderOffers = (offers) => {
    if (!offers || offers.length === 0) {
      return (
        <div className="text-center py-12">
          <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">لا توجد عروض لهذا الطلب</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {offers.map((offer, index) => (
          <div
            key={offer.offer_id || index}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">
                  {offer.offer_user?.name || "مستخدم غير معروف"}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(offer.created_at)}
              </span>
            </div>
            <div className="flex items-start gap-2 mb-3">
              <FiMessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
              <p className="text-sm text-gray-700 flex-1">{offer.message}</p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <FiMail className="w-3 h-3" />
                {offer.offer_user?.email || "غير متوفر"}
              </span>
              <span className="flex items-center gap-1">
                <FiPhone className="w-3 h-3" />
                {offer.offer_user?.phone || "غير متوفر"}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRequestDetails = (request) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FiUser className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">
                اسم مقدم الطلب
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-900">
                  {request.user?.name || request.user?.full_name || "غير معروف"}
                </span>
                {request.user?.id && (
                  <button
                    className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={() => openUserModal(request.user.id)}
                    title="عرض تفاصيل المستخدم"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FiMail className="w-5 h-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">
                البريد الإلكتروني
              </div>
              <div className="text-gray-900">
                {request.user?.email || "غير متوفر"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FiPhone className="w-5 h-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">
                رقم الهاتف
              </div>
              <div className="text-gray-900">
                {request.user?.phone || "غير متوفر"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FiNavigation className="w-5 h-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">المنطقة</div>
              <div className="text-gray-900">{request.region}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FiHome className="w-5 h-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">المدينة</div>
              <div className="text-gray-900">{request.city}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FiTarget className="w-5 h-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">الغرض</div>
              <div className="text-gray-900">
                {getPurposeText(request.purpose)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FiLayers className="w-5 h-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">النوع</div>
              <div className="text-gray-900">{getTypeText(request.type)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">المساحة</div>
              <div className="text-gray-900">{request.area} م²</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">
                عدد العروض
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-900">
                  {request.offers?.length || 0} عرض
                </span>
                {request.offers && request.offers.length > 0 && (
                  <button
                    className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={() => openOffersModal(request.offers)}
                    title="عرض العروض"
                  >
                    <FiGitPullRequest className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-700">الحالة</div>
              <div className="text-gray-900">
                {getStatusBadge(request.status)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FiCalendar className="w-5 h-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">
                تاريخ الطلب
              </div>
              <div className="text-gray-900">
                {formatDate(request.created_at)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FiMessageSquare className="w-5 h-5 text-gray-500" />
            <div className="text-sm font-medium text-gray-700">الوصف</div>
          </div>
          <div className="text-gray-900 bg-white p-3 rounded border">
            {request.description || "لا يوجد وصف"}
          </div>
        </div>
      </div>
    );
  };

  // ========== تحضير البيانات ==========
 const requests = landRequestsData?.data || [];
const pagination = landRequestsData?.pagination || {
  current_page: currentPage,
  last_page: 1,
  per_page: 10,
  total: 0,
  from: 0,
  to: 0,
};

// إنشاء بيانات الفلاتر مع الخيارات المناسبة
const filtersData = {
  status_options: [
    { value: "all", label: "جميع الحالات" },
    { value: "open", label: "مفتوحة" },
    { value: "pending", label: "قيد المراجعة" },
    { value: "completed", label: "مكتملة" },
    { value: "close", label: "مغلقة" }
  ],
  // يمكنك إضافة خيارات أخرى هنا إذا كنت تحتاجها
  ...landRequestsData?.filtersData
};
  // التحقق إذا كان هناك أي فلتر نشط
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

  const loading = isLoading || isRefreshing || statusMutation.isLoading;

  // ========== واجهة المستخدم ==========
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* الفلاتر */}
      <LandRequestsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClearFilters={clearFilters}
        filtersData={filtersData}
        loading={loading}
        hasActiveFilters={hasActiveFilters}
        handleRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        getPurposeText={getPurposeText}
        getTypeText={getTypeText}
        getStatusText={getStatusText}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* قائمة طلبات الأراضي */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-medium text-gray-900">
                  قائمة طلبات الأراضي ({requests.length})
                </h3>
                <span className="text-sm text-gray-500">
                  {pagination.total > 0 ? (
                    <>
                      عرض {pagination.from} إلى {pagination.to} من{" "}
                      {pagination.total} - الصفحة {pagination.current_page} من{" "}
                      {pagination.last_page}
                    </>
                  ) : (
                    "لا توجد نتائج"
                  )}
                </span>
              </div>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex space-x-2">
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
                  <p className="mt-4 text-sm text-gray-500">
                    جاري تحميل البيانات...
                  </p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12">
                  <FiMap className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">لا توجد نتائج</p>
                  {hasActiveFilters && (
                    <button
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={clearFilters}
                    >
                      مسح الفلاتر
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedRequest?.id === request.id
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedRequest(request)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <FiUser className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {request.user?.name ||
                                    request.user?.full_name ||
                                    "مستخدم غير معروف"}
                                </h4>
                                <div
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    request.status
                                  )}`}
                                >
                                  {getStatusText(request.status)}
                                </div>
                              </div>
                              <div className="space-y-1 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <FiNavigation className="w-3 h-3" />
                                  <span>
                                    {request.region} - {request.city}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FiTarget className="w-3 h-3" />
                                  <span>
                                    {getPurposeText(request.purpose)} -{" "}
                                    {getTypeText(request.type)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FiCalendar className="w-3 h-3" />
                                  <span>{formatDate(request.created_at)}</span>
                                </div>
                                {request.description && (
                                  <div className="flex items-start gap-1">
                                    <FiMessageSquare className="w-3 h-3 mt-0.5" />
                                    <span className="line-clamp-1">
                                      {request.description}
                                    </span>
                                  </div>
                                )}
                                {request.offers &&
                                  request.offers.length > 0 && (
                                    <div className="flex items-center gap-1 text-blue-600">
                                      <FiGitPullRequest className="w-3 h-3" />
                                      <span>{request.offers.length} عرض</span>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* الباجينيشن */}
                  {pagination.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-center">
                      <div className="flex items-center space-x-1">
                        {renderPagination()}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* تفاصيل الطلب */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
            {selectedRequest ? (
              <div>
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      تفاصيل طلب الأرض
                    </h3>
                    <span className="text-sm text-gray-500">
                      ID: {selectedRequest.id}
                    </span>
                  </div>
                </div>

                <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {renderRequestDetails(selectedRequest)}
                </div>

                <div className="p-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2">
                    {/* زر إكمال */}
                    <button
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        openStatusModal(selectedRequest.id, "completed")
                      }
                      disabled={
                        selectedRequest.status === "completed" || loading
                      }
                    >
                      <FiCheck className="w-4 h-4" />
                      إكمال
                    </button>

                    {/* زر قيد المراجعة */}
                    <button
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        openStatusModal(selectedRequest.id, "pending")
                      }
                      disabled={selectedRequest.status === "pending" || loading}
                    >
                      <FiFileText className="w-4 h-4" />
                      قيد المراجعة
                    </button>

                    {/* زر إغلاق */}
                    <button
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        openStatusModal(selectedRequest.id, "close")
                      }
                      disabled={selectedRequest.status === "close" || loading}
                    >
                      <FiX className="w-4 h-4" />
                      إغلاق
                    </button>

                    {/* زر إعادة فتح */}
                    <button
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        openStatusModal(selectedRequest.id, "open")
                      }
                      disabled={selectedRequest.status === "open" || loading}
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      إعادة فتح
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FiMap className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  اختر طلب أرض لعرض التفاصيل
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== المودالات ========== */}

      {/* مودال تغيير الحالة */}
      {statusModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <FiEdit className="w-5 h-5 text-gray-500" />
                تغيير حالة الطلب
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 transition-colors"
                onClick={closeStatusModal}
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة الجديدة
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      statusModal.newStatus
                    )}`}
                  >
                    {getStatusText(statusModal.newStatus)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رسالة / ملاحظات إضافية
                </label>
                <textarea
                  value={statusModal.adminNote}
                  onChange={(e) =>
                    setStatusModal((prev) => ({
                      ...prev,
                      adminNote: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  rows="4"
                  placeholder={getStatusMessagePlaceholder(
                    statusModal.newStatus
                  )}
                />
                <div className="mt-1 text-xs text-gray-500">
                  هذه الرسالة ستظهر للمستخدم كتفسير لتغيير الحالة
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={closeStatusModal}
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={handleStatusUpdate}
                disabled={loading}
              >
                <FiCheck className="w-4 h-4" />
                {loading ? "جاري الحفظ..." : "تأكيد التغيير"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال تفاصيل المستخدم */}
      {userModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* العنوان */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <FiUser className="w-5 h-5 text-gray-500" />
                تفاصيل المستخدم
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 transition-colors text-2xl leading-none"
                onClick={closeUserModal}
              >
                ×
              </button>
            </div>

            {/* محتوى المودال مع Scroll */}
            <div className="p-4 overflow-y-auto flex-1">
              {userModal.loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex space-x-2">
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
                  <p className="mt-4 text-sm text-gray-500">
                    جاري تحميل تفاصيل المستخدم...
                  </p>
                </div>
              ) : (
                renderUserDetails(userModal.user)
              )}
            </div>

            {/* زر الإغلاق */}
            <div className="flex items-center justify-end p-4 border-t border-gray-200">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={closeUserModal}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال عرض العروض */}
      {offersModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <FiGitPullRequest className="w-5 h-5 text-gray-500" />
                العروض المقدمة للطلب
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 transition-colors"
                onClick={closeOffersModal}
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              {renderOffers(offersModal.offers)}
            </div>
            <div className="flex items-center justify-end p-4 border-t border-gray-200">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={closeOffersModal}
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

export default LandRequests;