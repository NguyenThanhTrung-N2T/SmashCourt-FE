import { Skeleton } from './Skeleton';

interface TableSkeletonProps {
  className?: string;
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ className = '', rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <div className={`w-full overflow-hidden rounded-xl border border-border bg-surface-1 ${className}`}>
      {/* Table Header */}
      <div className="flex items-center gap-4 border-b border-border bg-surface-2/50 p-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`th-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Table Body */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`tr-${rowIndex}`} className="flex items-center gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={`td-${rowIndex}-${colIndex}`} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
