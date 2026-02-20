import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

export const djangoNotificationsService = {
    async getNotifications(unreadOnly?: boolean) {
        try {
            const params: any = {};
            if (unreadOnly) params.is_read = false;
            const response = await apiClient.get('/notifications/notifications/', { params });
            return { data: response.data, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error.response?.data?.message || 'فشل جلب الإشعارات' },
            };
        }
    },

    async markAsRead(notificationId: string) {
        try {
            const response = await apiClient.post(
                `/notifications/notifications/${notificationId}/mark_read/`
            );
            return { data: response.data, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error.response?.data?.message || 'فشل تحديث الإشعار' },
            };
        }
    },

    async markAllAsRead() {
        try {
            const response = await apiClient.post(
                '/notifications/notifications/mark_all_read/'
            );
            toast.success('تم تحديد جميع الإشعارات كمقروءة');
            return { data: response.data, error: null };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'فشل تحديث الإشعارات';
            toast.error(errorMessage);
            return { data: null, error: { message: errorMessage } };
        }
    },

    async getUnreadCount() {
        try {
            const response = await apiClient.get('/notifications/notifications/', {
                params: { is_read: false, page_size: 1 },
            });
            const count = response.data.count ?? 0;
            return { data: count, error: null };
        } catch (error: any) {
            return { data: 0, error: null };
        }
    },
};

export default djangoNotificationsService;
