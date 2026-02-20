import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export interface Category {
    id: number;
    name_ar: string;
    name_en: string;
    slug: string;
    description_ar: string;
    description_en: string;
    icon: string;
    color: string;
    is_featured: boolean;
    services_count?: number;
}

export interface Subcategory {
    id: number;
    name_ar: string;
    name_en: string;
    slug: string;
    description_ar: string;
    description_en: string;
    category: number | Category;
    services_count?: number;
}

export const categoriesService = {
    // Categories
    getAllCategories: async () => {
        const response = await apiClient.get<any>(API_ENDPOINTS.SERVICES.CATEGORIES);
        return response.data.results || response.data;
    },

    createCategory: async (data: Partial<Category>) => {
        const response = await apiClient.post<Category>(API_ENDPOINTS.SERVICES.CATEGORIES, data);
        return response.data;
    },

    updateCategory: async (slug: string, data: Partial<Category>) => {
        const response = await apiClient.put<Category>(`${API_ENDPOINTS.SERVICES.CATEGORIES}${slug}/`, data);
        return response.data;
    },

    deleteCategory: async (slug: string) => {
        await apiClient.delete(`${API_ENDPOINTS.SERVICES.CATEGORIES}${slug}/`);
    },

    // Subcategories
    getSubcategories: async (slug: string) => {
        const response = await apiClient.get<any>(`${API_ENDPOINTS.SERVICES.CATEGORIES}${slug}/subcategories/`);
        return response.data.results || response.data;
    },

    createSubcategory: async (data: Partial<Subcategory> & { category_id: number }) => {
        const response = await apiClient.post<Subcategory>(API_ENDPOINTS.SERVICES.SUBCATEGORIES, data);
        return response.data;
    },

    updateSubcategory: async (slug: string, data: Partial<Subcategory>) => {
        const response = await apiClient.put<Subcategory>(`${API_ENDPOINTS.SERVICES.SUBCATEGORIES}${slug}/`, data);
        return response.data;
    },

    deleteSubcategory: async (slug: string) => {
        await apiClient.delete(`${API_ENDPOINTS.SERVICES.SUBCATEGORIES}${slug}/`);
    },
};
