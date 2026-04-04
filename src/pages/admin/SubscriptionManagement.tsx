import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Crown,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Download,
  Gift,
  Edit2,
  Trash2,
  Power
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface SubscriptionStats {
  total_subscriptions: number;
  active_subscriptions: number;
  canceled_subscriptions: number;
  monthly_revenue: number;
  annual_revenue: number;
  churn_rate: number;
  avg_revenue_per_user: number;
  new_this_month: number;
}

interface Subscription {
  id: string;
  user: {
    full_name: string;
    phone_number: string;
  };
  plan: {
    name_ar: string;
    plan_type: string;
    price: number;
  };
  status: string;
  current_period_end: string;
  services_count: number;
  created_at: string;
}
const API_BASE =
  (import.meta.env?.VITE_API_BASE || "");
interface Coupon {
  id: string;
  code: string;
  name_ar: string;
  discount_type: string;
  discount_value: number;
  used_count: number;
  max_uses: number;
  valid_until: string;
  is_valid: boolean;
}

interface SubscriptionPlan {
  id: string;
  name_ar: string;
  name_en: string;
  plan_type: 'free' | 'pro' | 'business';
  billing_period: 'monthly' | 'annual';
  price: number;
  currency: string;
  max_services: number;
  max_team_members: number;
  has_advanced_analytics: boolean;
  has_priority_support: boolean;
  search_ranking_boost: number;
  featured_credits_included: number;
  stripe_price_id: string;
  description_ar: string;
  description_en: string;
  features_ar: string[];
  features_en: string[];
  is_popular: boolean;
  sort_order: number;
  is_active: boolean;
}

