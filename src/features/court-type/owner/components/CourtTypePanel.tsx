"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Warning,
    CheckCircle,
    PencilSimpleLine,
    GridFour,
    CircleNotch,
    Plus,
    ArrowClockwise,
    Trash,
    XCircle,
} from "@phosphor-icons/react";
import {
    fetchAllCourtTypes,
    createCourtType,
    updateCourtType,
    deleteCourtType,
} from "@/src/api/court-type.api";
import type {
    CourtType,
    CreateCourtTypeRequest,
    UpdateCourtTypeRequest,
} from "@/src/shared/types/court-type.types";
import { AuthApiError } from "@/src/api/auth.api";
import { useToast } from "@/src/shared/hooks/useToast";
import { Flex } from "@/src/shared/components/layout/Flex";
import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Stack } from "@/src/shared/components/layout/Stack";
import { Badge } from "@/src/shared/components/ui/Badge";
import { CreateCourtTypeModal } from "./modals/CreateCourtTypeModal";
import { EditCourtTypeModal } from "./modals/EditCourtTypeModal";
import { ConfirmationDialog } from "@/src/shared/components/ui/ConfirmationDialog";

// Helper to check if court type is active
function isActive(status: string | number): boolean {
    if (typeof status === "string") {
        return status.toUpperCase() === "ACTIVE";
    }
    if (typeof status === "number") {
        return status === 0; // ACTIVE = 0 in enum
    }
    return false;
}

export default function CourtTypePanel() {
    const [courtTypes, setCourtTypes] = useState<CourtType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCourtType, setEditingCourtType] = useState<CourtType | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { toast, show: showToast } = useToast();

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAllCourtTypes();
            setCourtTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof AuthApiError ? err.message : "Không tải được danh sách");
            setCourtTypes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    async function handleDelete(id: string) {
        try {
            await deleteCourtType(id);
            setCourtTypes((prev) => prev.filter((t) => t.id !== id));
            setDeletingId(null);
            showToast("success", "Đã xóa loại sân thành công!");
        } catch (err) {
            showToast("error", err instanceof AuthApiError ? err.message : "Xóa thất bại");
        }
    }

    return (
        <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight text-foreground">
                        Loại sân
                    </h1>
                    <p className="text-sm font-medium text-muted mt-1">
                        Tạo và quản lý các loại sân cầu lông tại các chi nhánh.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={load}
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
                        Tạo loại sân
                    </Button>
                </div>
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
            {!loading && !error && courtTypes.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-surface-1 px-8 py-16 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                        <GridFour className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">Chưa có loại sân nào</h3>
                    <p className="text-sm text-muted mb-4">Tạo loại sân đầu tiên để bắt đầu.</p>
                    <Button
                        variant="primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus className="h-4 w-4" />
                        Tạo loại sân mới
                    </Button>
                </div>
            )}

            {/* Table */}
            {!loading && !error && courtTypes.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-surface-2 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-muted">
                                    Tên loại sân
                                </th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-muted">
                                    Mô tả
                                </th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-muted text-center">
                                    Chi nhánh
                                </th>
                                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-muted text-center">
                                    Số sân
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
                            {courtTypes.map((courtType, index) => {
                                const active = isActive(courtType.status);
                                return (
                                    <tr
                                        key={courtType.id}
                                        className="group transition-all duration-200 hover:bg-primary/[0.02] animate-slide-up"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                                                    <GridFour className="h-5 w-5" />
                                                </div>
                                                <span className="font-bold text-foreground group-hover:text-primary transition-colors">{courtType.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted max-w-xs">
                                            <div className="truncate">
                                                {courtType.description || <span className="italic">Không có mô tả</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 border border-primary/20">
                                                <GridFour className="h-3.5 w-3.5 text-primary" />
                                                <span className="font-bold text-primary">{courtType.activeBranchCount}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 border border-emerald-500/20">
                                                <GridFour className="h-3.5 w-3.5 text-emerald-500" />
                                                <span className="font-bold text-emerald-600">{courtType.courtCount}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant={active ? "success" : "neutral"} size="sm">
                                                {active ? (
                                                    <><CheckCircle className="h-3 w-3" />Hoạt động</>
                                                ) : (
                                                    <><XCircle className="h-3 w-3" />Đã xóa</>
                                                )}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => setEditingCourtType(courtType)}
                                                >
                                                    <PencilSimpleLine className="h-3.5 w-3.5" />
                                                    Sửa
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => setDeletingId(courtType.id)}
                                                >
                                                    <Trash className="h-3.5 w-3.5" />
                                                    Xóa
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
            {toast.visible && (
                <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
                    <div
                        className={`flex items-start gap-3 rounded-xl border-2 px-5 py-4 shadow-2xl backdrop-blur-sm ${toast.tone === "success"
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : "border-red-500/30 bg-red-500/10"
                            }`}
                    >
                        {toast.tone === "success" ? (
                            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                        ) : (
                            <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                        )}
                        <p className={`text-sm font-bold ${toast.tone === "success" ? "text-emerald-600" : "text-red-600"}`}>
                            {toast.message}
                        </p>
                    </div>
                </div>
            )}

            {/* Modals */}
            {showCreateModal && (
                <CreateCourtTypeModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={(created) => {
                        setCourtTypes((prev) => [...prev, created]);
                        setShowCreateModal(false);
                        showToast("success", `Đã tạo loại sân"${created.name}" thành công!`);
                    }}
                />
            )}

            {editingCourtType && (
                <EditCourtTypeModal
                    courtType={editingCourtType}
                    onClose={() => setEditingCourtType(null)}
                    onSaved={(updated) => {
                        setCourtTypes((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
                        setEditingCourtType(null);
                        showToast("success", `Đã cập nhật loại sân"${updated.name}" thành công!`);
                    }}
                />
            )}

            {deletingId && (
                <ConfirmationDialog
                    title="Loại sân"
                    message={`Bạn có chắc muốn xóa loại sân "${courtTypes.find((t) => t.id === deletingId)?.name}"? Loại sân sẽ bị ẩn khỏi hệ thống.`}
                    confirmText="Xác nhận xóa"
                    cancelText="Hủy"
                    variant="danger"
                    onConfirm={() => handleDelete(deletingId)}
                    onCancel={() => setDeletingId(null)}
                />
            )}
        </div>
    );
}
