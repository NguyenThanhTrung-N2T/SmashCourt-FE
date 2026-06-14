"use client";

import { useBranchServices } from "@/src/features/service/manager/hooks/useBranchServices";
import { Button, Pagination, Toast } from "@/src/shared/components/ui";
import { PageHeader } from "@/src/shared/components/layout/PageHeader";
import { ArrowClockwise } from "@phosphor-icons/react";
import { ServiceLoadingState } from "@/src/features/service/manager/components/states/ServiceLoadingState";
import { ServiceErrorState } from "@/src/features/service/manager/components/states/ServiceErrorState";
import { ServiceEmptyState } from "@/src/features/service/manager/components/states/ServiceEmptyState";
import { ServiceCard } from "@/src/features/service/manager/components/ServiceCard";
import { useToast } from "@/src/shared/hooks/useToast";

const PAGE_SIZE = 12;

export function StaffServicePage() {
    const pageSize = PAGE_SIZE;
    const {
        branchServices,
        totalItems,
        loading,
        error,
        currentPage,
        totalPages,
        refresh,
        setCurrentPage,
    } = useBranchServices({ pageSize: pageSize });

    const { toast } = useToast();

    return (
        <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader
                    title="Dịch vụ chi nhánh"
                    description="Xem danh sách các dịch vụ đang cung cấp tại chi nhánh."
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
                </div>
            </div>

            {/* Stats bar */}
            {!loading && !error && branchServices.length > 0 && (
                <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-foreground">
                        {totalItems}
                        <span className="font-medium text-muted ml-1">dịch vụ đang hoạt động</span>
                    </span>
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
                <ServiceEmptyState />
            )}

            {/* Service Grid */}
            {!loading && !error && branchServices.length > 0 && (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {branchServices.map((service, index) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                            index={index}
                            editingServiceId={null}
                            actionLoading={false}
                            onEditStart={() => { }}
                            onEditCancel={() => { }}
                            readOnly={true}
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
        </div>
    );
}
