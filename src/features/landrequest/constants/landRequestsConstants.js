// constants/landRequestsConstants.js
import { FiUser, FiBriefcase, FiAward } from "react-icons/fi";

// Custom Gift icon component
export const FiGift = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-2h14a2 2 0 110 2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
    />
  </svg>
);

// Status translations and colors
export const STATUS_CONFIG = {
  open: { text: "مفتوح", color: "bg-yellow-100 text-yellow-800" },
  pending: { text: "قيد المراجعة", color: "bg-blue-100 text-blue-800" },
  completed: { text: "مكتمل", color: "bg-green-100 text-green-800" },
  close: { text: "مغلق", color: "bg-red-100 text-red-800" },
};

export const USER_STATUS_CONFIG = {
  approved: { text: "مقبول", color: "bg-green-100 text-green-800" },
  pending: { text: "قيد المراجعة", color: "bg-yellow-100 text-yellow-800" },
  close: { text: "موقوف", color: "bg-red-100 text-red-800" },
  completed: { text: "مكتمل", color: "bg-blue-100 text-blue-800" },
};

export const USER_TYPE_CONFIG = {
  "مالك": { text: "مالك", color: "bg-purple-100 text-purple-800" },
  "وكيل شرعي": { text: "وكيل شرعي", color: "bg-indigo-100 text-indigo-800" },
  "شركة": { text: "شركة", color: "bg-blue-100 text-blue-800" },
  "وسيط عقاري": { text: "وسيط عقاري", color: "bg-cyan-100 text-cyan-800" },
  "شركة مزاد": { text: "شركة مزاد", color: "bg-pink-100 text-pink-800" },
};

// Purpose and Type translations
export const PURPOSE_TEXT = {
  sale: "بيع",
  investment: "استثمار",
};

export const TYPE_TEXT = {
  residential: "سكني",
  commercial: "تجاري",
  industrial: "صناعي",
  agricultural: "زراعي",
};

// User type details icons
export const USER_TYPE_DETAILS = {
  "مالك": { icon: FiUser, title: "معلومات المالك", key: "land_owner" },
  "وكيل شرعي": { icon: FiBriefcase, title: "معلومات الوكيل الشرعي", key: "legal_agent" },
  "شركة": { icon: FiAward, title: "معلومات الشركة", key: "business_entity" },
  "وسيط عقاري": { icon: FiAward, title: "معلومات الوسيط العقاري", key: "real_estate_broker" },
  "شركة مزاد": { icon: FiGift, title: "معلومات شركة المزاد", key: "auction_company" },
};

// Field labels for user details
export const USER_DETAIL_LABELS = {
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

// Status message placeholders
export const STATUS_MESSAGE_PLACEHOLDERS = {
  completed: "اكتب رسالة للمستخدم توضح إتمام الطلب...",
  pending: "اكتب ملاحظات حول طلب قيد المراجعة...",
  close: "اكتب سبب إغلاق الطلب...",
  open: "اكتب ملاحظات إضافية حول الطلب...",
};

// Default filters
export const DEFAULT_FILTERS = {
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