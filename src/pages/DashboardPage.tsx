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
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

import { RootState } from '../store/store';
import { useSubscription } from '../hooks/useSubscription';
import { FeatureGate } from '../components/ui/FeatureGate';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { subscription, getRemainingServices, getRemainingFeaturedCredits } = useSubscription();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState(30);
 const API_BASE =
  (import.meta.env?.VITE_API_BASE || "http://192.168.1.7:8000") ;
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, timeFilter]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch analytics data
      const analyticsResponse = await fetch(`${API_BASE}/api/v1/analytics/provider/?days=${timeFilter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (analyticsResponse.ok) {
        const analytics = await analyticsResponse.json();
        setAnalyticsData(analytics.results);
      }

      // Fetch recent activity
      const activityResponse = await fetch(`${API_BASE}/api/v1/moderation/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (activityResponse.ok) {
        const activity = await activityResponse.json();
        setRecentActivity(activity.results);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>يرجى تسجيل الدخول لعرض لوحة التحكم</p>
      </div>
    );
  }

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
              {user.user_type === 'provider' ? 'تحليلات أداء خدماتك' : 'تتبع حجوزاتك ومراجعاتك'}
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
            
            {user.user_type === 'provider' && (
              <>
                <Button variant="outline" size="sm">
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
        {user.user_type === 'provider' && analyticsData ? (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: 'مشاهدات الملف الشخصي',
                  value: analyticsData.current_totals.total_profile_views || 0,
                  icon: Eye,
                  color: 'text-blue-600',
                },
                {
                  label: 'مشاهدات الخدمات',
                  value: analyticsData.current_totals.total_service_views || 0,
                  icon: BarChart3,
                  color: 'text-green-600',
                },
                {
                  label: 'الرسائل',
                  value: analyticsData.current_totals.total_messages || 0,
                  icon: MessageCircle,
                  color: 'text-purple-600',
                },
                {
                  label: 'معدل التحويل',
                  value: `${analyticsData.conversion_rate.toFixed(1)}%`,
                  icon: TrendingUp,
                  color: 'text-orange-600',
                },
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                النشاط الأخير
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <p>لا توجد بيانات لعرضها</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;