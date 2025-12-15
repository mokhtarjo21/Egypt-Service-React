import React from 'react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { Shield, Star, Zap, Trophy, Award, Sparkles } from 'lucide-react';

interface BadgeProps {
  type: 'verified' | 'top_rated' | 'responsive' | 'featured' | 'expert' | 'new_provider';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  type,
  size = 'md',
  showTooltip = true,
  className,
}) => {
  const { t } = useTranslation();
  
  const badgeConfig = {
    verified: {
      icon: Shield,
      label: t('badges.verified.label'),
      color: 'bg-green-100 text-green-800 border-green-200',
      tooltip: t('badges.verified.tooltip'),
    },
    top_rated: {
      icon: Star,
      label: t('badges.top_rated.label'),
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      tooltip: t('badges.top_rated.tooltip'),
    },
    responsive: {
      icon: Zap,
      label: t('badges.responsive.label'),
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      tooltip: t('badges.responsive.tooltip'),
    },
    featured: {
      icon: Trophy,
      label: t('badges.featured.label'),
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      tooltip: t('badges.featured.tooltip'),
    },
    expert: {
      icon: Award,
      label: t('badges.expert.label'),
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      tooltip: t('badges.expert.tooltip'),
    },
    new_provider: {
      icon: Sparkles,
      label: t('badges.new_provider.label'),
      color: 'bg-pink-100 text-pink-800 border-pink-200',
      tooltip: t('badges.new_provider.tooltip'),
    },
  };

  const config = badgeConfig[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium border',
        config.color,
        sizeClasses[size],
        className
      )}
      title={showTooltip ? config.tooltip : undefined}
    >
      <Icon className={clsx(iconSizes[size], 'mr-1 rtl:mr-0 rtl:ml-1')} />
      {config.label}
    </span>
  );
};