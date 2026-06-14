"use client";

import { useState } from "react";
import {
    Coffee,
    Plus,
    ArrowClockwise,
    Trash,
    PencilSimpleLine,
    Check,
    X,
} from "@phosphor-icons/react";

import type { BranchService } from "@/src/features/service/shared/types/service.types";
import { AuthApiError } from "@/src/api/auth.api";
import { useToast } from "@/src/shared/hooks/useToast";
import { useBranchServices } from "@/src/features/service/manager/hooks/useBranchServices";

import { Button, Toast, Pagination } from "@/src/shared/components/ui";
import { ConfirmationDialog } from "@/src/shared/components/ui/ConfirmationDialog";
import { ServiceLoadingState } from "@/src/features/service/manager/components/states/ServiceLoadingState";
import { ServiceErrorState } from "@/src/features/service/manager/components/states/ServiceErrorState";
import { ServiceEmptyState } from "@/src/features/service/manager/components/states/ServiceEmptyState";
import { ServiceCard } from "./components/ServiceCard";
import { AddServicePanel } from "./components/AddServicePanel";
import { PageHeader } from "@/src/shared/components/layout/PageHeader";

const PAGE_SIZE = 12;

// ─── Main Component ───────────────────────────────────────────────────────────
export function ManagerServicePage() {
    const pageSize = PAGE_SIZE;
    const {
        branchServices,
        availableServices,
        allServicesCount,
        loading,
        actionLoading,
        error,
        currentPage,
        totalPages,
        totalItems,
        refresh,
        addService,
        updatePrice,
        disableService,
        setCurrentPage,
    } = useBranchServices({ pageSize: pageSize });

    const { toast, show: showToast } = useToast();

    const [showAddPanel, setShowAddPanel] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [disablingService, setDisablingService] = useState<BranchService | null>(null);

    const handleAdd = async (serviceId: string, price: number) => {
        try {
            await addService({ serviceId, price });
            showToast("success", "Đã thêm dịch vụ vào chi nhánh!");
            setShowAddPanel(false);
        } catch (err) {
            showToast(
                "error",
                err instanceof AuthApiError ? err.message : "Thêm dịch vụ thất bại"
            );
        }
    };

    const handlePriceSave = async (serviceId: string, price: number) => {
        if (price < 1) {
            showToast("error", "Giá phải lớn hơn hoặc bằng 1");
            return;
        }
        try {
            await updatePrice(serviceId, { price });
            showToast("success", "Đã cập nhật giá dịch vụ!");
            setEditingServiceId(null);
        } catch (err) {
            showToast(
                "error",
                err instanceof AuthApiError ? err.message : "Cập nhật giá thất bại"
            );
        }
    };

    const handleDisable = async () => {
        if (!disablingService) return;
        try {
            await disableService(disablingService.serviceId);
            showToast("success", `Đã tắt dịch vụ "${disablingService.serviceName}"!`);
            setDisablingService(null);
        } catch (err) {
            showToast(
                "error",
                err instanceof AuthApiError ? err.message : "Tắt dịch vụ thất bại"
            );
        }
    };

    return (
        <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader
                    title="Dịch vụ chi nhánh"
                    description="Quản lý các dịch vụ đang cung cấp tại chi nhánh này."
                />
                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={refresh}
                        disabled={loading}
                    >
                        <ArrowClockwise className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                        Làm mới
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => setShowAddPanel(true)}
                        disabled={availableServices.length === 0}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Thêm dịch vụ
                    </Button>
                </div>
            </div>

            {/* Stats bar */}
            {!loading && !error && branchServices.length > 0 && (
                <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-foreground">
                        {totalItems}
                        <span className="font-medium text-muted ml-1">dịch vụ đang hoạt động</span>
                    </span>
                    {allServicesCount - totalItems > 0 && (
                        <>
                            <span className="text-border">·</span>
                            <button
                                onClick={() => setShowAddPanel(true)}
                                className="text-primary font-bold hover:underline transition-all"
                            >
                                + {allServicesCount - totalItems} có thể thêm
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Loading */}
            {loading && <ServiceLoadingState />}

            {/* Error */}
            {!loading && error && (
                <ServiceErrorState error={error} onRetry={refresh} />
            )}

            {/* Empty */}
            {!loading && !error && branchServices.length === 0 && (
                <ServiceEmptyState onCreateClick={() => setShowAddPanel(true)} />
            )}

            {/* Service Grid */}
            {!loading && !error && branchServices.length > 0 && (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {branchServices.map((service, index) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            index={index}
                            editingServiceId={editingServiceId}
                            actionLoading={actionLoading}
                            onEditStart={(s) => setEditingServiceId(s.serviceId)}
                            onEditCancel={() => setEditingServiceId(null)}
                            onPriceSave={handlePriceSave}
                            onDisable={(s) => setDisablingService(s)}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && !error && branchServices.length > 0 && totalPages > 1 && (
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

            {/* Add Service Panel */}
            {showAddPanel && (
                <AddServicePanel
                    availableServices={availableServices}
                    actionLoading={actionLoading}
                    onAdd={handleAdd}
                    onClose={() => setShowAddPanel(false)}
                />
            )}

            {/* Disable Confirmation */}
            {disablingService && (
                <ConfirmationDialog
                    title="Xác nhận tắt dịch vụ"
                    message={`Dịch vụ "${disablingService.serviceName}" sẽ bị tắt tại chi nhánh này. Bạn có thể kích hoạt lại bất cứ lúc nào.`}
                    confirmText="Xác nhận tắt"
                    cancelText="Hủy bỏ"
                    variant="danger"
                    onConfirm={handleDisable}
                    onCancel={() => setDisablingService(null)}
                />
            )}
        </div>
    );
}