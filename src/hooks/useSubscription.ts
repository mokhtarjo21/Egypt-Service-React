import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface SubscriptionUsage {
  services_count: number;
  team_members_count: number;
  featured_credits_used: number;
  storage_used_mb: number;
  monthly_api_calls: number;
  monthly_messages_sent: number;
  limits_check: {
    services: boolean;
    team_members: boolean;
    featured_credits: boolean;
  };
}

interface CurrentSubscription {
  id: string;
  plan: {
    plan_type: 'free' | 'pro' | 'business';
    max_services: number;
    max_team_members: number;
    has_advanced_analytics: boolean;
    has_priority_support: boolean;
    featured_credits_included: number;
  };
  status: string;
  days_until_renewal: number;
}

export const useSubscription = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(null);
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
 const API_BASE =
  (import.meta.env?.VITE_API_BASE || "http://192.168.1.7:8000") ;
  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      // Load current subscription
      const subResponse = await fetch(API_BASE+'/api/v1/subscriptions/subscriptions/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (subResponse.ok) {
        const subData = await subResponse.json();
        if (subData.length > 0) {
          setSubscription(subData[0]);
        }
      }

      // Load usage data
      const usageResponse = await fetch(API_BASE+'/api/v1/subscriptions/usage/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (usageResponse.ok) {
        const usageData = await usageResponse;
        setUsage(usageData);
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasFeature = (feature: string): boolean => {
    if (!subscription) return false;
    
    switch (feature) {
      case 'advanced_analytics':
        return subscription.plan.has_advanced_analytics;
      case 'priority_support':
        return subscription.plan.has_priority_support;
      case 'unlimited_services':
        return subscription.plan.plan_type === 'business';
      case 'team_management':
        return subscription.plan.max_team_members > 1;
      default:
        return false;
    }
  };

  const canCreateService = (): boolean => {
    if (!usage) return true; // Default to allowing for free users
    return usage.limits_check.services;
  };

  const canAddTeamMember = (): boolean => {
    if (!usage) return false;
    return usage.limits_check.team_members;
  };

  const getRemainingServices = (): number => {
    if (!subscription || !usage) return 0;
    return subscription.plan.max_services - usage.services_count;
  };

  const getRemainingFeaturedCredits = (): number => {
    if (!subscription || !usage) return 0;
    return subscription.plan.featured_credits_included - usage.featured_credits_used;
  };

  return {
    subscription,
    usage,
    isLoading,
    hasFeature,
    canCreateService,
    canAddTeamMember,
    getRemainingServices,
    getRemainingFeaturedCredits,
    refreshData: loadSubscriptionData,
  };
};