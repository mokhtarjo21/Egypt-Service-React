import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en?: string;
  price: number;
  service_type: string;
  status: string;
  category?: any;
  owner?: any;
  governorate?: any;
  images?: any[];
  views_count?: number;
  is_featured?: boolean;
  created_at: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const djangoServicesService = {
  async getServices(filters?: {
    category?: string;
    governorate_id?: number;
    service_type?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const params: any = {};

      if (filters?.category) params.category = filters.category;
      if (filters?.governorate_id) params.governorate_id = filters.governorate_id;
      if (filters?.service_type) params.service_type = filters.service_type;
      if (filters?.min_price) params.min_price = filters.min_price;
      if (filters?.max_price) params.max_price = filters.max_price;
      if (filters?.search) params.search = filters.search;
      if (filters?.page) params.page = filters.page;
      if (filters?.limit) params.limit = filters.limit;

      const response = await apiClient.get('/services/', { params });

      const results = response.data.results || response.data;
      const count = response.data.count || results.length;
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;

      return {
        data: results,
        error: null,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.response?.data?.message || 'Failed to fetch services' },
        pagination: null,
      };
    }
  },

  async getServiceBySlug(slug: string) {
    try {
      const response = await apiClient.get(`/services/${slug}/`);
      const service = response.data;

      await apiClient.post(`/services/${slug}/increment_views/`).catch(() => {});

      return { data: service, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.response?.data?.message || 'Failed to fetch service' },
      };
    }
  },

  async getCategories() {
    try {
      const response = await apiClient.get('/services/categories/');
      return { data: response.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.response?.data?.message || 'Failed to fetch categories' },
      };
    }
  },

  async getFeaturedServices() {
    try {
      const response = await apiClient.get('/services/featured/');
      return { data: response.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.response?.data?.message || 'Failed to fetch featured services' },
      };
    }
  },

  async createService(service: Partial<Service>) {
    try {
      const response = await apiClient.post('/services/', service);

      toast.success('تم إضافة الخدمة بنجاح وهي قيد المراجعة');
      return { data: response.data, error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'فشل إضافة الخدمة';
      toast.error(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  },

  async updateService(slug: string, updates: Partial<Service>) {
    try {
      const response = await apiClient.patch(`/services/${slug}/`, updates);

      toast.success('تم تحديث الخدمة بنجاح');
      return { data: response.data, error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'فشل تحديث الخدمة';
      toast.error(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  },

  async deleteService(slug: string) {
    try {
      await apiClient.delete(`/services/${slug}/`);

      toast.success('تم حذف الخدمة بنجاح');
      return { error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'فشل حذف الخدمة';
      toast.error(errorMessage);
      return { error: { message: errorMessage } };
    }
  },

  async uploadServiceImage(slug: string, file: File) {
    try {
      const formData = new FormData();
      formData.append('images', file);

      const response = await apiClient.post(`/services/${slug}/upload_images/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { data: response.data.images[0], error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'فشل رفع الصورة';
      toast.error(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  },

  async deleteServiceImage(slug: string, imageId: string) {
    try {
      await apiClient.delete(`/services/${slug}/delete_image/`, {
        data: { image_id: imageId },
      });

      toast.success('تم حذف الصورة بنجاح');
      return { error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          'فشل حذف الصورة';
      toast.error(errorMessage);
      return { error: { message: errorMessage } };
    }
  },

  async getMyServices() {
    try {
      const response = await apiClient.get('/services/my_services/');
      return { data: response.data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: { message: error.response?.data?.message || 'Failed to fetch services' },
      };
    }
  },
};

export default djangoServicesService;
