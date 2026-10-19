"use client";

import { useState, useEffect } from "react";
import { useBranches } from "@/src/features/branch/customer/hooks/useBranches";
import { useCourtTypes } from "@/src/features/court-type/shared/hooks/useCourtTypes";
import { useBranchPricing } from "@/src/features/pricing/shared/hooks/useBranchPricing";
import { BranchSelector } from "@/src/shared/components/layout/BranchSelector";
import { Select, Button, Badge, Toast } from "@/src/shared/components/ui";
import { PriceTable, PriceTableSkeleton } from "../components/PriceTable";
import { CreateVersionModal } from "../dialogs/CreateVersionModal";
import { useToast } from "@/src/shared/hooks/useToast";
import { Skeleton } from "@/src/shared/components/feedback";
import { Plus, Trash, Info, MapPin, Notepad, CheckCircle } from "@phosphor-icons/react";
import { cn } from "@/src/shared/utils/cn";

const fmtDate = (s?: string) => {
    if (!s) return "";
    const [y, m, d] = s.split("-");
    return `${d}/${m}/${y}`;
};

const STATUS_MAP = {
    ACTIVE: { label: "Đang hiệu lực", variant: "success" as const },
    SCHEDULED: { label: "Sắp hiệu lực", variant: "info" as const },
    EXPIRED: { label: "Đã hết hạn", variant: "neutral" as const },
};

