import React from 'react';
import { clsx } from 'clsx';
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
  const badgeConfig = {
    verified: {
      icon: Shield,
      label: 'موثق',
      color: 'bg-green-100 text-green-800 border-green-200',
      tooltip: 'تم التحقق من الهوية والمستندات',
    },
    top_rated: {
      icon: Star,
      label: 'الأعلى تقييماً',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      tooltip: 'متوسط تقييم 4.8+ مع 20+ تقييم في آخر 90 يوم',
    },
    responsive: {
      icon: Zap,
      label: 'سريع الاستجابة',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      tooltip: 'متوسط وقت الاستجابة أقل من 30 دقيقة',
    },
    featured: {
      icon: Trophy,
      label: 'مميز',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      tooltip: 'خدمة مميزة ومدفوعة الترويج',
    },
    expert: {
      icon: Award,
      label: 'خبير',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      tooltip: 'خبير معتمد في هذا المجال',
    },
    new_provider: {
      icon: Sparkles,
      label: 'مقدم جديد',
      color: 'bg-pink-100 text-pink-800 border-pink-200',
      tooltip: 'مقدم خدمة جديد على المنصة',
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