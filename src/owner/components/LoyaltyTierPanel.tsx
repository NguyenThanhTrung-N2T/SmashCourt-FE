"use client";

// Updated: 2026-04-01 - Redesigned header to match CourtTypePanel and CancellationPolicyManager

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Loader2,
  PercentIcon,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import {
  fetchAllLoyaltyTiers,
  fetchLoyaltyTierById,
  updateLoyaltyTier,
  type LoyaltyTierDto,
} from "@/src/owner/api/loyaltyTierApi";
import { AuthApiError } from "@/src/auth/api/authApi";

// ─── Tier visual config ───────────────────────────────────────────────────────

type TierTheme = {
  gradient: string;
  bgLight: string;
  border: string;
  textAccent: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  icon: React.ElementType;
  glow: string;
};

function getTierTheme(name: string): TierTheme {
  const lower = name.toLowerCase();
  if (lower.includes("diamond"))
    return {
      gradient: "from-cyan-400 via-blue-400 to-indigo-500",
      bgLight: "from-cyan-50 to-blue-50",
      border: "border-cyan-200 hover:border-cyan-400",
      textAccent: "text-cyan-700",
      badgeBg: "bg-cyan-50",
      badgeBorder: "border-cyan-200",
      badgeText: "text-cyan-800",
      icon: Trophy,
      glow: "shadow-cyan-500/30",
    };
  if (lower.includes("gold") || lower.includes("vàng"))
    return {
      gradient: "from-amber-400 via-yellow-400 to-orange-400",
      bgLight: "from-amber-50 to-yellow-50",
      border: "border-amber-200 hover:border-amber-400",
      textAccent: "text-amber-700",
      badgeBg: "bg-amber-50",
      badgeBorder: "border-amber-200",
      badgeText: "text-amber-800",
      icon: Star,
      glow: "shadow-amber-500/30",
    };
  if (lower.includes("silver") || lower.includes("bạc"))
    return {
      gradient: "from-slate-300 via-gray-300 to-slate-400",
      bgLight: "from-slate-50 to-gray-50",
      border: "border-slate-200 hover:border-slate-400",
      textAccent: "text-slate-600",
      badgeBg: "bg-slate-50",
      badgeBorder: "border-slate-200",
      badgeText: "text-slate-700",
      icon: ShieldCheck,
      glow: "shadow-slate-400/30",
    };
  // Bronze / default
  return {
    gradient: "from-orange-400 via-amber-500 to-yellow-600",
    bgLight: "from-orange-50 to-amber-50",
    border: "border-orange-200 hover:border-orange-400",
    textAccent: "text-orange-700",
    badgeBg: "bg-orange-50",
    badgeBorder: "border-orange-200",
    badgeText: "text-orange-800",
    icon: Award,
    glow: "shadow-orange-500/30",
  };
}

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastState = {
  visible: boolean;
  tone: "success" | "error";
  message: string;
};

function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    tone: "success",
    message: "",
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((tone: "success" | "error", message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ visible: true, tone, message });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3500);
  }, []);

  return { toast, show };
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

type EditModalProps = {
  tier: LoyaltyTierDto;
  onClose: () => void;
  onSaved: (updated: LoyaltyTierDto) => void;
};

