import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  id,
  className = '',
  required = false,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wider text-ink-heading">
          {label} {required && <span className="text-status-danger">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full appearance-none bg-white text-ink-heading text-sm rounded-md border ${
            error
              ? 'border-status-danger focus:ring-status-danger/20'
              : 'border-border focus:border-brand focus:ring-brand/20'
          } px-3 py-2 pr-9 transition-all outline-none focus:ring-2 cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 w-4 h-4 text-ink-muted pointer-events-none" />
      </div>
      {error && <span className="text-xs text-status-danger font-medium">{error}</span>}
      {helperText && !error && <span className="text-xs text-ink-muted">{helperText}</span>}
    </div>
  );
};
