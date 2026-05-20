"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Warning,
    ArrowUpRight,
    Clock,
    ArrowClockwise,
    ShieldCheck,
    Timer,
} from "@phosphor-icons/react";

import { fetchCancelPolicies } from "@/src/api/cancel-policy.api";
import {
    formatPolicyHours,
    formatRefundPercent,
    formatPolicyThreshold,
    getPolicyRangeLabel,
    getPolicyTone,
    normalizePolicyDescription,
    sortCancelPolicies,
} from "@/src/features/policy/utils/cancellationPolicy";
import type {
    CancelPolicy,
    CancellationPolicyTone,
} from "@/src/features/policy/shared/types/cancel-policy.types";

type CancellationPolicyPreviewProps = {
    anchorId?: string;
};

function getToneClasses(tone: CancellationPolicyTone) {
    if (tone === "emerald") {
        return {
            shell: "border-emerald-500/30 bg-emerald-500/10",
            badge: "bg-emerald-600 text-white",
            accent: "text-emerald-600",
            soft: "bg-emerald-500/15 text-emerald-600",
        };
    }

    if (tone === "amber") {
        return {
            shell: "border-amber-500/30 bg-amber-500/10",
            badge: "bg-amber-500 text-white",
            accent: "text-amber-600",
            soft: "bg-amber-500/15 text-amber-600",
        };
    }

    if (tone === "rose") {
        return {
            shell: "border-rose-500/30 bg-rose-500/10",
            badge: "bg-rose-500 text-white",
            accent: "text-rose-600",
            soft: "bg-rose-500/15 text-rose-600",
        };
    }

    return {
        shell: "border-border bg-surface-2",
        badge: "bg-inverse text-inverse",
        accent: "text-foreground",
        soft: "bg-surface-3 text-foreground",
    };
}

function formatUpdatedAt(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Đang cập nhật";
    }

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

function LoadingState() {
    return (
        <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="space-y-3">
                {[0, 1].map((item) => (
                    <div
                        key={item}
                        className="h-24 animate-pulse rounded-[1.5rem] border border-border bg-surface-1/80"
                    />
                ))}
            </div>
            <div className="space-y-3">
                {[0, 1, 2].map((item) => (
                    <div
                        key={item}
                        className="h-36 animate-pulse rounded-[1.5rem] border border-border bg-surface-1/80"
                    />
                ))}
            </div>
        </div>
    );
}

function ErrorState({
    message,
    onRetry,
}: {
    message: string;
    onRetry: () => void;
}) {
    return (
        <div className="rounded-[1.5rem] border border-rose-500/30 bg-rose-500/10 px-5 py-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-1 text-rose-500 shadow-sm">
                <Warning className="h-5 w-5" />
            </div>
            <h2 className="mt-3 text-xl font-extrabold text-foreground">
                Chưa thể tải dữ liệu chính sách
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
                {message}
            </p>
            <button
                type="button"
                onClick={onRetry}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-inverse px-4 py-2.5 text-sm font-extrabold text-inverse transition-all hover:-translate-y-0.5 hover:bg-emerald-600"
            >
                <ArrowClockwise className="h-4 w-4" />
                Tải lại dữ liệu
            </button>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-[1.5rem] border border-border bg-surface-1 px-5 py-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-3 text-muted">
                <Clock className="h-5 w-5" />
            </div>
            <h2 className="mt-3 text-xl font-extrabold text-foreground">
                Chưa có dữ liệu chính sách hủy
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
                Hệ thống hiện chưa trả về mốc chính sách nào để hiển thị.
            </p>
        </div>
    );
}

