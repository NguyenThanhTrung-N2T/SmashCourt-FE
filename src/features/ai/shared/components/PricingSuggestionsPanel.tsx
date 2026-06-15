import { useState } from "react";
import {
    Sparkle,
    WarningCircle,
    Tag,
    Info,
} from "@phosphor-icons/react";
import { useAISuggestion } from "@/src/features/ai/shared/hooks/useAISuggestion";
import { getPricingSuggestions } from "@/src/api/ai.api";
import type {
    PricingSuggestionDto,
    PricingSuggestionResponseDto,
} from "@/src/features/ai/shared/types/ai.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatVND(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(amount);
}

function today(): string {
    return new Date().toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SkeletonRow() {
    return (
        <tr className="animate-pulse border-b border-border">
            {Array.from({ length: 7 }).map((_, i) => (
                <td key={i} className="px-3 py-3">
                    <div className="h-3 rounded-full bg-surface-1" style={{ width: `${60 + (i % 3) * 20}%` }} />
                </td>
            ))}
        </tr>
    );
}

function IncreaseBadge({ value }: { value: number }) {
    const isPositive = value >= 0;
    return (
        <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${isPositive
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-red-500/10 text-red-500"
                }`}
        >
            {isPositive ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%
        </span>
    );
}

function ConfidenceBar({ value }: { value: number }) {
    // value is [0, 1]
    const pct = Math.round(value * 100);
    const color =
        pct >= 75
            ? "bg-emerald-500"
            : pct >= 45
                ? "bg-amber-500"
                : "bg-red-500";

    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-1">
                <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-[11px] tabular-nums text-muted">{pct}%</span>
        </div>
    );
}

function SuggestionRow({ row }: { row: PricingSuggestionDto }) {
    return (
        <tr className="border-b border-border transition-colors hover:bg-surface-1/50">
            <td className="px-3 py-2.5 text-xs font-medium text-foreground">{row.timeSlot}</td>
            <td className="px-3 py-2.5 text-xs text-muted">{row.dayOfWeek}</td>
            <td className="px-3 py-2.5 text-xs tabular-nums text-foreground">{formatVND(row.currentPrice)}</td>
            <td className="px-3 py-2.5 text-xs tabular-nums font-semibold text-foreground">
                {formatVND(row.suggestedPrice)}
            </td>
            <td className="px-3 py-2.5">
                <IncreaseBadge value={row.suggestedIncreasePercent} />
            </td>
            <td className="px-3 py-2.5">
                <ConfidenceBar value={row.confidence} />
            </td>
            <td className="max-w-[220px] px-3 py-2.5 text-[11px] leading-relaxed text-muted">
                {row.reasoning}
            </td>
        </tr>
    );
}

function formatGeneratedAt(generatedAt: string): string {
    if (!generatedAt) return "";

    // Try parse as ISO format first (from Python FastAPI)
    try {
        const date = new Date(generatedAt);
        if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hour = String(date.getHours()).padStart(2, '0');
            const minute = String(date.getMinutes()).padStart(2, '0');
            const second = String(date.getSeconds()).padStart(2, '0');
            return `${day}-${month}-${year} ${hour}:${minute}:${second}`;
        }
    } catch {
        // Fall through to try legacy format
    }

    // Try legacy format dd/MM/yyyy HH:mm:ss (from .NET backend)
    const match = generatedAt.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
    if (match) {
        const [, day, month, year, hour, minute, second] = match;
        return `${day}-${month}-${year} ${hour}:${minute}:${second}`;
    }

    return generatedAt;
}

// ---------------------------------------------------------------------------
// PricingSuggestionsPanel
// ---------------------------------------------------------------------------

interface PricingSuggestionsPanelProps {
    branchId?: string;
}

export function PricingSuggestionsPanel({ branchId }: PricingSuggestionsPanelProps) {
    const [fromDate, setFromDate] = useState(today());
    const [toDate, setToDate] = useState(today());

    const { data, isLoading, error, trigger } =
        useAISuggestion<PricingSuggestionResponseDto>(() =>
            getPricingSuggestions({
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
                        <input
                            type="date"
                            value={fromDate}
                            max={toDate || undefined}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full rounded-xl border-2 border-border bg-surface-2 px-3 py-2 text-sm font-medium text-foreground outline-none transition-all focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                        />
                    </div>

                    {/* To date */}
                    <div className="flex flex-1 flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                            Đến ngày <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="date"
                            value={toDate}
                            min={fromDate || undefined}
                            onChange={(e) => setToDate(e.target.value)}
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
                        background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)",
                        boxShadow: "0 4px 14px rgba(27, 94, 56, 0.35)",
                    }}
                >
                    <Sparkle className="h-4 w-4" weight="duotone" />
                    {isLoading ? "Đang phân tích…" : "Nhận gợi ý giá AI"}
                </button>
            </div>

            {/* ── Results area ─────────────────────────────────────────── */}
            <div className="flex-1 overflow-auto px-4 py-3 scroll-smooth">
                {/* Error */}
                {!isLoading && error && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-500 mb-3">
                        <WarningCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Initial empty state */}
                {!isLoading && !error && !data && (
                    <div className="flex h-full flex-col items-center justify-center py-6 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Tag className="h-6 w-6 text-primary" weight="duotone" />
                        </div>
                        <p className="text-xs font-semibold text-foreground">
                            AI sẵn sàng gợi ý giá
                        </p>
                        <p className="mt-1 text-[11px] text-muted leading-relaxed">
                            Chọn khoảng ngày và nhấn nút để nhận gợi ý giá thông minh.
                        </p>
                    </div>
                )}

                {/* Post-fetch empty state */}
                {!isLoading && !error && data && !hasResults && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Tag className="mb-2 h-8 w-8 text-muted" weight="duotone" />
                        <p className="text-xs font-semibold text-foreground">Chưa có gợi ý nào</p>
                        <p className="mt-0.5 text-[11px] text-muted">
                            Thử thay đổi khoảng ngày và nhận lại gợi ý.
                        </p>
                    </div>
                )}

                {/* Table */}
                {(isLoading || hasResults) && (
                    <div className="overflow-x-auto rounded-xl border border-border">
                        <table className="w-full min-w-[700px] text-left">
                            <thead>
                                <tr className="border-b border-border bg-surface-1">
                                    {[
                                        "Khung giờ",
                                        "Thứ",
                                        "Giá hiện tại",
                                        "Giá gợi ý",
                                        "% Thay đổi",
                                        "Độ tin cậy",
                                        "Lý do",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <>
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                    </>
                                ) : (
                                    suggestions.map((s, idx) => (
                                        <SuggestionRow key={idx} row={s} />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Advisory disclaimer */}
                {!isLoading && hasResults && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/8 px-3 py-2.5">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" weight="fill" />
                        <p className="text-[11px] leading-relaxed text-amber-600 dark:text-amber-400">
                            Đây chỉ là gợi ý tham khảo. Giá không được cập nhật tự động.
                        </p>
                    </div>
                )}

                {/* generatedAt timestamp */}
                {!isLoading && data?.generatedAt && (
                    <p className="pt-2 text-center text-[10px] text-muted">
                        Được tạo lúc {formatGeneratedAt(data.generatedAt)}
                    </p>
                )}
            </div>
        </div>
    );
}
