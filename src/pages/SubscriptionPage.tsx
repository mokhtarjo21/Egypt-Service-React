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
  BarChart3, 
  Headphones,
  CreditCard,
  Download,
  Gift
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

const CheckoutForm: React.FC<{
  plan: SubscriptionPlan;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ plan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState<any>(null);

  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      const response = await fetch('/api/v1/subscriptions/validate-coupon/', {
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
        toast.success('تم تطبيق الكوبون بنجاح');
      } else {
        const error = await response.json();
        toast.error(error.error || 'كوبون غير صالح');
        setDiscount(null);
      }
    } catch (error) {
      toast.error('حدث خطأ في التحقق من الكوبون');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;
    
    setIsLoading(true);
    
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        toast.error(error.message || 'حدث خطأ في معالجة البطاقة');
        return;
      }

      // Create subscription
      const response = await fetch('/api/v1/subscriptions/subscriptions/', {
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
          // Confirm payment if needed
          const { error: confirmError } = await stripe.confirmCardPayment(data.client_secret);
          
          if (confirmError) {
            toast.error(confirmError.message || 'فشل في تأكيد الدفع');
            return;
          }
        }
        
        toast.success('تم الاشتراك بنجاح!');
        onSuccess();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'فشل في إنشاء الاشتراك');
      }
    } catch (error) {
      toast.error('حدث خطأ في معالجة الاشتراك');
    } finally {
      setIsLoading(false);
    }
  };

  const finalPrice = discount ? discount.final_price : plan.price;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">ملخص الاشتراك</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>الخطة:</span>
            <span>{plan.name_ar}</span>
          </div>
          <div className="flex justify-between">
            <span>المدة:</span>
            <span>{plan.billing_period === 'monthly' ? 'شهري' : 'سنوي'}</span>
          </div>
          <div className="flex justify-between">
            <span>السعر الأساسي:</span>
            <span>{plan.price} {plan.currency}</span>
          </div>
          {discount && (
            <div className="flex justify-between text-green-600">
              <span>الخصم:</span>
              <span>-{discount.discount_amount} {plan.currency}</span>
            </div>
          )}
          <div className="flex justify-between font-medium text-lg border-t pt-2">
            <span>الإجمالي:</span>
            <span>{finalPrice} {plan.currency}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="كود الخصم"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={validateCoupon}>
          تطبيق
        </Button>
      </div>

      <div className="border border-gray-300 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          معلومات البطاقة
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

      <div className="flex space-x-4 rtl:space-x-reverse">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          إلغاء
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!stripe}
          className="flex-1"
        >
          اشترك الآن
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
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlans();
    loadCurrentSubscription();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/v1/subscriptions/plans/');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  const loadCurrentSubscription = async () => {
    try {
      const response = await fetch('/api/v1/subscriptions/subscriptions/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setCurrentSubscription(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setIsLoading(false);
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
        toast.success('تم إلغاء الاشتراك بنجاح');
        loadCurrentSubscription();
      }
    } catch (error) {
      toast.error('فشل في إلغاء الاشتراك');
    }
  };

  const filteredPlans = plans.filter(plan => plan.billing_period === billingPeriod);

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
            خطط الاشتراك
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اختر الخطة المناسبة لاحتياجاتك وابدأ في تنمية أعمالك
          </p>
        </div>

        {/* Current Subscription */}
        {currentSubscription && (
          <Card className="mb-8 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  اشتراكك الحالي
                </h3>
                <p className="text-gray-600">
                  خطة {currentSubscription.plan.name_ar} - ينتهي خلال {currentSubscription.days_until_renewal} يوم
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>الخدمات: {currentSubscription.services_count}/{currentSubscription.plan.max_services}</span>
                  <span>أعضاء الفريق: {currentSubscription.team_members_count}/{currentSubscription.plan.max_team_members}</span>
                  <span>رصيد الترويج: {currentSubscription.plan.featured_credits_included - currentSubscription.featured_credits_used}</span>
                </div>
              </div>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <Button variant="outline" size="sm">
                  إدارة الاشتراك
                </Button>
                <Button variant="outline" size="sm" onClick={cancelSubscription}>
                  إلغاء الاشتراك
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
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingPeriod === 'annual'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              سنوي
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
                وفر 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {filteredPlans.map((plan) => {
            const features = planFeatures[plan.plan_type];
            const Icon = features.icon;
            const isCurrentPlan = currentSubscription?.plan.id === plan.id;
            
            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.is_popular ? 'ring-2 ring-primary-500 shadow-lg' : ''
                } ${isCurrentPlan ? 'bg-primary-50 border-primary-200' : ''}`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      الأكثر شعبية
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 ${features.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${features.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name_ar}
                  </h3>
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {plan.price === 0 ? 'مجاني' : `${plan.price} ج.م`}
                  </div>
                  {plan.price > 0 && (
                    <p className="text-gray-600">
                      /{plan.billing_period === 'monthly' ? 'شهر' : 'سنة'}
                      {plan.billing_period === 'annual' && (
                        <span className="block text-sm text-green-600">
                          ({plan.monthly_price.toFixed(0)} ج.م/شهر)
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {(isRTL ? plan.features_ar : plan.features_en).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-3">
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      الخطة الحالية
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePlanSelect(plan)}
                      className="w-full"
                      variant={plan.is_popular ? 'primary' : 'outline'}
                    >
                      {plan.price === 0 ? 'ابدأ مجاناً' : 'اشترك الآن'}
                    </Button>
                  )}
                  
                  <div className="text-center">
                    <button className="text-sm text-primary-600 hover:text-primary-500">
                      عرض التفاصيل الكاملة
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <Card>
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            مقارنة الخطط
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-4 px-6 font-medium text-gray-900">المميزات</th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">مجاني</th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">احترافي</th>
                  <th className="text-center py-4 px-6 font-medium text-gray-900">أعمال</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">عدد الخدمات</td>
                  <td className="py-4 px-6 text-center">3</td>
                  <td className="py-4 px-6 text-center">20</td>
                  <td className="py-4 px-6 text-center">غير محدود</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">أعضاء الفريق</td>
                  <td className="py-4 px-6 text-center">1</td>
                  <td className="py-4 px-6 text-center">5</td>
                  <td className="py-4 px-6 text-center">غير محدود</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">التحليلات المتقدمة</td>
                  <td className="py-4 px-6 text-center"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">الدعم الفني المتقدم</td>
                  <td className="py-4 px-6 text-center"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><X className="w-5 h-5 text-red-500 mx-auto" /></td>
                  <td className="py-4 px-6 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">رصيد الترويج</td>
                  <td className="py-4 px-6 text-center">0</td>
                  <td className="py-4 px-6 text-center">5 شهرياً</td>
                  <td className="py-4 px-6 text-center">20 شهرياً</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* FAQ */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            الأسئلة الشائعة
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  هل يمكنني تغيير خطتي لاحقاً؟
                </h4>
                <p className="text-gray-600 text-sm">
                  نعم، يمكنك الترقية أو التراجع في أي وقت. سيتم احتساب الفرق بالتناسب.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  ما هو رصيد الترويج؟
                </h4>
                <p className="text-gray-600 text-sm">
                  رصيد يمكن استخدامه لترويج خدماتك في أعلى نتائج البحث لزيادة الظهور.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  هل توجد رسوم إضافية؟
                </h4>
                <p className="text-gray-600 text-sm">
                  لا توجد رسوم خفية. جميع الأسعار شاملة الضرائب المطبقة.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  كيف يتم الدفع؟
                </h4>
                <p className="text-gray-600 text-sm">
                  نقبل جميع البطاقات الائتمانية والمحافظ الإلكترونية المصرية.
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
        title={`الاشتراك في خطة ${selectedPlan?.name_ar}`}
        size="md"
      >
        {selectedPlan && (
          <Elements stripe={stripePromise}>
            <CheckoutForm
              plan={selectedPlan}
              onSuccess={handleSubscriptionSuccess}
              onCancel={() => setShowCheckout(false)}
            />
          </Elements>
        )}
      </Modal>
    </div>
  );
};

export default SubscriptionPage;