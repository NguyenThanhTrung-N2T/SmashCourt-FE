import * as React from "react";
import { cn } from "@/src/shared/utils/cn";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  headerGradient?: string;
  className?: string;
}

const shadowBorders: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = "lg",
  headerGradient = "from-indigo-500 to-violet-500",
  className,
}: ModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* Content */}
      <div 
        className={cn(
          "relative w-full animate-slide-up rounded-2xl border-2 border-white/40 bg-white shadow-2xl flex flex-col max-h-[90vh]",
          shadowBorders[maxWidth],
          className
        )}
      >
        {/* Header */}
        <div className={cn("flex shrink-0 items-center justify-between rounded-t-2xl px-6 py-5 bg-gradient-to-r", headerGradient)}>
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
                {icon}
              </div>
            )}
            <div>
              {subtitle && <p className="text-xs font-bold uppercase tracking-wider text-white/70">{subtitle}</p>}
              <h2 className="text-lg font-bold text-white">{title}</h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30 active:scale-95"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="overflow-y-auto w-full flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
