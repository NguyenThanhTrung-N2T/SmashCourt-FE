import { useState } from "react";
import { X, Plus, Trash, Stack, WarningCircle } from "@phosphor-icons/react";
import type { BranchCourtTypeDto } from "@/src/shared/types/branch.types";
import type { CourtType } from "../../types";
import { addCourtTypeToBranch, removeCourtTypeFromBranch } from "@/src/api/branch.api";

interface ManageBranchCourtTypesModalProps {
    branchId: string;
    systemCourtTypes: CourtType[];
    branchCourtTypes: BranchCourtTypeDto[];
    onClose: () => void;
    onSuccess: () => void; // Trigger refetch
    showToast: (tone: "success" | "error", message: string) => void;
}

export function ManageBranchCourtTypesModal({
    branchId,
    systemCourtTypes,
    branchCourtTypes,
    onClose,
    onSuccess,
    showToast,
}: ManageBranchCourtTypesModalProps) {
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [loadingRemove, setLoadingRemove] = useState<string | null>(null);
    const [selectedToAdd, setSelectedToAdd] = useState<string>("");

    // System CTs not yet active at the branch
    const activeAtBranchIds = branchCourtTypes.filter(ct => ct.isActive).map(ct => ct.courtTypeId);
    const availableToAdd = systemCourtTypes.filter(ct => !activeAtBranchIds.includes(ct.id));

    const handleAdd = async () => {
        if (!selectedToAdd) return;
        try {
            setLoadingAdd(true);
            await addCourtTypeToBranch(branchId, { courtTypeId: selectedToAdd });
            showToast("success", "Thêm loại sân thành công");
            setSelectedToAdd("");
            onSuccess();
            // onClose();
        } catch (err: any) {
            showToast("error", err.message || "Có lỗi xảy ra khi thêm loại sân");
        } finally {
            setLoadingAdd(false);
        }
    };

    const handleRemove = async (courtTypeId: string) => {
        if (!confirm("Loại sân sẽ bị tắt tại chi nhánh.\nBạn có chắc không?")) return;

        try {
            setLoadingRemove(courtTypeId);
            await removeCourtTypeFromBranch(branchId, courtTypeId);
            showToast("success", "Đã tắt loại sân tại chi nhánh");
            onSuccess();
        } catch (err: any) {
            const msg = err.message || "Có lỗi xảy ra";
            if (msg.includes("400") || msg.toLowerCase().includes("sử dụng")) {
                showToast("error", "Không thể tắt vì đang có sân sử dụng loại này");
            } else {
                showToast("error", msg);
            }
        } finally {
            setLoadingRemove(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-surface-1 shadow-2xl">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2">
                            <Stack className="h-5 w-5 text-muted" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">Quản lý loại sân</h3>
                            <p className="text-xs text-muted">Cấu hình loại sân cho chi nhánh</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-muted hover:bg-surface-2 hover:text-foreground transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Add new court type */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-foreground">Thêm loại sân</label>
                        <div className="flex gap-2">
                            <select
                                value={selectedToAdd}
                                onChange={(e) => setSelectedToAdd(e.target.value)}
                                className="flex-1 rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:bg-surface-1 focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">-- Chọn loại sân --</option>
                                {availableToAdd.map(ct => (
                                    <option key={ct.id} value={ct.id}>{ct.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleAdd}
                                disabled={!selectedToAdd || loadingAdd}
                                className="flex items-center gap-2 rounded-xl bg-[#1B5E38] px-4 py-2 text-sm font-bold text-white transition-all hover:bg-[#1B5E38]/90 disabled:opacity-50"
                            >
                                {loadingAdd ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : <Plus className="h-4 w-4" />}
                                Thêm
                            </button>
                        </div>
                    </div>

                    {/* Active court types */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-foreground">Loại sân đang hoạt động</label>
                        <div className="space-y-2">
                            {branchCourtTypes.filter(ct => ct.isActive).length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border p-4 text-center">
                                    <p className="text-sm text-muted">Chưa có loại sân nào được bật</p>
                                </div>
                            ) : (
                                branchCourtTypes.filter(ct => ct.isActive).map(ct => (
                                    <div key={ct.courtTypeId} className="flex items-center justify-between rounded-xl border border-border bg-surface-1 px-4 py-3 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                            <span className="text-sm font-bold text-foreground">{ct.courtTypeName}</span>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(ct.courtTypeId)}
                                            disabled={loadingRemove === ct.courtTypeId}
                                            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                        >
                                            {loadingRemove === ct.courtTypeId ? (
                                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-500/20 border-t-red-500" />
                                            ) : (
                                                <>
                                                    <Trash className="h-3 w-3" />
                                                    Tắt
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Inactive warning (if any) */}
                    {branchCourtTypes.some(ct => !ct.isActive) && (
                        <div className="rounded-xl bg-amber-500/10 p-4 flex items-start gap-3">
                            <WarningCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-600">
                                Một số loại sân đã bị tắt. Dữ liệu bảng giá cũ của các loại sân này vẫn được lưu trữ nhưng không thể áp dụng cho việc đặt sân mới.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
