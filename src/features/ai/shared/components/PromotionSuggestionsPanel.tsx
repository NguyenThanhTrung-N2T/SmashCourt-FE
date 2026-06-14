import { useState } from "react";
import {
    Sparkle,
    WarningCircle,
    Percent,
    Users,
    Clock,
    CalendarCheck,
    ChartLineUp,
    ChatText,
} from "@phosphor-icons/react";
import { useAISuggestion } from "@/src/features/ai/shared/hooks/useAISuggestion";
import { getPromotionSuggestions } from "@/src/api/ai.api";
import { AIDateInput } from "@/src/features/ai/shared/components/AIDateInput";
import type {
    PromotionSuggestionDto,
    PromotionSuggestionResponseDto,
} from "@/src/features/ai/shared/types/ai.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatVND(amount: number): string {
    const abs = Math.abs(amount);
    const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(abs);
    return amount < 0 ? `-${formatted}` : `+${formatted}`;
}

function today(): string {
    return new Date().toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SkeletonCard() {
    return (
        <div className="animate-pulse rounded-xl border border-border bg-surface-2 p-4">
            <div className="flex items-start gap-3">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-surface-1" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 rounded-full bg-surface-1" />
                    <div className="h-2.5 w-full rounded-full bg-surface-1" />
                    <div className="h-2.5 w-4/5 rounded-full bg-surface-1" />
                </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 rounded-lg bg-surface-1" />
                ))}
            </div>
        </div>
    );
}

function StatChip({
    icon,
    label,
    value,
    accent,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    accent: string;
}) {
    return (
        <div className={`flex flex-col gap-0.5 rounded-lg p-2 ${accent}`}>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-70">
                {icon}
                {label}
            </div>
            <span className="text-xs font-semibold leading-tight">{value}</span>
        </div>
    );
}

function PromotionCard({ card }: { card: PromotionSuggestionDto }) {
    const revenueColor =
        card.estimatedRevenueImpact >= 0
            ? "text-emerald-500"
            : "text-red-500";

    return (
        <div className="rounded-xl border border-violet-500/20 bg-surface-2 p-4 transition-all hover:bg-surface-1">
            {/* Header row */}
            <div className="mb-3 flex items-center gap-2 flex-wrap">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500">
                    <Percent className="h-4 w-4" weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground">
                        {card.timeSlot}
                    </p>
                    <p className="text-[11px] text-muted">{card.dayOfWeek}</p>
                </div>
                <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-bold text-violet-500">
                    -{card.discountPercent}%
                </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StatChip
                    icon={<Users className="h-3 w-3" />}
                    label="Đối tượng"
                    value={card.targetSegment}
                    accent="bg-blue-500/8 text-blue-500"
                />
                <StatChip
                    icon={<CalendarCheck className="h-3 w-3" />}
                    label="Thời gian"
                    value={`${card.suggestedDurationDays} ngày`}
                    accent="bg-amber-500/8 text-amber-500"
                />
                <StatChip
                    icon={<Clock className="h-3 w-3" />}
                    label="Tỷ lệ lấp đầy"
                    value={`${card.currentOccupancyPercent}%`}
                    accent="bg-slate-500/8 text-slate-400"
                />
                <StatChip
                    icon={<ChartLineUp className="h-3 w-3" />}
                    label="Doanh thu ước tính"
                    value={formatVND(card.estimatedRevenueImpact)}
                    accent={`bg-surface-1 ${revenueColor}`}
                />
            </div>

            {/* Reasoning */}
            <div className="mt-3 flex items-start gap-1.5 border-t border-border pt-3">
                <ChatText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" weight="duotone" />
                <p className="text-[11px] leading-relaxed text-muted">{card.reasoning}</p>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// PromotionSuggestionsPanel
// ---------------------------------------------------------------------------

interface PromotionSuggestionsPanelProps {
    branchId?: string;
}

export function PromotionSuggestionsPanel({ branchId }: PromotionSuggestionsPanelProps) {
    const [fromDate, setFromDate] = useState(today());
    const [toDate, setToDate] = useState(today());

    const { data, isLoading, error, trigger } =
        useAISuggestion<PromotionSuggestionResponseDto>(() =>
            getPromotionSuggestions({
                fromDate,
                toDate,
                ...(branchId ? { branchId } : {}),
            })
        );

    const suggestions = data?.suggestions ?? [];
    const hasResults = suggestions.length > 0;

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* ── Filter bar ───────────────────────────────────────────── */}
            <div className="border-b border-border bg-surface-1 px-4 py-3 space-y-2.5">
                <div className="flex gap-3">
                    {/* From date */}
                    <div className="flex flex-1 flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                            Từ ngày <span className="text-red-400">*</span>
                        </label>
                        <AIDateInput
                            value={fromDate}
                            onChange={setFromDate}
                            className="w-full rounded-xl border-2 border-border bg-surface-2 px-3 py-2 text-sm font-medium text-foreground outline-none transition-all focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                        />
                    </div>

                    {/* To date */}
                    <div className="flex flex-1 flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                            Đến ngày <span className="text-red-400">*</span>
                        </label>
                        <AIDateInput
                            value={toDate}
                            onChange={setToDate}
                            className="w-full rounded-xl border-2 border-border bg-surface-2 px-3 py-2 text-sm font-medium text-foreground outline-none transition-all focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                        />
                    </div>
                </div>

                {/* Trigger button */}
                <button
                    onClick={trigger}
                    disabled={isLoading || !fromDate || !toDate}
                    className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                    style={{
                        background: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
                        boxShadow: "0 4px 14px rgba(124, 58, 237, 0.35)",
                    }}
                >
                    <Sparkle className="h-4 w-4" weight="duotone" />
                    {isLoading ? "Đang phân tích…" : "Nhận gợi ý khuyến mãi AI"}
                </button>
            </div>

            {/* ── Results area ─────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 scroll-smooth">
                {/* Error */}
                {!isLoading && error && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-500">
                        <WarningCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Loading skeletons */}
                {isLoading && (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                )}

                {/* Initial empty state */}
                {!isLoading && !error && !data && (
                    <div className="flex h-full flex-col items-center justify-center py-6 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
                            <Percent className="h-6 w-6 text-violet-500" weight="duotone" />
                        </div>
                        <p className="text-xs font-semibold text-foreground">
                            AI sẵn sàng gợi ý khuyến mãi
                        </p>
                        <p className="mt-1 text-[11px] text-muted leading-relaxed">
                            Chọn khoảng ngày và nhấn nút để nhận gợi ý khuyến mãi thông minh.
                        </p>
                    </div>
                )}

                {/* Post-fetch empty state */}
                {!isLoading && !error && data && !hasResults && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Percent className="mb-2 h-8 w-8 text-muted" weight="duotone" />
                        <p className="text-xs font-semibold text-foreground">Chưa có gợi ý nào</p>
                        <p className="mt-0.5 text-[11px] text-muted">
                            Thử thay đổi khoảng ngày và nhận lại gợi ý.
                        </p>
                    </div>
                )}

                {/* Promotion cards */}
                {!isLoading &&
                    hasResults &&
                    suggestions.map((s, idx) => <PromotionCard key={idx} card={s} />)}

                {/* generatedAt timestamp */}
                {!isLoading && data?.generatedAt && (
                    <p className="pt-1 text-center text-[10px] text-muted">
                        Được tạo lúc{" "}
                        {new Date(data.generatedAt).toLocaleString("vi-VN", {
                            dateStyle: "short",
                            timeStyle: "short",
                        })}
                    </p>
                )}
            </div>
        </div>
    );
}
