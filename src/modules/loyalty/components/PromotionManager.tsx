"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Edit3,
  Loader2,
  Megaphone,
  PercentIcon,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react";

import {
  createPromotion,
  deletePromotion,
  fetchAllPromotions,
  updatePromotion,
} from "@/src/api/promotion.api";
import {
  PromotionStatus,
} from "@/src/shared/types/promotion.types";
import type {
  Promotion,
  SavePromotionRequest,
} from "@/src/shared/types/promotion.types";
import { AuthApiError } from "@/src/api/auth.api";
import { useToast } from "@/src/shared/hooks/useToast";

import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Flex } from "@/src/shared/components/layout/Flex";
import { Stack } from "@/src/shared/components/layout/Stack";
import { Grid } from "@/src/shared/components/layout/Grid";
import { Badge } from "@/src/shared/components/ui/Badge";
import { CreatePromotionModal } from "./modals/CreatePromotionModal";

// ─── Status config ────────────────────────────────────────────────────────────

type StatusCfg = {
  label: string;
  bg: string;
  text: string;
  dot: string;
  variant: "success" | "warning" | "danger" | "neutral" | "primary";
};

function getStatusCfg(status: PromotionStatus): StatusCfg {
  switch (status) {
    case PromotionStatus.ACTIVE:
      return {
        label: "Đang hoạt động",
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        dot: "bg-emerald-500",
        variant: "success",
      };
    case PromotionStatus.INACTIVE:
      return {
        label: "Chưa hiệu lực",
        bg: "bg-amber-100",
        text: "text-amber-800",
        dot: "bg-amber-500",
        variant: "warning",
      };
    case PromotionStatus.DELETED:
      return {
        label: "Đã xóa",
        bg: "bg-red-100",
        text: "text-red-800",
        dot: "bg-red-500",
        variant: "danger",
      };
  }
}

