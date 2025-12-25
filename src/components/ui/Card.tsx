'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  variant?: 'default' | 'glass' | 'elevated';
}

export function Card({
  children,
  className = '',
  hover = false,
  variant = 'default',
}: CardProps) {
  const variants = {
    default: 'bg-white border border-slate-200',
    glass: 'bg-white/80 backdrop-blur-lg border border-white/30',
    elevated: 'bg-white shadow-xl shadow-slate-200/50',
  };

  return (
    <div
      className={`
        rounded-2xl p-6
        ${variants[variant]}
        ${hover ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
