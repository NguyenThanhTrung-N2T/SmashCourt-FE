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

import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Textarea } from "@/src/shared/components/ui/Textarea";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Flex } from "@/src/shared/components/layout/Flex";
import { Grid } from "@/src/shared/components/layout/Grid";
import { Badge } from "@/src/shared/components/ui/Badge";
import { CreateServiceModal } from "./modals/CreateServiceModal";

import { ServiceDetailPanel } from "./panels/ServiceDetailPanel";

// ─── Status config ────────────────────────────────────────────────────────────

type StatusCfg = {
  label: string;
  variant: "success" | "danger" | "neutral";
};

export function getStatusCfg(status: ServiceStatus): StatusCfg {
  switch (status) {
    case ServiceStatus.ACTIVE:
      return { label: "Đang kinh doanh", variant: "success" };
    case ServiceStatus.DELETED:
      return { label: "Đã ngưng", variant: "danger" };
    default:
      return { label: "Không xác định", variant: "neutral" };
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
              Quản lý các mặt hàng bán lẻ như nước và dịch vụ thuê dụng cụ như vợt, giày tại sân.
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

      <Flex justify="between" align="center" wrap="wrap" className="mb-6">
        <Flex align="center" spacing="sm">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            Danh sách dịch vụ
          </h2>
          <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            {services.length} mặt hàng
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
            onClick={onCreateNew}
            className="bg-gradient-to-r from-orange-600 to-amber-600 shadow-orange-500/20 hover:shadow-orange-500/30 text-white"
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Tạo mới
          </Button>
        </Flex>
      </Flex>

      <Grid cols={2} spacing="md" className="mb-8 max-w-2xl">
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
      </Grid>
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
        <p className="text-xs text-slate-500 mb-3">Chọn để xem và tuỳ chỉnh</p>
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên..."
          leftIcon={<Search className="h-4 w-4" />}
          className="py-2.5 px-3 text-sm"
        />
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
    <div className="space-y-6 animate-slide-up w-full">
      <ServiceStatsHeader
        services={services}
        loading={loading}
        onRefresh={load}
        onCreateNew={() => setShowCreateModal(true)}
      />

      {loading && (
        <Flex justify="center" align="center" spacing="md" className="my-20 flex-col">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="font-semibold text-slate-500">Đang đồng bộ dữ liệu dịch vụ...</p>
        </Flex>
      )}

      {!loading && loadError && (
        <div className="my-10 flex flex-col items-center rounded-[2rem] border-2 border-red-200 bg-red-50 p-12 text-center shadow-sm w-full">
          <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
          <h3 className="text-xl font-bold text-red-800">Lỗi đồng bộ dữ liệu</h3>
          <p className="mt-2 text-red-600">{loadError}</p>
          <Button variant="danger" onClick={load} className="mt-6" leftIcon={<RefreshCw className="h-5 w-5" />}>
            Thử lại
          </Button>
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
          <Button
            onClick={() => setShowCreateModal(true)}
            className="mt-6 bg-gradient-to-r from-orange-600 to-amber-600 shadow-md hover:-translate-y-0.5 text-white"
            leftIcon={<Plus className="h-5 w-5" />}
          >
            Tạo dịch vụ đầu tiên
          </Button>
        </div>
      )}

      {!loading && !loadError && services.length > 0 && (
        <div className="grid grid-cols-5 gap-6 w-full h-[600px] min-h-[600px]">
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
