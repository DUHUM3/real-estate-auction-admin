import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiUsers,
  FiCheck,
  FiRefreshCw,
  FiX,
  FiMail,
  FiPhone,
  FiCalendar,
  FiFileText,
  FiHash,
  FiFilter,
  FiChevronRight,
  FiChevronLeft,
  FiSearch,
  FiSlash,
  FiEdit,
  FiCopy,
  FiInfo,
} from "react-icons/fi";
import { useQueryClient, useQuery, useMutation } from "react-query";
import { useNavigate, useLocation } from "react-router-dom";

// ==============================================
// الأجزاء الرئيسية في الكود:
// 1. الاستيرادات والمكتبات
// 2. تعريف المكون الرئيسي AllUsers
// 3. تعريف المتغيرات الأساسية والهوكات
// 4. دوال إدارة الحالة والتخزين المحلي
// 5. دوال النسخ إلى الحافظة
// 6. دوال بناء استعلامات API
// 7. دوال جلب البيانات من API
// 8. دوال إدارة الفلاتر والبحث
// 9. دوال إدارة المستخدمين (قبول/رفض)
// 10. دوال المساعدة والعرض
// 11. دوال عرض واجهة المستخدم
// 12. دوال الباجينيشن
// 13. عرض المكون الرئيسي
// ==============================================

