import * as React from "react";
import { cn } from "@/src/shared/utils/cn";
import { AlertCircle } from "lucide-react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full rounded-xl border-2 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all resize-y min-h-[100px] focus:bg-white focus:ring-4 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
              : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100",
            className
          )}
          {...props}
        />
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

Textarea.displayName = "Textarea";

export { Textarea };
