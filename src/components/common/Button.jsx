import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'icon'
  size = 'md', // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  type = 'button',
  icon: Icon,
  iconRight: IconRight,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 rounded-md gap-1.5',
    md: 'text-sm px-4 py-2 rounded-md gap-2',
    lg: 'text-base px-5 py-2.5 rounded-lg gap-2.5',
    icon: 'p-2 rounded-md w-9 h-9',
  };

  const variantStyles = {
    primary: 'bg-brand text-white hover:bg-brand-hover active:bg-brand-active shadow-sm',
    secondary: 'bg-surface-canvas text-ink-heading hover:bg-surface-hover border border-border',
    outline: 'bg-white text-ink-heading border border-border hover:bg-surface-hover hover:border-border-dark',
    destructive: 'bg-status-danger-bg text-status-danger border border-status-danger-border hover:bg-red-100',
    ghost: 'bg-transparent text-ink-body hover:bg-surface-hover hover:text-ink-heading',
    icon: 'bg-transparent text-ink-muted hover:bg-surface-hover hover:text-ink-heading border border-transparent hover:border-border',
  };

  const actualSize = variant === 'icon' ? 'icon' : size;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[actualSize]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 text-current" />
      ) : null}
      {children}
      {!loading && IconRight && <IconRight className="w-4 h-4 text-current" />}
    </button>
  );
};
