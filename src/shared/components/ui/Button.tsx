import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "dangerSoft";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-60 disabled:pointer-events-none";

    const variants = {
      primary: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:-translate-y-0.5",
      secondary: "bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100",
      danger: "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/20 hover:shadow-xl hover:-translate-y-0.5",
      dangerSoft: "border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 hover:from-red-100 hover:to-pink-100 hover:border-red-300 hover:shadow-md hover:-translate-y-0.5", // Added danger soft based on table buttons
      ghost: "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 active:bg-slate-200",
      outline: "bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50 shadow-sm",
      action: "border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5"
    };

    const sizes = {
      sm: "h-9 rounded-xl px-3 text-xs",
      md: "h-11 rounded-xl px-4 text-sm py-3",
      lg: "h-14 rounded-2xl px-6 text-base"
    };

    // Safely mapping variants using type assertion if custom variants are passed
    const variantStyle = (variants as Record<string, string>)[variant] || variants.primary;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizes[size], variantStyle, className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
