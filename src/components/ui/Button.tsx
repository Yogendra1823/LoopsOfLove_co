import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary:   'bg-[#C86D51] hover:bg-[#B0583E] text-white shadow-sm focus:ring-[#C86D51]',
    secondary: 'bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white shadow-sm focus:ring-[#1A1A1A]',
    outline:   'border border-[#C86D51] text-[#C86D51] hover:bg-[#FAF4E8] focus:ring-[#C86D51]',
    ghost:     'text-[#1A1A1A] hover:bg-[#FAF4E8] focus:ring-[#C86D51]',
    danger:    'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-600',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
