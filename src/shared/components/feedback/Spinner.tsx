import { CircleNotch } from '@phosphor-icons/react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}

export function Spinner({ size = 'md', className = '', weight = 'bold' }: SpinnerProps) {
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <CircleNotch
      className={`animate-spin ${sizeStyles[size]} ${className}`}
      weight={weight}
    />
  );
}
