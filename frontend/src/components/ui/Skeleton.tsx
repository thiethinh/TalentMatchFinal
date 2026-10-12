import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rounded';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rounded: 'rounded-xl',
  };

  return (
    <div
      aria-hidden="true"
      className={`shimmer-effect bg-slate-200 ${variantStyles[variant]} ${className}`}
    />
  );
};
