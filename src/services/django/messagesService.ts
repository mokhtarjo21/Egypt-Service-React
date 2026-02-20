import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

interface ConversationCreateData {
    service: string;
    provider: string;
    initial_message?: string;
}

interface MessageSendData {
    conversation: string;
    content: string;
    message_type?: 'text' | 'image' | 'file';
}

export const djangoMessagesService = {
    async getConversations() {
        try {
            const response = await apiClient.get('/messages/conversations/');
            return { data: response.data, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error.response?.data?.message || 'فشل جلب المحادثات' },
            };
        }
    },

    async getConversationById(conversationId: string) {
        try {
            const response = await apiClient.get(`/messages/conversations/${conversationId}/`);
            return { data: response.data, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error.response?.data?.message || 'فشل جلب المحادثة' },
            };
        }
    },

    async getMessages(conversationId: string, page?: number) {
        try {
            const params: any = {};
            if (page) params.page = page;
            const response = await apiClient.get(
                `/messages/conversations/${conversationId}/messages/`,
                { params }
            );
            return { data: response.data, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error.response?.data?.message || 'فشل جلب الرسائل' },
            };
        }
    },

    async sendMessage(data: MessageSendData) {
        try {
            const response = await apiClient.post('/messages/messages/', {
                ...data,
                message_type: data.message_type || 'text',
            });
            return { data: response.data, error: null };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'فشل إرسال الرسالة';
            toast.error(errorMessage);
            return { data: null, error: { message: errorMessage } };
        }
    },

    async createConversation(data: ConversationCreateData) {
        try {
            const response = await apiClient.post('/messages/conversations/', data);
            return { data: response.data, error: null };
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'فشل إنشاء المحادثة';
            toast.error(errorMessage);
            return { data: null, error: { message: errorMessage } };
        }
    },

    async archiveConversation(conversationId: string) {
        try {
            const response = await apiClient.post(
                `/messages/conversations/${conversationId}/archive/`
            );
            return { data: response.data, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: { message: error.response?.data?.message || 'فشل أرشفة المحادثة' },
            };
        }
    },
};

export default djangoMessagesService;
