import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

import {
  User, MapPin, Calendar, Shield, Star, CheckCircle,
  Briefcase, MessageCircle, Phone, ArrowRight, Award, Clock
} from 'lucide-react';

import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { djangoProfileService } from '../services/django/profileService';
import { apiClient } from '../services/api/client';
import { useDirection } from '../hooks/useDirection';
import { useAuth } from '../hooks/useAuth';

/* ─── helpers ─────────────────────────────────────── */
const StarRow: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({ rating, size = 'md' }) => {
  const sz = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${sz} ${i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({
  icon, label, value, color
}) => (
  <div className={`flex flex-col items-center p-4 rounded-xl ${color} shadow-sm`}>
    <div className="mb-1">{icon}</div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-600 text-center mt-0.5">{label}</p>
  </div>
);

/* ─── main component ──────────────────────────────── */
const PublicProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useDirection();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats]     = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews]   = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) loadAll(id);
  }, [id]);

  const loadAll = async (userId: string) => {
    setIsLoading(true);
    try {
      const [profileRes, statsRes, servicesRes, reviewsRes] = await Promise.allSettled([
        djangoProfileService.getProfileById(userId),
        apiClient.get(`/accounts/users/${userId}/stats/`),
        apiClient.get(`/accounts/users/${userId}/services/`),
        apiClient.get(`/accounts/users/${userId}/reviews/`),
      ]);

      if (profileRes.status === 'fulfilled' && !profileRes.value.error) {
        setProfile(profileRes.value.data);
      } else {
        navigate('/404');
        return;
      }
      if (statsRes.status === 'fulfilled')    setStats(statsRes.value.data);
      if (servicesRes.status === 'fulfilled') setServices(Array.isArray(servicesRes.value.data) ? servicesRes.value.data : []);
      if (reviewsRes.status === 'fulfilled')  setReviews(Array.isArray(reviewsRes.value.data) ? reviewsRes.value.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) return null;

  const isProvider = profile.role === 'provider';
  const isOwn = currentUser?.id === profile.id;
  const avatarUrl = profile.avatar
    ? profile.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'U')}&background=3B82F6&color=fff&size=128`;

  const joinDate = profile.date_joined
    ? format(new Date(profile.date_joined), 'MMMM yyyy', { locale: isRTL ? ar : enUS })
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* ── Hero Card ─────────────────────────── */}
        <Card className="overflow-hidden p-0">
          {/* Cover */}
          <div className="h-40 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 relative">
            {stats?.is_verified && (
              <span className="absolute top-4 end-4 bg-white/20 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" /> موثّق
              </span>
            )}
          </div>

          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14">
              <div className="relative w-28 h-28 shrink-0">
                <img
                  src={avatarUrl}
                  alt={profile.full_name}
                  className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-lg bg-white"
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'U')}&background=3B82F6&color=fff&size=128`;
                  }}
                />
                {stats?.is_verified && (
                  <CheckCircle className="w-6 h-6 text-green-500 fill-white absolute bottom-1 end-0 bg-white rounded-full" />
                )}
              </div>

              <div className="flex-1 pt-2 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
                  {stats?.is_verified && (
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Shield className="w-3 h-3" /> موثّق
                    </span>
                  )}
                </div>
                <p className="text-gray-500 mt-0.5 text-sm">
                  {isProvider ? 'مزود خدمة محترف' : 'عميل'}
                </p>

                {/* Quick info row */}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                  {profile.governorate && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {profile.governorate.name_ar}
                      {profile.center && ` ، ${profile.center.name_ar}`}
                    </span>
                  )}
                  {joinDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      عضو منذ {joinDate}
                    </span>
                  )}
                  {stats && stats.avg_rating > 0 && (
                    <span className="flex items-center gap-1 text-yellow-500 font-semibold">
                      <Star className="w-4 h-4 fill-yellow-400" />
                      {stats.avg_rating} / 5
                    </span>
                  )}
                </div>
              </div>

              {/* CTA */}
              {!isOwn && (
                <div className="flex gap-2 sm:self-end pb-1">
                  <Button
                    leftIcon={<MessageCircle className="w-4 h-4" />}
                    onClick={() => navigate(`/messages?user=${profile.id}`)}
                  >
                    تواصل
                  </Button>
                  {isProvider && services.length > 0 && (
                    <Button
                      variant="outline"
                      leftIcon={<Briefcase className="w-4 h-4" />}
                      onClick={() => navigate(`/services?owner=${profile.id}`)}
                    >
                      احجز خدمة
                    </Button>
                  )}
                </div>
              )}
              {isOwn && (
                <Button
                  variant="outline"
                  className="sm:self-end pb-1"
                  onClick={() => navigate('/profile')}
                >
                  تعديل الملف
                </Button>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-5 text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 text-sm border border-gray-100">
                {profile.bio}
              </p>
            )}
          </div>
        </Card>

        {/* ── Stats Cards ───────────────────────── */}
        {isProvider && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={<CheckCircle className="w-6 h-6 text-green-600" />}
              label="حجز مكتمل"
              value={stats.completed_bookings}
              color="bg-green-50"
            />
            <StatCard
              icon={<Star className="w-6 h-6 text-yellow-500 fill-yellow-400" />}
              label="متوسط التقييم"
              value={stats.avg_rating > 0 ? `${stats.avg_rating} ★` : '—'}
              color="bg-yellow-50"
            />
            <StatCard
              icon={<MessageCircle className="w-6 h-6 text-purple-600" />}
              label="تقييم موثّق"
              value={stats.review_count}
              color="bg-purple-50"
            />
            <StatCard
              icon={<Briefcase className="w-6 h-6 text-blue-600" />}
              label="خدمة متاحة"
              value={stats.services_count}
              color="bg-blue-50"
            />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left column ───────────────────── */}
          <div className="space-y-6">

            {/* About */}
            <Card>
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                <User className="w-5 h-5 text-blue-500" /> معلومات الحساب
              </h2>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  {profile.full_name}
                </li>
                {profile.governorate && (
                  <li className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    {profile.governorate.name_ar}
                    {profile.center && ` ، ${profile.center.name_ar}`}
                  </li>
                )}
                {joinDate && (
                  <li className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                    انضم في {joinDate}
                  </li>
                )}
                {stats?.is_verified && (
                  <li className="flex items-center gap-2 text-green-600 font-medium">
                    <Shield className="w-4 h-4 shrink-0" />
                    حساب موثّق
                  </li>
                )}
              </ul>
            </Card>

            {/* Trust badges */}
            {isProvider && stats && (
              <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" /> شارات الثقة
                </h2>
                <ul className="space-y-2 text-sm">
                  {stats.is_verified && (
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-300 shrink-0" />
                      هوية موثّقة
                    </li>
                  )}
                  {stats.completed_bookings >= 5 && (
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-300 fill-yellow-300 shrink-0" />
                      {stats.completed_bookings}+ حجز مكتمل
                    </li>
                  )}
                  {stats.avg_rating >= 4 && (
                    <li className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-yellow-300 shrink-0" />
                      تقييم ممتاز ({stats.avg_rating}/5)
                    </li>
                  )}
                  {stats.review_count === 0 && stats.completed_bookings === 0 && (
                    <li className="text-blue-200 text-xs">لا توجد شارات بعد</li>
                  )}
                </ul>
              </Card>
            )}
          </div>

          {/* ── Right column (2/3) ────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Services */}
            {isProvider && (
              <Card>
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-500" /> الخدمات المتاحة
                  </h2>
                  {services.length > 0 && (
                    <button
                      onClick={() => navigate(`/services?owner=${profile.id}`)}
                      className="text-blue-600 text-sm flex items-center gap-1 hover:underline"
                    >
                      عرض الكل <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {services.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">لا توجد خدمات متاحة حالياً</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {services.slice(0, 4).map((svc: any) => (
                      <div
                        key={svc.id}
                        onClick={() => navigate(`/services/${svc.slug || svc.id}`)}
                        className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <img
                          src={svc.primary_image?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(svc.title_ar || 'S')}&background=EBF4FF&color=3B82F6&size=60`}
                          alt={svc.title_ar}
                          className="w-14 h-14 rounded-lg object-cover shrink-0 bg-gray-100"
                          onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(svc.title_ar || 'S')}&background=EBF4FF&color=3B82F6`; }}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{svc.title_ar}</p>
                          <p className="text-xs text-gray-500 truncate">{svc.category?.name_ar}</p>
                          <p className="text-blue-600 text-sm font-bold mt-1">
                            {svc.price ? `${svc.price} ج.م` : 'قابل للتفاوض'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <h2 className="font-semibold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                آراء العملاء
                {stats?.review_count > 0 && (
                  <span className="text-xs text-gray-400 font-normal">({stats.review_count} تقييم)</span>
                )}
              </h2>

              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">لا توجد تقييمات بعد</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev: any) => (
                    <div key={rev.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                      <img
                        src={rev.reviewer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.reviewer_name || 'U')}&background=EBF4FF&color=3B82F6&size=40`}
                        alt={rev.reviewer_name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                        onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.reviewer_name || 'U')}&background=EBF4FF&color=3B82F6`; }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-semibold text-sm text-gray-900">{rev.reviewer_name}</p>
                          <StarRow rating={rev.rating} size="sm" />
                          <span className="text-xs text-gray-400 ms-auto">
                            {rev.created_at ? format(new Date(rev.created_at), 'dd MMM yyyy', { locale: isRTL ? ar : enUS }) : ''}
                          </span>
                        </div>
                        {rev.title && <p className="text-sm font-medium text-gray-800">{rev.title}</p>}
                        <p className="text-sm text-gray-600 mt-0.5 line-clamp-3">{rev.comment}</p>
                        {rev.service_title && (
                          <p className="text-xs text-blue-500 mt-1">الخدمة: {rev.service_title}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Back button */}
        <div className="flex justify-center pb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            العودة للصفحة السابقة
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