const AllUsers = () => {
  // ==============================================
  // الجزء 3: تعريف المتغيرات الأساسية والهوكات
  // ==============================================

  // تعريف الهوكات الأساسية
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  // دالة استرجاع الفلاتر المحفوظة من localStorage
  const getInitialFilters = () => {
    const savedFilters = localStorage.getItem("usersFilters");
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
    return {
      search: "",
      status: "all",
      user_type_id: "all",
      sort_field: "created_at",
      sort_direction: "desc",
    };
  };

  // تعريف حالات المكون
  const [filters, setFilters] = useState(getInitialFilters());
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("usersCurrentPage");
    return savedPage ? parseInt(savedPage) : 1;
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copyStatus, setCopyStatus] = useState({});

  // حالة المودال للرفض
  const [rejectModal, setRejectModal] = useState({
    show: false,
    userId: null,
    adminMessage: "",
  });

  // ==============================================
  // الجزء 4: دوال إدارة الحالة والتخزين المحلي
  // ==============================================

  // حفظ الفلاتر في localStorage عند التغيير
  useEffect(() => {
    localStorage.setItem("usersFilters", JSON.stringify(filters));
  }, [filters]);

  // حفظ الصفحة الحالية في localStorage
  useEffect(() => {
    localStorage.setItem("usersCurrentPage", currentPage.toString());
  }, [currentPage]);

  // استعادة المستخدم المحدد من localStorage
  useEffect(() => {
    const savedSelectedUser = localStorage.getItem("selectedUser");
    if (savedSelectedUser) {
      setSelectedUser(JSON.parse(savedSelectedUser));
    }
  }, []);

  // حفظ المستخدم المحدد في localStorage
  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
    } else {
      localStorage.removeItem("selectedUser");
    }
  }, [selectedUser]);

  // ==============================================
  // الجزء 5: دوال النسخ إلى الحافظة
  // ==============================================

  // دالة نسخ النص إلى الحافظة
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

  // ==============================================
  // الجزء 6: دوال بناء استعلامات API
  // ==============================================

  // دالة بناء استعلام البحث
  const buildQueryString = () => {
    const params = new URLSearchParams();

    if (filters.search.trim()) params.append("search", filters.search.trim());
    if (filters.status !== "all") params.append("status", filters.status);
    if (filters.user_type_id !== "all")
      params.append("user_type_id", filters.user_type_id);
    if (filters.sort_field) params.append("sort_field", filters.sort_field);
    if (filters.sort_direction)
      params.append("sort_direction", filters.sort_direction);

    params.append("page", currentPage);

    return params.toString();
  };

  // ==============================================
  // الجزء 7: دوال جلب البيانات من API
  // ==============================================

  // دالة جلب بيانات المستخدمين من API
  const fetchUsers = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      throw new Error("لم يتم العثور على رمز الدخول");
    }

    const queryString = buildQueryString();
    const url = `https://shahin-tqay.onrender.com/api/admin/users?${queryString}`;

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
      throw new Error(`فشل في جلب المستخدمين: ${errorText}`);
    }

    const result = await response.json();
    return result;
  };

  // استخدام React Query لجلب البيانات
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery(["users", filters, currentPage], fetchUsers, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error("خطأ في جلب المستخدمين:", error);
      alert("حدث خطأ أثناء جلب البيانات: " + error.message);
    },
  });

  // دالة تحديث البيانات يدوياً
  const handleRefresh = async () => {
    console.log("بدء تحديث البيانات...");
    setIsRefreshing(true);
    setActionLoading(true);

    try {
      await refetch();
    } catch (error) {
      console.error("خطأ في التحديث:", error);
      alert("حدث خطأ أثناء تحديث البيانات: " + error.message);
    } finally {
      setIsRefreshing(false);
      setActionLoading(false);
    }
  };

  // ==============================================
  // الجزء 8: دوال إدارة الفلاتر والبحث
  // ==============================================

  // دالة تغيير الفلاتر
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

  // دالة البحث
  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  // دالة مسح الفلاتر
  const clearFilters = () => {
    const defaultFilters = {
      search: "",
      status: "all",
      user_type_id: "all",
      sort_field: "created_at",
      sort_direction: "desc",
    };

    setFilters(defaultFilters);
    setCurrentPage(1);
  };

  // ==============================================
  // الجزء 9: دوال إدارة المستخدمين (قبول/رفض)
  // ==============================================

  // فتح مودال الرفض
  const openRejectModal = (userId) => {
    setRejectModal({
      show: true,
      userId,
      adminMessage: "",
    });
  };

  // إغلاق مودال الرفض
  const closeRejectModal = () => {
    setRejectModal({
      show: false,
      userId: null,
      adminMessage: "",
    });
  };

  // طلب قبول المستخدم
  const approveMutation = useMutation(
    async (userId) => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `https://shahin-tqay.onrender.com/api/admin/users/${userId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل في قبول المستخدم");
      }

      return await response.json();
    },
    {
      onSuccess: (data) => {
        alert("تم قبول المستخدم بنجاح");

        // ✅ تحديث الكاش محلياً مباشرة بعد الموافقة
        queryClient.setQueryData(["users", filters, currentPage], (oldData) => {
          if (!oldData) return oldData;
          const updatedUsers = oldData.data.map((user) =>
            user.id === data.data.id ? data.data : user
          );
          return { ...oldData, data: updatedUsers };
        });

        setSelectedUser(null);
      },
      onError: (error) => {
        alert(error.message);
      },
    }
  );

  // طلب رفض المستخدم
  const rejectMutation = useMutation(
    async ({ userId, adminMessage }) => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `https://shahin-tqay.onrender.com/api/admin/users/${userId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ admin_message: adminMessage }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل في رفض المستخدم");
      }

      return await response.json();
    },
    {
      onSuccess: (data) => {
        alert("تم رفض المستخدم بنجاح");

        // ✅ تحديث الكاش محلياً مباشرة بعد الرفض
        queryClient.setQueryData(["users", filters, currentPage], (oldData) => {
          if (!oldData) return oldData;
          const updatedUsers = oldData.data.map((user) =>
            user.id === data.data.id ? data.data : user
          );
          return { ...oldData, data: updatedUsers };
        });

        setSelectedUser(null);
        closeRejectModal();
      },
      onError: (error) => {
        alert(error.message);
      },
    }
  );

  // دالة قبول المستخدم
  const handleApprove = async (userId) => {
    if (!window.confirm("هل أنت متأكد من قبول هذا المستخدم؟")) return;
    approveMutation.mutate(userId);
  };

  // دالة رفض المستخدم
  const handleReject = async () => {
    if (!rejectModal.adminMessage.trim()) {
      alert("يرجى إدخال سبب الرفض");
      return;
    }

    if (!window.confirm("هل أنت متأكد من رفض هذا المستخدم؟")) return;

    rejectMutation.mutate({
      userId: rejectModal.userId,
      adminMessage: rejectModal.adminMessage,
    });
  };

  // ==============================================
  // الجزء 10: دوال المساعدة والعرض
  // ==============================================

  // دالة تحديث الصفحة الحالية
  const updatePagination = (newPage) => {
    setCurrentPage(newPage);
  };

  // دالة تنسيق التاريخ
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

  // دالة عرض حالة المستخدم
  const getStatusBadge = (status) => {
    const baseClasses =
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";

    switch (status) {
      case "pending":
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            قيد المراجعة
          </span>
        );
      case "approved":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            مقبول
          </span>
        );
      case "rejected":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            مرفوض
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            غير معروف
          </span>
        );
    }
  };

  // دالة نص حالة المستخدم
  const getUserStatusText = (status) => {
    switch (status) {
      case "pending":
        return "قيد المراجعة";
      case "approved":
        return "مقبول";
      case "rejected":
        return "مرفوض";
      default:
        return "غير معروف";
    }
  };

  // دالة الحصول على اسم نوع المستخدم
  const getUserTypeName = (user) => {
    return user.user_type?.type_name || "مستخدم عام";
  };

  // ==============================================
  // الجزء 11: دوال عرض واجهة المستخدم
  // ==============================================

  // دالة عرض تفاصيل المستخدم الكاملة
  const renderCompleteUserDetails = (user) => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FiInfo className="text-blue-500" />
              المعلومات الأساسية
            </h4>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiUser className="text-gray-400" />
                <span>الاسم الكامل</span>
              </div>
              <div className="text-gray-800 font-medium">{user.full_name}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiMail className="text-gray-400" />
                <span>البريد الإلكتروني</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">{user.email}</span>
                <button
                  className={`p-1 rounded transition-colors ${
                    copyStatus["email"]
                      ? "bg-green-100 text-green-600"
                      : "hover:bg-gray-100 text-gray-500"
                  }`}
                  onClick={() => copyToClipboard(user.email, "email")}
                  title="نسخ البريد الإلكتروني"
                >
                  <FiCopy size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiPhone className="text-gray-400" />
                <span>رقم الهاتف</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">{user.phone}</span>
                <button
                  className={`p-1 rounded transition-colors ${
                    copyStatus["phone"]
                      ? "bg-green-100 text-green-600"
                      : "hover:bg-gray-100 text-gray-500"
                  }`}
                  onClick={() => copyToClipboard(user.phone, "phone")}
                  title="نسخ رقم الهاتف"
                >
                  <FiCopy size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-600">نوع المستخدم</div>
              <div className="text-gray-800 font-medium">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getUserTypeName(user)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiCalendar className="text-gray-400" />
                <span>تاريخ التسجيل</span>
              </div>
              <div className="text-gray-800 font-medium">
                {formatDate(user.created_at)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiCalendar className="text-gray-400" />
                <span>آخر تحديث</span>
              </div>
              <div className="text-gray-800 font-medium">
                {formatDate(user.updated_at)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-600">الحالة</div>
              <div className="text-gray-800 font-medium">
                {getStatusBadge(user.status)}
              </div>
            </div>

            {user.admin_message && (
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiFileText className="text-gray-400" />
                  <span>رسالة المسؤول</span>
                </div>
                <div className="flex items-start justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-800">{user.admin_message}</span>
                  <button
                    className={`p-1 rounded transition-colors flex-shrink-0 ${
                      copyStatus["admin_message"]
                        ? "bg-green-100 text-green-600"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(user.admin_message, "admin_message")
                    }
                    title="نسخ رسالة المسؤول"
                  >
                    <FiCopy size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* تفاصيل نوع المستخدم المحدد */}
        {renderUserTypeSpecificDetails(user)}
      </div>
    );
  };

  // دالة عرض التفاصيل الخاصة بنوع المستخدم
  const renderUserTypeSpecificDetails = (user) => {
    const userType = user.user_type_id;
    if (userType === 2 && user.land_owner) {
      const owner = user.land_owner;
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <FiUser className="text-red-500" />
            <h4 className="text-lg font-semibold text-gray-800">
              تفاصيل مالك الأرض
            </h4>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* رقم الهوية */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiFileText className="text-gray-400" />
                <span>رقم الهوية</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">
                  {owner.national_id || "غير محدد"}
                </span>
                {owner.national_id && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["owner_national_id"]
                        ? "bg-green-100 text-green-600"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(owner.national_id, "owner_national_id")
                    }
                    title="نسخ رقم الهوية"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (userType === 5 && user.real_estate_broker) {
      const broker = user.real_estate_broker;

      const fields = [
        {
          label: "رقم الهوية",
          value: broker.national_id,
          key: "broker_national_id",
          icon: <FiFileText className="text-gray-400" />,
        },
        {
          label: "رقم الرخصة",
          value: broker.license_number,
          key: "broker_license",
          icon: <FiHash className="text-gray-400" />,
        },
      ];

      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition hover:shadow-md">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <FiUser className="text-purple-500" />
            <h4 className="text-lg font-semibold text-gray-800">
              تفاصيل الوسيط العقاري
            </h4>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {field.icon}
                  <span>{field.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-800 font-medium">
                    {field.value || "غير محدد"}
                  </span>
                  {field.value && (
                    <button
                      className={`p-1 rounded transition-colors ${
                        copyStatus[field.key]
                          ? "bg-green-100 text-green-600"
                          : "hover:bg-gray-100 text-gray-500"
                      }`}
                      onClick={() => copyToClipboard(field.value, field.key)}
                      title={`نسخ ${field.label}`}
                    >
                      <FiCopy size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* ملف الرخصة */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiFileText className="text-gray-400" />
                <span>ملف الرخصة</span>
              </div>
              {broker.license_file ? (
                <a
                  href={broker.license_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <FiFileText />
                  عرض / تحميل الملف
                </a>
              ) : (
                <span className="text-gray-500">لا يوجد ملف مرفق</span>
              )}
            </div>
          </div>
        </div>
      );
    }
    if (userType === 6 && user.auction_company) {
      const auction = user.auction_company;

      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FiUser className="text-indigo-500" />
              تفاصيل شركة المزادات
            </h4>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* السجل التجاري */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiHash className="text-gray-400" />
                <span>السجل التجاري</span>
              </div>
              <div className="flex items-center justify-between">
                {auction.commercial_register ? (
                  <a
                    href={auction.commercial_register}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    عرض السجل التجاري
                  </a>
                ) : (
                  <span className="text-gray-800 font-medium">غير محدد</span>
                )}
                {auction.commercial_register && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["auction_commercial"]
                        ? "bg-green-100 text-green-600"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        auction.commercial_register,
                        "auction_commercial"
                      )
                    }
                    title="نسخ السجل التجاري"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* اسم المزاد */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiFileText className="text-gray-400" />
                <span>اسم شركة المزاد</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">
                  {auction.auction_name || "غير محدد"}
                </span>
                {auction.auction_name && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["auction_name"]
                        ? "bg-green-100 text-green-600"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(auction.auction_name, "auction_name")
                    }
                    title="نسخ اسم المزاد"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* رقم الهوية */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiFileText className="text-gray-400" />
                <span>رقم الهوية</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">
                  {auction.national_id || "غير محدد"}
                </span>
                {auction.national_id && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["auction_national_id"]
                        ? "bg-green-100 text-green-600"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        auction.national_id,
                        "auction_national_id"
                      )
                    }
                    title="نسخ رقم الهوية"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* ملف السجل التجاري */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiFileText className="text-gray-400" />
                <span>ملف السجل التجاري</span>
              </div>
              <div className="flex items-center justify-between">
                {auction.commercial_file ? (
                  <a
                    href={auction.commercial_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    عرض الملف
                  </a>
                ) : (
                  <span className="text-gray-800 font-medium">غير محدد</span>
                )}
                {auction.commercial_file && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["auction_commercial_file"]
                        ? "bg-green-100 text-green-600"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        auction.commercial_file,
                        "auction_commercial_file"
                      )
                    }
                    title="نسخ الملف"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* رقم الرخصة */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiFileText className="text-gray-400" />
                <span>رقم الرخصة</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">
                  {auction.license_number || "غير محدد"}
                </span>
                {auction.license_number && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["auction_license_number"]
                        ? "bg-green-100 text-green-600"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        auction.license_number,
                        "auction_license_number"
                      )
                    }
                    title="نسخ رقم الرخصة"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* ملف الرخصة */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiFileText className="text-gray-400" />
                <span>ملف الرخصة</span>
              </div>
              <div className="flex items-center justify-between">
                {auction.license_file ? (
                  <a
                    href={auction.license_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    عرض الملف
                  </a>
                ) : (
                  <span className="text-gray-800 font-medium">غير محدد</span>
                )}
                {auction.license_file && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["auction_license_file"]
                        ? "bg-green-100 text-green-600"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        auction.license_file,
                        "auction_license_file"
                      )
                    }
                    title="نسخ الملف"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (userType === 4 && user.business_entity) {
      const entity = user.business_entity;

      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FiUser className="text-amber-500" />
              تفاصيل الجهة التجارية
            </h4>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* السجل التجاري */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiHash className="text-gray-400" />
                <span>السجل التجاري</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">
                  {entity.commercial_register || "غير محدد"}
                </span>
                {entity.commercial_register && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["business_commercial"]
                        ? "bg-green-100 text-green-600"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        entity.commercial_register,
                        "business_commercial"
                      )
                    }
                    title="نسخ السجل التجاري"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* اسم المنشأة */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiFileText className="text-gray-400" />
                <span>اسم المنشأة</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">
                  {entity.business_name || "غير محدد"}
                </span>
                {entity.business_name && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["business_name"]
                        ? "bg-green-100 text-green-600"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(entity.business_name, "business_name")
                    }
                    title="نسخ اسم المنشأة"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* رقم الهوية الوطنية */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiFileText className="text-gray-400" />
                <span>رقم الهوية الوطنية</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">
                  {entity.national_id || "غير محدد"}
                </span>
                {entity.national_id && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["business_national_id"]
                        ? "bg-green-100 text-green-600"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        entity.national_id,
                        "business_national_id"
                      )
                    }
                    title="نسخ رقم الهوية"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* ملف السجل التجاري */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiFileText className="text-gray-400" />
                <span>ملف السجل التجاري</span>
              </div>
              <div className="flex items-center justify-between">
                {entity.commercial_file ? (
                  <a
                    href={entity.commercial_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    عرض الملف
                  </a>
                ) : (
                  <span className="text-gray-800 font-medium">غير محدد</span>
                )}
                {entity.commercial_file && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["business_commercial_file"]
                        ? "bg-green-100 text-green-600"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        entity.commercial_file,
                        "business_commercial_file"
                      )
                    }
                    title="نسخ الملف"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (userType === 3 && user.legal_agent) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FiUser className="text-emerald-500" />
              تفاصيل الوكيل الشرعي
            </h4>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiHash className="text-gray-400" />
                <span>رقم الوكالة</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">
                  {user.legal_agent.agency_number || "غير محدد"}
                </span>
                {user.legal_agent.agency_number && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["agent_agency"]
                        ? "bg-green-100 text-green-600"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        user.legal_agent.agency_number,
                        "agent_agency"
                      )
                    }
                    title="نسخ رقم الوكالة"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiFileText className="text-gray-400" />
                <span>رقم الهوية</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">
                  {user.legal_agent.national_id || "غير محدد"}
                </span>
                {user.legal_agent.national_id && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus["agent_national_id"]
                        ? "bg-green-100 text-green-600"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                    onClick={() =>
                      copyToClipboard(
                        user.legal_agent.national_id,
                        "agent_national_id"
                      )
                    }
                    title="نسخ رقم الهوية"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // ==============================================
  // الجزء 12: دوال الباجينيشن
  // ==============================================

  // دالة عرض أزرار الباجينيشن
  const renderPagination = () => {
    if (
      !usersData ||
      !usersData.pagination ||
      usersData.pagination.last_page <= 1
    )
      return null;

    const pages = [];
    const pagination = usersData.pagination;

    pages.push(
      <button
        key="prev"
        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
          currentPage === 1
            ? "border-gray-300 text-gray-400 cursor-not-allowed"
            : "border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => currentPage > 1 && updatePagination(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FiChevronRight size={18} />
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
          <span
            key={page}
            className="flex items-center justify-center w-10 h-10 text-gray-500"
          >
            ...
          </span>
        );
      } else {
        pages.push(
          <button
            key={page}
            className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
              currentPage === page
                ? "bg-blue-600 border-blue-600 text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
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
        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
          currentPage === pagination.last_page
            ? "border-gray-300 text-gray-400 cursor-not-allowed"
            : "border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() =>
          currentPage < pagination.last_page &&
          updatePagination(currentPage + 1)
        }
        disabled={currentPage === pagination.last_page}
      >
        <FiChevronLeft size={18} />
      </button>
    );

    return pages;
  };

  // ==============================================
  // الجزء 13: عرض المكون الرئيسي
  // ==============================================

  // تعريف المتغيرات المشتقة
  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.user_type_id !== "all";
  const loading =
    isLoading ||
    actionLoading ||
    approveMutation.isLoading ||
    rejectMutation.isLoading;

  const users = usersData?.data || [];
  const pagination = usersData?.pagination || {
    current_page: currentPage,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* شريط البحث والتصفية */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="text-blue-600" size={20} />
              <span className="text-lg font-semibold text-gray-800">
                أدوات البحث والتصفية
              </span>
            </div>
            {hasActiveFilters && (
              <button
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                onClick={clearFilters}
              >
                <FiSlash size={16} />
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  بحث
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleRefresh}
                  disabled={isLoading || isRefreshing}
                >
                  <FiRefreshCw
                    className={isRefreshing ? "animate-spin" : ""}
                    size={18}
                  />
                  {isRefreshing ? "جاري التحديث..." : "تحديث البيانات"}
                </button>
              </div>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                الحالة:
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">قيد المراجعة</option>
                <option value="approved">مقبول</option>
                <option value="rejected">مرفوض</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                نوع المستخدم:
              </label>
              <select
                value={filters.user_type_id}
                onChange={(e) =>
                  handleFilterChange("user_type_id", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="all">جميع الأنواع</option>
                <option value="1">مستخدم عام</option>
                <option value="2">مالك أرض</option>
                <option value="3">وكيل شرعي</option>
                <option value="4">جهة تجارية</option>
                <option value="5">وسيط عقاري</option>
                <option value="6">شركة مزادات</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                ترتيب حسب:
              </label>
              <select
                value={filters.sort_field}
                onChange={(e) =>
                  handleFilterChange("sort_field", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="created_at">تاريخ التسجيل</option>
                <option value="full_name">الاسم</option>
                <option value="email">البريد الإلكتروني</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                الاتجاه:
              </label>
              <select
                value={filters.sort_direction}
                onChange={(e) =>
                  handleFilterChange("sort_direction", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="desc">تنازلي</option>
                <option value="asc">تصاعدي</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* قائمة المستخدمين */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          {/* الهيدر */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-xl font-semibold text-gray-800">
                قائمة المستخدمين ({pagination.total || users.length})
              </h3>
              <span className="text-sm text-gray-600">
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

          {/* المحتوى */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
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
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiUser className="text-gray-400 mb-4" size={64} />
                <p className="text-gray-600 mb-4">لا توجد نتائج</p>
                {hasActiveFilters && (
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={clearFilters}
                  >
                    مسح الفلاتر
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-4 border rounded-xl transition-all cursor-pointer ${
                      selectedUser?.id === user.id
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                        <FiUser size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-lg font-semibold text-gray-800 truncate">
                            {user.full_name}
                          </h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getUserTypeName(user)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCalendar size={14} />
                          <span>{formatDate(user.created_at)}</span>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : user.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {getUserStatusText(user.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* الباجينيشن */}
          {pagination.last_page > 1 && (
            <div className="flex justify-center items-center gap-2 py-4 border-t border-gray-100 bg-white">
              {renderPagination()}
            </div>
          )}
        </div>

        {/* تفاصيل المستخدم */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          {selectedUser ? (
            <>
              {/* الهيدر */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800">
                    تفاصيل المستخدم الكاملة
                  </h3>
                  <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                    ID: {selectedUser.id}
                  </span>
                </div>
              </div>

              {/* المحتوى */}
              <div className="p-6 overflow-y-auto max-h-[80vh] min-h-[100px]">
                {renderCompleteUserDetails(selectedUser)}
              </div>

              {/* الفوتر - أزرار القبول/الرفض */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-3">
                  {selectedUser.status === "pending" && (
                    <>
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleApprove(selectedUser.id)}
                        disabled={loading}
                      >
                        <FiCheck size={18} />
                        {loading ? "جاري المعالجة..." : "قبول المستخدم"}
                      </button>

                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => openRejectModal(selectedUser.id)}
                        disabled={loading}
                      >
                        <FiX size={18} />
                        {loading ? "جاري المعالجة..." : "رفض المستخدم"}
                      </button>
                    </>
                  )}
                  {selectedUser.status === "approved" && (
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => openRejectModal(selectedUser.id)}
                      disabled={loading}
                    >
                      <FiX size={18} />
                      {loading ? "جاري المعالجة..." : "رفض المستخدم"}
                    </button>
                  )}
                  {selectedUser.status === "rejected" && (
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleApprove(selectedUser.id)}
                      disabled={loading}
                    >
                      <FiCheck size={18} />
                      {loading ? "جاري المعالجة..." : "قبول المستخدم"}
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12 text-center">
              <FiUser className="text-gray-400 mb-4" size={64} />
              <p className="text-gray-600">
                اختر مستخدمًا لعرض التفاصيل الكاملة
              </p>
            </div>
          )}
        </div>
      </div>

      {/* مودال الرفض */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FiEdit className="text-red-600" />
                  رفض المستخدم
                </h3>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
                  onClick={closeRejectModal}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  سبب الرفض
                </label>
                <textarea
                  value={rejectModal.adminMessage}
                  onChange={(e) =>
                    setRejectModal((prev) => ({
                      ...prev,
                      adminMessage: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  rows="4"
                  placeholder="اكتب سبب رفض المستخدم هنا..."
                />
                <div className="text-sm text-gray-500">
                  هذا السبب سيظهر للمستخدم كتفسير لرفض طلبه
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                  onClick={closeRejectModal}
                  disabled={loading}
                >
                  إلغاء
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleReject}
                  disabled={loading}
                >
                  <FiX size={18} />
                  {loading ? "جاري الحفظ..." : "تأكيد الرفض"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
