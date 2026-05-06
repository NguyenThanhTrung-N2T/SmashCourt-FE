"use client";

interface LoadingSkeletonProps {
  variant?: 'table' | 'card' | 'form';
  rows?: number;
}

export function LoadingSkeleton({ variant = 'table', rows = 5 }: LoadingSkeletonProps) {
  if (variant === 'table') {
    return (
      <div className="rounded-2xl border border-border bg-surface-1 shadow-sm overflow-hidden animate-pulse">
        <div className="border-b border-border bg-surface-2 px-6 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-surface-3" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-surface-3" />
            <div className="h-3 w-20 rounded bg-surface-2" />
          </div>
        </div>
        <div className="divide-y divide-border">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3.5">
              <div className="h-7 w-7 rounded-lg bg-surface-2" />
              <div className="h-3.5 w-28 rounded bg-surface-2" />
              <div className="ml-auto h-3.5 w-16 rounded bg-surface-2" />
              <div className="h-3.5 w-16 rounded bg-surface-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="rounded-2xl border border-border bg-surface-1 shadow-sm p-6 animate-pulse">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-surface-3" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-surface-3" />
            <div className="h-3 w-48 rounded bg-surface-2" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-3 w-full rounded bg-surface-2" />
          <div className="h-3 w-3/4 rounded bg-surface-2" />
          <div className="h-3 w-5/6 rounded bg-surface-2" />
        </div>
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className="rounded-2xl border border-border bg-surface-1 shadow-sm p-6 animate-pulse">
        <div className="space-y-6">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 rounded bg-surface-3" />
              <div className="h-10 w-full rounded-xl bg-surface-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5 animate-pulse">
      <div className="h-7 w-7 rounded-lg bg-surface-2" />
      <div className="h-3.5 w-28 rounded bg-surface-2" />
      <div className="ml-auto h-3.5 w-16 rounded bg-surface-2" />
      <div className="h-3.5 w-16 rounded bg-surface-2" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface-1 shadow-sm p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-full bg-surface-3" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-surface-3" />
          <div className="h-3 w-48 rounded bg-surface-2" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 w-full rounded bg-surface-2" />
        <div className="h-3 w-3/4 rounded bg-surface-2" />
      </div>
    </div>
  );
}
