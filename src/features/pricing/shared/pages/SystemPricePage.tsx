"use client";

import { useState, useEffect } from "react";
import { useCourtTypes } from "@/src/features/court-type/shared/hooks/useCourtTypes";
import { useSystemPricing } from "@/src/features/pricing/shared/hooks/useSystemPricing";
import { Select, Button, Badge, Toast, Input } from "@/src/shared/components/ui";
import { PriceTable, PriceTableSkeleton } from "../components/PriceTable";
import { CreateVersionModal } from "../dialogs/CreateVersionModal";
import { useToast } from "@/src/shared/hooks/useToast";
import { Skeleton } from "@/src/shared/components/feedback";
import { Plus, Trash, Info, Notepad, CheckCircle, Calendar } from "@phosphor-icons/react";
import { cn } from "@/src/shared/utils/cn";


const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

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

export function SystemPricePage({ readOnly = false }: { readOnly?: boolean }) {
    const { courtTypes } = useCourtTypes();
    const { toast, show: showToast } = useToast();

    const [selectedCourtTypeId, setSelectedCourtTypeId] = useState("");
    const [date, setDate] = useState(todayStr());
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {
        currentPrices,
        isLoadingCurrentPrices,
        versions,
        isLoadingVersions,
        selectedVersionDetail,
        selectVersion,
        selectedEffectiveFrom,
        upsertVersion,
        isUpserting,
        deleteVersion,
    } = useSystemPricing({
        courtTypeId: selectedCourtTypeId || undefined,
        date: date,
    });

    // Auto-select first court type
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
            showToast("success", "Đã tạo phiên bản giá hệ thống mới.");
            return true;
        }
        return false;
    };

    const handleDelete = async (effectiveFrom: string) => {
        const ok = await deleteVersion(effectiveFrom);
        if (ok) {
            showToast("success", "Đã xoá phiên bản giá hệ thống.");
        }
    };

    return (
        <div className="space-y-8">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-6 items-end pb-6 border-b border-border/50">
                <div className="w-full sm:w-64">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted mb-2 block">
                        Loại sân
                    </label>
                    <Select
                        value={selectedCourtTypeId}
                        onChange={setSelectedCourtTypeId}
                        className="w-full"
                    >
                        {courtTypes.map(ct => (
                            <option key={ct.id} value={ct.id}>{ct.name}</option>
                        ))}
                    </Select>
                </div>
                {!readOnly && (
                    <div className="w-full sm:w-64">
                        <Input
                            label="Ngày áp dụng (Bảng giá hiện tại)"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {selectedCourtTypeId ? (
                <div className={cn("grid grid-cols-1 gap-8 items-start", !readOnly && "xl:grid-cols-12")}>
                    {!readOnly && (
                        <div className="xl:col-span-4 space-y-6">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Notepad className="h-5 w-5 text-primary" />
                                    Lịch sử phiên bản
                                </h3>
                                {!readOnly && (
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => setIsModalOpen(true)}
                                        leftIcon={<Plus className="h-4 w-4" weight="bold" />}
                                    >
                                        Tạo phiên bản
                                    </Button>
                                )}
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
                                        <p className="text-xs font-medium">Chưa có phiên bản giá nào.</p>
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
                                                <div className="flex items-center gap-2">
                                                    <Calendar className={cn("h-4 w-4", selectedEffectiveFrom === v.effectiveFrom ? "text-primary" : "text-muted")} />
                                                    <span className="text-sm font-bold text-foreground">
                                                        {fmtDate(v.effectiveFrom)}
                                                    </span>
                                                </div>
                                                <Badge
                                                    variant={STATUS_MAP[v.status as keyof typeof STATUS_MAP]?.variant}
                                                    size="sm"
                                                >
                                                    {STATUS_MAP[v.status as keyof typeof STATUS_MAP]?.label}
                                                </Badge>
                                            </div>
                                            <p className="text-[10px] text-muted font-medium">
                                                Ngày hiệu lực: {v.effectiveFrom}
                                            </p>
                                            {!readOnly && v.status === "SCHEDULED" && (
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

                    {/* Right Panel: Detail or Current snapshot */}
                    <div className={cn(readOnly ? "xl:col-span-12" : "xl:col-span-8", "space-y-6")}>
                        {selectedVersionDetail ? (
                            <div className="bg-surface-1 border-2 border-primary/20 rounded-2xl overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-300">
                                <div className="px-6 py-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">Chi tiết phiên bản hệ thống</h3>
                                        <p className="text-xs text-muted">Hiệu lực từ {fmtDate(selectedVersionDetail.effectiveFrom)}</p>
                                    </div>
                                    <Badge variant={STATUS_MAP[selectedVersionDetail.status as keyof typeof STATUS_MAP]?.variant}>
                                        {STATUS_MAP[selectedVersionDetail.status as keyof typeof STATUS_MAP]?.label}
                                    </Badge>
                                </div>
                                <div className="p-1 min-h-[400px]">
                                    <PriceTable slots={selectedVersionDetail.slots} />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 px-1 text-muted">
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                    <h3 className="text-sm font-bold text-primary">Bảng giá áp dụng (Ngày {fmtDate(date)})</h3>
                                </div>
                                <div className="bg-surface-1 border border-border rounded-2xl overflow-hidden shadow-sm min-h-[400px]">
                                    {isLoadingCurrentPrices ? (
                                        <PriceTableSkeleton />
                                    ) : currentPrices.length > 0 ? (
                                        <PriceTable slots={currentPrices} />
                                    ) : (
                                        <div className="py-20 text-center text-muted italic text-sm">
                                            Không có bảng giá áp dụng cho ngày này.
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-start gap-2 p-4 rounded-xl bg-surface-2 border border-border/50 text-muted italic">
                                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                                    <p className="text-xs leading-relaxed">
                                        Đây là bảng giá đang có hiệu lực. {readOnly ? (
                                            "Bạn không có quyền thay đổi bảng giá hệ thống."
                                        ) : (
                                            <>Để thay đổi giá, vui lòng chọn một phiên bản <strong>Sắp hiệu lực</strong> bên trái để chỉnh sửa hoặc <strong>Tạo phiên bản</strong> mới.</>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="py-20 flex flex-col items-center justify-center bg-surface-2/30 rounded-3xl border border-dashed border-border animate-in fade-in">
                    <Info className="h-16 w-16 text-muted/30 mb-6" weight="thin" />
                    <h3 className="text-lg font-bold text-foreground mb-2">Chọn loại sân để xem bảng giá</h3>
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
