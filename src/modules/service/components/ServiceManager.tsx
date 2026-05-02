"use client";

import { useCallback, useEffect, useState } from"react";
import {
 Coffee,
 CircleNotch,
 Plus,
 ArrowClockwise,
 Trash,
 PencilSimpleLine,
 Tag,
 Lightning,
 CheckCircle,
 XCircle,
} from"@phosphor-icons/react";

import {
 deleteService,
 fetchAllServices,
} from"@/src/api/service.api";
import { ServiceStatus } from"@/src/shared/types/service.types";
import type {
 Service,
} from"@/src/shared/types/service.types";
import { AuthApiError } from"@/src/api/auth.api";
import { useToast } from"@/src/shared/hooks/useToast";

import { Button } from"@/src/shared/components/ui/Button";
import { Badge } from"@/src/shared/components/ui/Badge";
import { Alert } from"@/src/shared/components/ui/Alert";
import { Stack } from"@/src/shared/components/layout/Stack";
import { Toast } from"@/src/shared/components/ui/Toast";
import { CreateServiceModal } from"./modals/CreateServiceModal";
import { EditServiceModal } from"./modals/EditServiceModal";
import { DeleteServiceDialog } from"./modals/DeleteServiceDialog";


// Helper to check if service is active
function isActive(status: ServiceStatus): boolean {
 return status === ServiceStatus.ACTIVE;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ServiceManager() {
 const [services, setServices] = useState<Service[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [showCreateModal, setShowCreateModal] = useState(false);
 const [editingService, setEditingService] = useState<Service | null>(null);
 const [deletingId, setDeletingId] = useState<string | null>(null);

 const { toast, show: showToast } = useToast();

 const load = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const data = await fetchAllServices(1, 50);
 setServices(Array.isArray(data.items) ? data.items : []);
 } catch (err) {
 setError(err instanceof AuthApiError ? err.message :"Không tải được danh sách dịch vụ");
 setServices([]);
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 load();
 }, [load]);

 async function handleDelete(id: string) {
 try {
 await deleteService(id);
 setServices((prev) => prev.filter((s) => s.id !== id));
 setDeletingId(null);
 showToast("success","Đã ngưng kinh doanh dịch vụ thành công!");
 } catch (err) {
 showToast("error", err instanceof AuthApiError ? err.message :"Xóa thất bại");
 }
 }

 const activeCount = services.filter((s) => isActive(s.status)).length;

 return (
 <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
 {/* Page Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight text-foreground">
 Dịch vụ
 </h1>
 <p className="text-sm font-medium text-muted mt-1">
 Quản lý mặt hàng bán lẻ và dịch vụ thuê dụng cụ tại sân.
 </p>
 </div>
 <div className="flex items-center gap-3 shrink-0">
 <Button
 variant="secondary"
 size="md"
 onClick={load}
 disabled={loading}
 >
 <ArrowClockwise className={`h-3.5 w-3.5 ${loading ?"animate-spin" :""}`} />
 Làm mới
 </Button>
 <Button
 variant="primary"
 size="md"
 onClick={() => setShowCreateModal(true)}
 >
 <Plus className="h-3.5 w-3.5" />
 Tạo dịch vụ
 </Button>
 </div>
 </div>

 {/* KPI Cards */}
 <div className="grid gap-4 grid-cols-2 max-w-md">
 {[
 {
 icon: Tag,
 val: loading ?"–" : services.length,
 label:"Tổng mặt hàng",
 },
 {
 icon: Lightning,
 val: loading ?"–" : activeCount,
 label:"Đang kinh doanh",
 },
 ].map((s, i) => (
 <div
 key={i}
 className="flex items-center gap-4 rounded-2xl border border-border bg-surface-1 p-4 shadow-sm hover:shadow-md transition-all"
 >
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
 <s.icon className="h-5 w-5" />
 </div>
 <div>
 <p className="text-2xl font-extrabold text-foreground leading-none">{s.val}</p>
 <p className="mt-1 text-xs font-semibold text-muted">{s.label}</p>
 </div>
 </div>
 ))}
 </div>

 {/* Loading */}
 {loading && (
 <Stack align="center" justify="center" className="py-16 rounded-2xl border border-border bg-surface-1" spacing="md">
 <CircleNotch className="h-10 w-10 animate-spin text-primary" />
 <p className="text-sm font-semibold text-muted">Đang tải...</p>
 </Stack>
 )}

 {/* Error */}
 {!loading && error && (
 <Alert variant="error" title="Không thể tải dữ liệu">
 <p className="mb-3">{error}</p>
 <Button variant="danger" size="sm" onClick={load}>
 <ArrowClockwise className="h-4 w-4" />
 Thử lại
 </Button>
 </Alert>
 )}

 {/* Empty */}
 {!loading && !error && services.length === 0 && (
 <div className="rounded-2xl border border-dashed border-border bg-surface-1 px-8 py-16 text-center">
 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
 <Coffee className="h-8 w-8 text-primary" />
 </div>
 <h3 className="text-lg font-bold text-foreground mb-2">Chưa có dịch vụ nào</h3>
 <p className="text-sm text-muted mb-4">
 Tạo mới các sản phẩm như nước giải khát, quần áo hoặc dịch vụ thuê vợt để cung cấp cho người chơi.
 </p>
 <Button
 variant="primary"
 onClick={() => setShowCreateModal(true)}
 >
 <Plus className="h-4 w-4" />
 Tạo dịch vụ đầu tiên
 </Button>
 </div>
 )}

 {/* Table */}
 {!loading && !error && services.length > 0 && (
 <div className="overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-sm">
 <table className="w-full text-left">
 <thead className="bg-surface-2 border-b border-border">
 <tr>
 <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-muted">
 Tên dịch vụ
 </th>
 <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-muted">
 Mô tả
 </th>
 <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-muted text-center">
 Đơn vị
 </th>
 <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-muted text-right">
 Giá mặc định
 </th>
 <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-muted text-center">
 Trạng thái
 </th>
 <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-muted text-center">
 Hành động
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {services.map((service, index) => {
 const active = isActive(service.status);
 return (
 <tr
 key={service.id}
 className="group transition-all duration-200 hover:bg-primary/[0.03] animate-slide-up"
 style={{ animationDelay: `${index * 0.05}s` }}
 >
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
 <Coffee className="h-5 w-5" />
 </div>
 <span className="font-bold text-foreground group-hover:text-primary transition-colors">{service.name}</span>
 </div>
 </td>
 <td className="px-6 py-4 text-sm text-muted max-w-xs">
 <div className="truncate">
 {service.description || <span className="text-muted italic">Không có mô tả</span>}
 </div>
 </td>
 <td className="px-6 py-4 text-center">
 <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-3 px-3 py-1.5 border border-border text-sm font-bold text-foreground">
 {service.unit}
 </span>
 </td>
 <td className="px-6 py-4 text-right">
 <span className="text-base font-bold text-foreground">
 {service.defaultPrice.toLocaleString()} đ
 </span>
 </td>
 <td className="px-6 py-4 text-center">
 <Badge variant={active ?"success" :"neutral"} size="sm">
 {active ? (
 <>
 <CheckCircle className="h-3 w-3" />
 Đang kinh doanh
 </>
 ) : (
 <>
 <XCircle className="h-3 w-3" />
 Đã ngưng
 </>
 )}
 </Badge>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center justify-center gap-2">
 <Button
 size="sm"
 variant="secondary"
 onClick={() => setEditingService(service)}
 >
 <PencilSimpleLine className="h-3.5 w-3.5" />
 Sửa
 </Button>
 <Button
 size="sm"
 variant="danger"
 onClick={() => setDeletingId(service.id)}
 >
 <Trash className="h-3.5 w-3.5" />
 Ngưng
 </Button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 )}

 {/* Toast */}
 <Toast toast={toast} />

 {/* Modals */}
 {showCreateModal && (
 <CreateServiceModal
 onClose={() => setShowCreateModal(false)}
 onCreated={(created) => {
 setServices((prev) => [...prev, created]);
 setShowCreateModal(false);
 showToast("success", `Đã tạo dịch vụ"${created.name}" thành công!`);
 }}
 />
 )}

 {editingService && (
 <EditServiceModal
 service={editingService}
 onClose={() => setEditingService(null)}
 onSaved={(updated) => {
 setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
 setEditingService(null);
 showToast("success", `Đã cập nhật dịch vụ"${updated.name}" thành công!`);
 }}
 />
 )}

 {deletingId && (
 <DeleteServiceDialog
 service={services.find((s) => s.id === deletingId)!}
 onClose={() => setDeletingId(null)}
 onConfirm={() => handleDelete(deletingId)}
 />
 )}
 </div>
 );
}
