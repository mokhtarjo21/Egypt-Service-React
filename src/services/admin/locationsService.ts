import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export interface Governorate {
    id: number;
    name_ar: string;
    name_en: string;
    code: string;
}

export interface City {
    id: number;
    name_ar: string;
    name_en: string;
    province: number;
}

export const locationsService = {
    // Governorates
    getAllGovernorates: async () => {
        const response = await apiClient.get<any>(API_ENDPOINTS.LOCATIONS.GOVERNORATES);
        return response.data.results || response.data;
    },

    createGovernorate: async (data: Partial<Governorate>) => {
        const response = await apiClient.post<Governorate>(API_ENDPOINTS.LOCATIONS.GOVERNORATES, data);
        return response.data;
    },

    updateGovernorate: async (id: number, data: Partial<Governorate>) => {
        const response = await apiClient.put<Governorate>(`${API_ENDPOINTS.LOCATIONS.GOVERNORATES}${id}/`, data);
        return response.data;
    },

    deleteGovernorate: async (id: number) => {
        await apiClient.delete(`${API_ENDPOINTS.LOCATIONS.GOVERNORATES}${id}/`);
    },

    // Cities
    getCities: async (governorateId?: number) => {
        const url = governorateId
            ? `${API_ENDPOINTS.LOCATIONS.CENTERS}?gov_id=${governorateId}`
            : API_ENDPOINTS.LOCATIONS.CENTERS;
        const response = await apiClient.get<any>(url);
        return response.data.results || response.data;
    },

    createCity: async (data: Partial<City>) => {
        const response = await apiClient.post<City>(API_ENDPOINTS.LOCATIONS.CENTERS, data);
        return response.data;
    },

    updateCity: async (id: number, data: Partial<City>) => {
        const response = await apiClient.put<City>(`${API_ENDPOINTS.LOCATIONS.CENTERS}${id}/`, data);
        return response.data;
    },

    deleteCity: async (id: number) => {
        await apiClient.delete(`${API_ENDPOINTS.LOCATIONS.CENTERS}${id}/`);
    },
};
