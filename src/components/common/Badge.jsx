import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral', // 'success' | 'warning' | 'danger' | 'brand' | 'neutral'
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    success: 'bg-status-success-bg text-status-success border border-status-success-border',
    warning: 'bg-status-warning-bg text-status-warning border border-status-warning-border',
    danger: 'bg-status-danger-bg text-status-danger border border-status-danger-border',
    brand: 'bg-brand-tint text-brand border border-brand/20',
    neutral: 'bg-surface-hover text-ink-body border border-border',
  };

  const dotColors = {
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    danger: 'bg-status-danger',
    brand: 'bg-brand',
    neutral: 'bg-ink-muted',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-pill text-xs font-medium tracking-wide leading-none ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};
