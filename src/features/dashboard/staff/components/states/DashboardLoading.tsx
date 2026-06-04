import React from "react";
import { CardSkeleton } from "@/src/shared/components/feedback/CardSkeleton";
import { Skeleton } from "@/src/shared/components/feedback/Skeleton";

export function DashboardKpiLoading() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-3 w-28" />
                </div>
            ))}
        </div>
    );
}

export function DashboardCourtCardsLoading() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
                <CardSkeleton key={i} hasHeader={false} />
            ))}
        </div>
    );
}

export function DashboardListLoading() {
    return (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                    <div className="flex items-start justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-40" />
                </div>
            ))}
        </div>
    );
}

export function DashboardChartLoading() {
    return (
        <div className="space-y-4">
            <div className="h-48 bg-slate-50 dark:bg-slate-900/20 rounded-xl animate-pulse" />
            <div className="flex justify-between">
                {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-3 w-12" />
                ))}
            </div>
        </div>
    );
}
