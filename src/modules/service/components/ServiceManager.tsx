"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Warning,
  Money,
  CheckCircle,
  Coffee,
  CircleNotch,
  Plus,
  ArrowClockwise,
  MagnifyingGlass,
  SlidersHorizontal,
  Tag,
  Lightning,
} from "@phosphor-icons/react";

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
import { Flex } from "@/src/shared/components/layout/Flex";
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
      {/* Page Header — matches dashboard style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight text-slate-900">
            Dịch vụ
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Quản lý mặt hàng bán lẻ và dịch vụ thuê dụng cụ tại sân.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            leftIcon={<ArrowClockwise className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            Làm mới
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateNew}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Tạo mới
          </Button>
        </div>
      </div>

      {/* KPI mini-cards — same visual as dashboard */}
      <div className="grid gap-4 grid-cols-2 max-w-md">
        {[
          {
            icon: Tag,
            val: loading ? "–" : services.length,
            label: "Tổng mặt hàng",
          },
          {
            icon: Lightning,
            val: loading ? "–" : activeCount,
            label: "Đang kinh doanh",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
          >
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
          leftIcon={<MagnifyingGlass className="h-4 w-4" />}
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
              className={`group relative flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-all duration-200 ${
                isSelected
                  ? "border-[#1B5E38]/25 bg-[#1B5E38]/5 shadow-sm ring-1 ring-[#1B5E38]/15"
                  : "border-transparent hover:border-slate-200 bg-transparent hover:bg-white hover:shadow-sm"
              }`}
            >
              {/* Active indicator strip */}
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
                <SlidersHorizontal className="h-5 w-5 text-white drop-shadow-sm" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`text-sm font-bold truncate transition-colors ${
                      isSelected ? "text-slate-900" : "text-slate-700"
                    }`}
                  >
                    {service.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    <Money className="h-2.5 w-2.5 text-slate-400" />
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

// ─── Detail / PencilSimple Panel (Right) ──────────────────────────────────────────────



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
    <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
      <ServiceStatsHeader
        services={services}
        loading={loading}
        onRefresh={load}
        onCreateNew={() => setShowCreateModal(true)}
      />

      {loading && (
        <Flex justify="center" align="center" spacing="md" className="my-20 flex-col">
          <CircleNotch className="h-8 w-8 animate-spin text-[#1B5E38]" />
          <p className="font-semibold text-slate-500">Đang tải dữ liệu dịch vụ...</p>
        </Flex>
      )}

      {!loading && loadError && (
        <div className="my-10 flex flex-col items-center rounded-[2rem] border-2 border-red-200 bg-red-50 p-12 text-center shadow-sm w-full">
          <Warning className="mb-4 h-12 w-12 text-red-400" />
          <h3 className="text-xl font-bold text-red-800">Lỗi đồng bộ dữ liệu</h3>
          <p className="mt-2 text-red-600">{loadError}</p>
          <Button variant="danger" onClick={load} className="mt-6" leftIcon={<ArrowClockwise className="h-5 w-5" />}>
            Thử lại
          </Button>
        </div>
      )}

      {!loading && !loadError && services.length === 0 && (
        <div className="my-10 flex flex-col items-center rounded-[2rem] border-2 border-dashed border-[#1B5E38]/25 bg-[#1B5E38]/5 p-16 text-center w-full">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl mb-4 shadow-inner"
            style={{ background: "linear-gradient(145deg, #2D7A50 0%, #1B5E38 100%)" }}
          >
            <Coffee className="h-10 w-10 text-white drop-shadow" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">Chưa có dịch vụ nào</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm">
            Tạo mới các sản phẩm như nước giải khát, quần áo hoặc dịch vụ thuê vợt để cung cấp cho người chơi.
          </p>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="mt-6 shadow-md hover:-translate-y-0.5"
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
            <CheckCircle className="h-6 w-6 text-emerald-500" />
          ) : (
            <Warning className="h-6 w-6 text-red-500" />
          )}
          <p className={`font-bold ${toast.tone === "success" ? "text-emerald-800" : "text-red-800"}`}>
            {toast.message}
          </p>
        </div>
      </div>
    </div>
  );
}
