import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  Users, 
  Star, 
  TrendingUp, 
  Plus,
  Eye,
  MessageCircle,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

import { RootState } from '../store/store';
import { useSubscription } from '../hooks/useSubscription';
import { FeatureGate } from '../components/ui/FeatureGate';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface AnalyticsData {
  current_totals: {
    total_profile_views: number;
    total_service_views: number;
    total_service_clicks: number;
    total_messages: number;
    total_bookings: number;
    total_revenue: number;
    avg_rating: number;
    avg_response_time: number;
  };
  previous_totals: {
    total_profile_views: number;
    total_service_views: number;
    total_service_clicks: number;
    total_messages: number;
    total_bookings: number;
    total_revenue: number;
  };
  conversion_rate: number;
  daily_data: Array<{
    date: string;
    profile_views: number;
    service_views: number;
    messages_received: number;
    bookings_count: number;
    revenue: number;
  }>;
  top_services: Array<{
    title: string;
    views: number;
    slug: string;
  }>;
  regional_performance: Array<{
    governorate__name_ar: string;
    views: number;
  }>;
}

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { subscription, usage, hasFeature, getRemainingServices, getRemainingFeaturedCredits } = useSubscription();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState(30);

  useEffect(() => {
    if (user?.user_type === 'provider') {
      loadAnalytics();
    }
  }, [user, timeFilter]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/analytics/provider/?days=${timeFilter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch(`/api/v1/analytics/export/?days=${timeFilter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${timeFilter}days.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>يرجى تسجيل الدخول لعرض لوحة التحكم</p>
      </div>
    );
  }

  const isProvider = user.user_type === 'provider';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              مرحباً، {user.full_name}
            </h1>
            <p className="text-gray-600">
              {isProvider ? 'تحليلات أداء خدماتك' : 'تتبع حجوزاتك ومراجعاتك'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value={7}>آخر 7 أيام</option>
              <option value={30}>آخر 30 يوم</option>
              <option value={90}>آخر 90 يوم</option>
            </select>
            
            {isProvider && (
              <>
                <Button variant="outline" size="sm" onClick={exportData}>
                  <Download className="w-4 h-4 mr-2" />
                  تصدير CSV
                </Button>
                <Button leftIcon={<Plus className="w-5 h-5" />}>
                  إضافة خدمة جديدة
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Analytics for Providers */}
        {isProvider && analyticsData ? (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: 'مشاهدات الملف الشخصي',
                  value: analyticsData.current_totals.total_profile_views || 0,
                  previous: analyticsData.previous_totals.total_profile_views || 0,
                  icon: Eye,
                  color: 'text-blue-600',
                },
                {
                  label: 'مشاهدات الخدمات',
                  value: analyticsData.current_totals.total_service_views || 0,
                  previous: analyticsData.previous_totals.total_service_views || 0,
                  icon: BarChart3,
                  color: 'text-green-600',
                },
                {
                  label: 'الرسائل',
                  value: analyticsData.current_totals.total_messages || 0,
                  previous: analyticsData.previous_totals.total_messages || 0,
                  icon: MessageCircle,
                  color: 'text-purple-600',
                },
                {
                  label: 'معدل التحويل',
                  value: `${analyticsData.conversion_rate.toFixed(1)}%`,
                  previous: 0,
                  icon: TrendingUp,
                  color: 'text-orange-600',
                  isPercentage: true,
                },
              ].map((stat, index) => {
                const Icon = stat.icon;
                const change = stat.isPercentage ? 0 : calculatePercentageChange(
                  typeof stat.value === 'string' ? parseFloat(stat.value) : stat.value,
                  stat.previous
                );
                
                return (
                  <Card key={index}>
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg bg-gray-100 ${stat.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="ml-4 rtl:ml-0 rtl:mr-4">
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        {!stat.isPercentage && (
                          <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(1)}% من الفترة السابقة
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Views Trend */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  اتجاه المشاهدات
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.daily_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="service_views" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="مشاهدات الخدمات"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profile_views" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="مشاهدات الملف"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Regional Performance */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  الأداء الإقليمي
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.regional_performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="governorate__name_ar" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Top Services */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                أفضل الخدمات أداءً
              </h3>
              <div className="space-y-3">
                {analyticsData.top_services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-medium text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{service.title}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{service.views}</span>
                      <p className="text-xs text-gray-500">مشاهدة</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                إجراءات سريعة
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="justify-start"
                  disabled={!canCreateService()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة خدمة
                  {subscription && (
                    <span className="text-xs text-gray-500 block">
                      ({getRemainingServices()} متبقية)
                    </span>
                  )}
                </Button>
                
                <FeatureGate feature="advanced_analytics" requiredPlan="pro">
                  <Button variant="outline" className="justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    تحليلات متقدمة
                  </Button>
                </FeatureGate>
                
                <FeatureGate feature="team_management" requiredPlan="business">
                  <Button variant="outline" className="justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    إدارة الفريق
                  </Button>
                </FeatureGate>
                
                <Button variant="outline" className="justify-start">
                  <Crown className="w-4 h-4 mr-2" />
                  ترويج الخدمات
                  {subscription && (
                    <span className="text-xs text-gray-500 block">
                      ({getRemainingFeaturedCredits()} رصيد)
                    </span>
                  )}
                </Button>
              </div>
            </Card>
            
            {/* Subscription Status */}
            {subscription && (
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      خطة {subscription.plan.name_ar}
                    </h3>
                    <p className="text-gray-600">
                      ينتهي خلال {subscription.days_until_renewal} يوم
                    </p>
                  </div>
                  <Link to="/subscription">
                    <Button variant="outline" leftIcon={<Crown className="w-4 h-4" />}>
                      إدارة الاشتراك
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        ) : (
          /* Customer Dashboard */
          <div className="space-y-8">
            {/* Customer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'الحجوزات', value: '5', icon: Calendar, color: 'text-blue-600' },
                { label: 'المفضلة', value: '23', icon: Star, color: 'text-yellow-600' },
                { label: 'المراجعات', value: '8', icon: Users, color: 'text-green-600' },
                { label: 'المدفوعات', value: '2,340', icon: TrendingUp, color: 'text-purple-600' },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg bg-gray-100 ${stat.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="ml-4 rtl:ml-0 rtl:mr-4">
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Recent Activity */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  النشاط الأخير
                </h3>
                <Button variant="outline" size="sm">
                  عرض الكل
                </Button>
              </div>

              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-medium">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          حجز خدمة {index + 1}
                        </p>
                        <p className="text-sm text-gray-600">
                          منذ {index + 1} {index === 0 ? 'ساعة' : 'ساعات'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {(index + 1) * 150} {t('common.currency')}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        index % 3 === 0
                          ? 'bg-green-100 text-green-800'
                          : index % 3 === 1
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {index % 3 === 0 ? 'مكتمل' : index % 3 === 1 ? 'قيد التنفيذ' : 'جديد'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;