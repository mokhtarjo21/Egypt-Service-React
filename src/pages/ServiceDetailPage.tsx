import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Star, MapPin, Clock, Users, Shield, MessageCircle, Flag, Heart, ChevronLeft, ChevronRight, Eye, ThumbsUp } from 'lucide-react';

import { RootState, AppDispatch } from '../store/store';
import { fetchServiceBySlug } from '../store/slices/servicesSlice';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { SentimentBar } from '../components/ui/SentimentBar';
import { ReportModal } from '../components/ui/ReportModal';
import { ReviewForm } from '../components/ui/ReviewForm';
import { useDirection } from '../hooks/useDirection';
import { formatCurrency, formatRelativeTime } from '../utils/dateFormatter';

const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const dispatch = useDispatch<AppDispatch>();
  
  const { currentService: service, isLoading } = useSelector((state: RootState) => state.services);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [sentimentData, setSentimentData] = useState(null);

  useEffect(() => {
    if (slug) {
      dispatch(fetchServiceBySlug(slug) as any);
    }
  }, [slug, dispatch]);

  useEffect(() => {
    if (service) {
      loadRecommendations();
      loadSentimentData();
    }
  }, [service]);

  const loadRecommendations = async () => {
    try {
      const response = await fetch(`/api/v1/recommendations/services/${service.id}/`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const loadSentimentData = async () => {
    try {
      const response = await fetch(`/api/v1/recommendations/sentiment/${service.owner.id}/`);
      if (response.ok) {
        const data = await response.json();
        setSentimentData(data);
      }
    } catch (error) {
      console.error('Failed to load sentiment data:', error);
    }
  };
  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // TODO: API call to add/remove from favorites
  };

  const handleContactProvider = () => {
    if (!user) {
      // Redirect to login
      return;
    }
    // TODO: Create conversation or navigate to existing one
  };

  const nextImage = () => {
    if (service?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % service.images.length);
    }
  };

  const prevImage = () => {
    if (service?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + service.images.length) % service.images.length);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الخدمة غير موجودة</h2>
          <p className="text-gray-600 mb-4">الخدمة التي تبحث عنها غير متاحة أو تم حذفها</p>
          <Link to="/services">
            <Button>تصفح الخدمات</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
            <Link to="/" className="hover:text-primary-600">الرئيسية</Link>
            <span>/</span>
            <Link to="/services" className="hover:text-primary-600">الخدمات</Link>
            <span>/</span>
            <span className="text-gray-900">{service.category.name_ar}</span>
            <span>/</span>
            <span className="text-gray-900">{service.subcategory.name_ar}</span>
          </div>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Images */}
            <Card className="!p-0 overflow-hidden">
              {service.images && service.images.length > 0 ? (
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-10">
                    <img
                      src={service.images[currentImageIndex]?.image}
                      alt={isRTL ? service.title_ar : service.title_en || service.title_ar}
                      className="w-full h-96 object-cover"
                    />
                  </div>
                  
                  {service.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75`}
                      >
                        {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={nextImage}
                        className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'} bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75`}
                      >
                        {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="aspect-w-16 aspect-h-10 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">لا توجد صور</span>
                </div>
              )}
              
              {service.images && service.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {service.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-primary-500' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image.image}
                        alt={`${service.title_ar} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Service Details */}
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {isRTL ? service.title_ar : service.title_en || service.title_ar}
                  </h1>
                  
                  {/* Service Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.owner.is_verified && <Badge type="verified" />}
                    {(service.owner.rating || 0) >= 4.8 && <Badge type="top_rated" />}
                    <Badge type="responsive" />
                    <Badge type="featured" />
                  </div>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFavorite}
                    className={isFavorited ? 'text-red-500' : 'text-gray-400'}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReportModal(true)}
                  >
                    <Flag className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-6 mb-6 text-gray-600">
                {service.duration_minutes && (
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    {service.duration_minutes} دقيقة
                  </div>
                )}
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  {service.is_on_site && service.is_online ? 'خدمة منزلية وعبر الإنترنت' : 
                   service.is_on_site ? 'خدمة منزلية' : 'عبر الإنترنت'}
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  حتى {service.max_participants} شخص
                </div>
                <div className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  {service.views_count} مشاهدة
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                {isRTL ? service.description_ar : service.description_en || service.description_ar}
              </p>

              {/* Service Attributes */}
              {service.attribute_values && service.attribute_values.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    مميزات الخدمة
                  </h3>
                  <ul className="grid md:grid-cols-2 gap-2">
                    {service.attribute_values.map((attr, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <Shield className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {attr.attribute}: {attr.value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex space-x-4 rtl:space-x-reverse pt-6 border-t border-gray-200">
                <Button
                  onClick={() => setShowReviewModal(true)}
                  variant="outline"
                  leftIcon={<Star className="w-4 h-4" />}
                  disabled={!user}
                >
                  كتابة تقييم
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<Flag className="w-4 h-4" />}
                  onClick={() => setShowReportModal(true)}
                >
                  إبلاغ
                </Button>
              </div>
            </Card>

            {/* Reviews Section */}
            <Card>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                التقييمات والمراجعات
              </h3>
              
              <div className="space-y-6">
                {/* Review Summary */}
                <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {service.owner.rating || 4.5}
                    </div>
                    <div className="flex items-center justify-center mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(service.owner.rating || 4.5)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      {service.owner.total_reviews || 0} تقييم
                    </div>
                  </div>
                  
                  {/* Rating Distribution */}
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="text-sm text-gray-600 w-8">{stars}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${Math.random() * 80 + 10}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">
                          {Math.floor(Math.random() * 50 + 10)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Individual Reviews - Mock data */}
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-start gap-3">
                        <img
                          src={`https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50`}
                          alt="Reviewer"
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              عميل {index + 1}
                            </span>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < 5 - index
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                              شراء مُحقق
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            خدمة ممتازة وسريعة. تم إصلاح الثلاجة في وقت قياسي والفني محترف جداً.
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              منذ {index + 1} أسبوع
                            </span>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <button className="flex items-center text-xs text-gray-500 hover:text-primary-600">
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                مفيد (12)
                              </button>
                              <button className="text-xs text-gray-500 hover:text-primary-600">
                                مفيد (12)
                              </button>
                              <button className="text-xs text-gray-500 hover:text-red-600">
                                إبلاغ
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            
            {/* Similar Services */}
            {recommendations.length > 0 && (
              <Card>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  خدمات مشابهة
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {recommendations.slice(0, 4).map((rec, index) => (
                    <Link key={index} to={`/services/${rec.recommended_service.slug}`}>
                      <Card hoverable className="!p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={rec.recommended_service.primary_image?.image || 'https://images.pexels.com/photos/8985471/pexels-photo-8985471.jpeg?auto=compress&cs=tinysrgb&w=100'}
                            alt={rec.recommended_service.title_ar}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {rec.recommended_service.title_ar}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(rec.recommended_service.price, isRTL ? 'ar' : 'en')}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Star className="w-3 h-3 fill-current text-yellow-400 mr-1" />
                              {rec.recommended_service.owner.rating || 4.5}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {formatCurrency(service.price, isRTL ? 'ar' : 'en')}
                </div>
                <p className="text-gray-600">
                  {service.pricing_type === 'fixed' ? 'سعر ثابت' :
                   service.pricing_type === 'hourly' ? 'بالساعة' :
                   service.pricing_type === 'package' ? 'باقة' : 'قابل للتفاوض'}
                </p>
              </div>

              <div className="space-y-4">
                <Button className="w-full" size="lg" disabled={!user}>
                  {user ? 'احجز الآن' : 'سجل دخولك للحجز'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  leftIcon={<MessageCircle className="w-5 h-5" />}
                  onClick={handleContactProvider}
                  disabled={!user}
                >
                  تواصل مع مقدم الخدمة
                </Button>
              </div>
            </Card>

            {/* Provider Info */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                مقدم الخدمة
              </h3>
              
              <div className="flex items-center gap-3 mb-4">
                {service.owner.avatar ? (
                  <img
                    src={service.owner.avatar}
                    alt={service.owner.full_name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {service.owner.full_name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">
                      {service.owner.full_name}
                    </h4>
                    {service.owner.is_verified && (
                      <Shield className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    {service.owner.rating || 4.5} ({service.owner.total_reviews || 0} تقييم)
                  </div>
                </div>
              </div>

              {/* Provider Badges */}
              <div className="flex flex-wrap gap-1 mb-4">
                {service.owner.is_verified && <Badge type="verified" size="sm" />}
                {(service.owner.rating || 0) >= 4.8 && <Badge type="top_rated" size="sm" />}
                <Badge type="responsive" size="sm" />
              </div>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-4 h-4 mr-2" />
                {service.governorate?.name_ar}, {service.center?.name_ar}
              </div>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">المشاهدات</span>
                  <span className="font-medium">{service.views_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الاستفسارات</span>
                  <span className="font-medium">{service.inquiries_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">عضو منذ</span>
                  <span className="font-medium">
                    {formatRelativeTime(service.created_at, isRTL ? 'ar' : 'en')}
                  </span>
                </div>
              </div>

              {/* Sentiment Analysis */}
              {sentimentData && (
                <div className="mb-6">
                  <SentimentBar
                    positive={sentimentData.positive_count}
                    neutral={sentimentData.neutral_count}
                    negative={sentimentData.negative_count}
                    total={sentimentData.total_reviews}
                  />
                </div>
              )}
              <Button variant="outline" className="w-full">
                عرض الملف الشخصي
              </Button>
            </Card>

            {/* Safety Tips */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                نصائح الأمان
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <Shield className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  تأكد من هوية مقدم الخدمة
                </li>
                <li className="flex items-start">
                  <Shield className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  لا تدفع مقدماً قبل إنجاز الخدمة
                </li>
                <li className="flex items-start">
                  <Shield className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  احتفظ بإيصال الدفع
                </li>
                <li className="flex items-start">
                  <Shield className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  استخدم منصة المراسلة للتواصل
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="service"
        targetId={service.id.toString()}
        targetTitle={service.title_ar}
      />
      
      {/* Review Modal */}
      <ReviewForm
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        serviceId={service.id.toString()}
        serviceTitle={service.title_ar}
        onReviewSubmitted={() => {
          // Refresh reviews
        }}
      />
    </div>
  );
};

export default ServiceDetailPage;