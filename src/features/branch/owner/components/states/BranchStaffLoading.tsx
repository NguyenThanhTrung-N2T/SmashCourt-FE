import { Skeleton } from "@/src/shared/components/feedback";

export function BranchStaffLoading() {
    return (
        <div className="rounded-2xl border border-border bg-surface-1 shadow-sm overflow-hidden animate-pulse">
            {/* Card header with action button */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-2">
                <div className="flex items-center gap-3">
                    <Skeleton variant="rounded" className="h-10 w-10" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-56" />
                    </div>
                </div>
                <Skeleton className="h-9 w-32 rounded-full" />
            </div>

            {/* Search bar */}
            <div className="px-6 py-4 border-b border-border">
                <Skeleton className="h-11 w-full rounded-xl" />
            </div>

            {/* Staff rows */}
            <div className="divide-y divide-border">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-4">
                        <Skeleton variant="circular" className="h-12 w-12 shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3.5 w-32" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-3 w-48" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}
