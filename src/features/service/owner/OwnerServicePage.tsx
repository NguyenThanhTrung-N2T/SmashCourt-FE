"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Coffee,
    Plus,
    ArrowClockwise,
    Trash,
    PencilSimpleLine,
    Tag,
    Lightning,
    CheckCircle,
    XCircle,
} from "@phosphor-icons/react";

import {
    deleteService,
    fetchAllServices,
} from "@/src/api/service.api";
import { ServiceStatus } from "@/src/features/service/shared/types/service.types";
import type {
    Service,
} from "@/src/features/service/shared/types/service.types";
import { AuthApiError } from "@/src/api/auth.api";
import { useToast } from "@/src/shared/hooks/useToast";

import { Button, Toast, Badge, Pagination } from "@/src/shared/components/ui";
import { CreateServiceModal } from "./dialogs/CreateServiceModal";
import { EditServiceModal } from "./dialogs/EditServiceModal";
import { ConfirmationDialog } from "@/src/shared/components/ui/ConfirmationDialog";
import { ServiceLoadingState } from "./components/states/ServiceLoadingState";
import { ServiceErrorState } from "./components/states/ServiceErrorState";
import { ServiceEmptyState } from "./components/states/ServiceEmptyState";
import { SmartImage } from "@/src/shared/components/ui/SmartImage";
// Helper to check if service is active
function isActive(status: ServiceStatus): boolean {
    return status === ServiceStatus.ACTIVE;
}
const PAGE_SIZE = 12;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OwnerServicePage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const { toast, show: showToast } = useToast();
    const pageSize = PAGE_SIZE;
    const load = useCallback(async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAllServices(page, pageSize);
            setServices(Array.isArray(data.items) ? data.items : []);
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.totalItems || 0);
        } catch (err) {
            setError(err instanceof AuthApiError ? err.message : "Không tải được danh sách dịch vụ");
            setServices([]);
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    useEffect(() => {
        load(currentPage);
    }, [load, currentPage]);

    async function handleDelete(id: string) {
        try {
            await deleteService(id);
            setServices((prev) => prev.filter((s) => s.id !== id));
            setDeletingId(null);
            showToast("success", "Đã ngưng kinh doanh dịch vụ thành công!");
        } catch (err) {
            showToast("error", err instanceof AuthApiError ? err.message : "Xóa thất bại");
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
                        onClick={() => load(currentPage)}
                        disabled={loading}
                    >
                        <ArrowClockwise className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
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

            {/* Loading */}
            {loading && <ServiceLoadingState />}

            {/* Error */}
            {!loading && error && (
                <ServiceErrorState error={error} onRetry={() => load(currentPage)} />
            )}

            {/* Empty */}
            {!loading && !error && services.length === 0 && (
                <ServiceEmptyState onCreateClick={() => setShowCreateModal(true)} />
            )}

            {/* Service Grid */}
            {!loading && !error && services.length > 0 && (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {services.map((service, index) => {
                        const active = isActive(service.status);
                        return (
                            <div
                                key={service.id}
                                className="group relative flex flex-col rounded-[24px] border border-border bg-surface-1 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 overflow-hidden animate-slide-up"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {/* Image Container */}
                                <div className="relative aspect-[4/3] w-full bg-surface-2 overflow-hidden border-b border-border">
                                    {service.serviceDisplayUrl ? (
                                        <SmartImage
                                            src={service.serviceDisplayUrl}
                                            alt={service.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary/40">
                                            <Coffee className="h-16 w-16 transition-transform duration-500 group-hover:scale-110" />
                                        </div>
                                    )}

                                    {/* Status Badge overlay */}
                                    <div className="absolute top-4 left-4">
                                        <Badge variant={active ? "success" : "neutral"} size="sm" className="shadow-md backdrop-blur-md bg-white/90 dark:bg-slate-900/90 font-black uppercase text-[9px] tracking-widest px-2.5 py-1 border-none">
                                            <>
                                                <CheckCircle className="h-3 w-3" />
                                                Đang bán
                                            </>
                                        </Badge>
                                    </div>

                                    {/* Action overlay on hover */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                        <Button
                                            size="md"
                                            variant="secondary"
                                            onClick={() => setEditingService(service)}
                                            className="rounded-full bg-white text-slate-900 hover:bg-white/90 border-none shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75"
                                        >
                                            <PencilSimpleLine className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="md"
                                            variant="danger"
                                            onClick={() => setDeletingId(service.id)}
                                            className="rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-150"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <h3 className="text-lg font-black text-foreground leading-tight group-hover:text-primary transition-colors">
                                            {service.name}
                                        </h3>
                                        <span className="shrink-0 text-[10px] font-black uppercase tracking-wider bg-surface-3 text-muted px-2 py-1 rounded-lg border border-border">
                                            {service.unit}
                                        </span>
                                    </div>

                                    <p className="text-sm text-muted line-clamp-2 mb-4 min-h-[40px]">
                                        {service.description || <span className="italic opacity-50">Không có mô tả chi tiết</span>}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-dashed border-border flex items-center justify-between">
                                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">Giá niêm yết</p>
                                        <p className="text-xl font-black text-foreground">
                                            {service.defaultPrice.toLocaleString()} <span className="text-xs font-bold text-muted ml-0.5">đ</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && services.length > 0 && totalPages > 1 && (
                <div className="mt-10 animate-fade-in">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        itemLabel="dịch vụ"
                    />
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
                <ConfirmationDialog
                    title="Xác nhận ngưng kinh doanh"
                    message={`Dịch vụ "${services.find((s) => s.id === deletingId)?.name}" sẽ bị ẩn khỏi hệ thống và không thể đặt mới. Dữ liệu lịch sử và các giao dịch đã thực hiện sẽ không bị ảnh hưởng.`}
                    confirmText="Xác nhận ngưng"
                    cancelText="Hủy bỏ"
                    variant="danger"
                    onConfirm={() => handleDelete(deletingId)}
                    onCancel={() => setDeletingId(null)}
                />
            )}
        </div>
    );
}
