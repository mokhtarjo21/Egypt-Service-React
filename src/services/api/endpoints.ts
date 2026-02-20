export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/accounts/login/',
        REGISTER: '/accounts/register/',
        VERIFY: '/accounts/verify/',
        RESEND_OTP: '/accounts/resend-otp/',
        REFRESH: '/accounts/refresh/',
        LOGOUT: '/accounts/logout/',
        PROFILE: '/accounts/profile/',
        CHANGE_PASSWORD: '/accounts/change-password/',
    },
    SERVICES: {
        LIST: '/services/services/',
        DETAIL: (slug: string) => `/services/services/${slug}/`,
        CATEGORIES: '/services/categories/',
        SUBCATEGORIES: '/services/subcategories/',
        FEATURED: '/services/featured/',
        SEARCH: '/services/search/',
        MY_SERVICES: '/services/services/my_services/',
        UPLOAD_IMAGES: (slug: string) => `/services/services/${slug}/upload_images/`,
        DELETE_IMAGE: (slug: string) => `/services/services/${slug}/delete_image/`,
    },
    LOCATIONS: {
        GOVERNORATES: '/health/geo/governorates/',
        CENTERS: '/health/geo/centers/',
    },
    BOOKINGS: {
        LIST: '/bookings/bookings/',
        create: '/bookings/bookings/',
        detail: (id: string) => `/bookings/bookings/${id}/`,
    }
};
