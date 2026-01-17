// Static values and default configurations for interests feature

export const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  property_id: "all",
  date_from: "",
  date_to: "",
  sort_by: "created_at",
  sort_order: "desc",
};

export const STORAGE_KEYS = {
  FILTERS: "interestsFilters",
  CURRENT_PAGE: "interestsCurrentPage",
  SELECTED_INTEREST: "selectedInterest",
};

export const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const COPY_TIMEOUT = 2000; // 2 seconds

export const IMAGE_BASE_URL = "https://core-api-x41.shaheenplus.sa/storage/";