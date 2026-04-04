import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  Crown,
  Check,
  X,
  Star,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { RootState } from '../store/store';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useDirection } from '../hooks/useDirection';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface SubscriptionPlan {
  id: string;
  name_ar: string;
  name_en: string;
  plan_type: 'free' | 'pro' | 'business';
  billing_period: 'monthly' | 'annual';
  price: number;
  monthly_price: number;
  currency: string;
  max_services: number;
  max_team_members: number;
  has_advanced_analytics: boolean;
  has_priority_support: boolean;
  search_ranking_boost: number;
  featured_credits_included: number;
  features_ar: string[];
  features_en: string[];
  is_popular: boolean;
}

interface CurrentSubscription {
  id: string;
  plan: SubscriptionPlan;
  status: string;
  current_period_end: string;
  days_until_renewal: number;
  services_count: number;
  team_members_count: number;
  featured_credits_used: number;
}
const API_BASE = import.meta.env?.VITE_API_BASE || "";
const CheckoutForm: React.FC<{
  plan: SubscriptionPlan;
  onSuccess: () => void;
  onCancel: () => void;
  method: 'card' | 'vodafone_cash';
}> = ({ plan, onSuccess, onCancel, method }) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState<any>(null);
  const [mobileNumber, setMobileNumber] = useState('');

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const response = await fetch(API_BASE + '/api/v1/subscriptions/validate-coupon/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          code: couponCode,
          plan_id: plan.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDiscount(data);
        toast.success(t('subscription_page.couponApplied'));
      } else {
        const error = await response.json();
        toast.error(error.error || t('subscription_page.invalidCoupon'));
        setDiscount(null);
      }
    } catch (error) {
      toast.error(t('subscription_page.couponError'));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (method === 'card') {
      if (!stripe || !elements) return;
      setIsLoading(true);

      try {
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;

        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });

        if (error) {
          toast.error(error.message || t('subscription_page.cardError'));
          return;
        }

        const response = await fetch(API_BASE + '/api/v1/subscriptions/subscriptions/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({
            plan_id: plan.id,
            payment_method_id: paymentMethod.id,
            coupon_code: couponCode || undefined,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.client_secret) {
            const { error: confirmError } = await stripe.confirmCardPayment(data.client_secret);
            if (confirmError) {
              toast.error(confirmError.message || t('subscription_page.confirmError'));
              return;
            }
          }
          toast.success(t('subscription_page.subscriptionSuccess'));
          onSuccess();
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || t('subscription_page.subscriptionFailed'));
        }
      } catch (error) {
        toast.error(t('subscription_page.processingError'));
      } finally {
        setIsLoading(false);
      }
    } else {
      // Vodafone Cash (Paymob)
      if (!mobileNumber) {
        toast.error(t('booking.enterMobile'));
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(API_BASE + '/api/v1/payments/checkout/subscription/paymob/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({
            plan_id: plan.id,
            mobile_number: mobileNumber,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.redirect_url) {
            window.location.href = data.redirect_url;
          }
        } else {
          const errorData = await response.json();
          toast.error(errorData.detail || t('subscription_page.subscriptionFailed'));
        }
      } catch (error) {
        toast.error(t('subscription_page.processingError'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const finalPrice = discount ? discount.final_price : plan.price;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">{t('subscription_page.summary')}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>{t('subscription_page.plan')}</span>
            <span>{plan.name_ar}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('subscription_page.duration')}</span>
            <span>{plan.billing_period === 'monthly' ? t('subscription_page.monthly') : t('subscription_page.annual')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('subscription_page.basePrice')}</span>
            <span>{plan.price} {plan.currency}</span>
          </div>
          {discount && (
            <div className="flex justify-between text-green-600">
              <span>{t('subscription_page.discount')}</span>
              <span>-{discount.discount_amount} {plan.currency}</span>
            </div>
          )}
          <div className="flex justify-between font-medium text-lg border-t pt-2">
            <span>{t('subscription_page.total')}</span>
            <span>{finalPrice} {plan.currency}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder={t('subscription_page.couponCode')}
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={validateCoupon}>
          {t('subscription_page.apply')}
        </Button>
      </div>

      {method === 'card' ? (
        <div className="border border-gray-300 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('subscription_page.cardInfo')}
          </label>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {t('booking.payWithVodafone')}
          </p>
          <Input
            label={t('booking.mobileNumber')}
            placeholder="01xxxxxxxxx"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
        </div>
      )}

      <div className="flex space-x-4 rtl:space-x-reverse">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          {t('subscription_page.cancel')}
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={method === 'card' && !stripe}
          className="flex-1"
        >
          {t('subscription_page.subscribeNow')}
        </Button>
      </div>
    </form>
  );
};

