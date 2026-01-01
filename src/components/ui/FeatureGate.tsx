import React from 'react';
import { useSelector } from 'react-redux';
import { Crown, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

import { RootState } from '../../store/store';
import { Button } from './Button';
import { Card } from './Card';

interface FeatureGateProps {
  feature: 'advanced_analytics' | 'priority_support' | 'unlimited_services' | 'team_management';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPlan?: 'pro' | 'business';
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  requiredPlan = 'pro',
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Mock subscription check - replace with actual subscription state
  const hasFeature = user?.role === 'admin' || false; // Placeholder logic

  if (hasFeature) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const featureNames = {
    advanced_analytics: 'التحليلات المتقدمة',
    priority_support: 'الدعم الفني المتقدم',
    unlimited_services: 'خدمات غير محدودة',
    team_management: 'إدارة الفريق',
  };

  const planNames = {
    pro: 'الاحترافية',
    business: 'الأعمال',
  };

  return (
    <Card className="text-center py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
      </div>
      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2">
        {featureNames[feature]}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 mb-6">
        هذه الميزة متاحة في خطة {planNames[requiredPlan]} وما فوق
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/subscription">
          <Button
            leftIcon={<Crown className="w-4 h-4 sm:w-5 sm:h-5" />}
            className="w-full sm:w-auto"
          >
            ترقية الخطة
          </Button>
        </Link>
        <Button variant="outline" className="w-full sm:w-auto">
          تعرف على المزيد
        </Button>
      </div>
    </Card>
  );
};