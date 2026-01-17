// Configuration for contact statuses
export const STATUS_CONFIG = {
  'غير مقروءة': {
    label: 'غير مقروءة',
    badgeColor: 'bg-yellow-100 text-yellow-800'
  },
  'مقروءة': {
    label: 'مقروءة',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  'تم التواصل': {
    label: 'تم التواصل',
    badgeColor: 'bg-green-100 text-green-800'
  }
};

// Default filter values
export const DEFAULT_FILTERS = {
  search: "",
  status: "",
  start_date: "",
  end_date: "",
  sort_by: "created_at",
  sort_order: "desc",
  per_page: 8,
};

// Pagination items per page options
export const PER_PAGE_OPTIONS = [5, 8, 15, 25, 50];

// Sort by field options
export const SORT_BY_OPTIONS = [
  { value: 'created_at', label: 'التاريخ' },
  { value: 'full_name', label: 'الاسم' },
  { value: 'email', label: 'البريد الإلكتروني' },
  { value: 'reason', label: 'الموضوع' },
  { value: 'status', label: 'الحالة' }
];

// Sort order options
export const SORT_ORDER_OPTIONS = [
  { value: 'desc', label: 'تنازلي' },
  { value: 'asc', label: 'تصاعدي' }
];

// Status filter options
export const STATUS_OPTIONS = [
  { value: '', label: 'جميع الحالات' },
  { value: 'غير مقروءة', label: 'غير مقروءة' },
  { value: 'مقروءة', label: 'مقروءة' },
  { value: 'تم التواصل', label: 'تم التواصل' }
];