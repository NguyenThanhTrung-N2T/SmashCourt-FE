"use client";

import { useState } from "react";
import {
    CourtBasketball,
    Plus,
    ArrowClockwise,
    Trash,
    Warning,
    CheckCircle,
    Info,
} from "@phosphor-icons/react";

import { useManagerCourtTypes } from "./hooks/useManagerCourtTypes";
import { getAuthUser } from "@/src/features/auth/session/sessionStore";
import { useToast } from "@/src/shared/hooks/useToast";
import { Button, Toast } from "@/src/shared/components/ui";
import { ConfirmationDialog } from "@/src/shared/components/ui/ConfirmationDialog";
import { PageHeader } from "@/src/shared/components/layout/PageHeader";
import { EmptyState } from "@/src/shared/components/layout";
import { Badge } from "@/src/shared/components/ui/Badge";
import { AddCourtTypePanel } from "./components/AddCourtTypePanel";

export function StaffCourtTypePage() {
    const {
        branchCourtTypes,
        availableCourtTypes,
        loading,
        actionLoading,
        error,
        refresh,
        addCourtType,
        removeCourtType,
    } = useManagerCourtTypes();

    const { toast, show: showToast } = useToast();
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [courtTypeToRemove, setCourtTypeToRemove] = useState<{ id: string, name: string } | null>(null);

    // Identify user role
    const user = getAuthUser();
    const userRole = user?.role?.toUpperCase();
    const isManager = userRole === "BRANCH_MANAGER" || userRole === "OWNER";
    const isStaff = userRole === "STAFF";

    const handleAdd = async (courtTypeId: string) => {
        try {
            await addCourtType(courtTypeId);
            showToast("success", "Đã thêm loại sân vào chi nhánh!");
            setShowAddPanel(false);
        } catch (err: unknown) {
            showToast("error", (err as Error)?.message || "Thêm loại sân thất bại");
        }
    };

    const handleRemove = async () => {
        if (!courtTypeToRemove) return;
        try {
            await removeCourtType(courtTypeToRemove.id);
            showToast("success", `Đã gỡ loại sân "${courtTypeToRemove.name}"!`);
            setCourtTypeToRemove(null);
        } catch (err: unknown) {
            showToast("error", (err as Error)?.message || "Gỡ loại sân thất bại");
        }
    };

    return (
        <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader
                    title="Loại sân chi nhánh"
                    description={isManager
                        ? "Quản lý các loại sân đang hoạt động tại chi nhánh này."
                        : "Danh sách các loại sân tại chi nhánh."}
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
                    {isManager && (
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => setShowAddPanel(true)}
                            disabled={availableCourtTypes.length === 0 || loading}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Thêm loại sân
                        </Button>
                    )}
                </div>
            </div>

            {/* Info for Staff */}
            {isStaff && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary animate-fade-in">
                    <Info className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">Bạn đang ở chế độ xem. Chỉ Quản lý mới có quyền thay đổi cấu hình loại sân.</p>
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="rounded-2xl border-2 border-red-500/30 bg-red-500/10 p-6 flex flex-col items-center gap-4 text-center">
                    <Warning className="h-10 w-10 text-red-500" />
                    <div>
                        <h3 className="text-lg font-bold text-red-600">Lỗi tải dữ liệu</h3>
                        <p className="text-sm font-medium text-red-500/80">{error}</p>
                    </div>
                    <Button variant="danger" size="sm" onClick={refresh}>
                        Thử lại
                    </Button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && branchCourtTypes.length === 0 && (
                <EmptyState
                    icon={<CourtBasketball className="h-16 w-16 text-muted" />}
                    title="Chưa có loại sân nào"
                    description={isManager
                        ? "Bắt đầu bằng cách thêm loại sân vào chi nhánh của bạn."
                        : "Hiện tại chi nhánh chưa cấu hình loại sân nào."}
                    action={isManager ? (
                        <Button variant="primary" onClick={() => setShowAddPanel(true)}>
                            <Plus className="h-4 w-4" />
                            Thêm loại sân ngay
                        </Button>
                    ) : undefined}
                />
            )}

            {/* Court Type Grid */}
            {!loading && !error && branchCourtTypes.length > 0 && (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {branchCourtTypes.map((item, index) => (
                        <div
                            key={item.id}
                            className="group relative rounded-2xl border border-border bg-surface-1 p-5 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 group-hover:scale-110 transition-transform duration-300">
                                    <CourtBasketball className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-extrabold text-foreground truncate group-hover:text-primary transition-colors">
                                        {item.courtTypeName}
                                    </h3>
                                    <Badge variant="success" size="sm" className="mt-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Hoạt động
                                    </Badge>
                                </div>
                                {isManager && (
                                    <button
                                        onClick={() => setCourtTypeToRemove({ id: item.courtTypeId, name: item.courtTypeName })}
                                        disabled={actionLoading}
                                        className="p-2 rounded-full text-muted hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="Gỡ loại sân"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {item.courtTypeDescription && (
                                <p className="text-sm text-muted line-clamp-2 min-h-[2.5rem]">
                                    {item.courtTypeDescription}
                                </p>
                            )}

                            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                                <span className="text-xs font-medium text-muted">Số sân</span>
                                <span className="text-xs font-bold text-primary">{item.courtCount}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Panel */}
            {showAddPanel && isManager && (
                <AddCourtTypePanel
                    availableCourtTypes={availableCourtTypes}
                    actionLoading={actionLoading}
                    onAdd={handleAdd}
                    onClose={() => setShowAddPanel(false)}
                />
            )}

            {/* Confirmation Dialog */}
            {courtTypeToRemove && (
                <ConfirmationDialog
                    title="Gỡ loại sân"
                    message={`Bạn có chắc muốn gỡ loại sân "${courtTypeToRemove.name}" khỏi chi nhánh? Hành động này sẽ không xóa dữ liệu gốc nhưng loại sân sẽ không còn khả dụng tại chi nhánh này.`}
                    confirmText="Gỡ loại sân"
                    cancelText="Hủy"
                    variant="danger"
                    onConfirm={handleRemove}
                    onCancel={() => setCourtTypeToRemove(null)}
                />
            )}

            <Toast toast={toast} />
        </div>
    );
}
