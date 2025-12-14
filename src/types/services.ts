export interface ServiceCategory {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  description_ar?: string;
  description_en?: string;
  icon?: string;
  color: string;
  is_featured: boolean;
  services_count: number;
}

export interface ServiceSubcategory {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  description_ar?: string;
  description_en?: string;
  category: ServiceCategory;
  services_count: number;
}

export interface ServiceImage {
  id: number;
  image: string;
  caption_ar?: string;
  caption_en?: string;
  sort_order: number;
}

export interface ServiceAttributeValue {
  attribute: string;
  value: string;
}

export interface Service {
  id: number;
  slug: string;
  title_ar: string;
  title_en?: string;
  description_ar: string;
  description_en?: string;
  provider: {
    id: number;
    full_name: string;
    avatar?: string;
    is_verified: boolean;
    rating?: number;
  };
  category: ServiceCategory;
  subcategory: ServiceSubcategory;
  pricing_type: 'fixed' | 'hourly' | 'package' | 'negotiable';
  base_price: number;
  currency: string;
  duration_minutes?: number;
  max_participants: number;
  is_online: boolean;
  is_on_site: boolean;
  featured_image?: string;
  images?: ServiceImage[];
  attribute_values?: ServiceAttributeValue[];
  service_areas?: string[];
  views_count: number;
  bookings_count: number;
  inquiries_count: number;
  meta_description_ar?: string;
  meta_description_en?: string;
  created_at: string;
}

export interface ServiceFilters {
  category?: number | string;
  subcategory?: number | string;
  min_price?: number;
  max_price?: number;
  pricing_type?: string;
  is_online?: boolean;
  is_on_site?: boolean;
  provider_province?: string;
  provider_city?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  current_page?: number;
  page_size?: number;
  results: T[];
}