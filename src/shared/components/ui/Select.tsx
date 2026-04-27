import { ReactNode } from 'react';
import { CaretDown } from '@phosphor-icons/react';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  value,
  onChange,
  children,
  placeholder,
  disabled = false,
  className = '',
}: SelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 pr-10 text-sm font-bold text-slate-700 outline-none transition-colors hover:border-[#1B5E38] focus:border-[#1B5E38] focus:bg-white focus:ring-2 focus:ring-[#1B5E38]/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
