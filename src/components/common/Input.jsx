import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  iconRight: IconRight,
  onIconRightClick,
  className = '',
  id,
  type = 'text',
  required = false,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-ink-heading flex items-center justify-between">
          <span>
            {label} {required && <span className="text-status-danger">*</span>}
          </span>
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-ink-muted pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          required={required}
          className={`w-full bg-white text-ink-heading text-sm rounded-md border ${
            error
              ? 'border-status-danger focus:ring-status-danger/20'
              : 'border-border focus:border-brand focus:ring-brand/20'
          } px-3 py-2 transition-all placeholder:text-ink-muted outline-none focus:ring-2 ${
            Icon ? 'pl-9' : ''
          } ${IconRight ? 'pr-9' : ''} ${className}`}
          {...props}
        />
        {IconRight && (
          <button
            type="button"
            onClick={onIconRightClick}
            className="absolute right-3 text-ink-muted hover:text-ink-heading transition-colors"
          >
            <IconRight className="w-4 h-4" />
          </button>
        )}
      </div>
      {error && <span className="text-xs text-status-danger font-medium mt-0.5">{error}</span>}
      {helperText && !error && <span className="text-xs text-ink-muted mt-0.5">{helperText}</span>}
    </div>
  );
};
