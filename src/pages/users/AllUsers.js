import React, { useState, useEffect, useCallback } from 'react';
import {
  FiUser,
  FiCheck,
  FiRefreshCw,
  FiX,
  FiMail,
  FiPhone,
  FiCalendar,
  FiFileText,
  FiHash,
  FiChevronRight,
  FiChevronLeft,
  FiCopy,
  FiInfo,
  FiEdit,
} from 'react-icons/fi';
import { useQueryClient, useQuery, useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import UsersFilters from './UsersFilters';
import { usersApi, usersUtils } from '../../services/usersApi';

const AllUsers = () => {
  // =============================================
  // 1. الهوكات والمتغيرات الأساسية
  // =============================================
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // دالة الحصول على الفلاتر المحفوظة
  const getInitialFilters = useCallback(() => {
    try {
      const savedFilters = localStorage.getItem('usersFilters');
      if (savedFilters) {
        return JSON.parse(savedFilters);
      }
    } catch (error) {
      console.error('❌ خطأ في تحليل الفلاتر المحفوظة:', error);
    }
    
    return usersUtils.getDefaultFilters();
  }, []);

  // =============================================
  // 2. حالات المكون
  // =============================================
  const [filters, setFilters] = useState(getInitialFilters());
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem('usersCurrentPage');
    return savedPage ? parseInt(savedPage) : 1;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copyStatus, setCopyStatus] = useState({});
  const [rejectModal, setRejectModal] = useState({
    show: false,
    userId: null,
    adminMessage: '',
  });

  // =============================================
  // 3. إدارة الحالة والتخزين المحلي
  // =============================================
  useEffect(() => {
    localStorage.setItem('usersFilters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem('usersCurrentPage', currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    const savedSelectedUser = localStorage.getItem('selectedUser');
    if (savedSelectedUser) {
      try {
        setSelectedUser(JSON.parse(savedSelectedUser));
      } catch (error) {
        console.error('❌ خطأ في تحليل المستخدم المحدد:', error);
        localStorage.removeItem('selectedUser');
      }
    }
  }, []);

  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem('selectedUser', JSON.stringify(selectedUser));
    } else {
      localStorage.removeItem('selectedUser');
    }
  }, [selectedUser]);

  // =============================================
  // 4. دوال النسخ إلى الحافظة
  // =============================================
  const copyToClipboard = useCallback(async (text, fieldName) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text.toString());
      setCopyStatus(prev => ({ ...prev, [fieldName]: true }));

      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [fieldName]: false }));
      }, 2000);
    } catch (err) {
      console.error('❌ فشل في نسخ النص:', err);
      
      // Fallback لمتصفحات قديمة
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      setCopyStatus(prev => ({ ...prev, [fieldName]: true }));
      
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [fieldName]: false }));
      }, 2000);
    }
  }, []);

  // =============================================
  // 5. جلب البيانات
  // =============================================
  const fetchUsers = useCallback(async () => {
    try {
      const result = await usersApi.getUsers(filters, currentPage);
      return result;
    } catch (error) {
      console.error('❌ خطأ في جلب البيانات:', error);
      throw error;
    }
  }, [filters, currentPage]);

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery(['users', filters, currentPage], fetchUsers, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('❌ خطأ في جلب المستخدمين:', error);
    },
  });

  // =============================================
  // 6. دوال الفلاتر والبحث
  // =============================================
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    if (key !== 'page' && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage]);

  const handleSearch = useCallback(() => {
    refetch();
  }, [refetch]);

  const clearFilters = useCallback(() => {
    setFilters(usersUtils.getDefaultFilters());
    setCurrentPage(1);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('❌ خطأ في التحديث:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // =============================================
  // 7. إدارة المستخدمين (قبول/رفض)
  // =============================================
  const approveMutation = useMutation(
    async (userId) => {
      return await usersApi.approveUser(userId);
    },
    {
      onSuccess: (data) => {
        alert('تم قبول المستخدم بنجاح');
        
        // تحديث الكاش
        queryClient.setQueryData(['users', filters, currentPage], (oldData) => {
          if (!oldData) return oldData;
          const updatedUsers = oldData.data.map(user =>
            user.id === data.data.id ? data.data : user
          );
          return { ...oldData, data: updatedUsers };
        });

        setSelectedUser(null);
      },
      onError: (error) => {
        alert(error.message || 'فشل في قبول المستخدم');
      },
    }
  );

  const rejectMutation = useMutation(
    async ({ userId, adminMessage }) => {
      return await usersApi.rejectUser(userId, adminMessage);
    },
    {
      onSuccess: (data) => {
        alert('تم رفض المستخدم بنجاح');
        
        // تحديث الكاش
        queryClient.setQueryData(['users', filters, currentPage], (oldData) => {
          if (!oldData) return oldData;
          const updatedUsers = oldData.data.map(user =>
            user.id === data.data.id ? data.data : user
          );
          return { ...oldData, data: updatedUsers };
        });

        setSelectedUser(null);
        closeRejectModal();
      },
      onError: (error) => {
        alert(error.message || 'فشل في رفض المستخدم');
      },
    }
  );

  const openRejectModal = useCallback((userId) => {
    setRejectModal({
      show: true,
      userId,
      adminMessage: '',
    });
  }, []);

  const closeRejectModal = useCallback(() => {
    setRejectModal({
      show: false,
      userId: null,
      adminMessage: '',
    });
  }, []);

  const handleApprove = useCallback((userId) => {
    if (!window.confirm('هل أنت متأكد من قبول هذا المستخدم؟')) return;
    approveMutation.mutate(userId);
  }, [approveMutation]);

  const handleReject = useCallback(() => {
    if (!rejectModal.adminMessage.trim()) {
      alert('يرجى إدخال سبب الرفض');
      return;
    }

    if (!window.confirm('هل أنت متأكد من رفض هذا المستخدم؟')) return;

    rejectMutation.mutate({
      userId: rejectModal.userId,
      adminMessage: rejectModal.adminMessage,
    });
  }, [rejectModal, rejectMutation]);

  // =============================================
  // 8. دوال المساعدة
  // =============================================
  const updatePagination = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const formatDate = usersUtils.formatDate;
  const getStatusBadge = usersUtils.getStatusBadge;
  const getUserStatusText = usersUtils.getUserStatusText;
  const getUserTypeName = usersUtils.getUserTypeName;

  // =============================================
  // 9. دوال عرض التفاصيل
  // =============================================
  const renderUserTypeSpecificDetails = useCallback((user) => {
    const userType = user.user_type_id;

    if (userType === 2 && user.land_owner) {
      const owner = user.land_owner;
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-4">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <FiUser className="text-red-500" />
            <h4 className="text-lg font-semibold text-gray-800">
              تفاصيل مالك الأرض
            </h4>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiFileText className="text-gray-400" />
                <span>رقم الهوية</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">
                  {owner.national_id || 'غير محدد'}
                </span>
                {owner.national_id && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus['owner_national_id']
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    onClick={() => copyToClipboard(owner.national_id, 'owner_national_id')}
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
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-4">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <FiUser className="text-purple-500" />
            <h4 className="text-lg font-semibold text-gray-800">
              تفاصيل الوسيط العقاري
            </h4>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiFileText className="text-gray-400" />
                <span>رقم الهوية</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">
                  {broker.national_id || 'غير محدد'}
                </span>
                {broker.national_id && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus['broker_national_id']
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    onClick={() => copyToClipboard(broker.national_id, 'broker_national_id')}
                    title="نسخ رقم الهوية"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiHash className="text-gray-400" />
                <span>رقم الرخصة</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">
                  {broker.license_number || 'غير محدد'}
                </span>
                {broker.license_number && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus['broker_license']
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    onClick={() => copyToClipboard(broker.license_number, 'broker_license')}
                    title="نسخ رقم الرخصة"
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

    if (userType === 6 && user.auction_company) {
      const auction = user.auction_company;
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-4">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <FiUser className="text-indigo-500" />
            <h4 className="text-lg font-semibold text-gray-800">
              تفاصيل شركة المزادات
            </h4>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiFileText className="text-gray-400" />
                <span>السجل التجاري</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">
                  {auction.commercial_register || 'غير محدد'}
                </span>
                {auction.commercial_register && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus['auction_commercial']
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    onClick={() => copyToClipboard(auction.commercial_register, 'auction_commercial')}
                    title="نسخ السجل التجاري"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiFileText className="text-gray-400" />
                <span>اسم شركة المزاد</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">
                  {auction.auction_name || 'غير محدد'}
                </span>
                {auction.auction_name && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus['auction_name']
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    onClick={() => copyToClipboard(auction.auction_name, 'auction_name')}
                    title="نسخ اسم المزاد"
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-4">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <FiUser className="text-amber-500" />
            <h4 className="text-lg font-semibold text-gray-800">
              تفاصيل الجهة التجارية
            </h4>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiHash className="text-gray-400" />
                <span>السجل التجاري</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">
                  {entity.commercial_register || 'غير محدد'}
                </span>
                {entity.commercial_register && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus['business_commercial']
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    onClick={() => copyToClipboard(entity.commercial_register, 'business_commercial')}
                    title="نسخ السجل التجاري"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiFileText className="text-gray-400" />
                <span>اسم المنشأة</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">
                  {entity.business_name || 'غير محدد'}
                </span>
                {entity.business_name && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus['business_name']
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    onClick={() => copyToClipboard(entity.business_name, 'business_name')}
                    title="نسخ اسم المنشأة"
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-4">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <FiUser className="text-emerald-500" />
            <h4 className="text-lg font-semibold text-gray-800">
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
                  {user.legal_agent.agency_number || 'غير محدد'}
                </span>
                {user.legal_agent.agency_number && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus['agent_agency']
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    onClick={() => copyToClipboard(user.legal_agent.agency_number, 'agent_agency')}
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
                  {user.legal_agent.national_id || 'غير محدد'}
                </span>
                {user.legal_agent.national_id && (
                  <button
                    className={`p-1 rounded transition-colors ${
                      copyStatus['agent_national_id']
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    onClick={() => copyToClipboard(user.legal_agent.national_id, 'agent_national_id')}
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
  }, [copyStatus, copyToClipboard]);

  const renderCompleteUserDetails = useCallback((user) => {
    return (
      <div className="space-y-6">
        {/* المعلومات الأساسية */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FiInfo className="text-blue-500" />
              المعلومات الأساسية
            </h4>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* الاسم الكامل */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiUser className="text-gray-400" />
                <span>الاسم الكامل</span>
              </div>
              <div className="text-gray-800 font-medium">{user.full_name}</div>
            </div>

            {/* البريد الإلكتروني */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiMail className="text-gray-400" />
                <span>البريد الإلكتروني</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">{user.email}</span>
                <button
                  className={`p-1 rounded transition-colors ${
                    copyStatus['email']
                      ? 'bg-green-100 text-green-600'
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                  onClick={() => copyToClipboard(user.email, 'email')}
                  title="نسخ البريد الإلكتروني"
                >
                  <FiCopy size={16} />
                </button>
              </div>
            </div>

            {/* رقم الهاتف */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiPhone className="text-gray-400" />
                <span>رقم الهاتف</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 font-medium">{user.phone}</span>
                <button
                  className={`p-1 rounded transition-colors ${
                    copyStatus['phone']
                      ? 'bg-green-100 text-green-600'
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                  onClick={() => copyToClipboard(user.phone, 'phone')}
                  title="نسخ رقم الهاتف"
                >
                  <FiCopy size={16} />
                </button>
              </div>
            </div>

            {/* نوع المستخدم */}
            <div className="space-y-2">
              <div className="text-sm text-gray-600">نوع المستخدم</div>
              <div className="text-gray-800 font-medium">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getUserTypeName(user)}
                </span>
              </div>
            </div>

            {/* تاريخ التسجيل */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiCalendar className="text-gray-400" />
                <span>تاريخ التسجيل</span>
              </div>
              <div className="text-gray-800 font-medium">
                {formatDate(user.created_at)}
              </div>
            </div>

            {/* آخر تحديث */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiCalendar className="text-gray-400" />
                <span>آخر تحديث</span>
              </div>
              <div className="text-gray-800 font-medium">
                {formatDate(user.updated_at)}
              </div>
            </div>

            {/* الحالة */}
            <div className="space-y-2">
              <div className="text-sm text-gray-600">الحالة</div>
              <div className="text-gray-800 font-medium">
                {getStatusBadge(user.status)}
              </div>
            </div>

            {/* رسالة المسؤول */}
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
                      copyStatus['admin_message']
                        ? 'bg-green-100 text-green-600'
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                    onClick={() => copyToClipboard(user.admin_message, 'admin_message')}
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
  }, [copyStatus, copyToClipboard, formatDate, getStatusBadge, getUserTypeName, renderUserTypeSpecificDetails]);

  // =============================================
  // 10. الباجينيشن
  // =============================================
  const renderPagination = useCallback(() => {
    if (
      !usersData ||
      !usersData.pagination ||
      usersData.pagination.last_page <= 1
    )
      return null;

    const pages = [];
    const pagination = usersData.pagination;

    // زر السابق
    pages.push(
      <button
        key="prev"
        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
          currentPage === 1
            ? 'border-gray-300 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
        onClick={() => currentPage > 1 && updatePagination(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FiChevronRight size={18} />
      </button>
    );

    // أرقام الصفحات
    const showPages = [];
    showPages.push(1);

    if (currentPage > 3) {
      showPages.push('ellipsis-start');
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(pagination.last_page - 1, currentPage + 1);
      i++
    ) {
      showPages.push(i);
    }

    if (currentPage < pagination.last_page - 2) {
      showPages.push('ellipsis-end');
    }

    if (pagination.last_page > 1) {
      showPages.push(pagination.last_page);
    }

    const uniquePages = [...new Set(showPages)];

    uniquePages.forEach((page) => {
      if (page === 'ellipsis-start' || page === 'ellipsis-end') {
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
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => updatePagination(page)}
          >
            {page}
          </button>
        );
      }
    });

    // زر التالي
    pages.push(
      <button
        key="next"
        className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
          currentPage === pagination.last_page
            ? 'border-gray-300 text-gray-400 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
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
  }, [usersData, currentPage, updatePagination]);

  // =============================================
  // 11. المتغيرات المشتقة
  // =============================================
  const loading = isLoading || approveMutation.isLoading || rejectMutation.isLoading;
  const users = usersData?.data || [];
  const pagination = usersData?.pagination || {
    current_page: currentPage,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
  };

  const filtersData = usersUtils.extractFiltersData(users);

  // =============================================
  // 12. عرض المكون الرئيسي
  // =============================================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* الفلاتر */}
      <UsersFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClearFilters={clearFilters}
        onRefresh={handleRefresh}
        filtersData={filtersData}
        loading={loading}
        isRefreshing={isRefreshing}
      />

      {/* المحتوى الرئيسي */}
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
                    عرض {pagination.from} إلى {pagination.to} من{' '}
                    {pagination.total} - الصفحة {pagination.current_page} من{' '}
                    {pagination.last_page}
                  </>
                ) : (
                  'لا توجد نتائج'
                )}
              </span>
            </div>
          </div>

          {/* المحتوى */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[75vh]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex space-x-2 mb-4">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
                <p className="text-gray-600">جاري تحميل البيانات...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FiUser className="text-gray-400 mb-4" size={64} />
                <p className="text-gray-600 mb-4">لا توجد نتائج</p>
                {(filters.search || filters.status !== 'all' || filters.user_type_id !== 'all') && (
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
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
                          user.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : user.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
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
                  {selectedUser.status === 'pending' && (
                    <>
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleApprove(selectedUser.id)}
                        disabled={loading}
                      >
                        <FiCheck size={18} />
                        {loading ? 'جاري المعالجة...' : 'قبول المستخدم'}
                      </button>

                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => openRejectModal(selectedUser.id)}
                        disabled={loading}
                      >
                        <FiX size={18} />
                        {loading ? 'جاري المعالجة...' : 'رفض المستخدم'}
                      </button>
                    </>
                  )}
                  {selectedUser.status === 'approved' && (
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => openRejectModal(selectedUser.id)}
                      disabled={loading}
                    >
                      <FiX size={18} />
                      {loading ? 'جاري المعالجة...' : 'رفض المستخدم'}
                    </button>
                  )}
                  {selectedUser.status === 'rejected' && (
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleApprove(selectedUser.id)}
                      disabled={loading}
                    >
                      <FiCheck size={18} />
                      {loading ? 'جاري المعالجة...' : 'قبول المستخدم'}
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
                  {loading ? 'جاري الحفظ...' : 'تأكيد الرفض'}
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