import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import {
    Calendar, Clock, MapPin, DollarSign, User, ShieldCheck,
    AlertTriangle, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { djangoBookingsService } from '../../services/django/bookingsService';
import { djangoPaymentsService } from '../../services/django/paymentsService';
import { useDirection } from '../../hooks/useDirection';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../services/api/client';
import { useTranslation } from 'react-i18next';

const BookingDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isRTL } = useDirection();
    const { user } = useAuth();
    const { t } = useTranslation();

    const [booking, setBooking] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelNotes, setCancelNotes] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMobile, setPaymentMobile] = useState('');
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [providerWallet, setProviderWallet] = useState<any>(null);

    useEffect(() => {
        if (id) {
            loadBooking(id);
        }
    }, [id]);

    const loadBooking = async (bookingId: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await djangoBookingsService.getBookingById(bookingId);
            if (error) {
                toast.error(error.message);
                navigate('/bookings');
            } else {
                setBooking(data);
            }
        } catch (error) {
            console.error(error);
            toast.error(t('booking.loadingDetailsError'));
        } finally {
            setIsLoading(false);
        }
    };

    const loadProviderWallet = async () => {
        try {
            const { data } = await apiClient.get('/payments/wallet/balance/');
            setProviderWallet(data);
        } catch (err) {
            console.error('Failed to fetch provider wallet', err);
        }
    };

    useEffect(() => {
        if (booking && user?.id === booking.provider?.id) {
            loadProviderWallet();
        }
    }, [booking, user]);

    const handleAction = async (action: 'confirm' | 'start' | 'complete') => {
        if (!booking) return;

        setIsActionLoading(true);
        try {
            let response;
            if (action === 'confirm') {
                response = await djangoBookingsService.confirmBooking(booking.id);
            } else if (action === 'start') {
                response = await djangoBookingsService.startBooking(booking.id);
            } else if (action === 'complete') {
                response = await djangoBookingsService.completeBooking(booking.id);
            }

            if (response && response.error) {
                toast.error(response.error.message);
            } else if (response) {
                setBooking(response.data);
            }
        } catch (error) {
            console.error(error);
            toast.error(`${t('booking.actionError')} ${action}`);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!booking || !cancelReason) return;

        setIsActionLoading(true);
        try {
            const { data, error } = await djangoBookingsService.cancelBooking(booking.id, {
                reason: cancelReason,
                notes: cancelNotes
            });

            if (error) {
                toast.error(error.message);
            } else {
                setBooking(data);
                setShowCancelModal(false);
            }
        } catch (error) {
            console.error(error);
            toast.error(t('booking.cancelError'));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!booking || !paymentMobile) {
            toast.error(t('booking.vodafonePhoneRequired'));
            return;
        }

        // Validate basic Egyptian mobile number (11 digits starting with 01)
        if (!/^01[0125][0-9]{8}$/.test(paymentMobile)) {
            toast.error(t('booking.vodafonePhoneInvalid'));
            return;
        }

        setIsPaymentLoading(true);
        try {
            const { data, error } = await djangoPaymentsService.checkoutVodafoneCash({
                booking_id: booking.id,
                mobile_number: paymentMobile
            });

            if (error) {
                toast.error(error.message);
            } else if (data?.redirect_url) {
                // Redirect user to Paymob iframe where the mobile USSD is triggered
                window.location.href = data.redirect_url;
            }
        } catch (error) {
            console.error(error);
            toast.error(t('booking.paymentStartError'));
        } finally {
            setIsPaymentLoading(false);
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!booking) return null;

    const isProvider = user?.id === booking.provider?.id;
    const isCustomer = user?.id === booking.customer?.id;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Provider Balance Info */}
                {isProvider && providerWallet && (
                    <Card className="mb-6 bg-blue-600 text-white border-none shadow-lg py-4 px-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-blue-100 text-sm">{t('booking.providerWalletBalance')}</p>
                                <p className="text-2xl font-bold">{providerWallet.balance} {providerWallet.currency}</p>
                            </div>
                            <Button 
                                variant="outline" 
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                onClick={() => navigate('/wallet')}
                            >
                                {t('booking.manageWallet')}
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {t('booking.bookingNumber')}{booking.booking_number}
                            <StatusBadge variant={getStatusColor(booking.status)}>
                                {booking.status_display}
                            </StatusBadge>
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {t('booking.createdAt')} {format(new Date(booking.created_at), 'PPP', { locale: isRTL ? ar : enUS })}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {/* Actions for Provider */}
                        {isProvider && booking.status === 'pending' && (
                            <Button
                                onClick={() => handleAction('confirm')}
                                isLoading={isActionLoading}
                                leftIcon={<CheckCircle className="w-4 h-4" />}
                            >
                                {t('booking.confirmBooking')}
                            </Button>
                        )}

                        {isProvider && booking.status === 'confirmed' && (
                            <Button
                                onClick={() => handleAction('start')}
                                isLoading={isActionLoading}
                                leftIcon={<Clock className="w-4 h-4" />}
                            >
                                {t('booking.startService')}
                            </Button>
                        )}

                        {isProvider && booking.status === 'in_progress' && (
                            <Button
                                onClick={() => handleAction('complete')}
                                isLoading={isActionLoading}
                                leftIcon={<CheckCircle className="w-4 h-4" />}
                            >
                                {t('booking.completeService')}
                            </Button>
                        )}

                        {/* Actions for Customer (Payment) */}
                        {isCustomer && (booking.status === 'confirmed' || booking.status === 'pending') && !booking.is_paid && (
                            <Button
                                onClick={() => setShowPaymentModal(true)}
                                className="bg-red-600 hover:bg-red-700 font-bold"
                                leftIcon={<DollarSign className="w-4 h-4" />}
                            >
                                {t('booking.payViaVodafone')}
                            </Button>
                        )}

                        {/* Actions for Customer/Provider (Cancel) */}
                        {booking.can_cancel && (
                            <Button
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => setShowCancelModal(true)}
                            >
                                {t('booking.cancelActionBtn')}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">

                        {/* Service Details */}
                        <Card>
                            <h2 className="text-lg font-semibold mb-4 border-b pb-2">{t('booking.serviceDetailsTitle')}</h2>
                            <div className="flex gap-4">
                                <img
                                    src={booking.service?.primary_image?.image || 'https://via.placeholder.com/150'}
                                    alt={booking.service?.title_ar || 'Service'}
                                    className="w-24 h-24 rounded-lg object-cover"
                                />
                                <div>
                                    <h3 className="font-bold text-lg mb-1">{booking.service?.title_ar}</h3>
                                    <p className="text-gray-600 text-sm mb-2">{booking.service?.category?.name_ar}</p>
                                    <div className="flex items-center text-primary-600 font-semibold">
                                        <DollarSign className="w-4 h-4 ml-1" />
                                        {booking.total_amount} {booking.currency}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Schedule & Location */}
                        <Card>
                            <h2 className="text-lg font-semibold mb-4 border-b pb-2">{t('booking.scheduleAndLocation')}</h2>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Calendar className="w-5 h-5 text-gray-400 ml-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">{t('booking.bookingDate')}</p>
                                        <p className="font-medium">
                                            {format(new Date(booking.scheduled_date), 'EEEE d MMMM yyyy', { locale: isRTL ? ar : enUS })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <Clock className="w-5 h-5 text-gray-400 ml-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">{t('booking.startTime')}</p>
                                        <p className="font-medium">
                                            {format(new Date(booking.scheduled_date), 'p', { locale: isRTL ? ar : enUS })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <MapPin className="w-5 h-5 text-gray-400 ml-3" />
                                    <div>
                                        <p className="text-sm text-gray-500">{t('booking.address')}</p>
                                        <p className="font-medium">
                                            {booking.location_address || t('booking.noAddress')}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {booking.location_city}, {booking.location_governorate}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Payment Status */}
                        <Card>
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h2 className="text-lg font-semibold">{t('booking.paymentDetails')}</h2>
                                <StatusBadge variant={booking.is_paid ? 'success' : 'warning'}>
                                    {booking.is_paid ? t('booking.paid') : t('booking.unpaid')}
                                </StatusBadge>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">{t('booking.basePrice')}</span>
                                    <span>{booking.service_price} {booking.currency}</span>
                                </div>
                                {booking.additional_charges > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">{t('booking.additionalFees')}</span>
                                        <span>{booking.additional_charges} {booking.currency}</span>
                                    </div>
                                )}
                                {booking.discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>{t('booking.discount')}</span>
                                        <span>-{booking.discount} {booking.currency}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                    <span>{t('booking.total')}</span>
                                    <span className="text-primary-600">{booking.total_amount} {booking.currency}</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Customer/Provider Info */}
                        <Card>
                            <h2 className="text-lg font-semibold mb-4 border-b pb-2">
                                {isCustomer ? t('booking.providerInfo') : t('booking.customerInfo')}
                            </h2>
                            {(() => {
                                const person = isCustomer ? booking.provider : booking.customer;
                                const avatarUrl = person?.avatar
                                    ? person.avatar
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(person?.full_name || 'User')}&background=3B82F6&color=fff&size=100`;
                                return (
                                    <div className="text-center">
                                        <img
                                            src={avatarUrl}
                                            alt={person?.full_name || 'Profile'}
                                            className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-gray-100 shadow"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(person?.full_name || 'U')}&background=3B82F6&color=fff&size=100`;
                                            }}
                                        />
                                        <h3 className="font-bold text-lg">{person?.full_name || '—'}</h3>
                                        <p className="text-gray-500 text-sm mb-1">{person?.phone_number || ''}</p>
                                        <p className="text-gray-400 text-xs mb-4">
                                            {isCustomer ? t('booking.trustedProvider') : t('booking.client')}
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="w-full text-sm"
                                            leftIcon={<User className="w-4 h-4" />}
                                            onClick={() => navigate(`/profile/${person?.id}`)}
                                        >
                                            {t('booking.viewProfile')}
                                        </Button>
                                    </div>
                                );
                            })()}
                        </Card>

                        {/* Safety Tips */}
                        <Card className="bg-blue-50 border-blue-100">
                            <h2 className="font-semibold text-blue-800 mb-2 flex items-center">
                                <ShieldCheck className="w-4 h-4 ml-1" />
                                {t('booking.safetyTips')}
                            </h2>
                            <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
                                <li>لا تقم بدفع أي مبالغ خارج المنصة</li>
                                <li>تأكد من هوية الطرف الآخر</li>
                                <li>في حالة الطوارئ اتصل بالدعم</li>
                            </ul>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            <Modal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                title={t('booking.cancelConfirmMsgTitle')}
            >
                <div className="space-y-4">
                    <div className="bg-red-50 p-3 rounded-lg flex items-start">
                        <AlertTriangle className="w-5 h-5 text-red-500 ml-2 mt-0.5" />
                        <p className="text-sm text-red-700">
                            {t('booking.cancelConfirmMsg')}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('booking.cancelReason')}
                        </label>
                        <select
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        >
                            <option value="">{t('booking.selectReason')}</option>
                            <option value="schedule_conflict">{t('booking.scheduleConflict')}</option>
                            <option value="found_alternative">{t('booking.foundAlternative')}</option>
                            <option value="price_issue">{t('booking.priceIssue')}</option>
                            <option value="other">{t('booking.otherReason')}</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ملاحظات إضافية
                        </label>
                        <textarea
                            rows={3}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                            value={cancelNotes}
                            onChange={(e) => setCancelNotes(e.target.value)}
                            placeholder={t('booking.explainReason')}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                            {t('booking.goBack')}
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                            onClick={handleCancel}
                            isLoading={isActionLoading}
                            disabled={!cancelReason}
                        >
                            {t('booking.confirmCancel')}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Payment Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title={t('booking.vodafonePaymentTitle')}
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        {t('booking.paymentInstructions1')} <span className="font-bold text-gray-900">{booking.total_amount} {booking.currency}</span>{t('booking.paymentInstructions2')}
                    </p>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('booking.phoneNumber')}
                        </label>
                        <input
                            type="tel"
                            placeholder="010XXXXXXXX"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-left"
                            dir="ltr"
                            value={paymentMobile}
                            onChange={(e) => setPaymentMobile(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            {t('booking.smsInfo')}
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                            {t('addService.cancel')}
                        </Button>
                        <Button
                            onClick={handlePayment}
                            isLoading={isPaymentLoading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={!paymentMobile || isPaymentLoading}
                            leftIcon={<DollarSign className="w-4 h-4" />}
                        >
                            {t('booking.confirmAndPay')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BookingDetailPage;
