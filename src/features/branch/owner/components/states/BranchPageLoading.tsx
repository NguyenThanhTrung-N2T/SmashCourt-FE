import { Skeleton, CardSkeleton } from "@/src/shared/components/feedback";

export function BranchPageLoading() {
    return (
        <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Skeleton className="h-9 w-52 mb-2" />
                    <Skeleton className="h-4 w-72" />
                </div>
                <Skeleton variant="circular" className="h-10 w-36" />
            </div>

            {/* Branch selector */}
            <Skeleton className="h-[72px] w-full rounded-2xl" />

            {/* Tab bar */}
            <div className="flex gap-2 border-b border-border pb-0">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-36 rounded-none rounded-t-lg" />
                ))}
            </div>

            {/* Tab content placeholder */}
            <CardSkeleton hasHeader hasFooter className="min-h-[400px]" />
        </div>
    );
}
