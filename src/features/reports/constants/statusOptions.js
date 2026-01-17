/**
 * Status options for each report type
 */
export const statusOptions = {
  properties: [
    { value: "all", label: "الكل" },
    { value: "مفتوح", label: "مفتوح" },
    { value: "قيد المراجعة", label: "قيد المراجعة" },
    { value: "مرفوض", label: "مرفوض" },
    { value: "تم البيع", label: "تم البيع" },
  ],
  users: [
    { value: "all", label: "الكل" },
    { value: "approved", label: "مقبول" },
    { value: "pending", label: "قيد المراجعة" },
    { value: "rejected", label: "مرفوض" },
  ],
  auctions: [
    { value: "all", label: "الكل" },
    { value: "مفتوح", label: "مفتوح" },
    { value: "مغلق", label: "مغلق" },
    { value: "قيد المراجعة", label: "قيد المراجعة" },
    { value: "مرفوض", label: "مرفوض" },
  ],
  interests: [
    { value: "all", label: "الكل" },
    { value: "pending", label: "قيد المراجعة" },
    { value: "reviewed", label: "تمت المراجعة" },
    { value: "cancelled", label: "ملغي" },
  ],
};

export const tableHeaders = {
  users: [
    "الاسم الكامل",
    "البريد الإلكتروني",
    "الحالة",
    "نوع المستخدم",
    "تاريخ التسجيل",
  ],
  properties: [
    "العنوان",
    "المنطقة",
    "المدينة",
    "الحالة",
    "المالك",
    "تاريخ الإضافة",
  ],
  auctions: [
    "العنوان",
    "الحالة",
    "تاريخ المزاد",
    "الشركة",
    "المالك",
    "تاريخ الإنشاء",
  ],
  interests: [
    "المستخدم",
    "البريد الإلكتروني",
    "العقار",
    "الحالة",
    "تاريخ الاهتمام",
  ],
};

/**
 * Get status badge CSS class based on status
 */
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case "approved":
    case "مقبول":
      return "bg-green-100 text-green-800";
    case "pending":
    case "قيد المراجعة":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
    case "مرفوض":
      return "bg-red-100 text-red-800";
    case "reviewed":
    case "تمت المراجعة":
      return "bg-blue-100 text-blue-800";
    case "cancelled":
    case "ملغي":
      return "bg-gray-100 text-gray-800";
    case "مفتوح":
      return "bg-teal-100 text-teal-800";
    case "مغلق":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Get status text in Arabic
 */
export const getStatusText = (status) => {
  switch (status) {
    case "approved":
      return "مقبول";
    case "pending":
      return "قيد المراجعة";
    case "rejected":
      return "مرفوض";
    case "reviewed":
      return "تمت المراجعة";
    case "cancelled":
      return "ملغي";
    case "مفتوح":
      return "مفتوح";
    case "مغلق":
      return "مغلق";
    case "قيد المراجعة":
      return "قيد المراجعة";
    default:
      return status;
  }
};