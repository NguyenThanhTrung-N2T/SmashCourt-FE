import { useState } from "react";
import {
    Clock,
    MapPin,
    Star,
    ChatDots,
    WarningCircle,
} from "@phosphor-icons/react";
import { useAISuggestion } from "@/src/features/ai/shared/hooks/useAISuggestion";
import { getBookingSuggestions } from "@/src/api/ai.api";
import { AIDateInput } from "@/src/features/ai/shared/components/AIDateInput";
import { useCourtTypes } from "@/src/features/court-type/shared/hooks/useCourtTypes";
import type {
    BookingSuggestionDto,
    BookingSuggestionResponseDto,
} from "@/src/features/ai/shared/types/ai.types";
import { CourtTypeStatus } from "@/src/features/court-type/shared/types/court-type.types";
// ---------------------------------------------------------------------------
// Type config — accent colors & icons per suggestion type
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<
    BookingSuggestionDto["type"],
    {
        icon: React.ReactNode;
        accent: string;       // Tailwind bg color class for icon container
        border: string;       // Tailwind border color class for card
        badge: string;        // Tailwind text + bg for the type badge
        label: string;
    }
> = {
    time_slot: {
        icon: <Clock className="h-4 w-4" weight="duotone" />,
        accent: "bg-blue-500/15 text-blue-500",
        border: "border-blue-500/20",
        badge: "bg-blue-500/10 text-blue-500",
        label: "Khung giờ",
    },
    branch: {
        icon: <MapPin className="h-4 w-4" weight="duotone" />,
        accent: "bg-emerald-500/15 text-emerald-500",
        border: "border-emerald-500/20",
        badge: "bg-emerald-500/10 text-emerald-500",
        label: "Chi nhánh",
    },
    court_type: {
        icon: <Star className="h-4 w-4" weight="duotone" />,
        accent: "bg-amber-500/15 text-amber-500",
        border: "border-amber-500/20",
        badge: "bg-amber-500/10 text-amber-500",
        label: "Loại sân",
    },
};
// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SkeletonCard() {
    return (
        <div className="animate-pulse rounded-xl border border-border bg-surface-2 p-3.5">
            <div className="flex items-start gap-3">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-surface-1" />
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 rounded-full bg-surface-1" />
                    <div className="h-2.5 w-full rounded-full bg-surface-1" />
                    <div className="h-2.5 w-4/5 rounded-full bg-surface-1" />
                </div>
            </div>
            <div className="mt-3 h-7 w-24 rounded-full bg-surface-1" />
        </div>
    );
}

function SuggestionCard({ suggestion }: { suggestion: BookingSuggestionDto }) {
    const config = TYPE_CONFIG[suggestion.type];

    return (
        <div
            className={`rounded-xl border bg-surface-2 p-3.5 transition-all hover:bg-surface-1 ${config.border}`}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.accent}`}
                >
                    {config.icon}
                </div>

                <div className="min-w-0 flex-1">
                    {/* Type badge + title */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${config.badge}`}
                        >
                            {config.label}
                        </span>
                        <p className="text-xs font-semibold text-foreground truncate">
                            {suggestion.title}
                        </p>
                    </div>

                    {/* Description */}
                    <p className="mt-1 text-[11px] leading-relaxed text-muted">
                        {suggestion.description}
                    </p>
                </div>
            </div>

            {/* Action button */}
            <button
                className={`mt-3 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all hover:opacity-80 active:scale-95 ${config.badge}`}
            >
                {suggestion.action}
            </button>
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
// BookingSuggestionsPanel
// ---------------------------------------------------------------------------

interface BookingSuggestionsPanelProps {
    role: "CUSTOMER" | "STAFF";
}

