import { apiClient } from './client';
import type { 
  Service, 
  ServiceCategory, 
  ServiceSubcategory, 
  ServiceFilters,
  PaginatedResponse 
} from '../../types/services';

export const servicesApi = {
  async getServices(params?: { 
    page?: number; 
    filters?: ServiceFilters 
  }): Promise<PaginatedResponse<Service>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) {
      searchParams.append('page', params.page.toString());
    }
    
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(`/services/services/?${searchParams.toString()}`);
    return response.data;
  },

  async getServiceBySlug(slug: string): Promise<Service> {
    const response = await apiClient.get(`/services/services/${slug}/`);
    return response.data;
  },

  async getFeaturedServices(): Promise<Service[]> {
    const response = await apiClient.get('/services/featured/');
    return response.data.results || response.data;
  },

  async getCategories(): Promise<ServiceCategory[]> {
    const response = await apiClient.get('/services/categories/');
    return response.data.results || response.data;
  },

  async getSubcategories(categorySlug: string): Promise<ServiceSubcategory[]> {
    const response = await apiClient.get(`/services/categories/${categorySlug}/subcategories/`);
    return response.data;
  },

  async searchServices(query: string): Promise<Service[]> {
    const response = await apiClient.get(`/services/search/?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  async incrementServiceViews(slug: string): Promise<void> {
    await apiClient.post(`/services/services/${slug}/increment_views/`);
  },

  async getUserServices(): Promise<Service[]> {
    const response = await apiClient.get('/services/services/my_services/');
    return response.data;
  },

  async createService(serviceData: Partial<Service>): Promise<Service> {
    const response = await apiClient.post('/services/services/', serviceData);
    return response.data;
  },

  async updateService(slug: string, serviceData: Partial<Service>): Promise<Service> {
    const response = await apiClient.patch(`/services/services/${slug}/`, serviceData);
    return response.data;
  },

  async deleteService(slug: string): Promise<void> {
    await apiClient.delete(`/services/services/${slug}/`);
  },
};