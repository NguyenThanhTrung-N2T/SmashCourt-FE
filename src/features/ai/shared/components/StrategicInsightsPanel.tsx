import { useState } from "react";
import {
    Sparkle,
    WarningCircle,
    Buildings,
    Users,
    MapPin,
    ChartLineUp,
    CheckCircle,
    XCircle,
    ArrowRight,
    Lightbulb,
    ChatText,
    TrendUp,
} from "@phosphor-icons/react";
import { useAISuggestion } from "@/src/features/ai/shared/hooks/useAISuggestion";
import { getStrategicSuggestions } from "@/src/api/ai.api";
import type {
    StrategicSuggestionResponseDto,
    BranchPerformanceDto,
    StaffingSuggestionDto,
    ExpansionOpportunityDto,
} from "@/src/features/ai/shared/types/ai.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function today(): string {
    return new Date().toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Rating badge config
// ---------------------------------------------------------------------------

const RATING_CONFIG: Record<
    string,
    { label: string; badge: string; dot: string }
> = {
    Excellent: {
        label: "Xuất sắc",
        badge: "bg-emerald-500/12 text-emerald-500 border border-emerald-500/25",
        dot: "bg-emerald-500",
    },
    excellent: {
        label: "Xuất sắc",
        badge: "bg-emerald-500/12 text-emerald-500 border border-emerald-500/25",
        dot: "bg-emerald-500",
    },
    Good: {
        label: "Tốt",
        badge: "bg-blue-500/12 text-blue-500 border border-blue-500/25",
        dot: "bg-blue-500",
    },
    good: {
        label: "Tốt",
        badge: "bg-blue-500/12 text-blue-500 border border-blue-500/25",
        dot: "bg-blue-500",
    },
    "Needs Improvement": {
        label: "Cần cải thiện",
        badge: "bg-amber-500/12 text-amber-500 border border-amber-500/25",
        dot: "bg-amber-500",
    },
    "needs improvement": {
        label: "Cần cải thiện",
        badge: "bg-amber-500/12 text-amber-500 border border-amber-500/25",
        dot: "bg-amber-500",
    },
    average: {
        label: "Trung bình",
        badge: "bg-amber-500/12 text-amber-500 border border-amber-500/25",
        dot: "bg-amber-500",
    },
    poor: {
        label: "Kém",
        badge: "bg-red-500/12 text-red-500 border border-red-500/25",
        dot: "bg-red-500",
    },
};

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

function SectionHeader({
    icon,
    title,
    count,
    accent,
}: {
    icon: React.ReactNode;
    title: string;
    count?: number;
    accent: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}
            >
                {icon}
            </div>
            <h3 className="text-sm font-bold text-foreground">{title}</h3>
            {count !== undefined && (
                <span className="ml-auto rounded-full bg-surface-1 px-2 py-0.5 text-[10px] font-semibold text-muted">
                    {count}
                </span>
            )}
        </div>
    );
}

function Divider() {
    return <div className="h-px bg-border" />;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SkeletonCard({ rows = 3 }: { rows?: number }) {
    return (
        <div className="animate-pulse rounded-xl border border-border bg-surface-2 p-4 space-y-3">
            <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-surface-1" />
                <div className="h-3.5 w-1/3 rounded-full bg-surface-1" />
                <div className="ml-auto h-5 w-16 rounded-full bg-surface-1" />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="h-2.5 rounded-full bg-surface-1"
                    style={{ width: `${100 - i * 12}%` }}
                />
            ))}
        </div>
    );
}

