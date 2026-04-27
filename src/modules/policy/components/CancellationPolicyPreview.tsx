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
} from "@/src/modules/policy/utils/cancellationPolicy";
import type {
  CancelPolicy,
  CancellationPolicyTone,
} from "@/src/shared/types/cancel-policy.types";

type CancellationPolicyPreviewProps = {
  anchorId?: string;
};

function getToneClasses(tone: CancellationPolicyTone) {
  if (tone === "emerald") {
    return {
      shell: "border-emerald-200 bg-emerald-50/80",
      badge: "bg-emerald-600 text-white",
      accent: "text-emerald-700",
      soft: "bg-emerald-100 text-emerald-700",
    };
  }

  if (tone === "amber") {
    return {
      shell: "border-amber-200 bg-amber-50/80",
      badge: "bg-amber-500 text-white",
      accent: "text-amber-700",
      soft: "bg-amber-100 text-amber-700",
    };
  }

  if (tone === "rose") {
    return {
      shell: "border-rose-200 bg-rose-50/80",
      badge: "bg-rose-500 text-white",
      accent: "text-rose-700",
      soft: "bg-rose-100 text-rose-700",
    };
  }

  return {
    shell: "border-slate-200 bg-slate-100/90",
    badge: "bg-slate-900 text-white",
    accent: "text-slate-800",
    soft: "bg-slate-200 text-slate-700",
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
            className="h-24 animate-pulse rounded-[1.5rem] border border-slate-200 bg-white/80"
          />
        ))}
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-36 animate-pulse rounded-[1.5rem] border border-slate-200 bg-white/80"
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
    <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm">
        <Warning className="h-5 w-5" />
      </div>
      <h2 className="mt-3 text-xl font-extrabold text-slate-950">
        Chưa thể tải dữ liệu chính sách
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600"
      >
        <ArrowClockwise className="h-4 w-4" />
        Tải lại dữ liệu
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-8 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Clock className="h-5 w-5" />
      </div>
      <h2 className="mt-3 text-xl font-extrabold text-slate-950">
        Chưa có dữ liệu chính sách hủy
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
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
      <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">
          <Timer className="h-3 w-3" />
          Tóm tắt
        </div>
        <h2 className="mt-3 text-xl font-black tracking-tight">
          Xem mốc hủy và mức hoàn tiền.
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            Mốc sớm nhất
          </p>
          <p className="mt-2 text-xl font-black tracking-tight text-slate-950">
            {formatPolicyHours(highestHours)}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Từ {formatPolicyThreshold(highestHours)} trở lên.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            Hoàn tối đa
          </p>
          <p className="mt-2 text-xl font-black tracking-tight text-slate-950">
            {formatRefundPercent(highestRefund)}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
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
          <h3 className="mt-3 text-xl font-black tracking-tight text-slate-950">
            {formatPolicyHours(policy.hoursBefore)}
          </h3>
          <p className="mt-2 text-xs font-bold leading-5 text-slate-700">
            {getPolicyRangeLabel(policies, index)}
          </p>
        </div>

        <div className="min-w-0 flex-1 rounded-[1.25rem] bg-white/80 px-4 py-4 shadow-inner shadow-white/60">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${classes.soft}`}
          >
            Điều kiện áp dụng
          </span>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {normalizePolicyDescription(policy.description)}
          </p>
        </div>

        <div className="lg:w-36 lg:shrink-0">
          <div className="rounded-[1.25rem] border border-white/80 bg-white/90 px-4 py-4 text-center shadow-sm lg:text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
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
