"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Coffee,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Tag,
  Trash2,
  X,
  Zap,
} from "lucide-react";

import {
  createService,
  deleteService,
  fetchAllServices,
  updateService,
} from "@/src/api/service.api";
import { ServiceStatus } from "@/src/shared/types/service.types";
import type {
  Service,
  SaveServiceRequest,
} from "@/src/shared/types/service.types";
import { AuthApiError } from "@/src/api/auth.api";
import { useToast } from "@/src/shared/hooks/useToast";

// ─── Status config ────────────────────────────────────────────────────────────

type StatusCfg = {
  label: string;
  bg: string;
  text: string;
  dot: string;
};

function getStatusCfg(status: ServiceStatus): StatusCfg {
  switch (status) {
    case ServiceStatus.ACTIVE:
      return {
        label: "Đang kinh doanh",
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        dot: "bg-emerald-500",
      };
    case ServiceStatus.DELETED:
      return {
        label: "Đã ngưng",
        bg: "bg-red-100",
        text: "text-red-800",
        dot: "bg-red-500",
      };
    default:
      return {
        label: "Không xác định",
        bg: "bg-slate-100",
        text: "text-slate-800",
        dot: "bg-slate-500",
      };
  }
}

// ─── Top Stats Header ─────────────────────────────────────────────────────────

