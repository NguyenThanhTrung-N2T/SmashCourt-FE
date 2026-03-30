"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Clock3,
  RefreshCw,
  ShieldCheck,
  TimerReset,
} from "lucide-react";

import { fetchCancelPolicies } from "@/src/common/cancellationPolicyApi";
import {
  formatPolicyHours,
  formatRefundPercent,
  formatPolicyThreshold,
  getPolicyRangeLabel,
  getPolicyTone,
  normalizePolicyDescription,
  sortCancelPolicies,
  type CancelPolicyDto,
  type CancellationPolicyTone,
} from "@/src/common/cancellationPolicy";

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
    <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
      <div className="space-y-4">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-[2rem] border border-slate-200 bg-white/80" />
        ))}
      </div>
      <div className="space-y-4">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-40 animate-pulse rounded-[2rem] border border-slate-200 bg-white/80" />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-2xl font-extrabold text-slate-950">Chưa thể tải dữ liệu chính sách</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600"
      >
        <RefreshCw className="h-4 w-4" />
        Tải lại dữ liệu
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Clock3 className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-2xl font-extrabold text-slate-950">Chưa có dữ liệu chính sách hủy</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
        Hệ thống hiện chưa trả về mốc chính sách nào để hiển thị.
      </p>
    </div>
  );
}

function SummaryRail({ policies }: { policies: CancelPolicyDto[] }) {
  const highestHours = Math.max(...policies.map((item) => item.hoursBefore));
  const highestRefund = Math.max(...policies.map((item) => item.refundPercent));
  const latestUpdate = policies.reduce((latest, policy) => {
    return new Date(policy.updatedAt).getTime() > new Date(latest.updatedAt).getTime()
      ? policy
      : latest;
  });

  return (
    <div className="space-y-4 lg:sticky lg:top-32">
      <div className="rounded-[2.25rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-200">
          <TimerReset className="h-3.5 w-3.5" />
          Tóm tắt
        </div>
        <h2 className="mt-4 text-2xl font-black tracking-tight">
          Xem mốc hủy và mức hoàn tiền theo từng dòng.
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          Dữ liệu được lấy từ backend và sắp lại để tra cứu nhanh hơn.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Mốc sớm nhất</p>
          <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{formatPolicyHours(highestHours)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">Xem trước từ {formatPolicyThreshold(highestHours)} trở lên.</p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Hoàn tối đa</p>
          <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{formatRefundPercent(highestRefund)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">Tỷ lệ cao nhất trong các mốc hiện có.</p>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Cập nhật gần nhất</p>
          <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{formatUpdatedAt(latestUpdate.updatedAt)}</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <ArrowUpRight className="h-3.5 w-3.5" />
            Đồng bộ từ backend
          </div>
        </div>
      </div>
    </div>
  );
}

function PolicyCard({ policy, index, policies }: { policy: CancelPolicyDto; index: number; policies: CancelPolicyDto[] }) {
  const tone = getPolicyTone(policy.refundPercent, index, policies.length);
  const classes = getToneClasses(tone);

  return (
    <article className={`rounded-[2rem] border p-5 shadow-sm ${classes.shell}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="lg:w-56 lg:shrink-0">
          <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${classes.badge}`}>
            Mốc {String(index + 1).padStart(2, "0")}
          </div>
          <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950">{formatPolicyHours(policy.hoursBefore)}</h3>
          <p className="mt-3 text-sm font-bold leading-6 text-slate-700">{getPolicyRangeLabel(policies, index)}</p>
        </div>

        <div className="min-w-0 flex-1 rounded-[1.75rem] bg-white/80 px-5 py-5 shadow-inner shadow-white/60">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${classes.soft}`}>
            Điều kiện áp dụng
          </span>
          <p className="mt-4 text-base leading-7 text-slate-700">{normalizePolicyDescription(policy.description)}</p>
        </div>

        <div className="lg:w-44 lg:shrink-0">
          <div className="rounded-[1.75rem] border border-white/80 bg-white/90 px-5 py-5 text-center shadow-sm lg:text-right">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Hoàn tiền</p>
            <p className={`mt-3 text-4xl font-black tracking-tight ${classes.accent}`}>{formatRefundPercent(policy.refundPercent)}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CancellationPolicyPreview({ anchorId }: CancellationPolicyPreviewProps) {
  const [policies, setPolicies] = useState<CancelPolicyDto[]>([]);
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
      setError(err instanceof Error ? err.message : "Không thể tải chính sách hủy từ hệ thống.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPolicies();
  }, [loadPolicies]);

  const sortedPolicies = useMemo(() => sortCancelPolicies(policies), [policies]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => void loadPolicies()} />;
  if (sortedPolicies.length === 0) return <EmptyState />;

  return (
    <section id={anchorId} className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
      <SummaryRail policies={sortedPolicies} />

      <div className="space-y-4">
        {sortedPolicies.map((policy, index) => (
          <PolicyCard key={policy.id} policy={policy} index={index} policies={sortedPolicies} />
        ))}

        <div className="rounded-[2rem] border border-slate-200 bg-white/90 px-6 py-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">Lưu ý</p>
              <p className="mt-2 text-base leading-7 text-slate-600">
                Danh sách này thay đổi theo dữ liệu mới nhất mà backend trả về.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