export function BookingSuggestionsPanel({
    role: _role,
}: BookingSuggestionsPanelProps) {
    const [date, setDate] = useState("");
    const [courtType, setCourtType] = useState("");

    const {
        courtTypes,
        isLoading: courtTypesLoading,
        error: courtTypesError,
    } = useCourtTypes();

    const { data, isLoading, error, trigger } =
        useAISuggestion<BookingSuggestionResponseDto>(() =>
            getBookingSuggestions({
                ...(date ? { date } : {}),
                ...(courtType ? { courtType } : {}),
            })
        );

    const suggestions = data?.suggestions ?? [];
    const hasResults = suggestions.length > 0;

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* ── Filter bar ──────────────────────────────────────────── */}
            <div className="border-b border-border bg-surface-1 px-4 py-3 space-y-2.5">
                {/* Date picker */}
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                        Ngày (tuỳ chọn)
                    </label>
                    <AIDateInput
                        value={date}
                        onChange={setDate}
                        className="w-full rounded-xl border-2 border-border bg-surface-2 px-3 py-2 text-sm font-medium text-foreground outline-none transition-all focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
                    />
                </div>

                {/* Court type dropdown — populated from API */}
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                        Loại sân (tuỳ chọn)
                    </label>
                    <select
                        value={courtType}
                        onChange={(e) => setCourtType(e.target.value)}
                        disabled={courtTypesLoading}
                        className="w-full rounded-xl border-2 border-border bg-surface-2 px-3 py-2 text-sm font-medium text-foreground outline-none transition-all focus:border-primary/60 focus:ring-4 focus:ring-primary/10 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <option value="">
                            {courtTypesLoading ? "Đang tải…" : "Tất cả loại sân"}
                        </option>
                        {!courtTypesLoading &&
                            !courtTypesError &&
                            courtTypes
                                .filter((ct) => ct.status === CourtTypeStatus.ACTIVE)
                                .map((ct) => (
                                    <option key={ct.id} value={ct.name}>
                                        {ct.name}
                                    </option>
                                ))}
                        {courtTypesError && (
                            <option disabled value="">
                                Không thể tải loại sân
                            </option>
                        )}
                    </select>
                </div>

                {/* Trigger button */}
                <button
                    onClick={trigger}
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                    style={{
                        background:
                            "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)",
                        boxShadow: "0 4px 14px rgba(27, 94, 56, 0.35)",
                    }}
                >
                    <ChatDots className="h-4 w-4" weight="duotone" />
                    {isLoading ? "Đang phân tích…" : "Nhận gợi ý AI"}
                </button>
            </div>

            {/* ── Results area ────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 scroll-smooth">
                {/* Loading — 3 skeleton cards */}
                {isLoading && (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                )}

                {/* Error */}
                {!isLoading && error && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-500">
                        <WarningCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Empty state — after a successful fetch with no results */}
                {!isLoading && !error && data && !hasResults && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Star
                            className="mb-2 h-8 w-8 text-muted"
                            weight="duotone"
                        />
                        <p className="text-xs font-semibold text-foreground">
                            Chưa có gợi ý nào
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted">
                            Thử thay đổi bộ lọc và nhận lại gợi ý.
                        </p>
                    </div>
                )}

                {/* Initial empty state — before first trigger */}
                {!isLoading && !error && !data && (
                    <div className="flex h-full flex-col items-center justify-center py-6 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <ChatDots
                                className="h-6 w-6 text-primary"
                                weight="duotone"
                            />
                        </div>
                        <p className="text-xs font-semibold text-foreground">
                            AI sẵn sàng gợi ý cho bạn
                        </p>
                        <p className="mt-1 text-[11px] text-muted leading-relaxed">
                            Chọn ngày, loại sân (tuỳ chọn) và nhấn nút để
                            nhận gợi ý thông minh.
                        </p>
                    </div>
                )}

                {/* Suggestion cards */}
                {!isLoading &&
                    hasResults &&
                    suggestions.map((s, idx) => (
                        <SuggestionCard key={idx} suggestion={s} />
                    ))}

                {/* generatedAt timestamp */}
                {!isLoading && data?.generatedAt && (
                    <p className="pt-1 text-center text-[10px] text-muted">
                        Được tạo lúc {formatGeneratedAt(data.generatedAt)}
                    </p>
                )}
            </div>
        </div>
    );
}
