import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Calendar, Edit, Shield, Star, Users } from 'lucide-react';
import toast from 'react-hot-toast';

import { RootState } from '../store/store';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SentimentBar } from '../components/ui/SentimentBar';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>يرجى تسجيل الدخول لعرض الملف الشخصي</p>
      </div>
    );
  }

  // Mock badge data - replace with actual API call
  const userBadges = [
    { type: 'verified' as const, earned_at: '2024-01-15' },
    { type: 'top_rated' as const, earned_at: '2024-01-20' },
    { type: 'responsive' as const, earned_at: '2024-01-18' },
  ];

  // Mock sentiment data - replace with actual API call
  const sentimentData = {
    positive: 85,
    neutral: 12,
    negative: 8,
    total: 105,
  };

  const handleEditProfile = () => {
    toast.success('انتقل إلى صفحة تعديل الملف الشخصي');
  };

  const handleManageTeam = () => {
    toast.success('انتقل إلى إدارة الفريق');
  };

  const handleEditInfo = () => {
    toast.success('انتقل إلى تعديل المعلومات الشخصية');
  };

  const handleVerifyEmail = () => {
    navigate('/verify-account');
  };

  const handleVerifyPhone = () => {
    navigate('/verify-account');
  };

  const handleChangePassword = () => {
    navigate('/security');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="text-center">
              <div className="mb-6">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.full_name}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {user.full_name}
                </h2>
                <p className="text-gray-600 mb-4">
                  {user.user_type === 'provider' ? 'مقدم خدمة' : 'عميل'}
                </p>
                
                {/* User Badges */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {userBadges.map((badge, index) => (
                    <Badge key={index} type={badge.type} size="sm" />
                  ))}
                </div>
              </div>
              
              <Button className="w-full" leftIcon={<Edit className="w-4 h-4" />} onClick={handleEditProfile}>
                تعديل الملف الشخصي
              </Button>
            </Card>

            {/* Quick Stats */}
            {user.user_type === 'provider' && (
              <Card className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  إحصائيات سريعة
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الخدمات</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">التقييم</span>
                    <span className="font-medium">4.8 ⭐</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المراجعات</span>
                    <span className="font-medium">127</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">معدل الإنجاز</span>
                    <span className="font-medium">98%</span>
                  </div>
                </div>
                
                {/* Sentiment Analysis */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <SentimentBar
                    positive={sentimentData.positive}
                    neutral={sentimentData.neutral}
                    negative={sentimentData.negative}
                    total={sentimentData.total}
                  />
                </div>
              </Card>
            )}
            
            {/* Organization Membership */}
            <Card className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  الفريق
                </h3>
                <Button variant="outline" size="sm" onClick={handleManageTeam}>
                  <Users className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">المؤسسة</span>
                  <span className="font-medium">شركة الخدمات المتميزة</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">الدور</span>
                  <span className="font-medium">مدير</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">أعضاء الفريق</span>
                  <span className="font-medium">5 أعضاء</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4" onClick={handleManageTeam}>
                إدارة الفريق
              </Button>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  المعلومات الشخصية
                </h3>
                <Button variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />} onClick={handleEditInfo}>
                  تعديل
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">رقم الهاتف</p>
                    <p className="font-medium text-gray-900">{user.phone_number}</p>
                  </div>
                </div>

                {user.province && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">الموقع</p>
                      <p className="font-medium text-gray-900">
                        {user.city?.name_ar}, {user.province.name_ar}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الانضمام</p>
                    <p className="font-medium text-gray-900">
                      {new Date(user.date_joined).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
              </div>

              {user.bio && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">نبذة شخصية</p>
                  <p className="text-gray-900">{user.bio}</p>
                </div>
              )}
            </Card>

            {/* Account Security */}
            <Card>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                أمان الحساب
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">التحقق من البريد الإلكتروني</p>
                    <p className="text-sm text-gray-600">
                      {user.email_verified ? 'تم التحقق' : 'لم يتم التحقق'}
                    </p>
                  </div>
                  {!user.email_verified && (
                    <Button variant="outline" size="sm" onClick={handleVerifyEmail}>
                      تحقق الآن
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">التحقق من رقم الهاتف</p>
                    <p className="text-sm text-gray-600">
                      {user.phone_verified ? 'تم التحقق' : 'لم يتم التحقق'}
                    </p>
                  </div>
                  {!user.phone_verified && (
                    <Button variant="outline" size="sm" onClick={handleVerifyPhone}>
                      تحقق الآن
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">كلمة المرور</p>
                    <p className="text-sm text-gray-600">آخر تحديث منذ 3 أشهر</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleChangePassword}>
                    تغيير
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                النشاط الأخير
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">تم تحديث الملف الشخصي</p>
                    <p className="text-sm text-gray-600">منذ يومين</p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">تسجيل دخول جديد</p>
                    <p className="text-sm text-gray-600">منذ 3 أيام</p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">تم إنشاء الحساب</p>
                    <p className="text-sm text-gray-600">
                      {new Date(user.date_joined).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;