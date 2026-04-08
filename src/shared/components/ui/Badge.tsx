import * as React from "react";
import { cn } from "@/src/shared/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "fuchsia" | "primary" | "amber";
  size?: "sm" | "md";
  dot?: boolean;
  icon?: React.ReactNode;
}

const variantStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-emerald-100",
  warning: "border-amber-200 bg-amber-50 text-amber-800 shadow-amber-100",
  danger: "border-red-200 bg-red-50 text-red-800 shadow-red-100",
  info: "border-indigo-200 bg-indigo-50 text-indigo-800 shadow-indigo-100",
  neutral: "border-slate-300 bg-slate-100 text-slate-600 shadow-slate-100",
  fuchsia: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800 shadow-fuchsia-100",
  amber: "border-amber-200 bg-amber-50 text-amber-800 shadow-amber-100",
  primary: "border-indigo-200 bg-indigo-100 text-indigo-800 shadow-indigo-100",
};

const dotColors = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-indigo-500",
  neutral: "bg-slate-500",
  fuchsia: "bg-fuchsia-500",
  amber: "bg-amber-500",
  primary: "bg-indigo-500",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1.5 text-xs",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", size = "sm", dot = false, icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-full border-2 font-black uppercase tracking-wider shadow-sm transition-all",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])} />
        )}
        {icon && <span className="[&>svg]:w-3 [&>svg]:h-3">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