function ServiceStatsHeader({
  services,
  loading,
  onRefresh,
  onCreateNew,
}: {
  services: Service[];
  loading: boolean;
  onRefresh: () => void;
  onCreateNew: () => void;
}) {
  const activeCount = services.filter((p) => p.status === ServiceStatus.ACTIVE).length;

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-8 text-white shadow-xl shadow-slate-900/10 mb-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-500/20 blur-[60px]" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-amber-500/10 blur-[50px]" />

        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center w-full">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-300">
              <Coffee className="h-3.5 w-3.5" /> Dịch vụ
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-white">
              Cửa hàng{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                & Tiện ích
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-md">
              Quản lý các mặt hàng bán lẻ như nước suối, bò húc và dịch vụ thuê dụng cụ như vợt, giày tại sân.
            </p>
          </div>

          <div className="hidden shrink-0 sm:flex items-center justify-center pr-4">
            <div
              className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-500/10 border border-white/10 shadow-[0_0_30px_rgba(249,115,22,0.15)] animate-pulse"
              style={{ animationDuration: "3s" }}
            >
              <div
                className="absolute inset-2 rounded-3xl border border-orange-500/20 border-dashed animate-spin"
                style={{ animationDuration: "15s" }}
              />
              <Coffee className="relative h-10 w-10 text-orange-400" />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            Danh sách dịch vụ
          </h2>
          <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            {services.length} mặt hàng
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
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Tạo mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 max-w-2xl">
        {[
          {
            icon: Tag,
            color: "text-orange-500",
            bg: "bg-orange-100",
            val: loading ? "–" : services.length,
            label: "Tổng mặt hàng",
          },
          {
            icon: Zap,
            color: "text-emerald-500",
            bg: "bg-emerald-100",
            val: loading ? "–" : activeCount,
            label: "Đang kinh doanh",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors"
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
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Service List Card (Left Sidebar) ───────────────────────────────────────

function ServiceListCard({
  services,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
}: {
  services: Service[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const q = searchQuery.toLowerCase();
    return services.filter((p) => p.name.toLowerCase().includes(q));
  }, [services, searchQuery]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/40">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
        <h2 className="text-base font-bold text-slate-800">Dịch vụ</h2>
        <p className="text-xs text-slate-500">Chọn để xem và tuỳ chỉnh</p>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 && (
          <div className="py-8 text-center">
            <Coffee className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-400">
              {searchQuery ? "Không tìm thấy" : "Chưa có dịch vụ nào"}
            </p>
          </div>
        )}
        {filtered.map((service) => {
          const statusCfg = getStatusCfg(service.status);
          const isSelected = selectedId === service.id;

          return (
            <button
              key={service.id}
              onClick={() => onSelect(service.id)}
              className={`group flex w-full items-center gap-4 rounded-2xl border-2 p-3 text-left transition-all duration-200 hover:shadow-md ${isSelected
                  ? "border-orange-400 bg-orange-50/40 shadow-sm"
                  : "border-transparent hover:border-slate-200 bg-transparent hover:bg-white"
                }`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-inner ${isSelected
                    ? "bg-gradient-to-br from-orange-500 to-amber-600"
                    : "bg-gradient-to-br from-slate-300 to-slate-400 group-hover:from-orange-400 group-hover:to-amber-500"
                  }`}
              >
                <Settings2 className="h-6 w-6 text-white drop-shadow-sm" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-sm font-extrabold truncate ${isSelected ? "text-slate-900" : "text-slate-700"
                      }`}
                  >
                    {service.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100/80 border border-zinc-200 px-2 py-0.5 text-[11px] font-bold text-zinc-800">
                    <Banknote className="h-2.5 w-2.5 text-zinc-500" />
                    {service.defaultPrice.toLocaleString()} đ / {service.unit}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${statusCfg.bg} ${statusCfg.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dot}`} />
                    {statusCfg.label}
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

// ─── Detail / Edit Panel (Right) ──────────────────────────────────────────────

function ServiceDetailPanel({
  service,
  onSaved,
  onDeleted,
  showToast,
}: {
  service: Service;
  onSaved: (p: Service) => void;
  onDeleted: (id: string) => void;
  showToast: (tone: "success" | "error", msg: string) => void;
}) {
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description || "");
  const [unit, setUnit] = useState(service.unit);
  const [defaultPrice, setDefaultPrice] = useState(String(service.defaultPrice));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    unit?: string;
    defaultPrice?: string;
    general?: string;
  }>({});

  useEffect(() => {
    setName(service.name);
    setDescription(service.description || "");
    setUnit(service.unit);
    setDefaultPrice(String(service.defaultPrice));
    setErrors({});
    setShowDeleteConfirm(false);
  }, [service.id, service.name, service.description, service.unit, service.defaultPrice]);

  const isDirty =
    name !== service.name ||
    description !== (service.description || "") ||
    unit !== service.unit ||
    Number(defaultPrice) !== Number(service.defaultPrice);

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Tên không được để trống";
    else if (name.trim().length > 255) e.name = "Tên tối đa 255 ký tự";

    if (!unit.trim()) e.unit = "Đơn vị tính không được rỗng";
    else if (unit.trim().length > 50) e.unit = "Đơn vị tính tối đa 50 ký tự";

    const d = Number(defaultPrice);
    if (!defaultPrice.trim() || isNaN(d) || d < 1)
      e.defaultPrice = "Giá mặc định phải lớn hơn 0";

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
      const dto: SaveServiceRequest = {
        name: name.trim(),
        description: description.trim() || null,
        unit: unit.trim(),
        defaultPrice: Number(defaultPrice),
      };
      const updated = await updateService(service.id, dto);
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
      await deleteService(service.id);
      onDeleted(service.id);
      showToast("success", `Đã ngưng kinh doanh "${service.name}"`);
    } catch (err) {
      const msg = err instanceof AuthApiError ? err.message : "Không thể xóa dịch vụ này.";
      showToast("error", msg);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  const statusCfg = getStatusCfg(service.status);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <div className="relative h-28 w-full bg-gradient-to-r from-orange-500 to-amber-600">
        <div className="absolute -bottom-10 left-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600">
              <Coffee className="h-8 w-8 text-white drop-shadow-md" />
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-6">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold shadow-md ${statusCfg.bg} ${statusCfg.text}`}
          >
            <span className={`h-2 w-2 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-6 pt-14">
        <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent">
          {service.name}
        </h2>
        {service.description && (
          <p className="mt-2 text-sm text-slate-500 max-w-lg">{service.description}</p>
        )}

        <div className="mt-8 rounded-3xl border border-slate-100 bg-orange-50/20 p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-slate-600" />
              <h3 className="text-base font-bold text-slate-800">Thông tin sản phẩm/dịch vụ</h3>
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
            <div className="col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">Tên dịch vụ</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: undefined }));
                }}
                className={`w-full rounded-xl border-2 px-4 py-3 text-base font-bold text-slate-800 shadow-sm outline-none transition-all ${errors.name
                    ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 bg-white focus:border-orange-500 focus:ring-orange-100"
                  }`}
              />
              {errors.name && <p className="mt-2 text-xs font-bold text-red-500">{errors.name}</p>}
            </div>

            <div className="col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">Mô tả thêm (Không bắt buộc)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Nước suối đóng chai 500ml ướp lạnh..."
                rows={2}
                className="w-full resize-none rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all focus:border-orange-500 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Giá mặc định (VNĐ)</label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  step={1000}
                  value={defaultPrice}
                  onChange={(e) => {
                    setDefaultPrice(e.target.value);
                    setErrors((p) => ({ ...p, defaultPrice: undefined }));
                  }}
                  className={`w-full rounded-xl border-2 px-4 py-3 pr-12 text-base font-bold text-slate-800 shadow-sm outline-none transition-all ${errors.defaultPrice
                      ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 bg-white focus:border-orange-500 focus:ring-orange-100"
                    }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  đ
                </span>
              </div>
              {errors.defaultPrice && <p className="mt-2 text-xs font-bold text-red-500">{errors.defaultPrice}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Đơn vị tính</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value);
                  setErrors((p) => ({ ...p, unit: undefined }));
                }}
                placeholder="VD: Chai, Lon, Lượt..."
                className={`w-full rounded-xl border-2 px-4 py-3 text-base font-bold text-slate-800 shadow-sm outline-none transition-all ${errors.unit
                    ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 bg-white focus:border-orange-500 focus:ring-orange-100"
                  }`}
              />
              {errors.unit && <p className="mt-2 text-xs font-bold text-red-500">{errors.unit}</p>}
            </div>

          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setName(service.name);
              setDescription(service.description || "");
              setUnit(service.unit);
              setDefaultPrice(String(service.defaultPrice));
              setErrors({});
            }}
            disabled={!isDirty || saving}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <RefreshCw className="h-4 w-4" /> Reset
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting || saving || service.status === ServiceStatus.DELETED}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-red-500 transition-all hover:bg-red-50 hover:text-red-700 disabled:opacity-30"
          >
            <Trash2 className="h-4 w-4" /> Ngưng kinh doanh
          </button>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-black text-white shadow-lg transition-all bg-orange-600 hover:bg-orange-700 active:bg-orange-800 disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
          Lưu thay đổi
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-[2rem]">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Xác nhận ngưng kinh doanh</h3>
                <p className="text-sm text-slate-500">Người mua sẽ không còn thấy dịch vụ này nữa.</p>
              </div>
            </div>
            <p className="mb-6 text-sm text-slate-600">
              Bạn có chắc muốn xóa/ngưng <strong>&quot;{service.name}&quot;</strong>? Nó sẽ bị ẩn trên hệ thống. Dữ liệu lịch sử sẽ không bị ảnh hưởng.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Xác nhận ngưng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Create Service Modal ───────────────────────────────────────────────────

function CreateServiceModal({
  onCreated,
  onClose,
  showToast,
}: {
  onCreated: (p: Service) => void;
  onClose: () => void;
  showToast: (tone: "success" | "error", msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    unit?: string;
    defaultPrice?: string;
    general?: string;
  }>({});

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Tên dịch vụ không được trống";
    else if (name.trim().length > 255) e.name = "Tối đa 255 ký tự";

    if (!unit.trim()) e.unit = "Đơn vị tính không được trống";
    else if (unit.trim().length > 50) e.unit = "Tối đa 50 ký tự";

    const d = Number(defaultPrice);
    if (!defaultPrice.trim() || isNaN(d) || d < 1)
      e.defaultPrice = "Giá mặc định phải > 0";

    return e;
  }

  async function handleCreate() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const dto: SaveServiceRequest = {
        name: name.trim(),
        description: description.trim() || null,
        unit: unit.trim(),
        defaultPrice: Number(defaultPrice),
      };
      const created = await createService(dto);
      onCreated(created);
      showToast("success", `Tạo dịch vụ "${created.name}" thành công`);
      onClose();
    } catch (err) {
      const msg = err instanceof AuthApiError ? err.message : "Đã có lỗi xảy ra.";
      setErrors({ general: msg });
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-xl animate-in fade-in zoom-in-95 duration-200 rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-md">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Tạo dịch vụ mới</h3>
              <p className="text-xs text-slate-500">Mở bán sản phẩm, thiết bị, dịch vụ.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-8 py-6">
          {errors.general && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <p className="text-sm font-semibold text-red-700">{errors.general}</p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Tên mặt hàng/dịch vụ <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="VD: Nước suối Aquafina"
                className={`w-full rounded-xl border-2 px-4 py-3 text-base font-bold text-slate-800 shadow-sm outline-none transition-all ${errors.name
                    ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 bg-white focus:border-orange-500 focus:ring-orange-100"
                  }`}
              />
              {errors.name && <p className="mt-2 text-xs font-bold text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Mô tả thêm</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Dành riêng cho miêu tả (không bắt buộc)..."
                className="w-full resize-none rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all focus:border-orange-500 focus:ring-orange-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Giá niêm yết <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    value={defaultPrice}
                    onChange={(e) => {
                      setDefaultPrice(e.target.value);
                      setErrors((p) => ({ ...p, defaultPrice: undefined }));
                    }}
                    placeholder="VD: 10000"
                    className={`w-full rounded-xl border-2 px-4 py-3 pr-10 text-base font-bold text-slate-800 shadow-sm outline-none transition-all ${errors.defaultPrice
                        ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-200 bg-white focus:border-orange-500 focus:ring-orange-100"
                      }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    đ
                  </span>
                </div>
                {errors.defaultPrice && (
                  <p className="mt-2 text-xs font-bold text-red-500">{errors.defaultPrice}</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Đơn vị tính <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => {
                    setUnit(e.target.value);
                    setErrors((p) => ({ ...p, unit: undefined }));
                  }}
                  placeholder="VD: Chai, Lượt..."
                  className={`w-full rounded-xl border-2 px-4 py-3 text-base font-bold text-slate-800 shadow-sm outline-none transition-all ${errors.unit
                      ? "border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 bg-white focus:border-orange-500 focus:ring-orange-100"
                    }`}
                />
                {errors.unit && (
                  <p className="mt-2 text-xs font-bold text-red-500">{errors.unit}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-8 py-5 bg-slate-50/50 rounded-b-3xl">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Lưu và Kinh doanh
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
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
      const data = await fetchAllServices(1, 50);
      const sorted = [...data.items].sort((a, b) => {
        if (a.status === ServiceStatus.ACTIVE && b.status !== ServiceStatus.ACTIVE) return -1;
        if (a.status !== ServiceStatus.ACTIVE && b.status === ServiceStatus.ACTIVE) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setServices(sorted);
      if (sorted.length > 0 && !selectedId) {
        setSelectedId(sorted[0].id);
      }
    } catch (err) {
      setLoadError(
        err instanceof AuthApiError ? err.message : "Không tải được dữ liệu dịch vụ/sản phẩm.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function handleSaved(updated: Service) {
    setServices((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      return next.sort((a, b) => {
        if (a.status === ServiceStatus.ACTIVE && b.status !== ServiceStatus.ACTIVE) return -1;
        if (a.status !== ServiceStatus.ACTIVE && b.status === ServiceStatus.ACTIVE) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    });
  }

  function handleDeleted(id: string) {
    // Unlike some systems that physically delete, the backend marks it as DELETED (status=1).
    // The requirement implies we should either remove it from list or keep it and update its status.
    // Let's rely on reload or map it if we know the status changes to DELETED.
    // Our UI fetches it but let's just mark it as DELETED in place so history users see it greyed out.
    setServices((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, status: ServiceStatus.DELETED } : p));
      return next.sort((a, b) => {
        if (a.status === ServiceStatus.ACTIVE && b.status !== ServiceStatus.ACTIVE) return -1;
        if (a.status !== ServiceStatus.ACTIVE && b.status === ServiceStatus.ACTIVE) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    });
  }

  function handleCreated(p: Service) {
    setServices((prev) => {
      const next = [p, ...prev].sort((a, b) => {
        if (a.status === ServiceStatus.ACTIVE && b.status !== ServiceStatus.ACTIVE) return -1;
        if (a.status !== ServiceStatus.ACTIVE && b.status === ServiceStatus.ACTIVE) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      return next;
    });
    setSelectedId(p.id);
  }

  const selectedService = services.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] p-8 overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full w-full">
      <ServiceStatsHeader
        services={services}
        loading={loading}
        onRefresh={load}
        onCreateNew={() => setShowCreateModal(true)}
      />

      {loading && (
        <div className="my-20 flex flex-col items-center gap-4 w-full">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="font-semibold text-slate-500">Đang đồng bộ dữ liệu dịch vụ...</p>
        </div>
      )}

      {!loading && loadError && (
        <div className="my-10 flex flex-col items-center rounded-[2rem] border-2 border-red-200 bg-red-50 p-12 text-center shadow-sm w-full">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
          <h3 className="text-xl font-bold text-red-800">Lỗi đồng bộ dữ liệu</h3>
          <p className="mt-2 text-red-600">{loadError}</p>
          <button
            onClick={load}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-bold text-white shadow-md hover:bg-red-700"
          >
            <RefreshCw className="h-5 w-5" /> Thử lại
          </button>
        </div>
      )}

      {!loading && !loadError && services.length === 0 && (
        <div className="my-10 flex flex-col items-center rounded-[2rem] border-2 border-dashed border-slate-300 bg-slate-50 p-16 text-center w-full">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-100 mb-4">
            <Coffee className="h-10 w-10 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">Chưa có dịch vụ nào</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
            Tạo mới các sản phẩm như nước giải khát, quần áo hoặc dịch vụ thuê vợt để cung cấp cho người chơi.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-3 font-bold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <Plus className="h-5 w-5" />
            Tạo dịch vụ đầu tiên
          </button>
        </div>
      )}

      {!loading && !loadError && services.length > 0 && (
        <div className="grid grid-cols-5 gap-6 w-full h-[600px] min-h-max">
          <div className="col-span-2 h-full">
            <ServiceListCard
              services={services}
              selectedId={selectedId}
              onSelect={(id) => {
                if (id !== selectedId) setSelectedId(id);
              }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          <div className="col-span-3 h-full relative">
            {selectedService ? (
              <ServiceDetailPanel
                key={selectedService.id}
                service={selectedService}
                onSaved={handleSaved}
                onDeleted={handleDeleted}
                showToast={showToast}
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                <div>
                  <Tag className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-3 font-semibold text-slate-400">
                    Chọn một dịch vụ để xem chi tiết
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateServiceModal
          onCreated={handleCreated}
          onClose={() => setShowCreateModal(false)}
          showToast={showToast}
        />
      )}

      <div
        className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${toast.visible
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
          }`}
      >
        <div
          className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-5 py-4 shadow-2xl ${toast.tone === "success" ? "border-emerald-300" : "border-red-300"
            }`}
        >
          {toast.tone === "success" ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-red-500" />
          )}
          <p className={`font-bold ${toast.tone === "success" ? "text-emerald-800" : "text-red-800"}`}>
            {toast.message}
          </p>
        </div>
      </div>
    </div>
  );
}
