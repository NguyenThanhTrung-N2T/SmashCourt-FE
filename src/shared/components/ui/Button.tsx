import { ReactNode } from 'react';
import { CircleNotch } from '@phosphor-icons/react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'dangerSoft';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  leftIcon?: ReactNode;
  isLoading?: boolean;
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  leftIcon,
  isLoading = false,
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center gap-2 rounded-full font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const variantStyles = {
    primary: 'text-white shadow-md hover:opacity-90',
    secondary: 'border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50',
    danger: 'border border-red-300 bg-white text-red-600 shadow-sm hover:bg-red-50',
    dangerSoft: 'bg-red-50 text-red-600 hover:bg-red-100',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };
  
  const gradientStyle = variant === 'primary' ? {
    background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)",
    boxShadow: "0 4px 14px rgba(27, 94, 56, 0.35)",
  } : undefined;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      style={gradientStyle}
    >
      {isLoading ? (
        <CircleNotch className="h-4 w-4 animate-spin" />
      ) : leftIcon}
      {children}
    </button>
  );
}
