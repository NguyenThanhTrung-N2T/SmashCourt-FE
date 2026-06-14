import { Skeleton } from "@/src/shared/components/feedback";

export function BranchServicesLoading() {
    return (
        <div className="rounded-2xl border border-border bg-surface-1 shadow-sm p-6 animate-pulse">
            {/* Card header */}
            <div className="flex items-center gap-3 mb-6">
                <Skeleton variant="rounded" className="h-10 w-10" />
                <div className="space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-52" />
                </div>
            </div>

            {/* 2-col grid of service cards */}
            <div className="grid gap-4 md:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-surface-2 border border-border">
                        <Skeleton variant="rounded" className="h-12 w-12 shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-3.5 w-32" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                            <div className="flex gap-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>
                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    );
}
