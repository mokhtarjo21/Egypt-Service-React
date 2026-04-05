import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, MapPin, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { djangoServicesService } from '../../services/django/servicesService';
import { djangoBookingsService } from '../../services/django/bookingsService';

interface BookingFormData {
    scheduled_date: string;
    scheduled_time: string;
    notes?: string;
    address?: string;
}

const BookServicePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [service, setService] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const { t } = useTranslation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<BookingFormData>();

    useEffect(() => {
        if (id) {
            loadService(id);
        }
    }, [id]);

    const loadService = async (serviceId: string) => {
        try {
            const { data, error } = await djangoServicesService.getServiceById(serviceId);
            if (error) {
                toast.error(t('booking.loadServiceError'));
                navigate('/services');
                return;
            }
            if (user && (user as any).id === data.owner?.id) {
                toast.error(t('booking.cantBookOwnService'));
                navigate('/services');
                return;
            }
            
            setService(data);
        } catch (error) {
            console.error(error);
            toast.error(t('booking.unexpectedError'));
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: BookingFormData) => {
        if (!service) return;

        setIsSubmitting(true);
        try {
            // Combine date and time
            const scheduledDateTime = `${data.scheduled_date}T${data.scheduled_time}:00`;

            const bookingData = {
                service_id: service.id,
                service_price: service.price.toString(),
                scheduled_date: scheduledDateTime,
                notes: data.notes,
                location_address: data.address,
            };

          

            const { data: booking, error } = await djangoBookingsService.createBooking(bookingData);

            if (error) {
                // Error is already handled/toasted in service
                return;
            }

            toast.success(t('booking.bookingSuccess'));
            navigate(`/bookings/${booking.id}`);
        } catch (error) {
            console.error(error);
            toast.error(t('booking.createBookingError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">{t('booking.serviceNotFound')}</h2>
                <Button onClick={() => navigate('/services')} className="mt-4">
                    {t('booking.browseServices')}
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('booking.title')}</h1>
                    <p className="text-gray-600">{t('booking.fillDetails')}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Booking Form */}
                    <div className="md:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Card>
                                <h2 className="text-xl font-semibold mb-6 flex items-center">
                                    <Calendar className="w-5 h-5 ml-2 text-primary-600" />
                                    {t('booking.bookingDateTitle')}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <Input
                                        type="date"
                                        label={`${t('booking.bookingDate')} *`}
                                        error={errors.scheduled_date?.message}
                                        min={new Date().toISOString().split('T')[0]}
                                        {...register('scheduled_date', { required: t('booking.dateRequired') })}
                                    />

                                    <Input
                                        type="time"
                                        label={`${t('booking.time')} *`}
                                        error={errors.scheduled_time?.message}
                                        {...register('scheduled_time', { required: t('booking.timeRequired') })}
                                    />
                                </div>

                                <div className="mb-6">
                                    <Input
                                        label={t('booking.detailedAddress')}
                                        placeholder={t('booking.addressPlaceholder')}
                                        error={errors.address?.message}
                                        {...register('address', { required: t('booking.addressRequired') })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('booking.notes')}
                                    </label>
                                    <textarea
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder={t('booking.notesPlaceholder')}
                                        {...register('notes')}
                                    />
                                </div>
                            </Card>

                            <div className="mt-6 flex justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="ml-4"
                                    onClick={() => navigate(`/services/${service.id}`)}
                                >
                                    {t('addService.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    leftIcon={<Clock className="w-5 h-5" />}
                                >
                                    {t('booking.confirmBooking')}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Service Summary */}
                    <div>
                        <Card>
                            <div className="mb-4">
                                <img
                                    src={service.primary_image?.image || 'https://via.placeholder.com/300'}
                                    alt={service.title_ar}
                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                />
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{service.title_ar}</h3>
                                <p className="text-sm text-gray-500 flex items-center">
                                    <MapPin className="w-4 h-4 ml-1" />
                                    {service.governorate?.name_ar}, {service.center?.name_ar}
                                </p>
                            </div>

                            <div className="border-t pt-4 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">{t('booking.provider')}</span>
                                    <span className="font-semibold">{service.owner?.first_name} {service.owner?.last_name}</span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">{t('booking.servicePrice')}</span>
                                    <span className="font-bold text-primary-600 flex items-center">
                                        {service.price} <span className="text-xs mr-1">{service.currency}</span>
                                    </span>
                                </div>

                                <div className="bg-blue-50 p-3 rounded-lg flex items-start mt-4">
                                    <Info className="w-5 h-5 text-blue-500 ml-2" />
                                    <p className="text-xs text-blue-700 leading-relaxed">
                                        {t('booking.paymentNote')}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookServicePage;
