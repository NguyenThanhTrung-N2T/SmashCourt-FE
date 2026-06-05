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
            shell: "border-emerald-500/20 bg-emerald-500/5 shadow-sm shadow-emerald-500/5",
            badge: "bg-emerald-600 text-white font-bold",
            accent: "text-emerald-700 font-black",
            soft: "bg-emerald-500/10 text-emerald-700 font-extrabold",
        };
    }

    if (tone === "amber") {
        return {
            shell: "border-amber-500/20 bg-amber-500/5 shadow-sm shadow-amber-500/5",
            badge: "bg-amber-600 text-white font-bold",
            accent: "text-amber-700 font-black",
            soft: "bg-amber-500/10 text-amber-700 font-extrabold",
        };
    }

    if (tone === "rose") {
        return {
            shell: "border-rose-500/20 bg-rose-500/5 shadow-sm shadow-rose-500/5",
            badge: "bg-rose-600 text-white font-bold",
            accent: "text-rose-700 font-black",
            soft: "bg-rose-500/10 text-rose-700 font-extrabold",
        };
    }

    return {
        shell: "border-slate-200 bg-slate-50",
        badge: "bg-slate-800 text-white font-bold",
        accent: "text-slate-900 font-black",
        soft: "bg-slate-200/60 text-slate-800 font-extrabold",
    };
}

function LoadingState() {
    return (
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="space-y-4">
                {[0, 1].map((item) => (
                    <div
                        key={item}
                        className="h-28 animate-pulse rounded-[1.5rem] border border-slate-200 bg-white"
                    />
                ))}
            </div>
            <div className="space-y-4">
                {[0, 1, 2].map((item) => (
                    <div
                        key={item}
                        className="h-36 animate-pulse rounded-[1.5rem] border border-slate-200 bg-white"
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
        <div className="rounded-[1.5rem] border border-rose-500/20 bg-rose-500/5 px-6 py-10 text-center shadow-sm max-w-xl mx-auto">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-rose-500 shadow-md">
                <Warning className="h-6 w-6" weight="bold" />
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-900">
                Chưa thể tải dữ liệu chính sách
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {message}
            </p>
            <button
                type="button"
                onClick={onRetry}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-slate-800 px-5 py-3 text-xs font-bold text-white transition-all hover:-translate-y-0.5"
            >
                <ArrowClockwise className="h-4 w-4" weight="bold" />
                Tải lại dữ liệu
            </button>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white px-6 py-10 text-center shadow-sm max-w-xl mx-auto">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Clock className="h-6 w-6" weight="bold" />
            </div>
            <h2 className="mt-4 text-xl font-black text-slate-900">
                Chưa có dữ liệu chính sách hủy
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Hệ thống hiện chưa thiết lập mốc chính sách nào để hiển thị.
            </p>
        </div>
    );
}

function SummaryRail({ policies }: { policies: CancelPolicy[] }) {
    const highestHours = Math.max(...policies.map((item) => item.hoursBefore));
    const highestRefund = Math.max(...policies.map((item) => item.refundPercent));

    return (
        <div className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-[1.5rem] border border-white/5 bg-[#071F14] p-6 text-white shadow-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#B3F56E]">
                    <Timer className="h-3.5 w-3.5" weight="bold" />
                    Tóm tắt quy định
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-tight leading-tight">
                    Theo dõi mốc thời gian đặt và tỷ lệ hoàn phí.
                </h2>
                <p className="mt-2 text-xs font-medium text-slate-350 leading-relaxed">
                    Hệ thống tự động áp dụng tỷ lệ hoàn tiền tương ứng tùy thuộc vào thời điểm bạn thực hiện hủy sân.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Mốc sớm nhất
                    </p>
                    <p className="mt-2 text-2xl font-black tracking-tight text-[#071F14]">
                        {formatPolicyHours(highestHours)}
                    </p>
                    <p className="mt-1.5 text-xs font-medium text-slate-500 leading-relaxed">
                        Từ {formatPolicyThreshold(highestHours)} trở lên.
                    </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Hoàn tiền tối đa
                    </p>
                    <p className="mt-2 text-2xl font-black tracking-tight text-[#071F14]">
                        {formatRefundPercent(highestRefund)}
                    </p>
                    <p className="mt-1.5 text-xs font-medium text-slate-500 leading-relaxed">
                        Tỷ lệ hoàn tiền cao nhất dành cho hội viên.
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
            className={`rounded-[1.5rem] border p-5 shadow-sm transition-all duration-300 hover:shadow-md bg-white ${classes.shell}`}
        >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="lg:w-48 lg:shrink-0">
                    <div
                        className={`inline-flex rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${classes.badge}`}
                    >
                        Mốc {String(index + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mt-4 text-2xl font-black tracking-tight text-[#071F14]">
                        {formatPolicyHours(policy.hoursBefore)}
                    </h3>
                    <p className="mt-2 text-xs font-bold leading-relaxed text-slate-600">
                        {getPolicyRangeLabel(policies, index)}
                    </p>
                </div>

                <div className="min-w-0 flex-1 rounded-[1.25rem] bg-white p-5 border border-slate-100 shadow-sm">
                    <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.16em] ${classes.soft}`}
                    >
                        Điều kiện áp dụng
                    </span>
                    <p className="mt-3 text-sm leading-relaxed font-semibold text-slate-700">
                        {normalizePolicyDescription(policy.description)}
                    </p>
                </div>

                <div className="lg:w-36 lg:shrink-0">
                    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5 text-center shadow-sm lg:text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                            Hoàn phí
                        </p>
                        <p
                            className={`mt-2 text-3xl ${classes.accent}`}
                        >
                            {formatRefundPercent(policy.refundPercent)}
                        </p>
                    </div>
                </div>
            </div>
        </article>
    );
}

export function CancellationPolicyPreview({
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
        <section id={anchorId} className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <SummaryRail policies={sortedPolicies} />

            <div className="space-y-4">
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
