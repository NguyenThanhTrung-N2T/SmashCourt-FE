import React from 'react';
import { CardSkeleton, Skeleton } from '@/src/shared/components/feedback';

export function DashboardKpiLoading() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-[140px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
        </div>
    );
}

export function DashboardChartLoading() {
    return <div className="h-[180px] bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-xl" />;
}

export function DashboardStatusLoading() {
    return (
        <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
            ))}
        </div>
    );
}

export function DashboardInsightLoading() {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-[80px] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
        </div>
    );
}

export function DashboardLeaderboardLoading() {
    return (
        <div className="space-y-2">
            {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-10 bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-lg" />
            ))}
        </div>
    );
}

export function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <DashboardKpiLoading />
            <div className="grid gap-6">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                    <Skeleton className="h-6 w-48 mb-8" />
                    <DashboardChartLoading />
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                        <Skeleton className="h-6 w-48 mb-8" />
                        <DashboardChartLoading />
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                        <Skeleton className="h-6 w-48 mb-8" />
                        <DashboardStatusLoading />
                    </div>
                </div>
                <DashboardInsightLoading />
            </div>
        </div>
    );
}
