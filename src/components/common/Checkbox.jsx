import React from 'react';
import { Check } from 'lucide-react';

export const Checkbox = ({
  checked,
  onChange,
  label,
  id,
  disabled = false,
  className = '',
  description,
  ...props
}) => {
  const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label htmlFor={checkboxId} className={`inline-flex items-start gap-2.5 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.checked)}
          className="sr-only"
          {...props}
        />
        <div
          className={`w-[18px] h-[18px] rounded border transition-all flex items-center justify-center ${
            checked
              ? 'bg-brand border-brand text-white'
              : 'bg-white border-[#D1D5DB] hover:border-brand'
          }`}
        >
          {checked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
        </div>
      </div>
      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && <span className="text-sm font-medium text-ink-heading leading-tight">{label}</span>}
          {description && <span className="text-xs text-ink-muted mt-0.5">{description}</span>}
        </div>
      )}
    </label>
  );
};
