import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

interface BookingCreateData {
    service_id: string;
    service_price: string;
    scheduled_date: string;
    scheduled_time?: string;
    notes?: string;
    location_address?: string;
}

interface BookingCancelData {
    reason: string;
    notes?: string;
}

export const djangoBookingsService = {
    async getMyBookings(statusFilter?: string) {
        try {
            const params: any = {};
            if (statusFilter) params.status = statusFilter;
            const response = await apiClient.get('/bookings/my_bookings/', { params });
            return { data: response.data, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error.response?.data?.message || 'فشل جلب الحجوزات' },
            };
        }
    },

    async getReceivedBookings(statusFilter?: string) {
        try {
            const params: any = {};
            if (statusFilter) params.status = statusFilter;
            const response = await apiClient.get('/bookings/received_bookings/', { params });
            return { data: response.data, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error.response?.data?.message || 'فشل جلب الحجوزات المستلمة' },
            };
        }
    },

    async getBookingById(id: string) {
        try {
            const response = await apiClient.get(`/bookings/${id}/`);
            return { data: response.data, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error.response?.data?.message || 'فشل جلب تفاصيل الحجز' },
            };
        }
    },

    async createBooking(data: BookingCreateData) {
        try {
            const response = await apiClient.post('/bookings/', data);
            toast.success('تم إنشاء الحجز بنجاح');
            return { data: response.data, error: null };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'فشل إنشاء الحجز';
            toast.error(errorMessage);
            return { data: null, error: { message: errorMessage } };
        }
    },

    async confirmBooking(id: string) {
        try {
            const response = await apiClient.post(`/bookings/${id}/confirm/`);
            toast.success('تم تأكيد الحجز بنجاح');
            return { data: response.data, error: null };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'فشل تأكيد الحجز';
            toast.error(errorMessage);
            return { data: null, error: { message: errorMessage } };
        }
    },

    async startBooking(id: string) {
        try {
            const response = await apiClient.post(`/bookings/${id}/start/`);
            toast.success('تم بدء تنفيذ الخدمة');
            return { data: response.data, error: null };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'فشل بدء الخدمة';
            toast.error(errorMessage);
            return { data: null, error: { message: errorMessage } };
        }
    },

    async completeBooking(id: string) {
        try {
            const response = await apiClient.post(`/bookings/${id}/complete/`);
            toast.success('تم إكمال الحجز بنجاح');
            return { data: response.data, error: null };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'فشل إكمال الحجز';
            toast.error(errorMessage);
            return { data: null, error: { message: errorMessage } };
        }
    },

    async cancelBooking(id: string, cancelData: BookingCancelData) {
        try {
            const response = await apiClient.post(`/bookings/${id}/cancel/`, cancelData);
            toast.success('تم إلغاء الحجز');
            return { data: response.data, error: null };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'فشل إلغاء الحجز';
            toast.error(errorMessage);
            return { data: null, error: { message: errorMessage } };
        }
    },

    async getBookingStats() {
        try {
            const response = await apiClient.get('/bookings/stats/');
            return { data: response.data, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error.response?.data?.message || 'فشل جلب إحصائيات الحجوزات' },
            };
        }
    },
};

export default djangoBookingsService;