function SkeletonReport() {
    return (
        <div className="space-y-4">
            {/* Section headers */}
            {[4, 3, 3, 4].map((rows, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-surface-2 p-4 space-y-3">
                    <div className="animate-pulse flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-surface-1" />
                        <div className="h-4 w-32 rounded-full bg-surface-1" />
                    </div>
                    <div className="animate-pulse space-y-2">
                        {Array.from({ length: rows }).map((_, i) => (
                            <div
                                key={i}
                                className="h-2.5 rounded-full bg-surface-1"
                                style={{ width: `${95 - i * 10}%` }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Section 1 — Branch Performance
// ---------------------------------------------------------------------------

function BranchPerformanceCard({ branch }: { branch: BranchPerformanceDto }) {
    const config = RATING_CONFIG[branch.performanceRating] || RATING_CONFIG["Good"];

    return (
        <div className="rounded-xl border border-border bg-surface-2 p-4 transition-colors hover:bg-surface-1">
            {/* Header */}
            <div className="mb-3 flex items-center gap-2 flex-wrap">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-500/10 text-slate-400">
                    <Buildings className="h-4 w-4" weight="duotone" />
                </div>
                <span className="text-sm font-semibold text-foreground flex-1 min-w-0 truncate">
                    {branch.branchName}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${config.badge}`}>
                    <span
                        className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${config.dot} align-middle`}
                    />
                    {config.label}
                </span>
            </div>

            {/* Strengths / Weaknesses two-column grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Strengths */}
                <div>
                    <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                        <CheckCircle className="h-3 w-3" weight="duotone" />
                        Điểm mạnh
                    </p>
                    {branch.strengths.length > 0 ? (
                        <ul className="space-y-1">
                            {branch.strengths.map((s, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-1.5 text-[11px] leading-relaxed text-foreground"
                                >
                                    <CheckCircle
                                        className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500"
                                        weight="duotone"
                                    />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-[11px] text-muted italic">Không có</p>
                    )}
                </div>

                {/* Weaknesses */}
                <div>
                    <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-500">
                        <XCircle className="h-3 w-3" weight="duotone" />
                        Điểm yếu
                    </p>
                    {branch.weaknesses.length > 0 ? (
                        <ul className="space-y-1">
                            {branch.weaknesses.map((w, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-1.5 text-[11px] leading-relaxed text-foreground"
                                >
                                    <XCircle
                                        className="mt-0.5 h-3 w-3 shrink-0 text-red-500"
                                        weight="duotone"
                                    />
                                    {w}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-[11px] text-muted italic">Không có</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Section 2 — Staffing Suggestions
// ---------------------------------------------------------------------------

function StaffingRow({ item }: { item: StaffingSuggestionDto }) {
    return (
        <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-surface-2 p-3.5 transition-colors hover:bg-surface-1">
            <div className="flex items-center gap-2">
                <Buildings className="h-3.5 w-3.5 shrink-0 text-blue-500" weight="duotone" />
                <span className="text-xs font-semibold text-foreground">{item.branchName}</span>
            </div>
            <p className="text-[12px] leading-relaxed text-foreground">{item.suggestion}</p>
            <div className="flex items-start gap-1.5 border-t border-border pt-2">
                <ChatText className="mt-0.5 h-3 w-3 shrink-0 text-muted" weight="duotone" />
                <p className="text-[11px] leading-relaxed text-muted">{item.reasoning}</p>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Section 3 — Expansion Opportunities
// ---------------------------------------------------------------------------

function PriorityBar({ value }: { value: number }) {
    const pct = Math.round(value * 100);
    const color =
        pct >= 70
            ? "bg-emerald-500"
            : pct >= 40
                ? "bg-amber-500"
                : "bg-slate-500";

    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-1">
                <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="w-7 text-right text-[11px] tabular-nums text-muted">{pct}%</span>
        </div>
    );
}

function ExpansionCard({ opp }: { opp: ExpansionOpportunityDto }) {
    return (
        <div className="rounded-xl border border-violet-500/20 bg-surface-2 p-4 transition-colors hover:bg-surface-1">
            {opp.location && opp.location.length > "SmashCourt ".length && (<div className="mb-2 flex items-center gap-2 flex-wrap">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                    <MapPin className="h-4 w-4" weight="duotone" />
                </div>
                <span className="text-sm font-semibold text-foreground flex-1 min-w-0">
                    {opp.location}
                </span>
            </div>)}

            <p className="mb-1 text-[12px] leading-relaxed text-foreground">{opp.opportunity}</p>

            {/* Priority bar */}
            <div className="my-2">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Mức ưu tiên
                </p>
                <PriorityBar value={opp.priority} />
            </div>

            <div className="flex items-start gap-1.5 border-t border-border pt-2">
                <ChatText className="mt-0.5 h-3 w-3 shrink-0 text-muted" weight="duotone" />
                <p className="text-[11px] leading-relaxed text-muted">{opp.reasoning}</p>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Section 4 — Demand Forecast
// ---------------------------------------------------------------------------

function DemandForecastSection({
    forecast,
}: {
    forecast: StrategicSuggestionResponseDto["demandForecast"]; // null | { summary, predictions }
}) {
    return (
        <div className="rounded-xl border border-sky-500/20 bg-surface-2 overflow-hidden">
            {/* Section header */}
            <div className="border-b border-border bg-surface-1 px-4 py-3">
                <SectionHeader
                    icon={<TrendUp className="h-4 w-4" weight="duotone" />}
                    title="Dự báo nhu cầu"
                    accent="bg-sky-500/10 text-sky-500"
                />
            </div>

            <div className="px-4 py-3 space-y-3">
                {/* Guard: null when AI fails */}
                {!forecast ? (
                    <p className="text-[12px] leading-relaxed text-muted italic">
                        Không có dữ liệu dự báo.
                    </p>
                ) : (
                    <>
                        {/* Summary paragraph */}
                        <p className="text-[12px] leading-relaxed text-foreground">
                            {forecast.summary}
                        </p>

                        {/* Predictions list */}
                        {forecast.predictions.length > 0 && (
                            <div>
                                <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-sky-500">
                                    <ArrowRight className="h-3 w-3" weight="bold" />
                                    Dự đoán cụ thể
                                </p>
                                <ul className="space-y-1.5">
                                    {forecast.predictions.map((pred, idx) => (
                                        <li
                                            key={idx}
                                            className="flex items-start gap-2 text-[12px] leading-relaxed text-foreground"
                                        >
                                            <ArrowRight
                                                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500"
                                                weight="bold"
                                            />
                                            {pred}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}


// ---------------------------------------------------------------------------
// Full report layout
// ---------------------------------------------------------------------------

function StrategicReport({ data }: { data: StrategicSuggestionResponseDto }) {
    return (
        <div className="space-y-4">
            {/* ── 1. Branch Performance ──────────────────────────────── */}
            <div className="rounded-xl border border-border bg-surface-2 overflow-hidden">
                <div className="border-b border-border bg-surface-1 px-4 py-3">
                    <SectionHeader
                        icon={<Buildings className="h-4 w-4" weight="duotone" />}
                        title="Hiệu suất chi nhánh"
                        count={data.branchPerformance.length}
                        accent="bg-slate-500/10 text-slate-400"
                    />
                </div>
                <div className="p-3 space-y-2.5">
                    {data.branchPerformance.length > 0 ? (
                        data.branchPerformance.map((branch, idx) => (
                            <BranchPerformanceCard key={idx} branch={branch} />
                        ))
                    ) : (
                        <p className="py-4 text-center text-[12px] text-muted">
                            Không có dữ liệu chi nhánh.
                        </p>
                    )}
                </div>
            </div>

            <Divider />

            {/* ── 2. Staffing Suggestions ───────────────────────────── */}
            <div className="rounded-xl border border-border bg-surface-2 overflow-hidden">
                <div className="border-b border-border bg-surface-1 px-4 py-3">
                    <SectionHeader
                        icon={<Users className="h-4 w-4" weight="duotone" />}
                        title="Gợi ý nhân sự"
                        count={data.staffingSuggestions.length}
                        accent="bg-blue-500/10 text-blue-500"
                    />
                </div>
                <div className="p-3 space-y-2">
                    {data.staffingSuggestions.length > 0 ? (
                        data.staffingSuggestions.map((item, idx) => (
                            <StaffingRow key={idx} item={item} />
                        ))
                    ) : (
                        <p className="py-4 text-center text-[12px] text-muted">
                            Không có gợi ý nhân sự.
                        </p>
                    )}
                </div>
            </div>

            <Divider />

            {/* ── 3. Expansion Opportunities ────────────────────────── */}
            <div className="rounded-xl border border-border bg-surface-2 overflow-hidden">
                <div className="border-b border-border bg-surface-1 px-4 py-3">
                    <SectionHeader
                        icon={<MapPin className="h-4 w-4" weight="duotone" />}
                        title="Cơ hội mở rộng"
                        count={data.expansionOpportunities.length}
                        accent="bg-violet-500/10 text-violet-500"
                    />
                </div>
                <div className="p-3 space-y-2.5">
                    {data.expansionOpportunities.length > 0 ? (
                        data.expansionOpportunities.map((opp, idx) => (
                            <ExpansionCard key={idx} opp={opp} />
                        ))
                    ) : (
                        <p className="py-4 text-center text-[12px] text-muted">
                            Không có cơ hội mở rộng.
                        </p>
                    )}
                </div>
            </div>

            <Divider />

            {/* ── 4. Demand Forecast ────────────────────────────────── */}
            <DemandForecastSection forecast={data.demandForecast} />
        </div>
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
// StrategicInsightsPanel — main export
// ---------------------------------------------------------------------------

export function StrategicInsightsPanel() {
    const [fromDate, setFromDate] = useState(today());
    const [toDate, setToDate] = useState(today());

    const { data, isLoading, error, trigger } =
        useAISuggestion<StrategicSuggestionResponseDto>(() =>
            getStrategicSuggestions({ fromDate, toDate })
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
                        background:
                            "linear-gradient(135deg, #F59E0B 0%, #B45309 100%)",
                        boxShadow: "0 4px 14px rgba(245, 158, 11, 0.30)",
                    }}
                >
                    <Sparkle className="h-4 w-4" weight="duotone" />
                    {isLoading ? "Đang phân tích…" : "Tạo báo cáo chiến lược"}
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
                {isLoading && <SkeletonReport />}

                {/* Initial empty state */}
                {!isLoading && !error && !data && (
                    <div className="flex h-full flex-col items-center justify-center py-6 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                            <ChartLineUp className="h-6 w-6 text-amber-500" weight="duotone" />
                        </div>
                        <p className="text-xs font-semibold text-foreground">
                            Báo cáo chiến lược AI
                        </p>
                        <p className="mt-1 text-[11px] text-muted leading-relaxed">
                            Chọn khoảng ngày và nhấn nút để tạo báo cáo chiến lược toàn diện.
                        </p>
                    </div>
                )}

                {/* Report */}
                {!isLoading && data && <StrategicReport data={data} />}

                {/* Advisory note */}
                {!isLoading && data && (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/8 px-3 py-2.5">
                        <Lightbulb
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500"
                            weight="duotone"
                        />
                        <p className="text-[11px] leading-relaxed text-amber-600 dark:text-amber-400">
                            Báo cáo này được tạo từ dữ liệu lịch sử và chỉ mang tính tham khảo.
                        </p>
                    </div>
                )}

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
