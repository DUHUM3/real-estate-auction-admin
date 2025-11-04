import React, { useState, useEffect } from "react";
import {
  FiMap,
  FiMapPin,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiLayers,
  FiFilter,
  FiChevronRight,
  FiChevronLeft,
  FiImage,
  FiSearch,
  FiSlash,
  FiCheck,
  FiX,
  FiEdit,
  FiRefreshCw,
  FiHome,
  FiEye,
  FiCopy,
  FiShoppingCart,
} from "react-icons/fi";
import { useQueryClient, useQuery, useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

const AllLands = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // استرجاع الفلاتر المحفوظة أو استخدام القيم الافتراضية
  const getInitialFilters = () => {
    const savedFilters = localStorage.getItem("landsFilters");
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return {
      search: "",
      status: "all",
      region: "all",
      city: "all",
      land_type: "all",
      purpose: "all",
      user_type_id: "all",
      min_area: "",
      max_area: "",
      sort_field: "created_at",
      sort_direction: "desc",
    };
  };

  const [filters, setFilters] = useState(getInitialFilters());
  const [selectedLand, setSelectedLand] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("landsCurrentPage");
    return savedPage ? parseInt(savedPage) : 1;
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copyStatus, setCopyStatus] = useState({}); // حالة نسخ البيانات

  // حالة المودال للرفض
  const [rejectModal, setRejectModal] = useState({
    show: false,
    landId: null,
    reason: "",
  });

  // حالة المودال لعرض تفاصيل المالك
  const [ownerModal, setOwnerModal] = useState({
    show: false,
    owner: null,
  });

  // دالة نسخ النص إلى الحافظة
  const copyToClipboard = async (text, fieldName) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text.toString());

      // تحديث حالة النسخ
      setCopyStatus((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      // إخفاء رسالة النجاح بعد 2 ثانية
      setTimeout(() => {
        setCopyStatus((prev) => ({
          ...prev,
          [fieldName]: false,
        }));
      }, 2000);
    } catch (err) {
      console.error("فشل في نسخ النص: ", err);
      // استخدام الطريقة القديمة كبديل
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
    console.log("بدء تحديث بيانات الأراضي...");
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

  // حفظ الفلاتر والصفحة في localStorage عند تغييرها
  useEffect(() => {
    localStorage.setItem("landsFilters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem("landsCurrentPage", currentPage.toString());
  }, [currentPage]);

  // استعادة الأرض المحددة من localStorage إذا كانت موجودة
  useEffect(() => {
    const savedSelectedLand = localStorage.getItem("selectedLand");
    if (savedSelectedLand) {
      setSelectedLand(JSON.parse(savedSelectedLand));
    }
  }, []);

  // حفظ الأرض المحددة في localStorage
  useEffect(() => {
    if (selectedLand) {
      localStorage.setItem("selectedLand", JSON.stringify(selectedLand));
    } else {
      localStorage.removeItem("selectedLand");
    }
  }, [selectedLand]);

  const buildQueryString = () => {
    const params = new URLSearchParams();

    if (filters.search.trim()) params.append("search", filters.search.trim());
    if (filters.status !== "all") params.append("status", filters.status);
    if (filters.region !== "all") params.append("region", filters.region);
    if (filters.city !== "all") params.append("city", filters.city);
    if (filters.land_type !== "all")
      params.append("land_type", filters.land_type);
    if (filters.purpose !== "all") params.append("purpose", filters.purpose);
    if (filters.user_type_id !== "all")
      params.append("user_type_id", filters.user_type_id);
    if (filters.min_area) params.append("min_area", filters.min_area);
    if (filters.max_area) params.append("max_area", filters.max_area);
    if (filters.sort_field) params.append("sort_field", filters.sort_field);
    if (filters.sort_direction)
      params.append("sort_direction", filters.sort_direction);

    params.append("page", currentPage);

    return params.toString();
  };

  // استخدام React Query لجلب بيانات الأراضي
  const fetchLands = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      throw new Error("لم يتم العثور على رمز الدخول");
    }

    const queryString = buildQueryString();
    const url = `https://shahin-tqay.onrender.com/api/admin/properties?${queryString}`;

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
      throw new Error(`فشل في جلب الأراضي: ${errorText}`);
    }

    const result = await response.json();
    return result;
  };

  const {
    data: landsData,
    isLoading,
    error,
    refetch,
  } = useQuery(["lands", filters, currentPage], fetchLands, {
    staleTime: 5 * 60 * 1000, // 5 دقائق
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error("خطأ في جلب الأراضي:", error);
      alert("حدث خطأ أثناء جلب البيانات: " + error.message);
    },
  });

  // فتح مودال الرفض
  const openRejectModal = (landId) => {
    setRejectModal({
      show: true,
      landId,
      reason: "",
    });
  };

  // إغلاق مودال الرفض
  const closeRejectModal = () => {
    setRejectModal({
      show: false,
      landId: null,
      reason: "",
    });
  };

  // فتح مودال تفاصيل المالك
  const openOwnerModal = (owner) => {
    setOwnerModal({
      show: true,
      owner,
    });
  };

  // إغلاق مودال تفاصيل المالك
  const closeOwnerModal = () => {
    setOwnerModal({
      show: false,
      owner: null,
    });
  };

  // === التعديلات الجوهرية هنا ===
  // استخدام useMutation لتحديث حالة الأرض باستخدام الرابط الموحد
  const updateLandStatusMutation = useMutation(
    async ({ landId, status, rejection_reason }) => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("لم يتم العثور على رمز الدخول");
      }

      const requestBody =
        status === "مرفوض"
          ? {
              status,
              rejection_reason: rejection_reason || "سبب الرفض غير محدد",
            }
          : { status };

      console.log("إرسال طلب تحديث الحالة:", { landId, requestBody });

      const response = await fetch(
        `https://shahin-tqay.onrender.com/api/admin/properties/${landId}/status`,
        {
          method: "PUT", // ✅ تم تغيير الطريقة لتتناسب مع الكنترولر
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error("خطأ في تحليل JSON:", jsonError);
        throw new Error("استجابة غير صالحة من الخادم");
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `فشل في تحديث الحالة: ${response.status}`
        );
      }

      return result;
    },
    {
      onSuccess: (data, variables) => {
        const statusText =
          variables.status === "مرفوض"
            ? "الرفض"
            : variables.status === "مفتوح"
            ? "القبول"
            : variables.status === "تم البيع"
            ? "تم البيع"
            : "تحديث الحالة";

        alert(`تم ${statusText} الإعلان بنجاح`);

        // ✅ تحديث البيانات الفوري في الكاش
        queryClient.setQueryData(["lands", filters, currentPage], (oldData) => {
          if (!oldData) return oldData;

          const updatedLands = oldData.data.map((land) =>
            land.id === variables.landId
              ? {
                  ...land,
                  status: variables.status,
                  rejection_reason: variables.rejection_reason || null,
                }
              : land
          );

          return { ...oldData, data: updatedLands };
        });

        setSelectedLand(null);

        if (variables.status === "مرفوض") {
          closeRejectModal();
        }
      },
      onError: (error) => {
        console.error("خطأ في تحديث الحالة:", error);
        alert(`خطأ: ${error.message}`);
      },
    }
  );

  // ================= دوال التعامل مع الحالات =================

  const handleApprove = (landId) => {
    if (
      !window.confirm(
        'هل أنت متأكد من قبول هذا الإعلان وتغيير حالته إلى "مفتوح"؟'
      )
    )
      return;

    updateLandStatusMutation.mutate({ landId, status: "مفتوح" });
  };

  const handleReject = () => {
    if (!rejectModal.reason.trim()) {
      alert("يرجى إدخال سبب الرفض");
      return;
    }

    if (
      !window.confirm(
        'هل أنت متأكد من رفض هذا الإعلان وتغيير حالته إلى "مرفوض"؟'
      )
    )
      return;

    updateLandStatusMutation.mutate({
      landId: rejectModal.landId,
      status: "مرفوض",
      rejection_reason: rejectModal.reason,
    });
  };

  const handleMarkAsSold = (landId) => {
    if (!window.confirm('هل أنت متأكد من تغيير حالة هذه الأرض إلى "تم البيع"؟'))
      return;

    updateLandStatusMutation.mutate({ landId, status: "تم البيع" });
  };

  const handleReopen = (landId) => {
    if (
      !window.confirm(
        'هل أنت متأكد من إعادة فتح هذا الإعلان وتغيير حالته إلى "مفتوح"؟'
      )
    )
      return;

    updateLandStatusMutation.mutate({ landId, status: "مفتوح" });
  };

  const handleReturnToPending = (landId) => {
    if (
      !window.confirm(
        'هل أنت متأكد من إعادة هذه الأرض إلى حالة "قيد المراجعة"؟'
      )
    )
      return;

    updateLandStatusMutation.mutate({ landId, status: "قيد المراجعة" });
  };

  // ================= دوال الفلترة والبحث =================

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
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
      land_type: "all",
      purpose: "all",
      user_type_id: "all",
      min_area: "",
      max_area: "",
      sort_field: "created_at",
      sort_direction: "desc",
    };
    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  const updatePagination = (newPage) => setCurrentPage(newPage);

  const formatDate = (dateString) => {
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
    switch (status) {
      case "مفتوح":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
            مفتوح
          </span>
        );
      case "مرفوض":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 border border-red-200">
            مرفوض
          </span>
        );
      case "تم البيع":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            تم البيع
          </span>
        );
      case "قيد المراجعة":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
            قيد المراجعة
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
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
      case "تم البيع":
        return "تم البيع";
      case "قيد المراجعة":
        return "قيد المراجعة";
      default:
        return status;
    }
  };

  const getLandTypeBadge = (landType) => {
    switch (landType) {
      case "سكني":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            سكني
          </span>
        );
      case "تجاري":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
            تجاري
          </span>
        );
      case "زراعي":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            زراعي
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
            {landType}
          </span>
        );
    }
  };

  const getPurposeBadge = (purpose) => {
    switch (purpose) {
      case "بيع":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            بيع
          </span>
        );
      case "استثمار":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
            استثمار
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
            {purpose}
          </span>
        );
    }
  };

  // خريطة أنواع المستخدمين بالعربي
  const userTypeMap = {
    1: "مستخدم عام",
    2: "مالك أرض",
    3: "وكيل قانوني",
    4: "كيان تجاري",
    5: "وسيط عقاري",
    6: "شركة مزاد",
  };

  // دالة لعرض تفاصيل المالك
  const renderOwnerDetails = (owner) => {
    if (!owner) return null;

    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-3">المعلومات الشخصية</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* الاسم الكامل */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                الاسم الكامل
              </label>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-800">
                  {owner.full_name || "غير متوفر"}
                </span>
                {owner.full_name && (
                  <button
                    className={`p-1 rounded ${
                      copyStatus["owner_full_name"]
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                    onClick={() =>
                      copyToClipboard(owner.full_name, "owner_full_name")
                    }
                    title="نسخ الاسم الكامل"
                  >
                    <FiCopy className="text-sm" />
                  </button>
                )}
              </div>
            </div>

            {/* البريد الإلكتروني */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                البريد الإلكتروني
              </label>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-800">
                  {owner.email || "غير متوفر"}
                </span>
                {owner.email && (
                  <button
                    className={`p-1 rounded ${
                      copyStatus["owner_email"]
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                    onClick={() => copyToClipboard(owner.email, "owner_email")}
                    title="نسخ البريد الإلكتروني"
                  >
                    <FiCopy className="text-sm" />
                  </button>
                )}
              </div>
            </div>

            {/* رقم الهاتف */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                رقم الهاتف
              </label>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-800">
                  {owner.phone || "غير متوفر"}
                </span>
                {owner.phone && (
                  <button
                    className={`p-1 rounded ${
                      copyStatus["owner_phone"]
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                    onClick={() => copyToClipboard(owner.phone, "owner_phone")}
                    title="نسخ رقم الهاتف"
                  >
                    <FiCopy className="text-sm" />
                  </button>
                )}
              </div>
            </div>

            {/* نوع المستخدم */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">
                نوع المستخدم
              </label>
              <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                <span className="text-gray-800">
                  {owner.user_type_id
                    ? userTypeMap[owner.user_type_id]
                    : "غير متوفر"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLandDetails = (land) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <FiHome className="ml-1" />
              <span className="font-medium">العنوان</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-800">{land.title}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <FiUser className="ml-1" />
              <span className="font-medium">المالك</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div className="flex space-x-2 space-x-reverse">
                <button
                  className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  onClick={() => openOwnerModal(land.user)}
                  title="عرض تفاصيل المالك"
                >
                  <FiEye className="text-sm" />
                </button>
                <button
                  className={`p-1 rounded ${
                    copyStatus["owner_info"]
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                  onClick={() =>
                    copyToClipboard(
                      `${land.user?.full_name} - ${land.user?.email} - ${land.user?.phone}`,
                      "owner_info"
                    )
                  }
                  title="نسخ معلومات المالك"
                >
                  <FiCopy className="text-sm" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium text-gray-600">رقم الإعلان</div>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-800">{land.announcement_number}</span>
              <button
                className={`p-1 rounded ${
                  copyStatus["announcement_number"]
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                onClick={() =>
                  copyToClipboard(
                    land.announcement_number,
                    "announcement_number"
                  )
                }
                title="نسخ رقم الإعلان"
              >
                <FiCopy className="text-sm" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <FiMapPin className="ml-1" />
              <span className="font-medium">الموقع</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-800">
                {land.region} - {land.city}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium text-gray-600">نوع الأرض</div>
            <div>{getLandTypeBadge(land.land_type)}</div>
          </div>

          <div className="space-y-2">
            <div className="font-medium text-gray-600">الغرض</div>
            <div>{getPurposeBadge(land.purpose)}</div>
          </div>

          <div className="space-y-2">
            <div className="font-medium text-gray-600">الحالة</div>
            <div>{getStatusBadge(land.status)}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <FiLayers className="ml-1" />
              <span className="font-medium">المساحة الكلية</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-800">{land.total_area} م²</span>
            </div>
          </div>
        </div>

        {land.status === "مرفوض" && land.rejection_reason && (
          <div className="space-y-2">
            <div className="flex items-center text-red-600">
              <FiX className="ml-1" />
              <span className="font-medium">سبب الرفض</span>
            </div>
            <div className="flex items-center justify-between bg-red-50 p-2 rounded border border-red-100">
              <span className="text-red-800">{land.rejection_reason}</span>
              <button
                className={`p-1 rounded ${
                  copyStatus["rejection_reason"]
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                onClick={() =>
                  copyToClipboard(land.rejection_reason, "rejection_reason")
                }
                title="نسخ سبب الرفض"
              >
                <FiCopy className="text-sm" />
              </button>
            </div>
          </div>
        )}

        {land.price_per_sqm && (
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <FiDollarSign className="ml-1" />
              <span className="font-medium">سعر المتر</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-800">
                {land.price_per_sqm} ريال/م²
              </span>
            </div>
          </div>
        )}

        {land.estimated_investment_value && (
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <FiDollarSign className="ml-1" />
              <span className="font-medium">القيمة الاستثمارية</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-800">
                {land.estimated_investment_value} ريال
              </span>
              <button
                className={`p-1 rounded ${
                  copyStatus["investment_value"]
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                onClick={() =>
                  copyToClipboard(
                    `${land.estimated_investment_value} ريال`,
                    "investment_value"
                  )
                }
                title="نسخ القيمة الاستثمارية"
              >
                <FiCopy className="text-sm" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="font-medium text-gray-600">رقم الصك</div>
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="text-gray-800">{land.deed_number}</span>
            <button
              className={`p-1 rounded ${
                copyStatus["deed_number"]
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              onClick={() => copyToClipboard(land.deed_number, "deed_number")}
              title="نسخ رقم الصك"
            >
              <FiCopy className="text-sm" />
            </button>
          </div>
        </div>

        {land.agency_number && (
          <div className="space-y-2">
            <div className="font-medium text-gray-600">رقم الوكالة</div>
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-800">{land.agency_number}</span>
              <button
                className={`p-1 rounded ${
                  copyStatus["agency_number"]
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
                onClick={() =>
                  copyToClipboard(land.agency_number, "agency_number")
                }
                title="نسخ رقم الوكالة"
              >
                <FiCopy className="text-sm" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="font-medium text-gray-600">الإحداثيات</div>
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="text-gray-800">{land.geo_location_text}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <FiCalendar className="ml-1" />
            <span className="font-medium">تاريخ الإضافة</span>
          </div>
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="text-gray-800">{formatDate(land.created_at)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-medium text-gray-600">الوصف</div>
          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <p className="text-gray-800 leading-relaxed">{land.description}</p>
          </div>
        </div>

        {/* الأبعاد */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-3">أبعاد الأرض</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center bg-white p-3 rounded border border-gray-200">
              <span className="block text-sm text-gray-600 mb-1">الشمال</span>
              <span className="block font-medium text-gray-800">
                {land.length_north} م
              </span>
            </div>
            <div className="text-center bg-white p-3 rounded border border-gray-200">
              <span className="block text-sm text-gray-600 mb-1">الجنوب</span>
              <span className="block font-medium text-gray-800">
                {land.length_south} م
              </span>
            </div>
            <div className="text-center bg-white p-3 rounded border border-gray-200">
              <span className="block text-sm text-gray-600 mb-1">الشرق</span>
              <span className="block font-medium text-gray-800">
                {land.length_east} م
              </span>
            </div>
            <div className="text-center bg-white p-3 rounded border border-gray-200">
              <span className="block text-sm text-gray-600 mb-1">الغرب</span>
              <span className="block font-medium text-gray-800">
                {land.length_west} م
              </span>
            </div>
          </div>
        </div>

        {/* الصور */}
        {land.images && land.images.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">
              صور الأرض ({land.images.length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {land.images.map((image, index) => (
                <div
                  key={image.id}
                  className="flex flex-col items-center justify-center bg-white p-3 rounded border border-gray-200"
                >
                  <FiImage className="text-gray-400 text-xl mb-1" />
                  <span className="text-xs text-gray-600">
                    صورة {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // إنشاء أزرار الباجينيشن
  const renderPagination = () => {
    if (
      !landsData ||
      !landsData.pagination ||
      landsData.pagination.last_page <= 1
    )
      return null;

    const pages = [];
    const pagination = landsData.pagination;

    pages.push(
      <button
        key="prev"
        className={`px-3 py-1 rounded border ${
          currentPage === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => currentPage > 1 && updatePagination(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FiChevronRight />
      </button>
    );

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
          <span key={page} className="px-2 py-1">
            ...
          </span>
        );
      } else {
        pages.push(
          <button
            key={page}
            className={`px-3 py-1 rounded border ${
              currentPage === page
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => updatePagination(page)}
          >
            {page}
          </button>
        );
      }
    });

    pages.push(
      <button
        key="next"
        className={`px-3 py-1 rounded border ${
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
        <FiChevronLeft />
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
    filters.land_type !== "all" ||
    filters.purpose !== "all" ||
    filters.user_type_id !== "all" ||
    filters.min_area ||
    filters.max_area;

  // استخراج البيانات من نتيجة الاستعلام
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
      {/* شريط البحث والتصفية */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <FiFilter className="text-blue-600 ml-2" size={24} />
              <span className="font-medium text-gray-700">
                أدوات البحث والتصفية:
              </span>
            </div>

            {hasActiveFilters && (
              <button
                className="flex items-center px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                onClick={clearFilters}
              >
                <FiSlash className="ml-1" />
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSearch} className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث بالعنوان أو رقم الإعلان أو وصف الأرض..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              بحث
            </button>
            <button
              className={`flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                isRefreshing || loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
            >
              <FiRefreshCw
                className={`ml-1 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "جاري التحديث..." : "تحديث البيانات"}
            </button>
          </div>
        </form>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                الحالة:
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">جميع الحالات</option>
                <option value="قيد المراجعة">قيد المراجعة</option>
                <option value="مفتوح">مفتوح</option>
                <option value="مرفوض">مرفوض</option>
                <option value="تم البيع">تم البيع</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                المنطقة:
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange("region", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                المدينة:
              </label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                نوع الأرض:
              </label>
              <select
                value={filters.land_type}
                onChange={(e) =>
                  handleFilterChange("land_type", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">جميع الأنواع</option>
                <option value="سكني">سكني</option>
                <option value="تجاري">تجاري</option>
                <option value="زراعي">زراعي</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                الغرض:
              </label>
              <select
                value={filters.purpose}
                onChange={(e) => handleFilterChange("purpose", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">جميع الأغراض</option>
                <option value="بيع">بيع</option>
                <option value="استثمار">استثمار</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                أقل مساحة:
              </label>
              <input
                type="number"
                value={filters.min_area}
                onChange={(e) => handleFilterChange("min_area", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="0"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                أكبر مساحة:
              </label>
              <input
                type="number"
                value={filters.max_area}
                onChange={(e) => handleFilterChange("max_area", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="10000"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                ترتيب حسب:
              </label>
              <select
                value={filters.sort_field}
                onChange={(e) =>
                  handleFilterChange("sort_field", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="created_at">تاريخ الإضافة</option>
                <option value="title">العنوان</option>
                <option value="total_area">المساحة</option>
                <option value="price_per_sqm">سعر المتر</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                الاتجاه:
              </label>
              <select
                value={filters.sort_direction}
                onChange={(e) =>
                  handleFilterChange("sort_direction", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="desc">تنازلي</option>
                <option value="asc">تصاعدي</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lands List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="font-semibold text-lg text-gray-800">
                  قائمة الأراضي ({lands.length})
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

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
              </div>
            ) : lands.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiMap className="text-gray-400 text-4xl mb-4" />
                <p className="text-gray-500 mb-4">لا توجد نتائج</p>
                {hasActiveFilters && (
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={clearFilters}
                  >
                    مسح الفلاتر
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200">
                  {lands.map((land) => (
                    <div
                      key={land.id}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedLand?.id === land.id
                          ? "bg-blue-50 border-r-4 border-blue-500"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedLand(land)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FiMap className="text-blue-600 text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {land.title}
                          </h4>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {land.region} - {land.city}
                            </span>
                            <span className="flex items-center text-sm text-gray-500">
                              <FiCalendar className="ml-1 text-xs" />
                              {formatDate(land.created_at)}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {getLandTypeBadge(land.land_type)}
                            {getPurposeBadge(land.purpose)}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              land.status === "مفتوح"
                                ? "bg-green-100 text-green-800"
                                : land.status === "مرفوض"
                                ? "bg-red-100 text-red-800"
                                : land.status === "تم البيع"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {getStatusText(land.status)}
                          </div>
                          <div className="mt-2 text-sm font-medium text-gray-700">
                            {land.total_area} م²
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* الباجينيشن */}
                {pagination.last_page > 1 && (
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex justify-center items-center space-x-2 space-x-reverse">
                      {renderPagination()}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Land Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
            {selectedLand ? (
              <div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-gray-800">
                      تفاصيل الأرض
                    </h3>
                    <span className="text-sm text-gray-500">
                      ID: {selectedLand.id}
                    </span>
                  </div>
                </div>

                <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {renderLandDetails(selectedLand)}
                </div>

                <div className="p-4 border-t border-gray-200">
                  <div className="flex flex-col gap-3">
                    {/* الأزرار بناءً على الحالة الحالية */}
                    {selectedLand.status === "قيد المراجعة" && (
                      <>
                        <button
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleApprove(selectedLand.id)}
                          disabled={loading}
                        >
                          <FiCheck />
                          {loading ? "جاري المعالجة..." : "قبول (مفتوح)"}
                        </button>

                        <button
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => openRejectModal(selectedLand.id)}
                          disabled={loading}
                        >
                          <FiX />
                          {loading ? "جاري المعالجة..." : "رفض"}
                        </button>
                      </>
                    )}

                    {selectedLand.status === "مرفوض" && (
                      <>
                        <button
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleApprove(selectedLand.id)}
                          disabled={loading}
                        >
                          <FiCheck />
                          {loading ? "جاري المعالجة..." : "قبول (مفتوح)"}
                        </button>

                        <button
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleReturnToPending(selectedLand.id)}
                          disabled={loading}
                        >
                          <FiRefreshCw />
                          {loading ? "جاري المعالجة..." : "إعادة للمراجعة"}
                        </button>
                      </>
                    )}

                    {selectedLand.status === "مفتوح" && (
                      <>
                        <button
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => openRejectModal(selectedLand.id)}
                          disabled={loading}
                        >
                          <FiX />
                          {loading ? "جاري المعالجة..." : "رفض"}
                        </button>

                        <button
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleMarkAsSold(selectedLand.id)}
                          disabled={loading}
                        >
                          <FiShoppingCart />
                          {loading ? "جاري المعالجة..." : "标记 كمباعة"}
                        </button>

                        <button
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleReturnToPending(selectedLand.id)}
                          disabled={loading}
                        >
                          <FiRefreshCw />
                          {loading ? "جاري المعالجة..." : "إعادة للمراجعة"}
                        </button>
                      </>
                    )}

                    {selectedLand.status === "تم البيع" && (
                      <>
                        <button
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleApprove(selectedLand.id)}
                          disabled={loading}
                        >
                          <FiCheck />
                          {loading ? "جاري المعالجة..." : "إعادة فتح"}
                        </button>

                        <button
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleReturnToPending(selectedLand.id)}
                          disabled={loading}
                        >
                          <FiRefreshCw />
                          {loading ? "جاري المعالجة..." : "إعادة للمراجعة"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiMap className="text-gray-400 text-4xl mb-4" />
                <p className="text-gray-500">اختر أرضًا لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* مودال الرفض */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="flex items-center font-semibold text-lg text-gray-800">
                <FiEdit className="ml-2" />
                رفض الإعلان
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 text-xl"
                onClick={closeRejectModal}
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  rows="4"
                  placeholder="اكتب سبب رفض الإعلان هنا..."
                />
                <div className="text-xs text-gray-500">
                  هذا السبب سيظهر للمستخدم كتفسير لرفض إعلانه
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={closeRejectModal}
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                onClick={handleReject}
                disabled={loading}
              >
                <FiX />
                {loading ? "جاري الحفظ..." : "تأكيد الرفض"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال تفاصيل المالك */}
      {ownerModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="flex items-center font-semibold text-lg text-gray-800">
                <FiUser className="ml-2" />
                تفاصيل المالك
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 text-xl"
                onClick={closeOwnerModal}
              >
                ×
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {renderOwnerDetails(ownerModal.owner)}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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

export default AllLands;
