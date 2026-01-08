import React, { useState, useEffect } from "react";
import { 
  Target, User, Phone, Navigation, FileText, Calendar, 
  Image, MessageSquare, RefreshCw, ChevronRight, ChevronLeft,
  Mail, Home, UserCheck, Clock, Check, X, AlertCircle, Edit
} from "lucide-react";
import { useQueryClient, useQuery, useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import MarketingFilters from "./AuctionsMarketingFilters";

import {
  filtersManager,
  fetchMarketingRequests,
  updateRequestStatus,
  getImageUrl,
  formatDate,
  getStatusText,
  getStatusColor,
  getStatusBadge,
  getPropertyRoleText,
} from "../../services/marketingRequestsApi";

const MarketingRequests = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [filters, setFilters] = useState(filtersManager.getInitialFilters());
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusModal, setStatusModal] = useState({
    show: false,
    requestId: null,
    newStatus: "",
    rejectionMessage: "",
  });
  const [imageModal, setImageModal] = useState({
    show: false,
    images: [],
    currentIndex: 0,
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = () => {
    refetch();
  };

  const clearFilters = () => {
    const defaultFilters = filtersManager.clearFilters();
    setFilters(defaultFilters);
    
    setTimeout(() => {
      refetch();
    }, 0);
  };

  const handleRefresh = () => {
    refetch();
  };

  useEffect(() => {
    filtersManager.saveFilters(filters);
  }, [filters]);

  useEffect(() => {
    refetch();
  }, [filters]);

  const {
    data: marketingRequestsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ["marketingRequests", filters],
    () => fetchMarketingRequests(filters, navigate),
    {
      staleTime: 0,
      cacheTime: 0,
      refetchOnWindowFocus: true,
      refetchOnMount: "always",
    }
  );

  const statusMutation = useMutation(
    ({ requestId, status, message }) =>
      updateRequestStatus(requestId, status, message),
    {
      onSuccess: (data) => {
        alert(data.message || "تم تحديث حالة الطلب بنجاح");
        setSelectedRequest(null);
        closeStatusModal();

        queryClient.setQueryData(["marketingRequests", filters], (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: oldData.data.map((req) =>
              req.id === data.auction_request.id ? data.auction_request : req
            ),
          };
        });
      },
      onError: (error) => {
        console.error("❌ خطأ أثناء تحديث الحالة:", error);
        alert(error.message || "فشل في تحديث حالة الطلب");
      },
    }
  );

  const openStatusModal = (requestId, newStatus) => {
    setStatusModal({
      show: true,
      requestId,
      newStatus,
      rejectionMessage: "",
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      show: false,
      requestId: null,
      newStatus: "",
      rejectionMessage: "",
    });
  };

  const handleStatusUpdate = async () => {
    if (!statusModal.requestId || !statusModal.newStatus) {
      alert("بيانات غير مكتملة");
      return;
    }

    if (
      statusModal.newStatus === "rejected" &&
      !statusModal.rejectionMessage.trim()
    ) {
      alert("يرجى إدخال سبب الرفض");
      return;
    }

    if (
      !window.confirm(
        `هل أنت متأكد من تغيير الحالة إلى "${getStatusText(
          statusModal.newStatus
        )}"؟`
      )
    ) {
      return;
    }

    statusMutation.mutate(
      {
        requestId: statusModal.requestId,
        status: statusModal.newStatus,
        message: statusModal.rejectionMessage,
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries(["marketingRequests"]);
          closeStatusModal();
        },
      }
    );
  };

  const updatePagination = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const openImageModal = (images, index = 0) => {
    setImageModal({
      show: true,
      images: images,
      currentIndex: index,
    });
  };

  const closeImageModal = () => {
    setImageModal({
      show: false,
      images: [],
      currentIndex: 0,
    });
  };

  const nextImage = () => {
    setImageModal(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length
    }));
  };

  const prevImage = () => {
    setImageModal(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
    }));
  };

  const renderPagination = () => {
    if (
      !marketingRequestsData ||
      !marketingRequestsData.pagination ||
      marketingRequestsData.pagination.last_page <= 1
    )
      return null;

    const pages = [];
    const pagination = marketingRequestsData.pagination;

    pages.push(
      <button
        key="prev"
        className={`flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 ${
          pagination.current_page === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() =>
          pagination.current_page > 1 &&
          updatePagination(pagination.current_page - 1)
        }
        disabled={pagination.current_page === 1}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    );

    const showPages = [];
    showPages.push(1);

    if (pagination.current_page > 3) {
      showPages.push("ellipsis-start");
    }

    for (
      let i = Math.max(2, pagination.current_page - 1);
      i <= Math.min(pagination.last_page - 1, pagination.current_page + 1);
      i++
    ) {
      showPages.push(i);
    }

    if (pagination.current_page < pagination.last_page - 2) {
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
            className={`flex items-center justify-center w-10 h-10 rounded-lg border ${
              pagination.current_page === page
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
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
        className={`flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 ${
          pagination.current_page === pagination.last_page
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() =>
          pagination.current_page < pagination.last_page &&
          updatePagination(pagination.current_page + 1)
        }
        disabled={pagination.current_page === pagination.last_page}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    );

    return pages;
  };

  const requests = marketingRequestsData?.data || [];
  const pagination = marketingRequestsData?.pagination || {
    current_page: filters.page,
    last_page: 1,
    per_page: filters.per_page,
    total: 0,
    from: 0,
    to: 0,
  };
  const filtersData = marketingRequestsData?.filtersData || {
    regions: [],
    cities: [],
    statuses: [],
    property_roles: [],
  };

  const loading = isLoading || statusMutation.isLoading;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                إدارة طلبات التسويق
              </h1>
              <p className="text-gray-600 mt-1">
                عرض وإدارة جميع طلبات التسويق - العدد الإجمالي:{" "}
                {pagination.total}
              </p>
            </div>
          </div>

          <button
            className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      <MarketingFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onClearFilters={clearFilters}
        filtersData={filtersData}
        loading={loading}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  قائمة طلبات التسويق ({requests.length})
                </h3>
                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                  {pagination.total > 0 ? (
                    <>
                      عرض {pagination.from} إلى {pagination.to} من{" "}
                      {pagination.total}
                    </>
                  ) : (
                    "لا توجد نتائج"
                  )}
                </span>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex space-x-2 space-x-reverse mb-4">
                    <div
                      className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    ></div>
                  </div>
                  <p className="text-gray-600">جاري تحميل طلبات التسويق...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Target className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg mb-4">
                    لا توجد طلبات تسويق
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedRequest?.id === request.id
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm"
                        }`}
                        onClick={() => setSelectedRequest(request)}
                      >
                        <div className="flex items-start space-x-4 space-x-reverse">
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                              <User className="w-7 h-7 text-white" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-lg font-semibold text-gray-900 truncate">
                                {request.name}
                              </h4>
                              <div
                                className={
                                  getStatusColor(request.status) +
                                  " px-3 py-1 rounded-full text-sm font-medium border shadow-sm"
                                }
                              >
                                {request.status_ar ||
                                  getStatusText(request.status)}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <User className="w-4 h-4 text-blue-500" />
                                <span className="font-medium">{request.user?.name}</span>
                              </div>

                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Phone className="w-4 h-4 text-green-500" />
                                <span>{request.user?.phone}</span>
                              </div>

                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Navigation className="w-4 h-4 text-purple-500" />
                                <span>
                                  {request.region} - {request.city}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2 space-x-reverse">
                                <FileText className="w-4 h-4 text-orange-500" />
                                <span>{getPropertyRoleText(request.property_role)}</span>
                              </div>

                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Calendar className="w-4 h-4 text-indigo-500" />
                                <span>{formatDate(request.created_at)}</span>
                              </div>

                              {request.images && request.images.length > 0 && (
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <Image className="w-4 h-4 text-pink-500" />
                                  <span>
                                    {request.images.length} صورة
                                  </span>
                                </div>
                              )}
                            </div>

                            {request.description && (
                              <div className="mt-3 flex items-start space-x-2 space-x-reverse">
                                <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                                <span className="text-sm text-gray-600 line-clamp-2">
                                  {request.description}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {pagination.last_page > 1 && (
                    <div className="flex items-center justify-center space-x-2 space-x-reverse mt-6 pt-6 border-t border-gray-200">
                      {renderPagination()}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-6">
            {selectedRequest ? (
              <div>
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      تفاصيل الطلب
                    </h3>
                    <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                      #{selectedRequest.id}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <User className="w-4 h-4 ml-2 text-blue-500" />
                      معلومات المالك
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">الاسم الكامل</p>
                        <p className="font-medium text-gray-900">{selectedRequest.name}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">رقم الهوية</p>
                        <p className="font-medium text-gray-900">{selectedRequest.id_number}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">صفة العقار</p>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {getPropertyRoleText(selectedRequest.property_role)}
                        </span>
                      </div>

                      {selectedRequest.property_role === "legal_agent" && selectedRequest.agency_number && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">رقم الوكالة</p>
                          <p className="font-medium text-gray-900">{selectedRequest.agency_number}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <UserCheck className="w-4 h-4 ml-2 text-green-500" />
                      معلومات مقدم الطلب
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">الاسم</p>
                          <p className="font-medium text-gray-900">
                            {selectedRequest.user?.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                          <p className="font-medium text-gray-900 truncate">
                            {selectedRequest.user?.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">رقم الهاتف</p>
                          <p className="font-medium text-gray-900">
                            {selectedRequest.user?.phone}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">نوع المستخدم</p>
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {selectedRequest.user?.user_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <Home className="w-4 h-4 ml-2 text-orange-500" />
                      معلومات العقار
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Navigation className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">الموقع</p>
                          <p className="font-medium text-gray-900">
                            {selectedRequest.region} - {selectedRequest.city}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">رقم الوثيقة</p>
                        <p className="font-medium text-gray-900">{selectedRequest.document_number}</p>
                      </div>

                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">تاريخ التقديم</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(selectedRequest.created_at)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">الحالة</p>
                        <div className="mt-1">
                          {getStatusBadge(selectedRequest.status)}
                        </div>
                      </div>

                      {selectedRequest.terms_accepted && (
                        <div className="flex items-center space-x-2 space-x-reverse text-green-600">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">تم قبول الشروط والأحكام</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedRequest.description && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <MessageSquare className="w-4 h-4 ml-2 text-indigo-500" />
                        الوصف
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-700 leading-relaxed">
                          {selectedRequest.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedRequest.rejection_message && (
                    <div>
                      <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center">
                        <AlertCircle className="w-4 h-4 ml-2" />
                        سبب الرفض
                      </h4>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="text-red-700">
                          {selectedRequest.rejection_message}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedRequest.images &&
                    selectedRequest.images.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <Image className="w-4 h-4 ml-2 text-pink-500" />
                          الصور المرفوعة ({selectedRequest.images.length})
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedRequest.images.map((image, index) => (
                            <div
                              key={index}
                              className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border-2 border-gray-200 hover:border-blue-400"
                              onClick={() =>
                                openImageModal(selectedRequest.images, index)
                              }
                            >
                              <img
                                src={getImageUrl(image)}
                                alt={`صورة ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                              <div className="hidden w-full h-full flex-col items-center justify-center bg-gray-200 text-gray-500">
                                <Image className="w-6 h-6 mb-1" />
                                <span className="text-xs">
                                  تعذر تحميل الصورة
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-col space-y-3">
                    <button
                      className="flex items-center justify-center space-x-2 space-x-reverse w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        openStatusModal(selectedRequest.id, "under_review")
                      }
                      disabled={
                        selectedRequest.status === "under_review" || loading
                      }
                    >
                      <Clock className="w-4 h-4" />
                      <span>قيد المراجعة</span>
                    </button>

                    <button
                      className="flex items-center justify-center space-x-2 space-x-reverse w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        openStatusModal(selectedRequest.id, "reviewed")
                      }
                      disabled={
                        selectedRequest.status === "reviewed" || loading
                      }
                    >
                      <Check className="w-4 h-4" />
                      <span>تمت المراجعة</span>
                    </button>

                    <button
                      className="flex items-center justify-center space-x-2 space-x-reverse w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        openStatusModal(selectedRequest.id, "auctioned")
                      }
                      disabled={
                        selectedRequest.status === "auctioned" || loading
                      }
                    >
                      <Target className="w-4 h-4" />
                      <span>تم عرض العقار في شركة المزادات</span>
                    </button>

                    <button
                      className="flex items-center justify-center space-x-2 space-x-reverse w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() =>
                        openStatusModal(selectedRequest.id, "rejected")
                      }
                      disabled={
                        selectedRequest.status === "rejected" || loading
                      }
                    >
                      <X className="w-4 h-4" />
                      <span>رفض الطلب</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Target className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500">اختر طلب تسويق لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {statusModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Edit className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  تغيير حالة الطلب
                </h3>
              </div>
              <button
                className="text-gray-400 hover:text-gray-500 transition-colors"
                onClick={closeStatusModal}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة الجديدة
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      statusModal.newStatus === "reviewed"
                        ? "bg-green-100 text-green-800"
                        : statusModal.newStatus === "auctioned"
                        ? "bg-purple-100 text-purple-800"
                        : statusModal.newStatus === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {getStatusText(statusModal.newStatus)}
                  </span>
                </div>
              </div>

              {statusModal.newStatus === "rejected" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    سبب الرفض *
                  </label>
                  <textarea
                    value={statusModal.rejectionMessage}
                    onChange={(e) =>
                      setStatusModal((prev) => ({
                        ...prev,
                        rejectionMessage: e.target.value,
                      }))
                    }
                    placeholder="يرجى إدخال سبب رفض الطلب..."
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-blue-700 text-sm">
                  هل أنت متأكد من تغيير حالة هذا الطلب إلى{" "}
                  <strong>{getStatusText(statusModal.newStatus)}</strong>؟
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 space-x-reverse p-6 border-t border-gray-200 bg-gray-50">
              <button
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                onClick={closeStatusModal}
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 space-x-reverse"
                onClick={handleStatusUpdate}
                disabled={
                  loading ||
                  (statusModal.newStatus === "rejected" &&
                    !statusModal.rejectionMessage.trim())
                }
              >
                <Check className="w-4 h-4" />
                <span>{loading ? "جاري الحفظ..." : "تأكيد التغيير"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {imageModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="relative w-full max-w-5xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white text-lg font-medium">
                الصورة {imageModal.currentIndex + 1} من {imageModal.images.length}
              </div>
              <button
                className="text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
                onClick={closeImageModal}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative bg-white rounded-lg overflow-hidden">
              <img
                src={getImageUrl(imageModal.images[imageModal.currentIndex])}
                alt={`صورة ${imageModal.currentIndex + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="hidden w-full h-96 flex-col items-center justify-center bg-gray-200 text-gray-500">
                <Image className="w-16 h-16 mb-2" />
                <span>تعذر تحميل الصورة</span>
              </div>

              {imageModal.images.length > 1 && (
                <>
                  <button
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                    onClick={prevImage}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <button
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                    onClick={nextImage}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {imageModal.images.length > 1 && (
              <div className="flex justify-center space-x-2 space-x-reverse mt-4">
                {imageModal.images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === imageModal.currentIndex
                        ? "bg-white w-8"
                        : "bg-gray-500 hover:bg-gray-400"
                    }`}
                    onClick={() => setImageModal(prev => ({ ...prev, currentIndex: index }))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingRequests;