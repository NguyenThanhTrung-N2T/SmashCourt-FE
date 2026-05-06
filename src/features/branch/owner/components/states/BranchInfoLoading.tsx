import { Skeleton } from "@/src/shared/components/feedback";

export function BranchInfoLoading() {
    return (
        <div className="rounded-2xl border border-border bg-surface-1 shadow-sm p-6 animate-pulse">
            {/* Card header */}
            <div className="flex items-center gap-3 mb-6">
                <Skeleton variant="rounded" className="h-10 w-10" />
                <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                </div>
            </div>

            {/* 2-col form grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Row 1: name + phone */}
                <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                </div>

                {/* Row 2: avatar URL (full width) */}
                <div className="md:col-span-2 space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                </div>

                {/* Row 3: address (full width, taller) */}
                <div className="md:col-span-2 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </div>

                {/* Row 4: lat + lng */}
                <div className="space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                </div>

                {/* Row 5: open + close time */}
                <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
                <Skeleton className="h-10 flex-1 rounded-full" />
                <Skeleton className="h-10 w-28 rounded-full" />
            </div>
        </div>
    );
}