const SubscriptionManagement: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'coupons' | 'plans'>('overview');
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const [planFormData, setPlanFormData] = useState<Partial<SubscriptionPlan>>({
    plan_type: 'free',
    billing_period: 'monthly',
    currency: 'EGP',
    max_services: 3,
    max_team_members: 1,
    has_advanced_analytics: false,
    has_priority_support: false,
    search_ranking_boost: 1.0,
    featured_credits_included: 0,
    is_popular: false,
    sort_order: 0,
    features_ar: [],
    features_en: []
  });

  const [featureArInput, setFeatureArInput] = useState('');
  const [featureEnInput, setFeatureEnInput] = useState('');

  useEffect(() => {
    loadStats();
    if (activeTab === 'subscriptions') loadSubscriptions();
    if (activeTab === 'coupons') loadCoupons();
    if (activeTab === 'plans') loadPlans();
  }, [activeTab]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch(API_BASE + '/api/v1/subscriptions/admin/stats/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to load stats:', response.status);
      }
    } catch (error) {
      console.error('Failed to load subscription stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };


  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_BASE + '/api/v1/subscriptions/admin/plans/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(Array.isArray(data) ? data : data.results || []);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openPlanModal = (plan?: SubscriptionPlan) => {
    if (plan) {
      setSelectedPlan(plan);
      setPlanFormData(plan);
    } else {
      setSelectedPlan(null);
      setPlanFormData({
        plan_type: 'free',
        billing_period: 'monthly',
        currency: 'EGP',
        max_services: 3,
        max_team_members: 1,
        has_advanced_analytics: false,
        has_priority_support: false,
        search_ranking_boost: 1.0,
        featured_credits_included: 0,
        is_popular: false,
        sort_order: 0,
        features_ar: [],
        features_en: []
      });
    }
    setFeatureArInput('');
    setFeatureEnInput('');
    setShowPlanModal(true);
  };

  const handleTogglePlanStatus = async (plan: SubscriptionPlan) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/subscriptions/admin/plans/${plan.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ is_active: !plan.is_active }),
      });

      if (response.ok) {
        toast.success(t('auth.updateSuccess', 'تم التحديث بنجاح'));
        loadPlans();
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      console.error('Failed to update plan status:', error);
      toast.error(t('common.error'));
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm(t('common.confirmDelete', 'هل أنت متأكد من الحذف؟'))) return;
    try {
      const response = await fetch(`${API_BASE}/api/v1/subscriptions/admin/plans/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        toast.success(t('common.deleteSuccess', 'تم الحذف بنجاح'));
        loadPlans();
      } else {
        toast.error(t('common.error'));
      }
    } catch (error) {
      console.error('Failed to delete plan:', error);
      toast.error(t('common.error'));
    }
  };

  const handlePlanSubmit = async () => {
    try {
      setIsLoading(true);
      const url = selectedPlan 
        ? `${API_BASE}/api/v1/subscriptions/admin/plans/${selectedPlan.id}/`
        : `${API_BASE}/api/v1/subscriptions/admin/plans/`;
      
      const method = selectedPlan ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(planFormData),
      });

      if (response.ok) {
        toast.success(selectedPlan ? t('auth.updateSuccess', 'تم التحديث بنجاح') : t('auth.createSuccess', 'تم الإنشاء بنجاح'));
        setShowPlanModal(false);
        loadPlans();
      } else {
        const err = await response.json();
        toast.error(err.detail || t('common.error'));
      }
    } catch (error) {
      console.error('Failed to save plan:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_BASE + '/api/v1/subscriptions/admin/subscriptions/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptions(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_BASE + '/api/v1/subscriptions/admin/coupons/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCoupons(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (error) {
      console.error('Failed to load coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportSubscriptionData = async () => {
    try {
      const response = await fetch(API_BASE + '/api/v1/subscriptions/admin/export/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'subscriptions_export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: t('subscriptionManagement.status.active') },
      past_due: { color: 'bg-yellow-100 text-yellow-800', label: t('subscriptionManagement.status.pastDue') },
      canceled: { color: 'bg-red-100 text-red-800', label: t('subscriptionManagement.status.canceled') },
      trialing: { color: 'bg-blue-100 text-blue-800', label: t('subscriptionManagement.status.trialing') },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const tabs = [
    { id: 'overview', label: t('subscriptionManagement.tabs.overview'), icon: TrendingUp },
    { id: 'subscriptions', label: t('subscriptionManagement.tabs.subscriptions'), icon: Users },
    { id: 'coupons', label: t('subscriptionManagement.tabs.coupons'), icon: Gift },
    { id: 'plans', label: t('subscriptionManagement.tabs.plans'), icon: Crown },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('subscriptionManagement.title')}
          </h1>
          <p className="text-gray-600">
            {t('subscriptionManagement.subtitle')}
          </p>
        </div>
        <Button onClick={exportSubscriptionData} leftIcon={<Download className="w-4 h-4" />}>
          {t('subscriptionManagement.exportData')}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 rtl:space-x-reverse">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        loadingStats ? (
          <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : stats ? (
        <div className="space-y-8">
          {/* Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">{t('subscriptionManagement.overview.totalSubscriptions')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_subscriptions}</p>
                  <p className="text-sm text-green-600">{stats.active_subscriptions} {t('subscriptionManagement.overview.active')}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">{t('subscriptionManagement.overview.monthlyRevenue')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.monthly_revenue.toLocaleString()} {t('subscriptionManagement.overview.currency')}</p>
                  <p className="text-sm text-blue-600">{stats.new_this_month} جديد هذا الشهر</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">{t('subscriptionManagement.overview.avgRevenue')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avg_revenue_per_user} {t('subscriptionManagement.overview.currency')}</p>
                  <p className="text-sm text-gray-500">لكل مستخدم نشط</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-100">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">{t('subscriptionManagement.overview.churnRate')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.churn_rate}%</p>
                  <p className="text-sm text-gray-500">{stats.canceled_subscriptions} ملغى إجمالاً</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Plan Distribution */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('subscriptionManagement.overview.planDistribution')}
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{stats.active_subscriptions}</div>
                <div className="text-sm text-gray-600">اشتراك نشط</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.new_this_month}</div>
                <div className="text-sm text-gray-600">جديد هذا الشهر</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">{stats.canceled_subscriptions}</div>
                <div className="text-sm text-gray-600">ملغى</div>
              </div>
            </div>
          </Card>
        </div>
        ) : (
          <div className="text-center py-16 text-gray-400">تعذّر تحميل الإحصائيات</div>
        )
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('subscriptionManagement.subscriptions.title')}
            </h2>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">{t('subscriptionManagement.status.allStatuses')}</option>
                <option value="active">{t('subscriptionManagement.status.active')}</option>
                <option value="past_due">{t('subscriptionManagement.status.pastDue')}</option>
                <option value="canceled">{t('subscriptionManagement.status.canceled')}</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        {t('subscriptionManagement.subscriptions.tableHead.user')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        {t('subscriptionManagement.subscriptions.tableHead.plan')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        {t('subscriptionManagement.subscriptions.tableHead.status')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        {t('subscriptionManagement.subscriptions.tableHead.services')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        {t('subscriptionManagement.subscriptions.tableHead.periodEnd')}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        {t('subscriptionManagement.subscriptions.tableHead.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {subscription.user.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {subscription.user.phone_number}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {subscription.plan.name_ar}
                          </div>
                          <div className="text-sm text-gray-500">
                            {subscription.plan.price} {t('subscriptionManagement.subscriptions.currency')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(subscription.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {subscription.services_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(subscription.current_period_end).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="outline" size="sm">
                            {t('subscriptionManagement.subscriptions.view')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('subscriptionManagement.coupons.title')}
            </h2>
            <Button onClick={() => setShowCouponModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
              {t('subscriptionManagement.coupons.addCoupon')}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid gap-4">
              {coupons.map((coupon) => (
                <Card key={coupon.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                        <Gift className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{coupon.name_ar}</h4>
                        <p className="text-sm text-gray-600">
                          {t('subscriptionManagement.coupons.code')} <span className="font-mono bg-gray-100 px-2 py-1 rounded">{coupon.code}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% ${t('subscriptionManagement.coupons.discountType.percentage')}` : `${coupon.discount_value} ${t('subscriptionManagement.coupons.discountType.fixed')}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {t('subscriptionManagement.coupons.used')} {coupon.used_count} {t('subscriptionManagement.coupons.of')} {coupon.max_uses || t('subscriptionManagement.coupons.unlimited')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t('subscriptionManagement.coupons.expiresAt')} {new Date(coupon.valid_until).toLocaleDateString('ar-EG')}
                      </div>
                      <div className="mt-2">
                        {coupon.is_valid ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {t('subscriptionManagement.coupons.valid')}
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            {t('subscriptionManagement.coupons.expired')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('subscriptionManagement.tabs.plans', 'خطط الاشتراكات')}
            </h2>
            <Button onClick={() => openPlanModal()} leftIcon={<Plus className="w-4 h-4" />}>
              {t('common.add', 'إضافة')}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.id} className={!plan.is_active ? 'opacity-60 grayscale' : ''}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{plan.name_ar}</h3>
                      <p className="text-sm text-gray-500">{plan.name_en}</p>
                    </div>
                    <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full uppercase">
                      {plan.plan_type} - {plan.billing_period}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 ml-1">{plan.currency}</span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <p>الخدمات: {plan.max_services}</p>
                    <p>أعضاء الفريق: {plan.max_team_members}</p>
                    <p>النقاط المميزة: {plan.featured_credits_included}</p>
                  </div>

                  <div className="flex space-x-2 rtl:space-x-reverse border-t pt-4 border-gray-100">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openPlanModal(plan)}
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-1" /> تعديل
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleTogglePlanStatus(plan)}
                      className="flex-1 text-yellow-600 hover:bg-yellow-50"
                    >
                      <Power className="w-4 h-4 mr-1" /> {plan.is_active ? 'إيقاف' : 'تفعيل'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Create Coupon Modal */}
      <Modal
        isOpen={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        title={t('subscriptionManagement.coupons.modal.title')}
        size="md"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('subscriptionManagement.coupons.modal.name')} placeholder="خصم العيد" />
            <Input label={t('subscriptionManagement.coupons.modal.code')} placeholder="EID2024" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('subscriptionManagement.coupons.modal.type')}
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="percentage">{t('subscriptionManagement.coupons.modal.types.percentage')}</option>
                <option value="fixed">{t('subscriptionManagement.coupons.modal.types.fixed')}</option>
              </select>
            </div>
            <Input label={t('subscriptionManagement.coupons.modal.value')} type="number" placeholder="20" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={t('subscriptionManagement.coupons.modal.startDate')} type="datetime-local" />
            <Input label={t('subscriptionManagement.coupons.modal.endDate')} type="datetime-local" />
          </div>

          <Input label={t('subscriptionManagement.coupons.modal.maxUses')} type="number" placeholder="100" />

          <div className="flex space-x-4 rtl:space-x-reverse">
            <Button
              variant="outline"
              onClick={() => setShowCouponModal(false)}
              className="flex-1"
            >
              {t('subscriptionManagement.coupons.modal.cancel')}
            </Button>
            <Button className="flex-1">
              {t('subscriptionManagement.coupons.modal.create')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create/Edit Plan Modal */}
      <Modal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title={selectedPlan ? 'تعديل خطة' : 'خطة جديدة'}
        size="lg"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="الاسم (عربي)" 
              value={planFormData.name_ar || ''}
              onChange={(e) => setPlanFormData({...planFormData, name_ar: e.target.value})}
            />
            <Input 
              label="الاسم (إنجليزي)" 
              value={planFormData.name_en || ''}
              onChange={(e) => setPlanFormData({...planFormData, name_en: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع الخطة</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={planFormData.plan_type}
                onChange={(e) => setPlanFormData({...planFormData, plan_type: e.target.value as any})}
              >
                <option value="free">مجاني (Free)</option>
                <option value="pro">برو (Pro)</option>
                <option value="business">أعمال (Business)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">فترة الفوترة</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={planFormData.billing_period}
                onChange={(e) => setPlanFormData({...planFormData, billing_period: e.target.value as any})}
              >
                <option value="monthly">شهري</option>
                <option value="annual">سنوي</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="السعر" 
              type="number" 
              value={planFormData.price || 0}
              onChange={(e) => setPlanFormData({...planFormData, price: Number(e.target.value)})}
            />
            <Input 
              label="العملة" 
              value={planFormData.currency || 'EGP'}
              onChange={(e) => setPlanFormData({...planFormData, currency: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input 
              label="أقصى عدد للخدمات" 
              type="number" 
              value={planFormData.max_services || 0}
              onChange={(e) => setPlanFormData({...planFormData, max_services: Number(e.target.value)})}
            />
            <Input 
              label="أقصى عدد للأعضاء" 
              type="number" 
              value={planFormData.max_team_members || 0}
              onChange={(e) => setPlanFormData({...planFormData, max_team_members: Number(e.target.value)})}
            />
            <Input 
              label="نقاط مميزة" 
              type="number" 
              value={planFormData.featured_credits_included || 0}
              onChange={(e) => setPlanFormData({...planFormData, featured_credits_included: Number(e.target.value)})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <label className="flex items-center space-x-3 rtl:space-x-reverse">
              <input 
                type="checkbox" 
                checked={planFormData.has_advanced_analytics || false}
                onChange={(e) => setPlanFormData({...planFormData, has_advanced_analytics: e.target.checked})}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-gray-700">تحليلات متقدمة</span>
            </label>
            <label className="flex items-center space-x-3 rtl:space-x-reverse">
              <input 
                type="checkbox" 
                checked={planFormData.has_priority_support || false}
                onChange={(e) => setPlanFormData({...planFormData, has_priority_support: e.target.checked})}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-gray-700">دعم فني أولوية</span>
            </label>
            <label className="flex items-center space-x-3 rtl:space-x-reverse">
              <input 
                type="checkbox" 
                checked={planFormData.is_popular || false}
                onChange={(e) => setPlanFormData({...planFormData, is_popular: e.target.checked})}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-gray-700">الأكثر شيوعاً (Popular)</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المزايا (عربي)</label>
              <div className="flex gap-2 mb-2">
                <Input 
                  value={featureArInput} 
                  onChange={(e) => setFeatureArInput(e.target.value)}
                  placeholder="ميزة جديدة..." 
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={() => {
                    if (featureArInput.trim()) {
                      setPlanFormData({...planFormData, features_ar: [...(planFormData.features_ar || []), featureArInput.trim()]});
                      setFeatureArInput('');
                    }
                  }}
                >
                  إضافة
                </Button>
              </div>
              <ul className="space-y-2">
                {(planFormData.features_ar || []).map((feat, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{feat}</span>
                    <button 
                      onClick={() => setPlanFormData({...planFormData, features_ar: planFormData.features_ar!.filter((_, i) => i !== idx)})}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المزايا (إنجليزي)</label>
              <div className="flex gap-2 mb-2">
                <Input 
                  value={featureEnInput} 
                  onChange={(e) => setFeatureEnInput(e.target.value)}
                  placeholder="New feature..." 
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  onClick={() => {
                    if (featureEnInput.trim()) {
                      setPlanFormData({...planFormData, features_en: [...(planFormData.features_en || []), featureEnInput.trim()]});
                      setFeatureEnInput('');
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <ul className="space-y-2">
                {(planFormData.features_en || []).map((feat, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{feat}</span>
                    <button 
                      onClick={() => setPlanFormData({...planFormData, features_en: planFormData.features_en!.filter((_, i) => i !== idx)})}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex space-x-4 rtl:space-x-reverse pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowPlanModal(false)}
              className="flex-1"
            >
              {t('common.cancel', 'إلغاء')}
            </Button>
            <Button onClick={handlePlanSubmit} isLoading={isLoading} className="flex-1">
              {t('common.save', 'حفظ')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubscriptionManagement;