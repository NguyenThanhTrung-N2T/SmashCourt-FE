"use client";

/**
 * CourtCardsGrid
 *
 * Responsive 3-col (desktop) / 2-col (tablet) / 1-col (mobile) grid.
 * Shows skeleton loading and empty state.
 */

import { CourtBasketball, Plus } from "@phosphor-icons/react";
import { CourtCard } from "./CourtCard";
import type { CourtManagementCardDto } from "@/src/features/court/shared/types/court.types";

interface CourtCardsGridProps {
    courts: CourtManagementCardDto[];
    loading: boolean;
    onViewDetail: (courtId: string) => void;
    onEdit: (courtId: string) => void;
    onSuspend: (courtId: string, name: string) => void;
    onActivate: (courtId: string, name: string) => void;
    onDelete: (courtId: string, name: string) => void;
    onAddCourt: () => void;
}

function CourtCardSkeleton() {
    return (
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse overflow-hidden">
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32 mb-2" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                    </div>
                    <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
                <div className="flex justify-between mb-4">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-28" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-1" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
            </div>
            <div className="px-5 py-3 border-t border-border bg-surface-2 flex justify-between">
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-full w-28" />
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
        </div>
    );
}

export function CourtCardsGrid({
    courts,
    loading,
    onViewDetail,
    onEdit,
    onSuspend,
    onActivate,
    onDelete,
}: CourtCardsGridProps) {
    if (loading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <CourtCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (courts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-20 px-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 mb-4">
                    <CourtBasketball className="h-8 w-8 text-muted" />
                </div>
                <h3 className="text-base font-extrabold text-foreground mb-1">Chưa có sân nào</h3>
                <p className="text-sm text-muted mb-6 max-w-xs">
                    Thêm sân đầu tiên để bắt đầu quản lý lịch và hoạt động sân của chi nhánh.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courts.map((court) => (
                <CourtCard
                    key={court.id}
                    court={court}
                    onViewDetail={onViewDetail}
                    onEdit={onEdit}
                    onSuspend={onSuspend}
                    onActivate={onActivate}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
