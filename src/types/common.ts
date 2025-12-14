export interface Province {
  id: number;
  name_ar: string;
  name_en: string;
  code: string;
}

export interface City {
  id: number;
  name_ar: string;
  name_en: string;
  province: Province;
}

export interface APIError {
  message: string;
  field?: string;
  code?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}