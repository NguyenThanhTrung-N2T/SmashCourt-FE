"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Crown,
  Edit3,
  Gem,
  Layers,
  Loader2,
  Medal,
  PercentIcon,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import {
  fetchAllLoyaltyTiers,
  updateLoyaltyTier,
} from "@/src/api/loyalty-tier.api";
import type { LoyaltyTier } from "@/src/shared/types/loyalty-tier.types";
import { AuthApiError } from "@/src/api/auth.api";

// ─── Tier config & Identity ───────────────────────────────────────────────────
type TierCfg = {
  gradient: string;
  gradientText: string;
  icon: React.ElementType;
  saveBg: string;
  pillBg: string;
  pillText: string;
  cardBorder: string;
  cardBg: string;
  formBg: string;
  inputFocus: string;
};

function getTierCfg(name: string): TierCfg {
  const n = name.toLowerCase();
  if (n.includes("diamond") || n.includes("kim cương"))
    return {
      gradient: "from-violet-500 to-fuchsia-600",
      gradientText: "from-violet-600 to-fuchsia-700",
      icon: Gem,
      saveBg: "bg-violet-600 hover:bg-violet-700 active:bg-violet-800",
      pillBg: "bg-violet-100/90",
      pillText: "text-violet-900",
      cardBorder: "border-violet-400",
      cardBg: "bg-violet-50/40",
      formBg: "bg-violet-50/30",
      inputFocus: "focus:border-violet-500 focus:ring-violet-100",
    };
  if (n.includes("platinum") || n.includes("bạch kim"))
    return {
      gradient: "from-cyan-300 to-sky-400",
      gradientText: "from-cyan-500 to-sky-600",
      icon: Sparkles,
      saveBg: "bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700",
      pillBg: "bg-cyan-100/90",
      pillText: "text-cyan-900",
      cardBorder: "border-cyan-300",
      cardBg: "bg-cyan-50/50",
      formBg: "bg-cyan-50/40",
      inputFocus: "focus:border-cyan-500 focus:ring-cyan-100",
    };
  if (n.includes("gold") || n.includes("vàng"))
    return {
      gradient: "from-yellow-400 to-amber-500",
      gradientText: "from-yellow-600 to-amber-700",
      icon: Crown,
      saveBg: "bg-amber-500 hover:bg-amber-600 active:bg-amber-700",
      pillBg: "bg-amber-100/90",
      pillText: "text-amber-900",
      cardBorder: "border-amber-400",
      cardBg: "bg-amber-50/40",
      formBg: "bg-amber-50/30",
      inputFocus: "focus:border-amber-500 focus:ring-amber-100",
    };
  if (n.includes("silver") || n.includes("bạc"))
    return {
      gradient: "from-zinc-400 to-zinc-600",
      gradientText: "from-zinc-600 to-zinc-800",
      icon: Medal,
      saveBg: "bg-slate-600 hover:bg-slate-700 active:bg-slate-800",
      pillBg: "bg-slate-200/90",
      pillText: "text-slate-800",
      cardBorder: "border-slate-400",
      cardBg: "bg-slate-50/80",
      formBg: "bg-slate-50",
      inputFocus: "focus:border-slate-500 focus:ring-slate-100",
    };
  if (n.includes("bronze") || n.includes("đồng"))
    return {
      gradient: "from-amber-600 to-amber-800",
      gradientText: "from-amber-700 to-amber-900",
      icon: Award,
      saveBg: "bg-orange-600 hover:bg-orange-700 active:bg-orange-800",
      pillBg: "bg-orange-100/90",
      pillText: "text-orange-900",
      cardBorder: "border-orange-400",
      cardBg: "bg-orange-50/40",
      formBg: "bg-orange-50/30",
      inputFocus: "focus:border-orange-500 focus:ring-orange-100",
    };
  return {
    gradient: "from-slate-400 to-slate-600",
    gradientText: "from-slate-600 to-slate-800",
    icon: Layers,
    saveBg: "bg-slate-600 hover:bg-slate-700 active:bg-slate-800",
    pillBg: "bg-slate-200/90",
    pillText: "text-slate-800",
    cardBorder: "border-slate-300",
    cardBg: "bg-slate-50/70",
    formBg: "bg-slate-50/50",
    inputFocus: "focus:border-slate-500 focus:ring-slate-100",
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────

type Toast = { visible: boolean; tone: "success" | "error"; message: string };
function useToast() {
  const [toast, setToast] = useState<Toast>({ visible: false, tone: "success", message: "" });
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((tone: "success" | "error", message: string) => {
    if (t.current) clearTimeout(t.current);
    setToast({ visible: true, tone, message });
    t.current = setTimeout(() => setToast((p) => ({ ...p, visible: false })), 3500);
  }, []);
  return { toast, show };
}

// ─── Top Stats Header ─────────────────────────────────────────────────────────

function TopStatsHeader({
  tiers,
  loading,
  onRefresh,
}: {
  tiers: LoyaltyTier[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const maxDiscount = tiers.length ? Math.max(...tiers.map((t) => Number(t.discountRate))) : 0;
  const maxPoints = tiers.length ? Math.max(...tiers.map((t) => t.minPoints)) : 0;

  return (
    <>
      {/* Dark Header */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-8 text-white shadow-xl shadow-slate-900/10 mb-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/20 blur-[60px]" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-yellow-500/10 blur-[50px]" />

        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center w-full">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-300">
              <Trophy className="h-3.5 w-3.5" /> Quản trị
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-white">
              Quản lý{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">
                Hạng thành viên
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-md">
              Thiết lập ngưỡng điểm xét hạng & tỷ lệ ưu đãi cho hệ thống. Hệ thống tự động xếp loại khách hàng theo điểm tích lũy.
            </p>
          </div>

          <div className="hidden shrink-0 sm:flex items-center justify-center pr-4">
            <div
              className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-500/10 border border-white/10 shadow-[0_0_30px_rgba(251,191,36,0.15)] animate-pulse"
              style={{ animationDuration: "3s" }}
            >
              <div
                className="absolute inset-2 rounded-3xl border border-amber-500/20 border-dashed animate-spin"
                style={{ animationDuration: "15s" }}
              />
              <Trophy className="relative h-10 w-10 text-amber-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            Cấu hình hạng thành viên
          </h2>
          <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            {tiers.length} hạng
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-white px-3 text-xs font-bold text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { icon: Trophy, color: "text-amber-500", bg: "bg-amber-100", val: loading ? "–" : tiers.length, label: "Tổng số hạng" },
          { icon: PercentIcon, color: "text-emerald-500", bg: "bg-emerald-100", val: loading ? "–" : `${maxDiscount}%`, label: "Giảm giá tối đa" },
          { icon: Zap, color: "text-indigo-500", bg: "bg-indigo-100", val: loading ? "–" : maxPoints.toLocaleString("vi-VN"), label: "Ngưỡng điểm kịch trần" },
          { icon: Users, color: "text-slate-500", bg: "bg-slate-100", val: "--", label: "Tổng thành viên (Sắp có)" },
        ].map((s, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.val}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Left Sidebar: Tier List ──────────────────────────────────────────────────

function TierListCard({
  tiers,
  selectedId,
  onSelect,
}: {
  tiers: LoyaltyTier[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
        <h2 className="text-base font-bold text-slate-800">Danh sách hạng</h2>
        <p className="text-xs text-slate-500">Thứ tự từ hạng mới đến cao nhất</p>
      </div>

      <div className="flex-1 p-3 space-y-2">
        {tiers.map((tier, i) => {
          const cfg = getTierCfg(tier.name);
          const Icon = cfg.icon;
          const isSelected = selectedId === tier.id;

          return (
            <button
              key={tier.id}
              onClick={() => onSelect(tier.id)}
              className={`group flex w-full items-center gap-4 rounded-2xl border-2 p-3 text-left transition-all duration-200 hover:shadow-md ${isSelected ? `${cfg.cardBorder} ${cfg.cardBg} shadow-sm` : "border-transparent hover:border-slate-200 bg-transparent hover:bg-white"
                }`}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.gradient} shadow-inner`}>
                <Icon className="h-6 w-6 text-white drop-shadow-sm" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-sm font-extrabold truncate ${isSelected ? "text-slate-900" : "text-slate-700"}`}>
                    {tier.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-black text-slate-500">
                    #{i + 1}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${cfg.pillBg} ${cfg.pillText}`}>
                    <Zap className="h-2.5 w-2.5" /> {tier.minPoints.toLocaleString()} đ
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100/80 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    <PercentIcon className="h-2.5 w-2.5" /> {Number(tier.discountRate)}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Right Panel: Detail & Edit ───────────────────────────────────────────────

function DetailPanel({
  tier,
  onSaved,
  showToast,
}: {
  tier: LoyaltyTier;
  onSaved: (u: LoyaltyTier) => void;
  showToast: (tone: "success" | "error", msg: string) => void;
}) {
  const cfg = getTierCfg(tier.name);
  const Icon = cfg.icon;

  const [minPoints, setMinPoints] = useState(String(tier.minPoints));
  const [discountRate, setDiscountRate] = useState(String(tier.discountRate));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ minPoints?: string; discountRate?: string; general?: string }>({});

  useEffect(() => {
    setMinPoints(String(tier.minPoints));
    setDiscountRate(String(tier.discountRate));
    setErrors({});
  }, [tier.id, tier.minPoints, tier.discountRate]);

  const isDirty = Number(minPoints) !== tier.minPoints || Number(discountRate) !== Number(tier.discountRate);

  function validate() {
    const e: typeof errors = {};
    const p = Number(minPoints);
    const d = Number(discountRate);
    if (!minPoints.trim() || isNaN(p) || p < 0) e.minPoints = "Vui lòng nhập số hợp lệ ≥ 0";
    if (!discountRate.trim() || isNaN(d) || d < 0 || d > 100) e.discountRate = "Vui lòng nhập tỷ lệ từ 0 đến 100";
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSaving(true);
    try {
      const updated = await updateLoyaltyTier(tier.id, { minPoints: Number(minPoints), discountRate: Number(discountRate) });
      onSaved(updated);
      showToast("success", `Cập nhật hạng "${updated.name}" thành công`);
    } catch (err) {
      const msg = err instanceof AuthApiError ? err.message : "Đã có lỗi xảy ra, không thể lưu hệ thống.";
      setErrors({ general: msg });
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

      {/* ── Visual Banner ── */}
      <div className={`relative h-28 w-full bg-gradient-to-r ${cfg.gradient}`}>
        <div className="absolute -bottom-10 left-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
            <div className={`flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br ${cfg.gradient}`}>
              <Icon className="h-8 w-8 text-white drop-shadow-md" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 pb-6 pt-14">
        <h2 className={`text-2xl font-black tracking-tight bg-gradient-to-r ${cfg.gradientText} bg-clip-text text-transparent`}>
          {tier.name}
        </h2>

        {/* Info Highlights */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Điểm tối thiểu</p>
              <p className="text-xl font-black text-slate-800">{tier.minPoints.toLocaleString("vi-VN")}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-200 text-emerald-700">
              <PercentIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600/70">Tỷ lệ giảm giá</p>
              <p className="text-xl font-black text-emerald-700">{Number(tier.discountRate)}%</p>
            </div>
          </div>
        </div>

        {/* Edit Form Area */}
        <div className={`mt-8 rounded-3xl border border-slate-100 ${cfg.formBg} p-6`}>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-slate-600" />
              <h3 className="text-base font-bold text-slate-800">Cấu hình điều kiện hạng</h3>
            </div>
            {isDirty && (
              <span className="animate-pulse rounded-full bg-amber-200 px-3 py-1 text-xs font-black text-amber-800">
                CHƯA LƯU
              </span>
            )}
          </div>

          {errors.general && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <p className="text-sm font-semibold text-red-700">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {/* Field 1 */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Điểm tích lũy tối thiểu
              </label>
              <div className="relative">
                <input
                  id={`min-pts-${tier.id}`}
                  type="number"
                  min={0}
                  value={minPoints}
                  onChange={(e) => { setMinPoints(e.target.value); setErrors((p) => ({ ...p, minPoints: undefined })); }}
                  className={`w-full rounded-xl border-2 px-4 py-3 pr-12 text-base font-bold text-slate-800 shadow-sm outline-none transition-all ${errors.minPoints ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-100" : `border-slate-200 bg-white ${cfg.inputFocus}`
                    }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Pts</span>
              </div>
              {errors.minPoints ? (
                <p className="mt-2 text-xs font-bold text-red-500">{errors.minPoints}</p>
              ) : (
                <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">Người dùng sẽ tự động nâng lên hạng này khi đạt số điểm tích lũy trên.</p>
              )}
            </div>

            {/* Field 2 */}
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Tỷ lệ chiết khấu (%)
              </label>
              <div className="relative">
                <input
                  id={`disc-${tier.id}`}
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={discountRate}
                  onChange={(e) => { setDiscountRate(e.target.value); setErrors((p) => ({ ...p, discountRate: undefined })); }}
                  className={`w-full rounded-xl border-2 px-4 py-3 pr-12 text-base font-bold text-slate-800 shadow-sm outline-none transition-all ${errors.discountRate ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-100" : `border-slate-200 bg-white ${cfg.inputFocus}`
                    }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">%</span>
              </div>
              {errors.discountRate ? (
                <p className="mt-2 text-xs font-bold text-red-500">{errors.discountRate}</p>
              ) : (
                <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">Mức giảm giá sẽ được tự động áp dụng vào tổng hóa đơn khi đặt sân.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Footer */}
      <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-8 py-5 flex items-center justify-between">
        <button
          onClick={() => { setMinPoints(String(tier.minPoints)); setDiscountRate(String(tier.discountRate)); setErrors({}); }}
          disabled={!isDirty || saving}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>

        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className={`inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-black text-white shadow-lg transition-all ${cfg.saveBg} disabled:opacity-50 disabled:shadow-none disabled:hover:bg-opacity-100 hover:-translate-y-0.5 active:translate-y-0`}
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Lưu cấu hình
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LoyaltyTierManager() {
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { toast, show: showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAllLoyaltyTiers();
      const sorted = [...data].sort((a, b) => a.minPoints - b.minPoints);
      setTiers(sorted);
      if (sorted.length > 0) {
        setSelectedId(sorted[0].id); // Tự động chọn hạng đầu tiên, giải quyết UX "form trống"
      }
    } catch (err) {
      setLoadError(err instanceof AuthApiError ? err.message : "Không tải được dữ liệu hệ thống.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function handleSaved(updated: LoyaltyTier) {
    setTiers((prev) =>
      [...prev.map((t) => (t.id === updated.id ? updated : t))].sort((a, b) => a.minPoints - b.minPoints)
    );
  }

  // Luôn có 1 tier được chọn nhờ auto-select
  const selectedTier = tiers.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] p-8 overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full w-full">

      {/* 1. Header Card */}
      <TopStatsHeader tiers={tiers} loading={loading} onRefresh={load} />

      {/* States */}
      {loading && (
        <div className="my-20 flex flex-col items-center gap-4 w-full">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="font-semibold text-slate-500">Đang đồng bộ dữ liệu hạng...</p>
        </div>
      )}

      {!loading && loadError && (
        <div className="my-10 flex flex-col items-center rounded-[2rem] border-2 border-red-200 bg-red-50 p-12 text-center shadow-sm w-full">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
          <h3 className="text-xl font-bold text-red-800">Lỗi đồng bộ dữ liệu</h3>
          <p className="mt-2 text-red-600">{loadError}</p>
          <button onClick={load} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white shadow-md hover:bg-red-700">
            <RefreshCw className="h-5 w-5" /> Thử lại
          </button>
        </div>
      )}

      {/* 2. Content Layout */}
      {!loading && !loadError && tiers.length > 0 && selectedTier && (
        <div className="grid grid-cols-5 gap-6 w-full">

          {/* Left: List Card */}
          <div className="col-span-2">
            <TierListCard
              tiers={tiers}
              selectedId={selectedId}
              onSelect={(id) => {
                if (id !== selectedId) setSelectedId(id);
                // Nếu bấm lại ID cũ, không làm gì cả
              }}
            />
          </div>

          {/* Right: Detail Card */}
          <div className="col-span-3">
            <DetailPanel
              key={selectedTier.id}
              tier={selectedTier}
              onSaved={handleSaved}
              showToast={showToast}
            />
          </div>
        </div>
      )}

      {/* Global Toast */}
      <div
        className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${toast.visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
          }`}
      >
        <div className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-5 py-4 shadow-2xl ${toast.tone === "success" ? "border-emerald-300" : "border-red-300"
          }`}>
          {toast.tone === "success"
            ? <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            : <AlertTriangle className="h-6 w-6 text-red-500" />}
          <p className={`font-bold ${toast.tone === "success" ? "text-emerald-800" : "text-red-800"}`}>
            {toast.message}
          </p>
        </div>
      </div>
    </div>
  );
}
