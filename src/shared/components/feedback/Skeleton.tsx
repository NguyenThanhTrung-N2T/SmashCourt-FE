interface SkeletonProps {
  className?: string;
  variant?: 'rounded' | 'circular' | 'text';
}

export function Skeleton({ className = '', variant = 'rounded' }: SkeletonProps) {
  const variantStyles = {
    rounded: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded',
  };

  return (
    <div className={`bg-surface-2 animate-pulse ${variantStyles[variant]} ${className}`} />
  );
}
