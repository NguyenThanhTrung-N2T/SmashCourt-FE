import { Skeleton, CardSkeleton } from "@/src/shared/components/feedback";

export function CustomerPageLoading() {
    return (
        <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Skeleton className="h-9 w-52 mb-2" />
                    <Skeleton className="h-4 w-72" />
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Customer table */}
            <CardSkeleton hasHeader className="min-h-[500px]" />
        </div>
    );
}
