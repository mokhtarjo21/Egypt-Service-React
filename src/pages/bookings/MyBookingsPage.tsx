import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Calendar, DollarSign, User, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { djangoBookingsService } from '../../services/django/bookingsService';
import { useDirection } from '../../hooks/useDirection';

interface Booking {
    id: string;
    booking_number: string;
    service: {
        id: string;
        title_ar: string;
        title_en: string;
        primary_image: any;
    };
    customer: {
        first_name: string;
        last_name: string;
        profile_image: string;
    };
    provider: {
        first_name: string;
        last_name: string;
        profile_image: string;
    };
    status: string;
    status_display: string;
    scheduled_date: string;
    total_amount: number;
    currency: string;
}

const MyBookingsPage: React.FC = () => {
    // t and i18n from useTranslation not currently used in this component
    const { isRTL } = useDirection();
    const [activeTab, setActiveTab] = useState<'customer' | 'provider'>('customer');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');

    useEffect(() => {
        loadBookings();
    }, [activeTab, statusFilter]);

    const loadBookings = async () => {
        setIsLoading(true);
        try {
            let response;
            if (activeTab === 'customer') {
                response = await djangoBookingsService.getMyBookings(statusFilter);
            } else {
                response = await djangoBookingsService.getReceivedBookings(statusFilter);
            }

            if (response.error) {
                toast.error(response.error.message);
            } else {
                setBookings(response.data.results || []);
            }
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء تحميل الحجوزات');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
            case 'completed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'in_progress':
                return 'info';
            case 'cancelled_by_customer':
            case 'cancelled_by_provider':
            case 'refunded':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">حجوزاتي</h1>
                    <p className="text-gray-600">إدارة جميع حجوزاتك الحالية والسابقة</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'customer'
                            ? 'border-b-2 border-primary-600 text-primary-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('customer')}
                    >
                        حجوزات قمت بها
                    </button>
                    <button
                        className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'provider'
                            ? 'border-b-2 border-primary-600 text-primary-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('provider')}
                    >
                        حجوزات مستلمة (كمزود خدمة)
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-6 flex space-x-2 rtl:space-x-reverse overflow-x-auto pb-2">
                    <Button
                        size="sm"
                        variant={statusFilter === '' ? 'primary' : 'outline'}
                        onClick={() => setStatusFilter('')}
                    >
                        الكل
                    </Button>
                    <Button
                        size="sm"
                        variant={statusFilter === 'pending' ? 'primary' : 'outline'}
                        onClick={() => setStatusFilter('pending')}
                    >
                        قيد الانتظار
                    </Button>
                    <Button
                        size="sm"
                        variant={statusFilter === 'confirmed' ? 'primary' : 'outline'}
                        onClick={() => setStatusFilter('confirmed')}
                    >
                        مؤكدة
                    </Button>
                    <Button
                        size="sm"
                        variant={statusFilter === 'completed' ? 'primary' : 'outline'}
                        onClick={() => setStatusFilter('completed')}
                    >
                        مكتملة
                    </Button>
                    <Button
                        size="sm"
                        variant={statusFilter.includes('cancelled') ? 'primary' : 'outline'}
                        onClick={() => setStatusFilter('cancelled')}
                    >
                        ملغاة
                    </Button>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : bookings.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {bookings.map((booking) => (
                            <Card key={booking.id} className="hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                        <img
                                            src={booking.service?.primary_image?.image || 'https://via.placeholder.com/150'}
                                            alt={booking.service?.title_ar || 'Service'}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                        <div>
                                            <h3 className="font-semibold text-gray-900 line-clamp-1">
                                                {isRTL ? booking.service?.title_ar : booking.service?.title_en}
                                            </h3>
                                            <p className="text-xs text-gray-500">#{booking.booking_number}</p>
                                        </div>
                                    </div>
                                    <StatusBadge variant={getStatusColor(booking.status)}>
                                        {booking.status_display}
                                    </StatusBadge>
                                </div>

                                <div className="space-y-3 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 ml-2" />
                                        <span>
                                            {format(new Date(booking.scheduled_date), 'EEEE d MMMM yyyy - p', {
                                                locale: isRTL ? ar : enUS,
                                            })}
                                        </span>
                                    </div>

                                    <div className="flex items-center">
                                        <User className="w-4 h-4 ml-2" />
                                        <span>
                                            {activeTab === 'customer'
                                                ? `مقدم الخدمة: ${booking.provider?.first_name || ''} ${booking.provider?.last_name || ''}`
                                                : `العميل: ${booking.customer?.first_name || ''} ${booking.customer?.last_name || ''}`
                                            }
                                        </span>
                                    </div>

                                    <div className="flex items-center">
                                        <DollarSign className="w-4 h-4 ml-2" />
                                        <span className="font-semibold text-gray-900">
                                            {booking.total_amount} {booking.currency}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t pt-4 mt-auto">
                                    <Link to={`/bookings/${booking.id}`} className="block">
                                        <Button variant="outline" className="w-full">
                                            عرض التفاصيل
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حجوزات</h3>
                        <p className="text-gray-500 mb-6">
                            {activeTab === 'customer'
                                ? 'لم تقم بحجز أي خدمة حتى الآن'
                                : 'لم تتلق أي طلبات حجز بعد'}
                        </p>
                        {activeTab === 'customer' && (
                            <Link to="/services">
                                <Button>تصفح الخدمات</Button>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookingsPage;
