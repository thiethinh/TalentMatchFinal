import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand' | 'escrow' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  className = '',
}) => {
  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-800 border-slate-200/80 font-bold',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
    warning: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
    danger: 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
    brand: 'bg-blue-50 text-blue-700 border-blue-200 font-extrabold',
    escrow: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 font-bold shadow-xs',
    purple: 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold',
  };

  const dotColors = {
    neutral: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    brand: 'bg-blue-500',
    escrow: 'bg-teal-500',
    purple: 'bg-violet-500',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
    lg: 'text-xs px-3 py-1 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full transition-all duration-150 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColors[variant]}`} />
        </span>
      )}
      {children}
    </span>
  );
};
