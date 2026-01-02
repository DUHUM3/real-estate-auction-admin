// ContactsPage.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchContacts,
  fetchContactDetails,
  deleteContact,
  markAsContacted,
  getAttachmentUrl,
  formatDate,
  truncateText,
  getStatusConfig
} from "../Services/ContactsApi";

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    start_date: "",
    end_date: "",
    sort_by: "created_at",
    sort_order: "desc",
    per_page: 8,
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 8,
    total: 0,
  });
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // جلب جهات الاتصال
  const fetchContactsData = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchContacts(filters, page);

        if (result.success) {
          setContacts(result.data);
          setPagination(result.meta);
        }
      } catch (err) {
        setError(err.message);
        console.error("خطأ في جلب جهات الاتصال:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters]
  );

  // تحديث البيانات يدوياً
  const handleRefresh = () => {
    setRefreshing(true);
    fetchContactsData(pagination.current_page);
  };

  // استخدام debounce للبحث
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchContactsData(1);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [filters.search, filters.status]);

  // إعادة الجلب عند تغيير الفلاتر الأخرى
  useEffect(() => {
    if (filters.search === "" && filters.status === "") {
      fetchContactsData(1);
    }
  }, [
    filters.start_date,
    filters.end_date,
    filters.sort_by,
    filters.sort_order,
    filters.per_page,
  ]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    fetchContactsData(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "",
      start_date: "",
      end_date: "",
      sort_by: "created_at",
      sort_order: "desc",
      per_page: 8,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الرسالة؟")) {
      try {
        await deleteContact(id);
        fetchContactsData(pagination.current_page);
        
        if (selectedContact && selectedContact.id === id) {
          setShowModal(false);
        }
      } catch (err) {
        setError("فشل في حذف الرسالة");
        console.error("خطأ في حذف الرسالة:", err);
      }
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const result = await fetchContactDetails(id);

      if (result.success) {
        setSelectedContact(result.data);
        setShowModal(true);
        fetchContactsData(pagination.current_page);
      }
    } catch (err) {
      setError("فشل في جلب تفاصيل الرسالة");
      console.error("خطأ في جلب تفاصيل الرسالة:", err);
    }
  };

  const handleMarkAsContacted = async (id) => {
    try {
      await markAsContacted(id);

      // تحديث البيانات فوراً
      if (selectedContact && selectedContact.id === id) {
        setSelectedContact((prev) => ({
          ...prev,
          status: "تم التواصل",
        }));
      }

      // تحديث القائمة
      fetchContactsData(pagination.current_page);

      alert('تم تغيير حالة الرسالة إلى "تم التواصل" بنجاح');
    } catch (err) {
      setError("فشل في تغيير حالة الرسالة");
      console.error("خطأ في تغيير حالة الرسالة:", err);
    }
  };

  const handlePageChange = (page) => {
    fetchContactsData(page);
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.badgeColor}`}
      >
        {config.label}
      </span>
    );
  };

  // ميمو للبيانات المحسوبة
  const paginationInfo = useMemo(() => {
    const start =
      pagination.total > 0
        ? (pagination.current_page - 1) * pagination.per_page + 1
        : 0;
    const end = Math.min(
      pagination.current_page * pagination.per_page,
      pagination.total
    );
    return { start, end };
  }, [pagination]);

  if (loading && contacts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-red-800 font-medium">خطأ</h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => fetchContactsData(1)}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* العنوان الرئيسي */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          إدارة رسائل التواصل
        </h1>
        <p className="text-gray-600">
          عرض وإدارة استفسارات العملاء والرسائل الواردة
        </p>
      </div>

      {/* قسم الفلاتر */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">فلاتر البحث</h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {refreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                جاري التحديث...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                تحديث البيانات
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* البحث */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              بحث
            </label>
            <input
              type="text"
              placeholder="ابحث في الرسائل..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* فلترة حسب الحالة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الحالة
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">جميع الحالات</option>
              <option value="غير مقروءة">غير مقروءة</option>
              <option value="مقروءة">مقروءة</option>
              <option value="تم التواصل">تم التواصل</option>
            </select>
          </div>

          {/* من تاريخ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              من تاريخ
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange("start_date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* إلى تاريخ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              إلى تاريخ
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange("end_date", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* ترتيب حسب */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ترتيب حسب
            </label>
            <select
              value={filters.sort_by}
              onChange={(e) => handleFilterChange("sort_by", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="created_at">التاريخ</option>
              <option value="full_name">الاسم</option>
              <option value="email">البريد الإلكتروني</option>
              <option value="reason">الموضوع</option>
              <option value="status">الحالة</option>
            </select>
          </div>

          {/* اتجاه الترتيب */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اتجاه الترتيب
            </label>
            <select
              value={filters.sort_order}
              onChange={(e) => handleFilterChange("sort_order", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="desc">تنازلي</option>
              <option value="asc">تصاعدي</option>
            </select>
          </div>

          {/* عدد العناصر في الصفحة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              عدد العناصر في الصفحة
            </label>
            <select
              value={filters.per_page}
              onChange={(e) =>
                handleFilterChange("per_page", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* أزرار الفلاتر */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            عرض {paginationInfo.start} إلى {paginationInfo.end} من أصل{" "}
            {pagination.total} رسالة
          </div>
          <div className="flex space-x-2 space-x-reverse">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              إعادة التعيين
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              تطبيق الفلاتر
            </button>
          </div>
        </div>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الموضوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معاينة الرسالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {filters.search || filters.start_date || filters.end_date
                      ? "لا توجد رسائل تطابق الفلاتر المحددة."
                      : "لا توجد رسائل تواصل حالياً."}
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => handleViewDetails(contact.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-end">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {contact.full_name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="mr-4 text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {contact.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contact.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {contact.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {contact.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {getStatusBadge(contact.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {truncateText(contact.message)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatDate(contact.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <div
                        className="flex justify-start space-x-2 space-x-reverse"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleViewDetails(contact.id)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-sm transition-colors duration-150"
                        >
                          عرض
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-sm transition-colors duration-150"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* الترقيم */}
        {pagination.last_page > 1 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                عرض <span className="font-medium">{paginationInfo.start}</span>{" "}
                إلى <span className="font-medium">{paginationInfo.end}</span> من{" "}
                <span className="font-medium">{pagination.total}</span> نتيجة
              </div>
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  السابق
                </button>

                {/* أرقام الصفحات */}
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === pagination.last_page ||
                      Math.abs(page - pagination.current_page) <= 2
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-3 py-1 text-sm text-gray-500">
                          ...
                        </span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 border rounded-md text-sm font-medium transition-colors ${
                          page === pagination.current_page
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}

                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  التالي
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* نافذة تفاصيل الرسالة */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  تفاصيل الرسالة
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* معلومات المرسل */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    الاسم الكامل
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedContact.full_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    البريد الإلكتروني
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedContact.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    رقم الهاتف
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedContact.phone || "غير متوفر"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    الحالة
                  </label>
                  <p className="mt-1">
                    {getStatusBadge(selectedContact.status)}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    الموضوع
                  </label>
                  <p className="mt-1">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {selectedContact.reason}
                    </span>
                  </p>
                </div>
              </div>

              {/* محتوى الرسالة */}
              <div>
                <label className="text-sm font-medium text-gray-500">
                  محتوى الرسالة
                </label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                </div>
              </div>

              {/* المرفقات */}
              {selectedContact.file_path && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    المرفقات
                  </label>
                  <div className="mt-2">
                    <a
                      href={getAttachmentUrl(selectedContact.file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      عرض الملف
                    </a>
                  </div>
                </div>
              )}
              {/* الطوابع الزمنية */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      تاريخ الاستلام
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedContact.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      آخر تحديث
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedContact.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex justify-between items-center">
                <div className="flex space-x-3 space-x-reverse">
                  <button
                    onClick={() => handleMarkAsContacted(selectedContact.id)}
                    disabled={selectedContact.status === "تم التواصل"}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {selectedContact.status === "تم التواصل"
                      ? "تم التواصل ✓"
                      : "تم التواصل"}
                  </button>
                </div>
                <div className="flex space-x-3 space-x-reverse">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    إغلاق
                  </button>
                  <button
                    onClick={() => handleDelete(selectedContact.id)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    حذف الرسالة
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;