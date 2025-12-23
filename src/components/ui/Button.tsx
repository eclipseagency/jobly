'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'employee' | 'employer' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center font-semibold
    rounded-xl transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-[1.02] active:scale-[0.98]
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-primary-500 to-primary-600
      hover:from-primary-600 hover:to-primary-700
      text-white shadow-lg shadow-primary-500/25
      focus:ring-primary-500
    `,
    secondary: `
      bg-slate-100 hover:bg-slate-200
      text-slate-700
      focus:ring-slate-400
    `,
    employee: `
      bg-gradient-to-r from-employee-500 to-employee-600
      hover:from-employee-600 hover:to-employee-700
      text-white shadow-lg shadow-employee-500/25
      focus:ring-employee-500
    `,
    employer: `
      bg-gradient-to-r from-employer-500 to-employer-600
      hover:from-employer-600 hover:to-employer-700
      text-white shadow-lg shadow-employer-500/25
      focus:ring-employer-500
    `,
    outline: `
      border-2 border-slate-300 hover:border-slate-400
      bg-transparent hover:bg-slate-50
      text-slate-700
      focus:ring-slate-400
    `,
    ghost: `
      bg-transparent hover:bg-slate-100
      text-slate-600 hover:text-slate-800
      focus:ring-slate-400
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
}
