import React from 'react';
import { clsx } from 'clsx';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | { sm?: string; md?: string; lg?: string };
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-primary text-white hover:shadow-lg hover:scale-105 active:scale-95 focus:ring-primary-500',
    secondary: 'bg-white text-primary-600 border border-primary-200 hover:bg-primary-50 hover:shadow-md focus:ring-primary-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
  };

  const sizeClasses = typeof size === 'string'
    ? {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg',
      }[size]
    : clsx(
        size.sm && `sm:${size.sm}`,
        size.md && `md:${size.md}`,
        size.lg && `lg:${size.lg}`
      );

  const iconSizeClasses = typeof size === 'string'
    ? {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
      }[size]
    : clsx(
        size.sm && `sm:w-${size.sm} sm:h-${size.sm}`,
        size.md && `md:w-${size.md} md:h-${size.md}`,
        size.lg && `lg:w-${size.lg} lg:h-${size.lg}`
      );

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" className="mr-2 rtl:mr-0 rtl:ml-2" />
      ) : leftIcon ? (
        <span className={clsx('mr-2 rtl:mr-0 rtl:ml-2', iconSizeClasses)}>{leftIcon}</span>
      ) : null}

      {children}

      {!isLoading && rightIcon && (
        <span className={clsx('ml-2 rtl:ml-0 rtl:mr-2', iconSizeClasses)}>{rightIcon}</span>
      )}
    </button>
  );
};