export function BranchPricePage({ role = "owner" }: { role?: "owner" | "manager" | "staff" }) {
    const { branches, isLoading: isLoadingBranches } = useBranches(1, 50);
    const { courtTypes, isLoading: isLoadingCourtTypes } = useCourtTypes();
    const { toast, show: showToast } = useToast();

    const [selectedBranchId, setSelectedBranchId] = useState("");
    const [selectedCourtTypeId, setSelectedCourtTypeId] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        effectivePrices,
        isLoadingEffectivePrices,
        versions,
        isLoadingVersions,
        selectedVersionDetail,
        isLoadingDetail,
        selectVersion,
        selectedEffectiveFrom,
        upsertVersion,
        isUpserting,
        deleteVersion,
        isDeleting,
    } = useBranchPricing({
        branchId: role === "owner" ? (selectedBranchId || undefined) : undefined,
        courtTypeId: selectedCourtTypeId || undefined,
    });

    // Auto-select first branch and court type
    useEffect(() => {
        if (branches.length > 0 && !selectedBranchId) {
            const timer = setTimeout(() => {
                setSelectedBranchId(branches[0].id);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [branches, selectedBranchId]);

    useEffect(() => {
        if (courtTypes.length > 0 && !selectedCourtTypeId) {
            const timer = setTimeout(() => {
                setSelectedCourtTypeId(courtTypes[0].id);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [courtTypes, selectedCourtTypeId]);

    const handleCreateVersion = async (effectiveFrom: string, dto: unknown) => {
        const result = await upsertVersion(effectiveFrom, dto as Parameters<typeof upsertVersion>[1]);
        if (result) {
            showToast("success", "Đã tạo phiên bản giá ghi đè cho chi nhánh.");
            return true;
        }
        return false;
    };

    const handleDelete = async (effectiveFrom: string) => {
        const ok = await deleteVersion(effectiveFrom);
        if (ok) {
            showToast("success", "Đã xoá phiên bản giá ghi đè.");
        }
    };

    return (
        <div className="space-y-8">
            {/* Toolbar */}
            <div className={cn("grid grid-cols-1 gap-4", role === "owner" ? "md:grid-cols-2" : "md:grid-cols-1")}>
                {role === "owner" && (
                    <BranchSelector
                        branches={branches as unknown as Parameters<typeof BranchSelector>[0]["branches"]}
                        selectedBranchId={selectedBranchId}
                        onBranchChange={setSelectedBranchId}
                    />
                )}
                <div className="bg-surface-1 p-4 rounded-2xl border border-border shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-muted uppercase tracking-wide mb-1">
                        Loại sân
                    </p>
                    <Select
                        value={selectedCourtTypeId}
                        onChange={setSelectedCourtTypeId}
                        placeholder="-- Chọn loại sân --"
                    >
                        {courtTypes.map(ct => (
                            <option key={ct.id} value={ct.id}>{ct.name}</option>
                        ))}
                    </Select>
                </div>
            </div>

            {(role !== "owner" || selectedBranchId) && selectedCourtTypeId ? (
                <div className={cn("grid grid-cols-1 gap-8 items-start", role !== "staff" && "xl:grid-cols-12")}>
                    {/* Left Panel: Version List & Creation */}
                    {role !== "staff" && (
                        <div className="xl:col-span-4 space-y-6">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Notepad className="h-5 w-5 text-primary" />
                                    Phiên bản ghi đè
                                </h3>
                                <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => setIsModalOpen(true)}
                                    leftIcon={<Plus className="h-4 w-4" weight="bold" />}
                                >
                                    Tạo ghi đè
                                </Button>
                            </div>

                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {isLoadingVersions ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <div key={i} className="p-4 rounded-xl border border-border bg-surface-1 space-y-2">
                                            <Skeleton className="h-4 w-1/2" />
                                            <Skeleton className="h-3 w-1/3" />
                                        </div>
                                    ))
                                ) : versions.length === 0 ? (
                                    <div className="text-center py-10 px-4 bg-surface-2/50 rounded-2xl border border-dashed border-border text-muted">
                                        <Info className="h-8 w-8 mx-auto mb-3 opacity-20" />
                                        <p className="text-xs font-medium">Chưa có phiên bản ghi đè nào.</p>
                                        <p className="text-[10px] mt-1">Chi nhánh đang áp dụng bảng giá hệ thống.</p>
                                    </div>
                                ) : (
                                    versions.map(v => (
                                        <div
                                            key={v.effectiveFrom}
                                            onClick={() => selectVersion(selectedEffectiveFrom === v.effectiveFrom ? null : v.effectiveFrom)}
                                            className={cn(
                                                "group p-4 rounded-xl border-2 transition-all cursor-pointer relative",
                                                selectedEffectiveFrom === v.effectiveFrom
                                                    ? "border-primary bg-primary/5 shadow-md z-10"
                                                    : "border-transparent bg-surface-2 hover:bg-surface-1 hover:border-primary/30"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-bold text-foreground">
                                                    {fmtDate(v.effectiveFrom)}
                                                </span>
                                                <Badge
                                                    variant={STATUS_MAP[v.status as keyof typeof STATUS_MAP]?.variant}
                                                    size="sm"
                                                >
                                                    {STATUS_MAP[v.status as keyof typeof STATUS_MAP]?.label}
                                                </Badge>
                                            </div>
                                            <p className="text-[10px] text-muted font-medium">
                                                Ngày hiệu lực: {fmtDate(v.effectiveFrom)}
                                            </p>
                                            {v.status === "SCHEDULED" && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(v.effectiveFrom);
                                                    }}
                                                    className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                >
                                                    <Trash className="h-3 w-3" weight="bold" />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Right Panel: Detail or Effective Table */}
                    <div className={cn(role === "staff" ? "xl:col-span-12" : "xl:col-span-8", "space-y-6")}>
                        {selectedVersionDetail ? (
                            <div className="bg-surface-1 border-2 border-primary/20 rounded-2xl overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-300">
                                <div className="px-6 py-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">Chi tiết phiên bản ghi đè</h3>
                                        <p className="text-xs text-muted">Hiệu lực từ {fmtDate(selectedVersionDetail.effectiveFrom)}</p>
                                    </div>
                                    <Badge variant={STATUS_MAP[selectedVersionDetail.status as keyof typeof STATUS_MAP]?.variant}>
                                        {STATUS_MAP[selectedVersionDetail.status as keyof typeof STATUS_MAP]?.label}
                                    </Badge>
                                </div>
                                <div className="p-1">
                                    <PriceTable slots={selectedVersionDetail.slots} />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 px-1 text-muted">
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                    <h3 className="text-sm font-bold text-primary">Bảng giá thực tế hiện tại</h3>
                                </div>
                                <div className="bg-surface-1 border border-border rounded-2xl overflow-hidden shadow-sm">
                                    {isLoadingEffectivePrices ? (
                                        <PriceTableSkeleton />
                                    ) : effectivePrices ? (
                                        <>
                                            <div className="bg-surface-2/50 px-6 py-3 border-b border-border flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                                        <span className="text-[10px] font-bold text-muted uppercase">Giá hệ thống</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                                        <span className="text-[10px] font-bold text-muted uppercase">Giá chi nhánh</span>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-muted italic font-medium">Hệ thống tự động hợp nhất giá</p>
                                            </div>
                                            <div className="p-1">
                                                {/* We find the court type in the response */}
                                                {effectivePrices.courtTypes.find(ct => ct.courtTypeId === selectedCourtTypeId)?.slots ? (
                                                    <table className="w-full border-collapse">
                                                        <thead>
                                                            <tr className="bg-surface-2/50 border-b border-border text-[10px] font-bold text-muted uppercase tracking-wider">
                                                                <th className="px-6 py-4 text-left">Khung giờ</th>
                                                                <th className="px-6 py-4 text-right">
                                                                    <span className="block">Ngày thường</span>
                                                                    <span className="block text-[9px] font-medium text-muted/60 normal-case tracking-normal mt-0.5">/ 30 phút</span>
                                                                </th>
                                                                <th className="px-6 py-4 text-right">
                                                                    <span className="block">Cuối tuần</span>
                                                                    <span className="block text-[9px] font-medium text-muted/60 normal-case tracking-normal mt-0.5">/ 30 phút</span>
                                                                </th>
                                                                <th className="px-6 py-4 text-center">Nguồn</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border/40">
                                                            {effectivePrices.courtTypes
                                                                .find(ct => ct.courtTypeId === selectedCourtTypeId)!
                                                                .slots.map((s, i) => (
                                                                    <tr key={i} className="hover:bg-surface-2/30 transition-colors duration-150">
                                                                        <td className="px-6 py-4 text-sm font-bold text-foreground">
                                                                            {s.startTime.slice(0, 5)} – {s.endTime.slice(0, 5)}
                                                                        </td>
                                                                        <td className="px-6 py-4 text-sm text-right font-bold text-foreground">
                                                                            {s.weekdayPrice.toLocaleString("vi-VN")}đ
                                                                        </td>
                                                                        <td className="px-6 py-4 text-sm text-right font-bold text-foreground">
                                                                            {s.weekendPrice.toLocaleString("vi-VN")}đ
                                                                        </td>
                                                                        <td className="px-6 py-4 text-center">
                                                                            <Badge variant={s.priceSource === "SYSTEM" ? "neutral" : "warning"} size="sm">
                                                                                {s.priceSource === "SYSTEM" ? "Hệ thống" : "Nhánh"}
                                                                            </Badge>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <div className="py-20 text-center text-muted italic text-sm">
                                                        Không tìm thấy dữ liệu giá cho loại sân này.
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="py-20 text-center text-muted italic text-sm">
                                            Vui lòng chọn chi nhánh và loại sân để xem bảng giá.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="py-20 flex flex-col items-center justify-center bg-surface-2/30 rounded-3xl border border-dashed border-border animate-in fade-in">
                    {role === "owner" ? (
                        <>
                            <MapPin className="h-16 w-16 text-muted/30 mb-6" weight="thin" />
                            <h3 className="text-lg font-bold text-foreground mb-2">Chọn chi nhánh để bắt đầu</h3>
                            <p className="text-sm text-muted">Bạn có thể thiết lập giá riêng cho từng chi nhánh nếu cần thiết.</p>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-16 w-16 text-muted/30 mb-6" weight="thin" />
                            <h3 className="text-lg font-bold text-foreground mb-2">Chọn loại sân để xem bảng giá</h3>
                        </>
                    )}
                </div>
            )}

            <CreateVersionModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                existingVersions={versions}
                onSubmit={handleCreateVersion}
                isSubmitting={isUpserting}
            />

            <Toast toast={toast} />
        </div>
    );
}
