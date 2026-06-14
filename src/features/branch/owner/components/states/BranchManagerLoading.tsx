import { Skeleton } from "@/src/shared/components/feedback";

export function BranchManagerLoading() {
    return (
        <div className="rounded-2xl border border-border bg-surface-1 shadow-sm p-6 animate-pulse">
            {/* Card header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Skeleton variant="rounded" className="h-10 w-10" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-52" />
                    </div>
                </div>
                <Skeleton className="h-9 w-28 rounded-full" />
            </div>

            {/* Manager card */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-2 border border-border">
                <Skeleton variant="circular" className="h-16 w-16 shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            </div>
        </div>
    );
}
