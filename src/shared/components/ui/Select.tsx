import * as React from "react";
import { cn } from "@/src/shared/utils/cn";
import { AlertCircle, ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full appearance-none rounded-xl border-2 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:bg-white focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-1.5 text-red-500 mt-0.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
