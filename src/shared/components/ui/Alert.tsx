import * as React from "react";
import { cn } from "@/src/shared/utils/cn";
import {
  WarningCircle,
  CheckCircle,
  Info,
  Warning,
} from "@phosphor-icons/react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "warning" | "success" | "info";
  title?: string;
}

const variantStyles = {
  error: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-indigo-200 bg-indigo-50 text-indigo-800",
};

const iconMap = {
  error: WarningCircle,
  warning: Warning,
  success: CheckCircle,
  info: Info,
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", title, children, ...props }, ref) => {
    const Icon = iconMap[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-start gap-3 rounded-xl border-2 px-4 py-3",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          {title && <p className="font-bold mb-1">{title}</p>}
          <div className="text-sm opacity-90">{children}</div>
        </div>
      </div>
    );
  }
);

Alert.displayName = "Alert";