function formatDate(dateStr: string) {
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function toInputDate(dateStr: string) {
  // Already YYYY-MM-DD format from API
  return dateStr;
}

function getTodayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Top Stats Header ─────────────────────────────────────────────────────────

function PromotionStatsHeader({
  promotions,
  loading,
  onRefresh,
  onCreateNew,
}: {
  promotions: Promotion[];
  loading: boolean;
  onRefresh: () => void;
  onCreateNew: () => void;
}) {
  const activeCount = promotions.filter((p) => p.status === PromotionStatus.ACTIVE).length;
  const maxDiscount = promotions.length
    ? Math.max(...promotions.map((p) => Number(p.discountRate)))
    : 0;

  return (
    <>
      {/* Dark Header */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-8 text-white shadow-xl shadow-slate-900/10 mb-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-[60px]" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-violet-500/10 blur-[50px]" />

        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center w-full">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-fuchsia-300">
              <Megaphone className="h-3.5 w-3.5" /> Quản trị
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-white">
              Quản lý{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400">
                Khuyến mãi
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-md">
              Tạo & quản lý các chương trình khuyến mãi. Khách hàng có tài khoản sẽ được chọn chương trình khi đặt sân.
            </p>
          </div>

          <div className="hidden shrink-0 sm:flex items-center justify-center pr-4">
            <div
              className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-fuchsia-500/10 border border-white/10 shadow-[0_0_30px_rgba(217,70,239,0.15)] animate-pulse"
              style={{ animationDuration: "3s" }}
            >
              <div
                className="absolute inset-2 rounded-3xl border border-fuchsia-500/20 border-dashed animate-spin"
                style={{ animationDuration: "15s" }}
              />
              <Megaphone className="relative h-10 w-10 text-fuchsia-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Action Bar */}
      <Flex justify="between" align="center" wrap="wrap" className="mb-6">
        <Flex align="center" spacing="sm">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            Danh sách khuyến mãi
          </h2>
          <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            {promotions.length} chương trình
          </span>
        </Flex>

        <Flex align="center" spacing="sm">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            Làm mới
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md shadow-fuchsia-500/20 hover:shadow-lg hover:shadow-fuchsia-500/30 hover:-translate-y-0.5 transition-all outline-none border-none"
            onClick={onCreateNew}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Tạo khuyến mãi
          </Button>
        </Flex>
      </Flex>

      {/* Stats Cards */}
      <Grid cols={3} spacing="md" className="mb-8">
        {[
          {
            icon: Tag,
            color: "text-fuchsia-500",
            bg: "bg-fuchsia-100",
            val: loading ? "–" : promotions.length,
            label: "Tổng số chương trình",
          },
          {
            icon: Sparkles,
            color: "text-emerald-500",
            bg: "bg-emerald-100",
            val: loading ? "–" : activeCount,
            label: "Đang hoạt động",
          },
          {
            icon: PercentIcon,
            color: "text-indigo-500",
            bg: "bg-indigo-100",
            val: loading ? "–" : `${maxDiscount}%`,
            label: "Giảm giá cao nhất",
          },
        ].map((s, i) => (
          <Stack
            spacing="md"
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.val}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {s.label}
              </p>
            </div>
          </Stack>
        ))}
      </Grid>
    </>
  );
}

// ─── Promotion List Card (Left Sidebar) ───────────────────────────────────────

function PromotionListCard({
  promotions,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
}: {
  promotions: Promotion[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return promotions;
    const q = searchQuery.toLowerCase();
    return promotions.filter((p) => p.name.toLowerCase().includes(q));
  }, [promotions, searchQuery]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
        <h2 className="text-base font-bold text-slate-800">Chương trình</h2>
        <p className="text-xs text-slate-500">Chọn để xem chi tiết & chỉnh sửa</p>
        <div className="mt-3">
          <Input
            leftIcon={<Search className="h-3.5 w-3.5" />}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm khuyến mãi..."
            className="py-2 text-xs focus:border-fuchsia-400 focus:ring-fuchsia-100"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 && (
          <div className="py-8 text-center">
            <Tag className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-400">
              {searchQuery ? "Không tìm thấy" : "Chưa có khuyến mãi"}
            </p>
          </div>
        )}
        {filtered.map((promo) => {
          const statusCfg = getStatusCfg(promo.status);
          const isSelected = selectedId === promo.id;

          return (
            <button
              key={promo.id}
              onClick={() => onSelect(promo.id)}
              className={`group flex w-full items-center gap-4 rounded-2xl border-2 p-3 text-left transition-all duration-200 hover:shadow-md ${isSelected
                ? "border-fuchsia-400 bg-fuchsia-50/40 shadow-sm"
                : "border-transparent hover:border-slate-200 bg-transparent hover:bg-white"
                }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-inner ${isSelected
                  ? "bg-gradient-to-br from-fuchsia-500 to-violet-600"
                  : "bg-gradient-to-br from-slate-300 to-slate-400 group-hover:from-fuchsia-400 group-hover:to-violet-500"
                  }`}
              >
                <Megaphone className="h-6 w-6 text-white drop-shadow-sm" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-sm font-extrabold truncate ${isSelected ? "text-slate-900" : "text-slate-700"
                      }`}
                  >
                    {promo.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="primary" size="sm" icon={<PercentIcon className="h-2.5 w-2.5" />}>
                    {Number(promo.discountRate)}%
                  </Badge>
                  <Badge variant={statusCfg.variant} size="sm" dot>
                    {statusCfg.label}
                  </Badge>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Detail / Edit Panel (Right) ──────────────────────────────────────────────

function PromotionDetailPanel({
  promotion,
  onSaved,
  onDeleted,
  showToast,
}: {
  promotion: Promotion;
  onSaved: (p: Promotion) => void;
  onDeleted: (id: string) => void;
  showToast: (tone: "success" | "error", msg: string) => void;
}) {
  const [name, setName] = useState(promotion.name);
  const [discountRate, setDiscountRate] = useState(String(promotion.discountRate));
  const [startDate, setStartDate] = useState(toInputDate(promotion.startDate));
  const [endDate, setEndDate] = useState(toInputDate(promotion.endDate));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    discountRate?: string;
    startDate?: string;
    endDate?: string;
    general?: string;
  }>({});

  useEffect(() => {
    setName(promotion.name);
    setDiscountRate(String(promotion.discountRate));
    setStartDate(toInputDate(promotion.startDate));
    setEndDate(toInputDate(promotion.endDate));
    setErrors({});
    setShowDeleteConfirm(false);
  }, [promotion.id, promotion.name, promotion.discountRate, promotion.startDate, promotion.endDate]);

  const isDirty =
    name !== promotion.name ||
    Number(discountRate) !== Number(promotion.discountRate) ||
    startDate !== toInputDate(promotion.startDate) ||
    endDate !== toInputDate(promotion.endDate);

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Tên khuyến mãi không được để trống";
    else if (name.trim().length > 255) e.name = "Tên khuyến mãi tối đa 255 ký tự";

    const d = Number(discountRate);
    if (!discountRate.trim() || isNaN(d) || d < 0.01 || d > 100)
      e.discountRate = "Tỷ lệ giảm giá phải từ 0.01 đến 100";

    if (!startDate) e.startDate = "Ngày bắt đầu không được để trống";
    if (!endDate) e.endDate = "Ngày kết thúc không được để trống";
    if (startDate && endDate && startDate > endDate)
      e.endDate = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu";

    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const dto: SavePromotionRequest = {
        name: name.trim(),
        discountRate: Number(discountRate),
        startDate,
        endDate,
      };
      const updated = await updatePromotion(promotion.id, dto);
      onSaved(updated);
      showToast("success", `Cập nhật "${updated.name}" thành công`);
    } catch (err) {
      const msg = err instanceof AuthApiError ? err.message : "Đã có lỗi xảy ra, không thể lưu.";
      setErrors({ general: msg });
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deletePromotion(promotion.id);
      onDeleted(promotion.id);
      showToast("success", `Đã xóa "${promotion.name}"`);
    } catch (err) {
      const msg = err instanceof AuthApiError ? err.message : "Không thể xóa khuyến mãi.";
      showToast("error", msg);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  const statusCfg = getStatusCfg(promotion.status);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      {/* Visual Banner */}
      <div className="relative h-28 w-full bg-gradient-to-r from-fuchsia-500 to-violet-600">
        <div className="absolute -bottom-10 left-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600">
              <Megaphone className="h-8 w-8 text-white drop-shadow-md" />
            </div>
          </div>
        </div>
        {/* Status Badge */}
        <div className="absolute top-4 right-6">
          <Badge variant={statusCfg.variant} dot>
            {statusCfg.label}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-6 pt-14">
        <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-fuchsia-600 to-violet-700 bg-clip-text text-transparent">
          {promotion.name}
        </h2>

        {/* Info Highlights */}
        <Grid cols={3} className="mt-6" spacing="md">
          <Flex align="center" spacing="md" className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-200 text-indigo-700">
              <PercentIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">Tỷ lệ giảm</p>
              <p className="text-xl font-black text-indigo-800">{Number(promotion.discountRate)}%</p>
            </div>
          </Flex>
          <Flex align="center" spacing="md" className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bắt đầu</p>
              <p className="text-lg font-black text-slate-800">{formatDate(promotion.startDate)}</p>
            </div>
          </Flex>
          <Flex align="center" spacing="md" className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Kết thúc</p>
              <p className="text-lg font-black text-slate-800">{formatDate(promotion.endDate)}</p>
            </div>
          </Flex>
        </Grid>

        {/* Edit Form */}
        <div className="mt-8 rounded-3xl border border-slate-100 bg-fuchsia-50/30 p-6">
          <Flex justify="between" align="center" className="mb-6">
            <Flex align="center" spacing="sm">
              <Edit3 className="h-5 w-5 text-slate-600" />
              <h3 className="text-base font-bold text-slate-800">Chỉnh sửa khuyến mãi</h3>
            </Flex>
            {isDirty && (
              <Badge variant="warning" className="animate-pulse">
                CHƯA LƯU
              </Badge>
            )}
          </Flex>

          {errors.general && (
            <Alert variant="error" className="mb-6 py-2">
              {errors.general}
            </Alert>
          )}

          <Grid cols={2} spacing="lg">
            {/* Name */}
            <div className="col-span-2">
              <Input
                label="Tên chương trình *"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="VD: Khuyến mãi hè 2026"
                error={errors.name}
                className="text-base focus:border-fuchsia-500 focus:ring-fuchsia-100"
              />
              {!errors.name && (
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Tên hiển thị cho khách hàng khi chọn khuyến mãi lúc đặt sân.
                </p>
              )}
            </div>

            {/* Discount Rate */}
            <div>
              <Input
                label="Tỷ lệ giảm giá (%) *"
                type="number"
                min={0.01}
                max={100}
                step={0.01}
                value={discountRate}
                onChange={(e) => {
                  setDiscountRate(e.target.value);
                  setErrors((p) => ({ ...p, discountRate: undefined }));
                }}
                error={errors.discountRate}
                rightIcon={<span className="text-sm font-bold text-slate-400">%</span>}
                className="text-base focus:border-fuchsia-500 focus:ring-fuchsia-100"
              />
              {!errors.discountRate && (
                <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
                  Từ 0.01% đến 100%.
                </p>
              )}
            </div>

            {/* Empty cell for alignment */}
            <div />

            {/* Start Date */}
            <div>
              <Input
                label="Ngày bắt đầu *"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setErrors((p) => ({ ...p, startDate: undefined, endDate: undefined }));
                }}
                error={errors.startDate}
                className="text-base focus:border-fuchsia-500 focus:ring-fuchsia-100"
              />
            </div>

            {/* End Date */}
            <div>
              <Input
                label="Ngày kết thúc *"
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setErrors((p) => ({ ...p, endDate: undefined }));
                }}
                error={errors.endDate}
                className="text-base focus:border-fuchsia-500 focus:ring-fuchsia-100"
              />
              {!errors.endDate && (
                <p className="mt-2 text-xs font-medium text-slate-500">
                  Phải bằng hoặc sau ngày bắt đầu.
                </p>
              )}
            </div>
          </Grid>
        </div>
      </div>

      {/* Floating Action Footer */}
      <Flex className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-8 py-5" justify="between" align="center">
        <Flex align="center" spacing="sm">
          <Button
            variant="ghost"
            onClick={() => {
              setName(promotion.name);
              setDiscountRate(String(promotion.discountRate));
              setStartDate(toInputDate(promotion.startDate));
              setEndDate(toInputDate(promotion.endDate));
              setErrors({});
            }}
            disabled={!isDirty || saving}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Reset
          </Button>
          {/* Delete Button */}
          <Button
            variant="dangerSoft"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting || saving}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Xóa
          </Button>
        </Flex>

        <Button
          variant="primary"
          className="bg-fuchsia-600 hover:bg-fuchsia-700 active:bg-fuchsia-800 outline-none border-none shadow-lg text-white font-black"
          onClick={handleSave}
          disabled={saving || !isDirty}
          isLoading={saving}
          leftIcon={<CheckCircle2 className="h-5 w-5" />}
        >
          Lưu thay đổi
        </Button>
      </Flex>

      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Xác nhận xóa"
          subtitle="THAO TÁC NÀY KHÔNG THỂ HOÀN TÁC"
          icon={<AlertTriangle className="h-6 w-6" />}
          maxWidth="md"
        >
          <div className="p-6">
            <Alert variant="warning" className="mb-6">
              Bạn có chắc muốn xóa chương trình <strong>&quot;{promotion.name}&quot;</strong>? Khuyến mãi sẽ bị ẩn khỏi hệ thống. Booking cũ vẫn giữ nguyên.
            </Alert>
            <Flex justify="end" align="center" spacing="md">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={deleting}
                isLoading={deleting}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Xóa khuyến mãi
              </Button>
            </Flex>
          </div>
        </Modal>
      )}
    </div>
  );
}



// ─── Main Component ───────────────────────────────────────────────────────────

export default function PromotionManager() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast, show: showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAllPromotions(1, 50);
      // Sort: ACTIVE first, then by createdAt desc
      const sorted = [...data.items].sort((a, b) => {
        if (a.status === PromotionStatus.ACTIVE && b.status !== PromotionStatus.ACTIVE) return -1;
        if (a.status !== PromotionStatus.ACTIVE && b.status === PromotionStatus.ACTIVE) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setPromotions(sorted);
      if (sorted.length > 0 && !selectedId) {
        setSelectedId(sorted[0].id);
      }
    } catch (err) {
      setLoadError(
        err instanceof AuthApiError ? err.message : "Không tải được dữ liệu khuyến mãi.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function handleSaved(updated: Promotion) {
    setPromotions((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      return next.sort((a, b) => {
        if (a.status === PromotionStatus.ACTIVE && b.status !== PromotionStatus.ACTIVE) return -1;
        if (a.status !== PromotionStatus.ACTIVE && b.status === PromotionStatus.ACTIVE) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    });
  }

  function handleDeleted(id: string) {
    setPromotions((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (selectedId === id) {
        setSelectedId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  }

  function handleCreated(p: Promotion) {
    setPromotions((prev) => {
      const next = [p, ...prev].sort((a, b) => {
        if (a.status === PromotionStatus.ACTIVE && b.status !== PromotionStatus.ACTIVE) return -1;
        if (a.status !== PromotionStatus.ACTIVE && b.status === PromotionStatus.ACTIVE) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      return next;
    });
    setSelectedId(p.id);
  }

  const selectedPromotion = promotions.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="w-full">
      {/* Header */}
      <PromotionStatsHeader
        promotions={promotions}
        loading={loading}
        onRefresh={load}
        onCreateNew={() => setShowCreateModal(true)}
      />

      {/* States */}
      {loading && (
        <Stack align="center" justify="center" spacing="md" className="my-20 w-full">
          <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
          <p className="font-semibold text-slate-500">Đang đồng bộ dữ liệu khuyến mãi...</p>
        </Stack>
      )}

      {!loading && loadError && (
        <Alert variant="error" className="my-10 py-12 flex flex-col items-center text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
          <h3 className="text-xl font-bold text-red-800">Lỗi đồng bộ dữ liệu</h3>
          <p className="mt-2 text-red-600">{loadError}</p>
          <Button
            onClick={load}
            variant="danger"
            className="mt-6"
            leftIcon={<RefreshCw className="h-5 w-5" />}
          >
            Thử lại
          </Button>
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !loadError && promotions.length === 0 && (
        <Stack align="center" className="my-10 rounded-[2rem] border-2 border-dashed border-slate-300 bg-slate-50 p-16 text-center w-full">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-fuchsia-100 mb-4">
            <Megaphone className="h-10 w-10 text-fuchsia-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">Chưa có chương trình khuyến mãi</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
            Tạo chương trình khuyến mãi đầu tiên để khách hàng có thể tận hưởng ưu đãi khi đặt sân.
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            className="mt-6 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 outline-none border-none"
            leftIcon={<Plus className="h-5 w-5" />}
          >
            Tạo khuyến mãi đầu tiên
          </Button>
        </Stack>
      )}

      {/* Content Layout */}
      {!loading && !loadError && promotions.length > 0 && (
        <Grid cols={5} spacing="lg" className="w-full">
          {/* Left: List */}
          <div className="col-span-2">
            <PromotionListCard
              promotions={promotions}
              selectedId={selectedId}
              onSelect={(id) => {
                if (id !== selectedId) setSelectedId(id);
              }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Right: Detail */}
          <div className="col-span-3 relative">
            {selectedPromotion ? (
              <PromotionDetailPanel
                key={selectedPromotion.id}
                promotion={selectedPromotion}
                onSaved={handleSaved}
                onDeleted={handleDeleted}
                showToast={showToast}
              />
            ) : (
              <Stack align="center" justify="center" className="h-full rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                <Tag className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-3 font-semibold text-slate-400">
                  Chọn một khuyến mãi để xem chi tiết
                </p>
              </Stack>
            )}
          </div>
        </Grid>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreatePromotionModal
          onCreated={handleCreated}
          onClose={() => setShowCreateModal(false)}
          showToast={showToast}
        />
      )}

      {/* Global Toast */}
      {toast.visible && (
        <div className="fixed bottom-8 right-8 z-[100] transition-all duration-300 animate-slide-up">
          <div
            className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-5 py-3.5 shadow-xl ${
              toast.tone === "success" ? "border-emerald-200" : "border-red-200"
            }`}
          >
            {toast.tone === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
            <p
              className={`text-sm font-bold ${
                toast.tone === "success" ? "text-emerald-800" : "text-red-800"
              }`}
            >
              {toast.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
