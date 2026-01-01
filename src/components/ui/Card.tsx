import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg' | { sm?: string; md?: string; lg?: string };
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  hoverable = false,
}) => {
  const baseClasses = 'bg-white rounded-xl transition-all duration-200';

  const variantClasses = {
    default: 'shadow-sm',
    elevated: 'shadow-lg',
    outlined: 'border border-gray-200 shadow-sm',
  };

  const paddingClasses =
    typeof padding === 'string'
      ? {
          sm: 'p-4',
          md: 'p-6',
          lg: 'p-8',
        }[padding]
      : clsx(
          padding.sm && `sm:${padding.sm}`,
          padding.md && `md:${padding.md}`,
          padding.lg && `lg:${padding.lg}`
        );

  const hoverClasses = hoverable
    ? 'hover:shadow-md hover:-translate-y-1 cursor-pointer'
    : '';

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        paddingClasses,
        hoverClasses,
        className
      )}
    >
      {children}
    </div>
  );
};