import { useState } from "react";
import {
    Sparkle,
    WarningCircle,
    ChartBar,
    CheckCircle,
    Warning,
    ArrowRight,
} from "@phosphor-icons/react";
import { useAISuggestion } from "@/src/features/ai/shared/hooks/useAISuggestion";
import { getAnalyticsSummary } from "@/src/api/ai.api";
import type {
    AnalyticsSummaryResponseDto,
} from "@/src/features/ai/shared/types/ai.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function today(): string {
    return new Date().toISOString().split("T")[0];
}

function formatDateString(dateStr: string): string {
    const trimmed = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [year, month, day] = trimmed.split("-");
        return `${day}-${month}-${year}`;
    }
    return trimmed;
}

function formatPeriod(period: string): string {
    if (!period) return "";
    if (period.includes("..")) {
        const parts = period.split("..");
        if (parts.length === 2) {
            return `${formatDateString(parts[0])} đến ${formatDateString(parts[1])}`;
        }
    }
    return formatDateString(period);
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
// Sub-components
// ---------------------------------------------------------------------------

function SkeletonBlock({ lines = 3 }: { lines?: number }) {
    return (
        <div className="animate-pulse space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-3 rounded-full bg-surface-1"
                    style={{ width: `${100 - (i % 3) * 15}%` }}
                />
            ))}
        </div>
    );
}

function SectionHeading({
    icon,
    label,
    accent,
}: {
    icon: React.ReactNode;
    label: string;
    accent: string;
}) {
    return (
        <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${accent}`}>
            {icon}
            {label}
        </div>
    );
}

function BulletList({
    items,
    icon,
    itemClass,
}: {
    items: string[];
    icon: React.ReactNode;
    itemClass: string;
}) {
    if (items.length === 0) return null;

    return (
        <ul className="space-y-1.5">
            {items.map((item, idx) => (
                <li key={idx} className={`flex items-start gap-2 text-[12px] leading-relaxed ${itemClass}`}>
                    <span className="mt-0.5 shrink-0">{icon}</span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

function SkeletonSummary() {
    return (
        <div className="animate-pulse space-y-4 rounded-xl border border-border bg-surface-2 p-4">
            {/* Header */}
            <div className="space-y-1.5">
                <div className="h-4 w-1/2 rounded-full bg-surface-1" />
                <div className="h-3 w-1/3 rounded-full bg-surface-1" />
            </div>
            <div className="h-px bg-border" />
            {/* Overview */}
            <SkeletonBlock lines={3} />
            <div className="h-px bg-border" />
            {/* Highlights */}
            <SkeletonBlock lines={2} />
            <div className="h-px bg-border" />
            {/* Concerns */}
            <SkeletonBlock lines={2} />
            <div className="h-px bg-border" />
            {/* Recommendations */}
            <SkeletonBlock lines={3} />
        </div>
    );
}

function SummaryCard({ data }: { data: AnalyticsSummaryResponseDto }) {
    const displayBranchName =
        data.branchName && data.branchName.toLowerCase() === "all branches"
            ? "Tất cả chi nhánh"
            : data.branchName;

    return (
        <div className="rounded-xl border border-border bg-surface-2 overflow-hidden">
            {/* Branch & period header */}
            <div className="border-b border-border bg-surface-1 px-4 py-3">
                <p className="text-sm font-bold text-foreground">{displayBranchName}</p>
                <p className="mt-0.5 text-[11px] text-muted">{formatPeriod(data.period)}</p>
            </div>

            <div className="divide-y divide-border">
                {/* Overview */}
                <div className="px-4 py-3 space-y-2">
                    <SectionHeading
                        icon={<ChartBar className="h-3.5 w-3.5" weight="duotone" />}
                        label="Tổng quan"
                        accent="text-primary"
                    />
                    <p className="text-[12px] leading-relaxed text-foreground">
                        {data.overview}
                    </p>
                </div>

                {/* Highlights */}
                {data.highlights.length > 0 && (
                    <div className="px-4 py-3 space-y-2">
                        <SectionHeading
                            icon={<CheckCircle className="h-3.5 w-3.5" weight="duotone" />}
                            label="Điểm nổi bật"
                            accent="text-emerald-500"
                        />
                        <BulletList
                            items={data.highlights}
                            icon={
                                <CheckCircle
                                    className="h-3.5 w-3.5 text-emerald-500"
                                    weight="duotone"
                                />
                            }
                            itemClass="text-foreground"
                        />
                    </div>
                )}

                {/* Concerns */}
                {data.concerns.length > 0 && (
                    <div className="px-4 py-3 space-y-2">
                        <SectionHeading
                            icon={<Warning className="h-3.5 w-3.5" weight="duotone" />}
                            label="Lưu ý"
                            accent="text-amber-500"
                        />
                        <BulletList
                            items={data.concerns}
                            icon={
                                <Warning
                                    className="h-3.5 w-3.5 text-amber-500"
                                    weight="duotone"
                                />
                            }
                            itemClass="text-foreground"
                        />
                    </div>
                )}

                {/* Recommendations */}
                {data.recommendations.length > 0 && (
                    <div className="px-4 py-3 space-y-2">
                        <SectionHeading
                            icon={<ArrowRight className="h-3.5 w-3.5" weight="bold" />}
                            label="Khuyến nghị"
                            accent="text-blue-500"
                        />
                        <BulletList
                            items={data.recommendations}
                            icon={
                                <ArrowRight
                                    className="h-3.5 w-3.5 text-blue-500"
                                    weight="bold"
                                />
                            }
                            itemClass="text-foreground"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// AnalyticsSummaryPanel
// ---------------------------------------------------------------------------

interface AnalyticsSummaryPanelProps {
    branchId?: string;
}

export function AnalyticsSummaryPanel({ branchId }: AnalyticsSummaryPanelProps) {
    const [fromDate, setFromDate] = useState(today());
    const [toDate, setToDate] = useState(today());

    const { data, isLoading, error, trigger } =
        useAISuggestion<AnalyticsSummaryResponseDto>(() =>
            getAnalyticsSummary({
                fromDate,
                toDate,
                ...(branchId ? { branchId } : {}),
            })
        );

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
                        background: "linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)",
                        boxShadow: "0 4px 14px rgba(14, 165, 233, 0.35)",
                    }}
                >
                    <Sparkle className="h-4 w-4" weight="duotone" />
                    {isLoading ? "Đang phân tích…" : "Nhận tóm tắt phân tích AI"}
                </button>
            </div>

            {/* ── Results area ─────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scroll-smooth">
                {/* Error */}
                {!isLoading && error && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-500">
                        <WarningCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Loading skeleton */}
                {isLoading && <SkeletonSummary />}

                {/* Initial empty state */}
                {!isLoading && !error && !data && (
                    <div className="flex h-full flex-col items-center justify-center py-6 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10">
                            <ChartBar className="h-6 w-6 text-sky-500" weight="duotone" />
                        </div>
                        <p className="text-xs font-semibold text-foreground">
                            AI sẵn sàng tóm tắt phân tích
                        </p>
                        <p className="mt-1 text-[11px] text-muted leading-relaxed">
                            Chọn khoảng ngày và nhấn nút để nhận tóm tắt phân tích hoạt động.
                        </p>
                    </div>
                )}

                {/* Summary card */}
                {!isLoading && data && <SummaryCard data={data} />}

                {/* generatedAt timestamp */}
                {!isLoading && data?.generatedAt && (
                    <p className="text-center text-[10px] text-muted">
                        Được tạo lúc {formatGeneratedAt(data.generatedAt)}
                    </p>
                )}
            </div>
        </div>
    );
}
