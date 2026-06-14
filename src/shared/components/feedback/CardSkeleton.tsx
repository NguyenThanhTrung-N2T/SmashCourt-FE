import { Skeleton } from './Skeleton';

interface CardSkeletonProps {
  className?: string;
  hasHeader?: boolean;
  hasFooter?: boolean;
}

export function CardSkeleton({ className = '', hasHeader = true, hasFooter = false }: CardSkeletonProps) {
  return (
    <div className={`p-5 rounded-2xl bg-surface-1 border border-border space-y-4 ${className}`}>
      {hasHeader && (
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" className="h-10 w-10 shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      {hasFooter && (
        <div className="pt-4 mt-4 border-t border-border flex justify-end gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      )}
    </div>
  );
}
