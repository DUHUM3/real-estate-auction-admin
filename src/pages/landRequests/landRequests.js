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
  FiFilter,
  FiChevronRight,
  FiChevronLeft,
  FiSearch,
  FiSlash,
  FiMessageSquare,
  FiEdit,
  FiRefreshCw,
  FiEye,
  FiNavigation,
  FiTarget,
  FiLayers,
  FiDollarSign,
  FiUsers,
  FiGitPullRequest,
  FiBriefcase,
  FiAward,
  FiInfo,
} from "react-icons/fi";
import { useQueryClient, useQuery, useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

// مكونات أيقونات إضافية
const FiGift = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-2h14a2 2 0 110 2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
    />
  </svg>
);

const LandRequests = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // استرجاع الفلاتر المحفوظة أو استخدام القيم الافتراضية
  const getInitialFilters = () => {
    const savedFilters = localStorage.getItem("landRequestsFilters");
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return {
      search: "",
      status: "all",
      region: "all",
      city: "all",
      purpose: "all",
      type: "all",
      area_min: "",
      area_max: "",
      date_from: "",
      date_to: "",
      sort_by: "created_at",
      sort_order: "desc",
    };
  };

  const [filters, setFilters] = useState(getInitialFilters());
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

  const handleRefresh = async () => {
    console.log("بدء تحديث بيانات طلبات الأراضي...");
    setIsRefreshing(true);

    try {
      await refetch();
      console.log("تم تحديث بيانات طلبات الأراضي بنجاح");
    } catch (error) {
      console.error("خطأ في التحديث:", error);
      alert("حدث خطأ أثناء تحديث البيانات: " + error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

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

  // حفظ الفلاتر والصفحة في localStorage عند تغييرها
  useEffect(() => {
    localStorage.setItem("landRequestsFilters", JSON.stringify(filters));
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

  const buildQueryString = () => {
    const params = new URLSearchParams();

    if (filters.search.trim()) params.append("search", filters.search.trim());
    if (filters.status !== "all") params.append("status", filters.status);
    if (filters.region !== "all") params.append("region", filters.region);
    if (filters.city !== "all") params.append("city", filters.city);
    if (filters.purpose !== "all") params.append("purpose", filters.purpose);
    if (filters.type !== "all") params.append("type", filters.type);
    if (filters.area_min) params.append("area_min", filters.area_min);
    if (filters.area_max) params.append("area_max", filters.area_max);
    if (filters.date_from) params.append("start_date", filters.date_from);
    if (filters.date_to) params.append("end_date", filters.date_to);
    if (filters.sort_by) params.append("sort_by", filters.sort_by);
    if (filters.sort_order) params.append("sort_order", filters.sort_order);

    params.append("page", currentPage);
    params.append("per_page", 10);

    return params.toString();
  };

  // استخدام React Query لجلب بيانات طلبات الأراضي
  const fetchLandRequests = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      throw new Error("لم يتم العثور على رمز الدخول");
    }

    const queryString = buildQueryString();
    const url = `https://core-api-x41.shaheenplus.sa/api/admin/land-requests?${queryString}`;

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
      throw new Error(`فشل في جلب طلبات الأراضي: ${errorText}`);
    }

    const result = await response.json();

    if (result.success && result.data) {
      return {
        data: result.data,
        pagination: result.meta || {
          current_page: currentPage,
          last_page: 1,
          per_page: 10,
          total: result.data.length,
          from: 1,
          to: result.data.length,
        },
        filtersData: {
          regions: result.meta?.filters?.regions || [],
          cities: result.meta?.filters?.cities || [],
          purposes: ["sale", "investment"],
          types: ["residential", "commercial", "industrial", "agricultural"],
          statuses: ["open", "close", "completed", "pending"], // تم تعديلها لتطابق المسموح
        },
      };
    } else {
      throw new Error(result.message || "هيكل البيانات غير متوقع");
    }
  };

  const {
    data: landRequestsData,
    isLoading,
    error,
    refetch,
  } = useQuery(["landRequests", filters, currentPage], fetchLandRequests, {
    staleTime: 5 * 60 * 1000, // 5 دقائق
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error("خطأ في جلب طلبات الأراضي:", error);
      alert("حدث خطأ أثناء جلب البيانات: " + error.message);
    },
  });

  // دالة لجلب تفاصيل المستخدم
  const fetchUserDetails = async (userId) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      throw new Error("لم يتم العثور على رمز الدخول");
    }

    const response = await fetch(
      `https://core-api-x41.shaheenplus.sa/api/admin/users/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("access_token");
      navigate("/login");
      throw new Error("انتهت جلسة الدخول أو التوكن غير صالح");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`فشل في جلب تفاصيل المستخدم: ${errorText}`);
    }

    const result = await response.json();

    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error(result.message || "هيكل البيانات غير متوقع");
    }
  };

  // فتح مودال تفاصيل المستخدم
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
      const userDetails = await fetchUserDetails(userId);
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

  // إغلاق مودال تفاصيل المستخدم
  const closeUserModal = () => {
    setUserModal({
      show: false,
      user: null,
      loading: false,
    });
  };

  // فتح مودال عرض العروض
  const openOffersModal = (offers) => {
    setOffersModal({
      show: true,
      offers: offers || [],
      loading: false,
    });
  };

  // إغلاق مودال العروض
  const closeOffersModal = () => {
    setOffersModal({
      show: false,
      offers: [],
      loading: false,
    });
  };

  // استخدام useMutation لتحديث حالة طلب الأرض
  const statusMutation = useMutation(
    async ({ requestId, status, adminNote }) => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `https://core-api-x41.shaheenplus.sa/api/admin/land-requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: status,
            admin_note: adminNote.trim() || undefined,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل في تحديث حالة الطلب");
      }

      return await response.json();
    },
    {
      onSuccess: () => {
        alert("تم تحديث حالة الطلب بنجاح");
        refetch(); // إعادة تحميل البيانات
        setSelectedRequest(null);
        closeStatusModal();
        queryClient.invalidateQueries(["landRequests"]);
      },
      onError: (error) => {
        alert(error.message);
      },
    }
  );

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
    refetch();
  };

  const clearFilters = () => {
    const defaultFilters = {
      search: "",
      status: "all",
      region: "all",
      city: "all",
      purpose: "all",
      type: "all",
      area_min: "",
      area_max: "",
      date_from: "",
      date_to: "",
      sort_by: "created_at",
      sort_order: "desc",
    };

    setFilters(defaultFilters);
    setCurrentPage(1);
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

  // تحديث الصفحة الحالية
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case "open":
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            مفتوح
          </span>
        );
      case "pending":
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            قيد المراجعة
          </span>
        );
      case "completed":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            مكتمل
          </span>
        );
      case "close":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>مغلق</span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  const getUserStatusBadge = (status) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (status) {
      case "approved":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            مقبول
          </span>
        );
      case "pending":
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            قيد المراجعة
          </span>
        );
      case "close":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            موقوف
          </span>
        );
      case "completed":
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            مكتمل
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  const getUserTypeBadge = (userType) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    switch (userType) {
      case "مالك":
        return (
          <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
            مالك
          </span>
        );
      case "وكيل شرعي":
        return (
          <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>
            وكيل شرعي
          </span>
        );
      case "شركة":
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            شركة
          </span>
        );
      case "وسيط عقاري":
        return (
          <span className={`${baseClasses} bg-cyan-100 text-cyan-800`}>
            وسيط عقاري
          </span>
        );
      case "شركة مزاد":
        return (
          <span className={`${baseClasses} bg-pink-100 text-pink-800`}>
            شركة مزاد
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {userType}
          </span>
        );
    }
  };
  const getStatusText = (status) => {
    switch (status) {
      case "open":
        return "مفتوح";
      case "close":
        return "مغلق";
      case "completed":
        return "مكتمل";
      case "pending":
        return "قيد المراجعة";
      default:
        return "غير معروف"; // حالة افتراضية لأي قيمة غير موجودة
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800";
      case "close":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-red-100 text-red-800"; // لون افتراضي للحالات غير المعروفة
    }
  };

  const getPurposeText = (purpose) => {
    switch (purpose) {
      case "sale":
        return "بيع";
      case "investment":
        return "استثمار";
      default:
        return purpose;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case "residential":
        return "سكني";
      case "commercial":
        return "تجاري";
      case "industrial":
        return "صناعي";
      case "agricultural":
        return "زراعي";
      default:
        return type;
    }
  };

  const getStatusMessagePlaceholder = (status) => {
    switch (status) {
      case "completed":
        return "اكتب رسالة للمستخدم توضح إتمام الطلب...";
      case "pending":
        return "اكتب ملاحظات حول طلب قيد المراجعة...";
      case "close":
        return "اكتب سبب إغلاق الطلب...";
      case "open":
        return "اكتب ملاحظات إضافية حول الطلب...";
      default:
        return "اكتب ملاحظات إضافية...";
    }
  };

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

  // إنشاء أزرار الباجينيشن
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

  // استخراج البيانات من نتيجة الاستعلام
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
    statuses: ["open", "close", "completed", "pending"], // تم تعديلها هنا
  };

  const loading = isLoading || isRefreshing || statusMutation.isLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* شريط البحث والتصفية */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                أدوات البحث والتصفية:
              </span>
            </div>
            {hasActiveFilters && (
              <button
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                onClick={clearFilters}
              >
                <FiSlash className="w-4 h-4" />
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSearch} className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث باسم المستخدم أو الوصف..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              بحث
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                isRefreshing || loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
            >
              <FiRefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "جاري التحديث..." : "تحديث البيانات"}
            </button>
          </div>
        </form>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المنطقة:
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange("region", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">جميع المناطق</option>
                {filtersData.regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المدينة:
              </label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">جميع المدن</option>
                {filtersData.cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الغرض:
              </label>
              <select
                value={filters.purpose}
                onChange={(e) => handleFilterChange("purpose", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">جميع الأغراض</option>
                {filtersData.purposes.map((purpose) => (
                  <option key={purpose} value={purpose}>
                    {getPurposeText(purpose)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                النوع:
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">جميع الأنواع</option>
                {filtersData.types.map((type) => (
                  <option key={type} value={type}>
                    {getTypeText(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحالة:
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">جميع الحالات</option>
                {filtersData.statuses.map((status) => (
                  <option key={status} value={status}>
                    {getStatusText(status)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المساحة من (م²):
              </label>
              <input
                type="number"
                value={filters.area_min}
                onChange={(e) => handleFilterChange("area_min", e.target.value)}
                placeholder="أدنى مساحة"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المساحة إلى (م²):
              </label>
              <input
                type="number"
                value={filters.area_max}
                onChange={(e) => handleFilterChange("area_max", e.target.value)}
                placeholder="أقصى مساحة"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                من تاريخ:
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  handleFilterChange("date_from", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                إلى تاريخ:
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ترتيب حسب:
              </label>
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange("sort_by", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="created_at">تاريخ الطلب</option>
                <option value="area">المساحة</option>
                <option value="region">المنطقة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الاتجاه:
              </label>
              <select
                value={filters.sort_order}
                onChange={(e) =>
                  handleFilterChange("sort_order", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="desc">تنازلي</option>
                <option value="asc">تصاعدي</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Land Requests List */}
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

        {/* Request Details */}
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
