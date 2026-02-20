import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Crown,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Download,
  Gift
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface SubscriptionStats {
  total_subscriptions: number;
  active_subscriptions: number;
  monthly_revenue: number;
  annual_revenue: number;
  churn_rate: number;
  avg_revenue_per_user: number;
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

const SubscriptionManagement: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'coupons' | 'plans'>('overview');
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStats();
    if (activeTab === 'subscriptions') loadSubscriptions();
    if (activeTab === 'coupons') loadCoupons();
  }, [activeTab]);

  const loadStats = async () => {
    // Mock stats - replace with actual API call
    setStats({
      total_subscriptions: 1247,
      active_subscriptions: 1156,
      monthly_revenue: 45600,
      annual_revenue: 547200,
      churn_rate: 7.3,
      avg_revenue_per_user: 39.5,
    });
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
        setSubscriptions(data);
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
        setCoupons(data);
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
      {activeTab === 'overview' && stats && (
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
                  <p className="text-sm text-green-600">+12% {t('subscriptionManagement.overview.fromLastMonth')}</p>
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
                  <p className="text-sm text-green-600">+5% {t('subscriptionManagement.overview.fromLastMonth')}</p>
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
                  <p className="text-sm text-red-600">+1.2% {t('subscriptionManagement.overview.fromLastMonth')}</p>
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
                <div className="text-3xl font-bold text-gray-900">65%</div>
                <div className="text-sm text-gray-600">{t('subscriptionManagement.overview.plans.free')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">28%</div>
                <div className="text-sm text-gray-600">{t('subscriptionManagement.overview.plans.pro')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">7%</div>
                <div className="text-sm text-gray-600">{t('subscriptionManagement.overview.plans.business')}</div>
              </div>
            </div>
          </Card>
        </div>
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
    </div>
  );
};

export default SubscriptionManagement;