function EditModal({ tier, onClose, onSaved }: EditModalProps) {
  const theme = getTierTheme(tier.name);
  const Icon = theme.icon;

  const [minPoints, setMinPoints] = useState(String(tier.minPoints));
  const [discountRate, setDiscountRate] = useState(String(tier.discountRate));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    minPoints?: string;
    discountRate?: string;
    general?: string;
  }>({});

  const validate = () => {
    const errs: typeof errors = {};
    const pts = Number(minPoints);
    const disc = Number(discountRate);

    if (!minPoints.trim() || isNaN(pts) || pts < 0) {
      errs.minPoints = "Điểm tối thiểu phải là số >= 0";
    }
    if (!discountRate.trim() || isNaN(disc) || disc < 0 || disc > 100) {
      errs.discountRate = "Tỷ lệ giảm giá phải từ 0 đến 100";
    }
    return errs;
  };

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const updated = await updateLoyaltyTier(tier.id, {
        minPoints: Number(minPoints),
        discountRate: Number(discountRate),
      });
      onSaved(updated);
    } catch (err) {
      const msg =
        err instanceof AuthApiError
          ? err.message
          : "Lưu thất bại, vui lòng thử lại.";
      setErrors({ general: msg });
    } finally {
      setSaving(false);
    }
  }

  // Trap focus & close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Chỉnh sửa hạng ${tier.name}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg animate-slide-up rounded-[2rem] border-2 border-white/40 bg-white shadow-2xl shadow-slate-900/20">
        {/* Header */}
        <div
          className={`flex items-center justify-between rounded-t-[2rem] bg-gradient-to-r ${theme.gradient} px-8 py-6`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white shadow-lg">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/70">
                Chỉnh sửa hạng
              </p>
              <p className="text-xl font-extrabold text-white">{tier.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white transition-all hover:bg-white/30 hover:scale-110 active:scale-95"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-8 space-y-6">
          {errors.general && (
            <div className="flex items-start gap-3 rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
              <p className="text-sm font-semibold text-red-700">
                {errors.general}
              </p>
            </div>
          )}

          {/* MinPoints */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
              <Zap className="h-3.5 w-3.5 text-indigo-500" />
              Điểm tối thiểu
            </label>
            <div className="relative">
              <input
                id="edit-min-points"
                type="number"
                min={0}
                value={minPoints}
                onChange={(e) => {
                  setMinPoints(e.target.value);
                  if (errors.minPoints) setErrors((p) => ({ ...p, minPoints: undefined }));
                }}
                className={`w-full rounded-2xl border-2 ${
                  errors.minPoints
                    ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200"
                    : "border-slate-200 bg-slate-50 focus:border-indigo-400 focus:ring-indigo-100"
                } px-5 py-4 text-base font-bold text-slate-900 outline-none transition-all focus:ring-4 focus:bg-white`}
                placeholder="0"
              />
              {errors.minPoints && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">
                  {errors.minPoints}
                </p>
              )}
            </div>
          </div>

          {/* DiscountRate */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
              <PercentIcon className="h-3.5 w-3.5 text-emerald-500" />
              Tỷ lệ giảm giá (%)
            </label>
            <div className="relative">
              <input
                id="edit-discount-rate"
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={discountRate}
                onChange={(e) => {
                  setDiscountRate(e.target.value);
                  if (errors.discountRate) setErrors((p) => ({ ...p, discountRate: undefined }));
                }}
                className={`w-full rounded-2xl border-2 ${
                  errors.discountRate
                    ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200"
                    : "border-slate-200 bg-slate-50 focus:border-emerald-400 focus:ring-emerald-100"
                } px-5 py-4 text-base font-bold text-slate-900 outline-none transition-all focus:ring-4 focus:bg-white`}
                placeholder="0"
              />
              {errors.discountRate && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">
                  {errors.discountRate}
                </p>
              )}
            </div>
          </div>

          {/* Preview */}
          <div
            className={`rounded-2xl border-2 ${theme.badgeBorder} ${theme.badgeBg} px-5 py-4`}
          >
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
              Xem trước
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Tối thiểu:{" "}
                <span className={`font-extrabold ${theme.textAccent}`}>
                  {Number(minPoints) || 0} điểm
                </span>
              </span>
              <span className="text-sm font-semibold text-slate-700">
                Giảm giá:{" "}
                <span className={`font-extrabold ${theme.textAccent}`}>
                  {Number(discountRate) || 0}%
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-8 pb-8">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-2xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-extrabold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95 disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            id="save-tier-btn"
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-indigo-500/30 transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

type DetailDrawerProps = {
  tierId: string;
  onClose: () => void;
  onEdit: () => void;
};

function DetailDrawer({ tierId, onClose, onEdit }: DetailDrawerProps) {
  const [tier, setTier] = useState<LoyaltyTierDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchLoyaltyTierById(tierId);
        if (!cancelled) setTier(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof AuthApiError
              ? err.message
              : "Không tải được dữ liệu",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [tierId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const theme = tier ? getTierTheme(tier.name) : null;
  const Icon = theme?.icon ?? Award;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer — slides in from right */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md animate-slide-in-right overflow-y-auto rounded-l-[2.5rem] border-l-2 border-white/30 bg-white shadow-2xl shadow-slate-900/20">
        {/* Header */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between ${
            theme
              ? `bg-gradient-to-r ${theme.gradient}`
              : "bg-gradient-to-r from-indigo-500 to-violet-500"
          } px-8 py-6 rounded-tl-[2.5rem]`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white shadow-lg">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/70">
                Chi tiết hạng
              </p>
              <p className="text-xl font-extrabold text-white">
                {loading ? "Đang tải…" : (tier?.name ?? "Không tìm thấy")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white transition-all hover:bg-white/30 hover:scale-110 active:scale-95"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-16">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
              <p className="text-sm font-semibold text-slate-500">
                Đang tải dữ liệu…
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-start gap-3 rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-5">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && tier && theme && (
            <div className="space-y-6 animate-slide-up">
              {/* Stats cards */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`rounded-2xl border-2 ${theme.badgeBorder} bg-gradient-to-br ${theme.bgLight} p-5 shadow-sm`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className={`h-4 w-4 ${theme.textAccent}`} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Điểm tối thiểu
                    </p>
                  </div>
                  <p className={`text-3xl font-extrabold ${theme.textAccent}`}>
                    {tier.minPoints.toLocaleString("vi-VN")}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    điểm
                  </p>
                </div>

                <div
                  className={`rounded-2xl border-2 ${theme.badgeBorder} bg-gradient-to-br ${theme.bgLight} p-5 shadow-sm`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <PercentIcon className={`h-4 w-4 ${theme.textAccent}`} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Giảm giá
                    </p>
                  </div>
                  <p className={`text-3xl font-extrabold ${theme.textAccent}`}>
                    {Number(tier.discountRate)}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    %
                  </p>
                </div>
              </div>

              {/* Tier badge */}
              <div
                className={`rounded-2xl border-2 ${theme.border} bg-gradient-to-br ${theme.bgLight} px-6 py-5`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">
                      Hạng thành viên
                    </p>
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border-2 ${theme.badgeBorder} ${theme.badgeBg} px-4 py-2`}
                    >
                      <Icon className={`h-4 w-4 ${theme.textAccent}`} />
                      <span
                        className={`font-extrabold uppercase tracking-wider text-sm ${theme.badgeText}`}
                      >
                        {tier.name}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.gradient} text-white shadow-xl ${theme.glow}`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>
                </div>
              </div>

              {/* Info table */}
              <div className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-500 w-1/2">
                        ID
                      </td>
                      <td className="px-5 py-4 text-xs font-mono font-bold text-slate-700 break-all">
                        {tier.id}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-500">
                        Tên hạng
                      </td>
                      <td className={`px-5 py-4 text-sm font-extrabold ${theme.textAccent}`}>
                        {tier.name}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-500">
                        Điểm tối thiểu
                      </td>
                      <td className="px-5 py-4 text-sm font-extrabold text-slate-900">
                        {tier.minPoints.toLocaleString("vi-VN")} điểm
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-500">
                        Giảm giá
                      </td>
                      <td className="px-5 py-4 text-sm font-extrabold text-emerald-700">
                        {Number(tier.discountRate)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Edit button */}
              <button
                id={`edit-tier-detail-btn-${tier.id}`}
                onClick={onEdit}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${theme.gradient} px-6 py-4 text-sm font-extrabold text-white shadow-xl ${theme.glow} transition-all hover:shadow-2xl hover:-translate-y-0.5 active:scale-95`}
              >
                <Edit3 className="h-4 w-4" />
                Chỉnh sửa hạng này
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tier Card ─────────────────────────────────────────────────────────────────

type TierCardProps = {
  tier: LoyaltyTierDto;
  index: number;
  onViewDetail: (id: string) => void;
  onEdit: (tier: LoyaltyTierDto) => void;
};

function TierCard({ tier, index, onViewDetail, onEdit }: TierCardProps) {
  const theme = getTierTheme(tier.name);
  const Icon = theme.icon;

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border-2 ${theme.border} bg-gradient-to-br ${theme.bgLight} p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl animate-slide-up`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Glow orb */}
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${theme.gradient} opacity-10 blur-2xl transition-opacity group-hover:opacity-25`}
      />

      {/* Icon & Name */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.gradient} text-white shadow-lg ${theme.glow} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
        >
          <Icon className="h-7 w-7" />
        </div>
        <div
          className={`inline-flex items-center gap-1.5 rounded-full border-2 ${theme.badgeBorder} ${theme.badgeBg} px-3 py-1 text-[10px] font-black uppercase tracking-widest ${theme.badgeText}`}
        >
          <Sparkles className="h-3 w-3" />
          Hạng {index + 1}
        </div>
      </div>

      {/* Name */}
      <h3 className={`text-xl font-extrabold ${theme.textAccent} mb-4`}>
        {tier.name}
      </h3>

      {/* Stats */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/70 px-4 py-3">
          <div className="flex items-center gap-2">
            <Zap className={`h-4 w-4 ${theme.textAccent}`} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">
              Điểm tối thiểu
            </span>
          </div>
          <span className={`text-base font-extrabold ${theme.textAccent}`}>
            {tier.minPoints.toLocaleString("vi-VN")}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/70 px-4 py-3">
          <div className="flex items-center gap-2">
            <PercentIcon className={`h-4 w-4 ${theme.textAccent}`} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">
              Giảm giá
            </span>
          </div>
          <span className="text-base font-extrabold text-emerald-700">
            {Number(tier.discountRate)}%
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          id={`view-tier-btn-${tier.id}`}
          onClick={() => onViewDetail(tier.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 border-slate-200 bg-white px-3 py-2.5 text-xs font-extrabold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md active:scale-95"
        >
          Xem chi tiết
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          id={`edit-tier-btn-${tier.id}`}
          onClick={() => onEdit(tier)}
          className={`flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r ${theme.gradient} px-4 py-2.5 text-xs font-extrabold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95`}
        >
          <Edit3 className="h-3.5 w-3.5" />
          Sửa
        </button>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function LoyaltyTierPanel() {
  console.log("🎯 LoyaltyTierPanel rendered - NEW VERSION with dark header");
  
  const [tiers, setTiers] = useState<LoyaltyTierDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Drawer state
  const [editingTier, setEditingTier] = useState<LoyaltyTierDto | null>(null);
  const [viewingTierId, setViewingTierId] = useState<string | null>(null);

  const { toast, show: showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllLoyaltyTiers();
      setTiers(data);
    } catch (err) {
      setError(
        err instanceof AuthApiError
          ? err.message
          : "Không tải được danh sách hạng thành viên",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleSaved(updated: LoyaltyTierDto) {
    setTiers((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );
    setEditingTier(null);
    // Also close drawer if it was viewing the same tier
    showToast("success", `Đã cập nhật hạng "${updated.name}" thành công!`);
  }

  function handleEditFromDrawer() {
    if (!viewingTierId) return;
    const tier = tiers.find((t) => t.id === viewingTierId);
    if (tier) {
      setViewingTierId(null);
      setEditingTier(tier);
    }
  }

  return (
    <>
      {/* Panel card */}
      <div className="space-y-6 animate-slide-up">
        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-8 text-white shadow-xl shadow-slate-900/10">
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
                Xem và điều chỉnh điểm tối thiểu & tỷ lệ giảm giá cho từng hạng. Hệ thống tự động xếp loại khách hàng theo điểm tích lũy.
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              Danh sách hạng thành viên
            </h2>
            <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {tiers.length} hạng
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="refresh-tiers-btn"
              onClick={load}
              disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-white px-3 text-xs font-bold text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
              aria-label="Tải lại"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Summary bar */}
        {!loading && !error && tiers.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {tiers.map((tier) => {
              const theme = getTierTheme(tier.name);
              const TierIcon = theme.icon;
              return (
                <div
                  key={tier.id}
                  className={`flex items-center gap-3 rounded-2xl border-2 ${theme.badgeBorder} ${theme.badgeBg} px-4 py-3 transition-all hover:-translate-y-0.5`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient} text-white shadow-sm`}
                  >
                    <TierIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-extrabold truncate ${theme.textAccent}`}>
                      {tier.name}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-500">
                      {tier.minPoints.toLocaleString("vi-VN")} đ •{" "}
                      {Number(tier.discountRate)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-xl shadow-amber-400/30">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
            <p className="text-sm font-semibold text-slate-500">
              Đang tải danh sách hạng thành viên…
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="flex items-start gap-3 rounded-2xl border-2 border-red-200 bg-red-50 px-6 py-5 w-full max-w-md">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-extrabold text-red-700">
                  Không tải được dữ liệu
                </p>
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {error}
                </p>
              </div>
            </div>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-red-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              Thử lại
            </button>
          </div>
        )}

        {/* Tier grid */}
        {!loading && !error && tiers.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {tiers.map((tier, index) => (
              <TierCard
                key={tier.id}
                tier={tier}
                index={index}
                onViewDetail={(id) => setViewingTierId(id)}
                onEdit={(t) => setEditingTier(t)}
              />
            ))}
          </div>
        )}

        {!loading && !error && tiers.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Trophy className="h-14 w-14 text-amber-300" />
            <p className="text-base font-extrabold text-slate-700">
              Chưa có hạng thành viên nào
            </p>
            <p className="text-sm text-slate-500">
              Dữ liệu sẽ hiển thị sau khi hệ thống được cấu hình.
            </p>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {viewingTierId && (
        <DetailDrawer
          tierId={viewingTierId}
          onClose={() => setViewingTierId(null)}
          onEdit={handleEditFromDrawer}
        />
      )}

      {/* Edit Modal */}
      {editingTier && (
        <EditModal
          tier={editingTier}
          onClose={() => setEditingTier(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Toast notification */}
      <div
        className={`fixed bottom-6 right-6 z-[60] transition-all duration-500 ${
          toast.visible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-4 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div
          className={`flex items-center gap-3 rounded-2xl border-2 shadow-2xl px-5 py-4 min-w-[280px] max-w-sm ${
            toast.tone === "success"
              ? "border-emerald-200 bg-white"
              : "border-red-200 bg-white"
          }`}
        >
          {toast.tone === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          )}
          <p
            className={`text-sm font-semibold ${
              toast.tone === "success" ? "text-emerald-800" : "text-red-700"
            }`}
          >
            {toast.message}
          </p>
        </div>
      </div>
    </>
  );
}