function SummaryRail({ policies }: { policies: CancelPolicy[] }) {
    const highestHours = Math.max(...policies.map((item) => item.hoursBefore));
    const highestRefund = Math.max(...policies.map((item) => item.refundPercent));

    return (
        <div className="space-y-3 lg:sticky lg:top-32">
            <div className="rounded-[1.5rem] border border-border bg-surface-inverse p-5 text-white shadow-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-surface-3/50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
                    <Timer className="h-3 w-3" />
                    Tóm tắt
                </div>
                <h2 className="mt-3 text-xl font-black tracking-tight">
                    Xem mốc hủy và mức hoàn tiền.
                </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-border bg-surface-1/90 p-4 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">
                        Mốc sớm nhất
                    </p>
                    <p className="mt-2 text-xl font-black tracking-tight text-foreground">
                        {formatPolicyHours(highestHours)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                        Từ {formatPolicyThreshold(highestHours)} trở lên.
                    </p>
                </div>

                <div className="rounded-[1.5rem] border border-border bg-surface-1/90 p-4 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">
                        Hoàn tối đa
                    </p>
                    <p className="mt-2 text-xl font-black tracking-tight text-foreground">
                        {formatRefundPercent(highestRefund)}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                        Tỷ lệ cao nhất hiện có.
                    </p>
                </div>
            </div>
        </div>
    );
}

function PolicyCard({
    policy,
    index,
    policies,
}: {
    policy: CancelPolicy;
    index: number;
    policies: CancelPolicy[];
}) {
    const tone = getPolicyTone(policy.refundPercent, index, policies.length);
    const classes = getToneClasses(tone);

    return (
        <article
            className={`rounded-[1.5rem] border p-4 shadow-sm ${classes.shell}`}
        >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="lg:w-48 lg:shrink-0">
                    <div
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${classes.badge}`}
                    >
                        Mốc {String(index + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mt-3 text-xl font-black tracking-tight text-foreground">
                        {formatPolicyHours(policy.hoursBefore)}
                    </h3>
                    <p className="mt-2 text-xs font-bold leading-5 text-foreground">
                        {getPolicyRangeLabel(policies, index)}
                    </p>
                </div>

                <div className="min-w-0 flex-1 rounded-[1.25rem] bg-surface-1/80 px-4 py-4 shadow-inner shadow-white/60">
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${classes.soft}`}
                    >
                        Điều kiện áp dụng
                    </span>
                    <p className="mt-3 text-sm leading-6 text-foreground">
                        {normalizePolicyDescription(policy.description)}
                    </p>
                </div>

                <div className="lg:w-36 lg:shrink-0">
                    <div className="rounded-[1.25rem] border border-border bg-surface-1/90 px-4 py-4 text-center shadow-sm lg:text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">
                            Hoàn tiền
                        </p>
                        <p
                            className={`mt-2 text-3xl font-black tracking-tight ${classes.accent}`}
                        >
                            {formatRefundPercent(policy.refundPercent)}
                        </p>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function CancellationPolicyPreview({
    anchorId,
}: CancellationPolicyPreviewProps) {
    const [policies, setPolicies] = useState<CancelPolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPolicies = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const nextPolicies = await fetchCancelPolicies();
            setPolicies(sortCancelPolicies(nextPolicies));
        } catch (err) {
            setPolicies([]);
            setError(
                err instanceof Error
                    ? err.message
                    : "Không thể tải chính sách hủy từ hệ thống.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadPolicies();
    }, [loadPolicies]);

    const sortedPolicies = useMemo(
        () => sortCancelPolicies(policies),
        [policies],
    );

    if (loading) return <LoadingState />;
    if (error)
        return <ErrorState message={error} onRetry={() => void loadPolicies()} />;
    if (sortedPolicies.length === 0) return <EmptyState />;

    return (
        <section id={anchorId} className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
            <SummaryRail policies={sortedPolicies} />

            <div className="space-y-3">
                {sortedPolicies.map((policy, index) => (
                    <PolicyCard
                        key={policy.id}
                        policy={policy}
                        index={index}
                        policies={sortedPolicies}
                    />
                ))}
            </div>
        </section>
    );
}
