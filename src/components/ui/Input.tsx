import React from 'react';
import { clsx } from 'clsx';
import { useDirection } from '../../hooks/useDirection';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className,
      id,
      ...props
    },
    ref
  ) {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const { isRTL } = useDirection();

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              className={clsx(
                'absolute top-1/2 -translate-y-1/2 text-gray-400',
                isRTL ? 'right-3 sm:right-4' : 'left-3 sm:left-4'
              )}
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full px-4 sm:px-5 py-3 sm:py-4 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              leftIcon && (isRTL ? 'pr-10 sm:pr-12' : 'pl-10 sm:pl-12'),
              rightIcon && (isRTL ? 'pl-10 sm:pl-12' : 'pr-10 sm:pr-12'),
              error
                ? 'border-red-300 text-red-900 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-500',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div
              className={clsx(
                'absolute top-1/2 -translate-y-1/2 text-gray-400',
                isRTL ? 'left-3 sm:left-4' : 'right-3 sm:right-4'
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-sm sm:text-base text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm sm:text-base text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);
