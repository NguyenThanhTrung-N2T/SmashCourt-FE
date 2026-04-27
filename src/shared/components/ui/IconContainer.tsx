import { ReactNode } from 'react';

interface IconContainerProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function IconContainer({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}: IconContainerProps) {
  const baseStyles = 'flex items-center justify-center rounded-xl shrink-0';
  
  const sizeStyles = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };
  
  const variantStyles = {
    primary: 'bg-[#1B5E38]/10',
    secondary: 'bg-slate-100',
    neutral: 'bg-slate-50',
  };

  return (
    <div className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}