const SubscriptionPage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const { user } = useSelector((state: RootState) => state.auth);

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'vodafone_cash'>('vodafone_cash');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlans();
    loadCurrentSubscription();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch(API_BASE + '/api/v1/subscriptions/plans/');
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

  const loadCurrentSubscription = async () => {
    try {
      const response = await fetch(API_BASE + '/api/v1/subscriptions/subscriptions/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const sub = Array.isArray(data) ? data[0] : (data.results && data.results.length > 0 ? data.results[0] : null);
        if (sub) {
          setCurrentSubscription(sub);
        }
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handleSubscriptionSuccess = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
    loadCurrentSubscription();
  };

  const cancelSubscription = async () => {
    if (!currentSubscription) return;

    try {
      const response = await fetch(`/api/v1/subscriptions/subscriptions/${currentSubscription.id}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        toast.success(t('subscription_page.subscriptionCancelled'));
        loadCurrentSubscription();
      }
    } catch (error) {
      toast.error(t('subscription_page.cancelFailed'));
    }
  };

  const filteredPlans = (plans || []).filter(plan => plan.billing_period === billingPeriod);

  const planFeatures = {
    free: {
      icon: Star,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    pro: {
      icon: Crown,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    business: {
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  };

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('subscription_page.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subscription_page.subtitle')}
          </p>
        </div>

        {/* Current Subscription */}
        {currentSubscription && (
          <Card className="mb-8 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('subscription_page.currentSubscription')}
                </h3>
                <p className="text-gray-600">
                  {t('subscription_page.planEndsIn', { name: currentSubscription.plan.name_ar, days: currentSubscription.days_until_renewal })}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>{t('subscription_page.services', { count: currentSubscription.services_count, max: currentSubscription.plan.max_services })}</span>
                  <span>{t('subscription_page.teamMembers', { count: currentSubscription.team_members_count, max: currentSubscription.plan.max_team_members })}</span>
                  <span>{t('subscription_page.featuredCredits', { credits: currentSubscription.plan.featured_credits_included - currentSubscription.featured_credits_used })}</span>
                </div>
              </div>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button variant="outline" size="sm">
                  {t('subscription_page.manageSubscription')}
                </Button>
                <Button variant="outline" size="sm" onClick={cancelSubscription}>
                  {t('subscription_page.cancelSubscription')}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${billingPeriod === 'monthly'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {t('subscription_page.monthly')}
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${billingPeriod === 'annual'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {t('subscription_page.annual')}
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
                {t('subscription_page.save20')}
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {filteredPlans.length === 0 ? (
            <div className="col-span-3 text-center py-16 text-gray-500">
              <Crown className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">{t('subscription_page.noPlansAvailable', 'لا توجد خطط متاحة حالياً')}</p>
              <p className="text-sm mt-2">{t('subscription_page.tryOtherPeriod', 'جرّب تبديل فترة الفوترة أو عد لاحقاً')}</p>
            </div>
          ) : (
            filteredPlans.map((plan) => {
              const features = planFeatures[plan.plan_type] || planFeatures.free;
              const Icon = features.icon;
              const isCurrentPlan = currentSubscription?.plan.id === plan.id;

              return (
                <Card
                  key={plan.id}
                  className={`relative ${plan.is_popular ? 'ring-2 ring-primary-500 shadow-lg' : ''
                    } ${isCurrentPlan ? 'bg-primary-50 border-primary-200' : ''}`}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        {t('subscription_page.mostPopular')}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 ${features.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`w-8 h-8 ${features.color}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {isRTL ? plan.name_ar : plan.name_en}
                    </h3>
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      {plan.price === 0 ? t('subscription_page.free') : `${plan.price} ${t('common.currency', 'ج.م')}`}
                    </div>
                    {plan.price > 0 && (
                      <p className="text-gray-600">
                        /{plan.billing_period === 'monthly' ? t('subscription_page.month') : t('subscription_page.year')}
                        {plan.billing_period === 'annual' && (
                          <span className="block text-sm text-green-600">
                            ({plan.monthly_price.toFixed(0)} {t('common.currency', 'ج.م')}/{t('subscription_page.month')})
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {((isRTL ? plan.features_ar : plan.features_en) || []).map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-3">
                    {isCurrentPlan ? (
                      <Button variant="outline" className="w-full" disabled>
                        {t('subscription_page.currentPlan')}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handlePlanSelect(plan)}
                        className="w-full"
                        variant={plan.is_popular ? 'primary' : 'outline'}
                      >
                        {plan.price === 0 ? t('subscription_page.startFree') : t('subscription_page.subscribeNow')}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Feature Comparison */}
        <Card>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {t('subscription_page.comparePlans')}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-4 px-6 font-medium text-gray-900">{t('subscription_page.features')}</th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">{t('subscription_page.freePlan')}</th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">{t('subscription_page.proPlan')}</th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">{t('subscription_page.businessPlan')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">{t('subscription_page.numberOfServices')}</td>
                  <td className="py-4 px-6 text-center">3</td>
                  <td className="py-4 px-6 text-center">20</td>
                  <td className="py-4 px-6 text-center">{t('subscription_page.unlimited')}</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">{t('subscription_page.teamMembers')}</td>
                  <td className="py-4 px-6 text-center">1</td>
                  <td className="py-4 px-6 text-center">5</td>
                  <td className="py-4 px-6 text-center">{t('subscription_page.unlimited')}</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">{t('subscription_page.advancedAnalytics')}</td>
                  <td className="py-4 px-6 text-center"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">{t('subscription_page.advancedSupport')}</td>
                  <td className="py-4 px-6 text-center"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">{t('subscription_page.featuredCredits')}</td>
                  <td className="py-4 px-6 text-center">0</td>
                  <td className="py-4 px-6 text-center">{t('subscription_page.monthlyCredits', { credits: 5 })}</td>
                  <td className="py-4 px-6 text-center">{t('subscription_page.monthlyCredits', { credits: 20 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* FAQ */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {t('subscription_page.faq')}
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  {t('subscription_page.faq1Q')}
                </h4>
                <p className="text-gray-600 text-sm">
                  {t('subscription_page.faq1A')}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  {t('subscription_page.faq2Q')}
                </h4>
                <p className="text-gray-600 text-sm">
                  {t('subscription_page.faq2A')}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  {t('subscription_page.faq3Q')}
                </h4>
                <p className="text-gray-600 text-sm">
                  {t('subscription_page.faq3A')}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  {t('subscription_page.faq4Q')}
                </h4>
                <p className="text-gray-600 text-sm">
                  {t('subscription_page.faq4A')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        title={t('subscription_page.subscribeToPlan', { name: selectedPlan?.name_ar })}
        size="md"
      >
        {selectedPlan && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <Button
                variant={paymentMethod === 'vodafone_cash' ? 'primary' : 'outline'}
                onClick={() => setPaymentMethod('vodafone_cash')}
                className="flex-1"
              >
                فودافون كاش
              </Button>
              <Button
                variant={paymentMethod === 'card' ? 'primary' : 'outline'}
                onClick={() => setPaymentMethod('card')}
                className="flex-1"
              >
                بطاقة بنكية
              </Button>
            </div>

            <Elements stripe={stripePromise}>
              <CheckoutForm
                plan={selectedPlan}
                onSuccess={handleSubscriptionSuccess}
                onCancel={() => setShowCheckout(false)}
                method={paymentMethod}
              />
            </Elements>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubscriptionPage;