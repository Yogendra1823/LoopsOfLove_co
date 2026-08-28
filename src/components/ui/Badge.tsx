import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'rose' | 'sage' | 'charcoal' | 'outline' | 'warning';
  className?: string;
}

export function Badge({ children, variant = 'rose', className }: BadgeProps) {
  const variantStyles = {
    rose: 'bg-[#FAF4E8] text-[#C86D51] border border-[#E8D2B4]',
    sage: 'bg-[#F5F7F5] text-[#4A5B4B] border border-[#C8D4C8]',
    charcoal: 'bg-[#1A1A1A] text-white',
    outline: 'bg-transparent border border-[#DAAF87] text-[#6C2D1F]',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
