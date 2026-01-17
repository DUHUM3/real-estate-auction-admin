// constants/usersConstants.js
// مسؤول عن: تعريف الثوابت والبيانات الثابتة المستخدمة في الميزة

export const USER_STATUS = {
  ALL: 'all',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const USER_TYPES = {
  ALL: 'all',
  GENERAL: '1',
  LAND_OWNER: '2',
  LEGAL_AGENT: '3',
  BUSINESS_ENTITY: '4',
  REAL_ESTATE_BROKER: '5',
  AUCTION_COMPANY: '6',
};

export const USER_TYPE_NAMES = {
  1: 'مستخدم عام',
  2: 'مالك أرض',
  3: 'وكيل شرعي',
  4: 'جهة تجارية',
  5: 'وسيط عقاري',
  6: 'شركة مزادات',
};

export const SORT_FIELDS = {
  CREATED_AT: 'created_at',
  FULL_NAME: 'full_name',
  EMAIL: 'email',
};

export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
};

export const DEFAULT_FILTERS = {
  search: '',
  status: USER_STATUS.ALL,
  user_type_id: USER_TYPES.ALL,
  sort_field: SORT_FIELDS.CREATED_AT,
  sort_direction: SORT_DIRECTIONS.DESC,
};

export const API_BASE_URL = 'https://core-api-x41.shaheenplus.sa';

export const STORAGE_BASE_URL = `${API_BASE_URL}/storage`;