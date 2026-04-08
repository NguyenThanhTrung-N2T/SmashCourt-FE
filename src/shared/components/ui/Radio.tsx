import * as React from "react";
import { cn } from "@/src/shared/utils/cn";

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, ...props }, ref) => {
    return (
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="radio"
            ref={ref}
            className="peer sr-only"
            {...props}
          />
          <div className={cn(
            "h-5 w-5 rounded-full border-2 border-slate-300 bg-white transition-all peer-checked:border-indigo-600 peer-checked:bg-white peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-100 group-hover:border-indigo-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            className
          )} />
          <div className="absolute h-2.5 w-2.5 rounded-full bg-indigo-600 scale-0 transition-transform peer-checked:scale-100 pointer-events-none" />
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && <span className="text-sm font-semibold text-slate-900">{label}</span>}
            {description && <span className="text-xs text-slate-500">{description}</span>}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = "Radio";
