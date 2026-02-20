import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

interface ReviewCreateData {
    service: string;
    rating: number;
    comment_ar?: string;
    comment_en?: string;
}

interface ReviewUpdateData {
    rating?: number;
    comment_ar?: string;
    comment_en?: string;
}

export const djangoReviewsService = {
    async getServiceReviews(serviceSlug: string, page?: number) {
        try {
            const params: any = { service: serviceSlug };
            if (page) params.page = page;
            const response = await apiClient.get('/reviews/reviews/', { params });
            return { data: response.data, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error.response?.data?.message || 'فشل جلب التقييمات' },
            };
        }
    },

    async createReview(data: ReviewCreateData) {
        try {
            const response = await apiClient.post('/reviews/reviews/', data);
            toast.success('تم إضافة تقييمك بنجاح');
            return { data: response.data, error: null };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'فشل إضافة التقييم';
            toast.error(errorMessage);
            return { data: null, error: { message: errorMessage } };
        }
    },

    async updateReview(reviewId: string, data: ReviewUpdateData) {
        try {
            const response = await apiClient.patch(`/reviews/reviews/${reviewId}/`, data);
            toast.success('تم تحديث تقييمك بنجاح');
            return { data: response.data, error: null };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'فشل تحديث التقييم';
            toast.error(errorMessage);
            return { data: null, error: { message: errorMessage } };
        }
    },

    async deleteReview(reviewId: string) {
        try {
            await apiClient.delete(`/reviews/reviews/${reviewId}/`);
            toast.success('تم حذف التقييم بنجاح');
            return { error: null };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'فشل حذف التقييم';
            toast.error(errorMessage);
            return { error: { message: errorMessage } };
        }
    },
};

export default djangoReviewsService;
