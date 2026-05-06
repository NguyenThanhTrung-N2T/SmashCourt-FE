import { Skeleton, CardSkeleton } from "@/src/shared/components/feedback";

export function OwnerPricingLoading() {
    return (
        <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Skeleton className="h-9 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton variant="circular" className="h-10 w-40" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <CardSkeleton key={i} hasHeader={false} className="h-24 py-4" />
                ))}
            </div>
            <Skeleton className="h-[400px] w-full rounded-4xl" />
        </div>
    );
}
