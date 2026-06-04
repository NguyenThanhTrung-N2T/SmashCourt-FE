"use client";

/**
 * CourtFilters
 *
 * Filter bar: search input + court type select (left) + view toggle (right).
 */

import { MagnifyingGlass, SquaresFour, Rows, Calendar, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Input } from "@/src/shared/components/ui/Input";
import { Select } from "@/src/shared/components/ui/Select";
import type { CourtType } from "@/src/features/court-type/shared/types/court-type.types";

interface CourtFiltersProps {
    date: string;
    onDateChange: (v: string) => void;
    search: string;
    onSearchChange: (v: string) => void;
    typeId: string;
    onTypeIdChange: (v: string) => void;
    courtTypes: CourtType[];
    viewMode: "grid" | "timeline";
    onViewModeChange: (v: "grid" | "timeline") => void;
}

export function CourtFilters({
    date,
    onDateChange,
    search,
    onSearchChange,
    typeId,
    onTypeIdChange,
    courtTypes,
    viewMode,
    onViewModeChange,
}: CourtFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left: Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 min-w-0">
                {/* Search */}
                <div className="flex-1 min-w-0 max-w-xs">
                    <Input
                        placeholder="Tìm sân..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        leftIcon={<MagnifyingGlass className="h-4 w-4" />}
                    />
                </div>

                {/* Date Navigation */}
                <div className="flex items-center gap-2 bg-surface-1 border border-border rounded-xl p-1 shrink-0 shadow-sm">
                    <button
                        onClick={() => {
                            const d = new Date(date);
                            d.setDate(d.getDate() - 1);
                            onDateChange(d.toISOString().split("T")[0]);
                        }}
                        className="p-2 hover:bg-surface-2 rounded-lg text-muted hover:text-foreground transition-colors"
                        title="Ngày trước"
                    >
                        <CaretLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-2 px-1">
                        <div className="relative">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => onDateChange(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex items-center gap-2 bg-surface-2/50 px-3 py-1.5 rounded-lg border border-border/50 hover:border-primary/30 transition-all pointer-events-none">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span className="text-sm font-bold text-foreground">
                                    {format(new Date(date), 'dd/MM/yyyy', { locale: vi })}
                                </span>
                            </div>
                        </div>

                        {/* Badges */}
                        {(() => {
                            const today = new Date().toISOString().split("T")[0];
                            const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0];
                            if (date === today) return (
                                <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md">
                                    Hôm nay
                                </span>
                            );
                            if (date === tomorrow) return (
                                <span className="bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md">
                                    Ngày mai
                                </span>
                            );
                            return null;
                        })()}
                    </div>

                    <button
                        onClick={() => {
                            const d = new Date(date);
                            d.setDate(d.getDate() + 1);
                            onDateChange(d.toISOString().split("T")[0]);
                        }}
                        className="p-2 hover:bg-surface-2 rounded-lg text-muted hover:text-foreground transition-colors"
                        title="Ngày sau"
                    >
                        <CaretRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Court type filter */}
                <div className="w-48 shrink-0">
                    <Select
                        value={typeId}
                        onChange={onTypeIdChange}
                    >
                        <option value="">Tất cả loại sân</option>
                        {courtTypes.map((ct) => (
                            <option key={ct.id} value={ct.id}>
                                {ct.name}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

            {/* Right: View toggle */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-surface-2 p-1 shrink-0">
                {/* Card view */}
                <button
                    onClick={() => onViewModeChange("grid")}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-all ${viewMode === "grid"
                        ? "bg-surface-1 text-foreground shadow-sm"
                        : "text-muted hover:text-foreground"
                        }`}
                    aria-label="Card view"
                >
                    <SquaresFour className="h-4 w-4" />
                    <span className="hidden sm:inline">Thẻ</span>
                </button>

                {/* Timeline view */}
                <button
                    onClick={() => onViewModeChange("timeline")}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-all ${viewMode === "timeline"
                        ? "bg-surface-1 text-foreground shadow-sm"
                        : "text-muted hover:text-foreground"
                        }`}
                    aria-label="Timeline view"
                >
                    <Rows className="h-4 w-4" />
                    <span className="hidden sm:inline">Timeline</span>
                </button>
            </div>
        </div>
    );
}
