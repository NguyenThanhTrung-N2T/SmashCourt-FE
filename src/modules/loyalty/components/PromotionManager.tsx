"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Warning,
  Calendar,
  CheckCircle,
  PencilSimpleLine,
  CircleNotch,
  Megaphone,
  Percent,
  Plus,
  ArrowClockwise,
  MagnifyingGlass,
  Sparkle,
  Tag,
  Trash,
  XCircle,
  Lightning,
} from "@phosphor-icons/react";

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
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
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
        variant: "error",
      };
  }
}

function formatDate(dateStr: string) {
  try {
    // Handle ISO datetime format (e.g., "2026-04-01T00:00:00")
    const dateOnly = dateStr.split("T")[0];
    const parts = dateOnly.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function toInputDate(dateStr: string) {
  // Handle ISO datetime format and extract date part
  try {
    const dateOnly = dateStr.split("T")[0];
    return dateOnly;
  } catch {
    return dateStr;
  }
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
      {/* Page Header — matches dashboard/service/loyalty style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight text-slate-900">
            Khuyến mãi
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Tạo & quản lý các chương trình khuyến mãi cho hệ thống đặt sân.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={onRefresh}
            disabled={loading}
            leftIcon={<ArrowClockwise className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            Làm mới
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onCreateNew}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Tạo khuyến mãi
          </Button>
        </div>
      </div>

      {/* KPI mini-cards — same visual as dashboard/service */}
      <div className="grid gap-4 grid-cols-3">
        {[
          { icon: Tag, val: loading ? "–" : promotions.length, label: "Tổng số chương trình" },
          { icon: Sparkle, val: loading ? "–" : activeCount, label: "Đang hoạt động" },
          { icon: Percent, val: loading ? "–" : `${maxDiscount}%`, label: "Giảm giá cao nhất" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B5E38]/10 text-[#1B5E38]">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 leading-none">{s.val}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* List section label + action row */}
      <Flex justify="between" align="center" wrap="wrap">
        <Flex align="center" spacing="sm">
          <h2 className="text-lg font-bold tracking-tight text-slate-800">Danh sách khuyến mãi</h2>
          <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            {promotions.length} chương trình
          </span>
        </Flex>
      </Flex>
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
            leftIcon={<MagnifyingGlass className="h-3.5 w-3.5" />}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm khuyến mãi..."
            className="py-2 text-xs focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
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
              className={`group relative flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-all duration-200 ${
                isSelected
                  ? "border-[#1B5E38]/25 bg-[#1B5E38]/5 shadow-sm ring-1 ring-[#1B5E38]/15"
                  : "border-transparent hover:border-slate-200 bg-transparent hover:bg-white hover:shadow-sm"
              }`}
            >
              {isSelected && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-[#1B5E38]" />
              )}
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all ${
                  isSelected
                    ? "bg-[#1B5E38] shadow-lg shadow-[#1B5E38]/30"
                    : "bg-slate-100 group-hover:bg-[#1B5E38]/80"
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
                  <Badge variant="neutral" size="sm" icon={<Percent className="h-2.5 w-2.5" />}>
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

// ─── Detail / PencilSimple Panel (Right) ──────────────────────────────────────────────

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
      <div
        className="relative h-28 w-full"
        style={{ background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)" }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="absolute -bottom-10 left-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg shadow-[#1B5E38]/20">
            <div
              className="flex h-full w-full items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(145deg, #2D7A50 0%, #1B5E38 100%)" }}
            >
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
        <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#2A9D5C] to-[#1B5E38] bg-clip-text text-transparent">
          {promotion.name}
        </h2>

        {/* Info Highlights */}
        <Grid cols={3} className="mt-6" spacing="md">
          <Flex align="center" spacing="md" className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-200 text-indigo-700">
              <Percent className="h-6 w-6" />
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

        {/* PencilSimple Form */}
        <div className="mt-8 rounded-3xl border border-[#1B5E38]/10 bg-[#1B5E38]/5 p-6">
          <Flex justify="between" align="center" className="mb-6">
            <Flex align="center" spacing="sm">
              <PencilSimpleLine className="h-5 w-5 text-[#1B5E38]" />
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
                className="text-base focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
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
                className="text-base focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
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
                className="text-base focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
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
                className="text-base focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
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
            variant="secondary"
            onClick={() => {
              setName(promotion.name);
              setDiscountRate(String(promotion.discountRate));
              setStartDate(toInputDate(promotion.startDate));
              setEndDate(toInputDate(promotion.endDate));
              setErrors({});
            }}
            disabled={!isDirty || saving}
            leftIcon={<ArrowClockwise className="h-4 w-4" />}
          >
            Reset
          </Button>
          {/* Delete Button */}
          <Button
            variant="dangerSoft"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting || saving}
            leftIcon={<Trash className="h-4 w-4" />}
          >
            Xóa
          </Button>
        </Flex>

        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving || !isDirty}
          isLoading={saving}
          leftIcon={<CheckCircle className="h-5 w-5" />}
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
          icon={<Warning className="h-6 w-6" />}
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
                leftIcon={<Trash className="h-4 w-4" />}
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
    <div className="space-y-6 w-full animate-slide-up">
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
          <CircleNotch className="h-8 w-8 animate-spin text-[#1B5E38]" />
          <p className="font-semibold text-slate-500">Đang đồng bộ dữ liệu khuyến mãi...</p>
        </Stack>
      )}

      {!loading && loadError && (
        <Alert variant="error" className="my-10 py-12 flex flex-col items-center text-center">
          <Warning className="mb-4 h-12 w-12 text-red-400" />
          <h3 className="text-xl font-bold text-red-800">Lỗi đồng bộ dữ liệu</h3>
          <p className="mt-2 text-red-600">{loadError}</p>
          <Button
            onClick={load}
            variant="danger"
            className="mt-6"
            leftIcon={<ArrowClockwise className="h-5 w-5" />}
          >
            Thử lại
          </Button>
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !loadError && promotions.length === 0 && (
        <Stack align="center" className="my-10 rounded-[2rem] border-2 border-dashed border-[#1B5E38]/25 bg-[#1B5E38]/5 p-16 text-center w-full">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl mb-4 shadow-inner"
            style={{ background: "linear-gradient(145deg, #2D7A50 0%, #1B5E38 100%)" }}
          >
            <Megaphone className="h-10 w-10 text-white drop-shadow" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">Chưa có chương trình khuyến mãi</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
            Tạo chương trình khuyến mãi đầu tiên để khách hàng có thể tận hưởng ưu đãi khi đặt sân.
          </p>
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            className="mt-6 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            leftIcon={<Plus className="h-5 w-5" />}
          >
            Tạo khuyến mãi đầu tiên
          </Button>
        </Stack>
      )}

      {/* Content Layout */}
      {!loading && !loadError && promotions.length > 0 && (
        <div className="grid grid-cols-5 gap-6 w-full h-[600px] min-h-[600px]">
          {/* Left: List */}
          <div className="col-span-2 h-full">
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
          <div className="col-span-3 h-full relative">
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
        </div>
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
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            ) : (
              <Warning className="h-5 w-5 text-red-500" />
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
