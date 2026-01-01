import React from 'react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | { sm?: string; md?: string; lg?: string };
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = typeof size === 'string'
    ? {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
      }[size]
    : clsx(
        size.sm && `sm:${size.sm}`,
        size.md && `md:${size.md}`,
        size.lg && `lg:${size.lg}`
      );

  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-gray-300 border-t-primary-600',
        sizeClasses,
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};