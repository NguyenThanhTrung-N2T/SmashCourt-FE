import { Skeleton } from "@/src/shared/components/feedback";

export function PricingTableLoading() {
    return (
        <div className="rounded-4xl border border-border bg-surface-1 shadow-sm overflow-hidden animate-pulse">
            <div className="border-b border-border bg-surface-2 px-6 py-4 flex items-center gap-3">
                <Skeleton variant="rounded" className="h-10 w-10 bg-surface-3" />
                <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-32 bg-surface-3" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
            <div className="divide-y divide-border">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                        <Skeleton variant="rounded" className="h-7 w-7" />
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="ml-auto h-3.5 w-16" />
                        <Skeleton className="h-3.5 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}
