import { apiClient } from '../api/client';

export interface ApiResponse<T = any> {
    data: T | null;
    error: {
        message: string;
        code?: string;
        details?: any;
    } | null;
}

interface CheckoutRequest {
    booking_id: string;
    mobile_number: string;
}

interface SubscriptionCheckoutRequest {
    plan_id: string;
    mobile_number: string;
}

interface CheckoutResponse {
    redirect_url: string;
}

export const djangoPaymentsService = {
    /**
     * Initiate a Vodafone Cash Payment checkout for a booking.
     * @param data The booking ID and Vodafone Cash mobile number
     * @returns A redirect URL to Paymob's payment iframe/page
     */
    checkoutVodafoneCash: async (data: CheckoutRequest): Promise<ApiResponse<CheckoutResponse>> => {
        try {
            const response = await apiClient.post('/payments/checkout/paymob/', data);
            return { data: response.data, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: {
                    message: error.response?.data?.detail || 'فشل في الاتصال ببوابة الدفع. الرجاء المحاولة مرة أخرى.',
                    code: error.response?.status?.toString(),
                    details: error.response?.data
                }
            };
        }
    },

    /**
     * Initiate a subscription payment via Paymob.
     * @param data The plan ID and Vodafone Cash mobile number
     * @returns A redirect URL to Paymob's payment page
     */
    checkoutSubscription: async (data: SubscriptionCheckoutRequest): Promise<ApiResponse<CheckoutResponse>> => {
        try {
            const response = await apiClient.post('/payments/checkout/subscription/paymob/', data);
            return { data: response.data, error: null };
        } catch (error: any) {
            return {
                data: null,
                error: {
                    message: error.response?.data?.detail || 'فشل في الاتصال ببوابة الدفع. الرجاء المحاولة مرة أخرى.',
                    code: error.response?.status?.toString(),
                    details: error.response?.data
                }
            };
        }
    },
};

