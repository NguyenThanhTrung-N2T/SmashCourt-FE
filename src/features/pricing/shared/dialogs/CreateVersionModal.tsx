"use client";

import { useState } from "react";
import { PriceVersionDto, UpsertSystemPriceRequest, UpsertSystemPriceItem } from "@/src/features/pricing/shared/types/pricing.types";
import { Select, Button, Modal, Input, Radio } from "@/src/shared/components/ui";
import { Plus, Trash, Clock, CurrencyCircleDollar, Info, WarningCircle, Calendar } from "@phosphor-icons/react";
import { cn } from "@/src/shared/utils/cn";

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Normalise HH:mm → HH:mm:ss for the API
const toHHmmss = (t: string) => (t.length === 5 ? `${t}:00` : t);

const fmtDate = (s?: string) => {
    if (!s) return "";
    const [y, m, d] = s.split("-");
    return `${d}/${m}/${y}`;
};

// 30-min increment time options from 00:00 → 24:00
const TIME_OPTIONS: string[] = (() => {
    const opts: string[] = [];
    for (let h = 5; h <= 22; h++) {
        opts.push(`${String(h).padStart(2, "0")}:00`);
        opts.push(`${String(h).padStart(2, "0")}:30`);
    }
    opts.pop();
    return opts;
})();

const STATUS_MAP = {
    ACTIVE: { label: "Đang hiệu lực" },
    SCHEDULED: { label: "Sắp hiệu lực" },
    EXPIRED: { label: "Đã hết hạn" },
};

interface FormSlot extends Omit<UpsertSystemPriceItem, "weekdayPrice" | "weekendPrice"> {
    weekdayPrice: string | number;
    weekendPrice: string | number;
}

export function CreateVersionModal({
    open, onClose, existingVersions, onSubmit, isSubmitting,
}: {
    open: boolean;
    onClose: () => void;
    existingVersions: PriceVersionDto[];
    onSubmit: (effectiveFrom: string, dto: UpsertSystemPriceRequest) => Promise<boolean>;
    isSubmitting: boolean;
}) {
    const [effectiveFrom, setEffectiveFrom] = useState("");
    const [baseType, setBaseType] = useState<"empty" | "copy">("copy");
    const [baseVersion, setBaseVersion] = useState("");
    const [slots, setSlots] = useState<FormSlot[]>([{ startTime: "06:00", endTime: "22:00", weekdayPrice: 0, weekendPrice: 0 }]);
    const [error, setError] = useState("");

    const handleBaseVersionChange = (ef: string) => {
        setBaseVersion(ef);
        // Simplified: reset slots for now
        setSlots([{ startTime: "06:00", endTime: "22:00", weekdayPrice: 0, weekendPrice: 0 }]);
    };

    const addSlot = () => setSlots(prev => [...prev, { startTime: "06:00", endTime: "22:00", weekdayPrice: 0, weekendPrice: 0 }]);
    const removeSlot = (i: number) => setSlots(prev => prev.filter((_, idx) => idx !== i));
    const updateSlot = (i: number, field: keyof FormSlot, val: string) => {
        setSlots(prev => {
            const next = [...prev];
            next[i] = { ...next[i], [field]: val };
            return next;
        });
    };

    const validate = (): string | null => {
        if (!effectiveFrom) return "Vui lòng chọn ngày hiệu lực.";
        if (effectiveFrom < todayStr()) return "Ngày hiệu lực phải từ hôm nay trở đi.";
        if (existingVersions.some(v => v.effectiveFrom === effectiveFrom)) return "Đã tồn tại phiên bản với ngày này.";
        if (baseType === "copy" && !baseVersion) return "Vui lòng chọn phiên bản gốc.";
        for (const [i, s] of slots.entries()) {
            if (!s.startTime || !s.endTime) return `Khung giờ ${i + 1}: thiếu giờ bắt đầu/kết thúc.`;
            if (s.startTime >= s.endTime) return `Khung giờ ${i + 1}: giờ bắt đầu phải trước giờ kết thúc.`;
            if (!s.weekdayPrice || !s.weekendPrice) return `Khung giờ ${i + 1}: thiếu giá.`;
            if (Number(s.weekdayPrice) < 0 || Number(s.weekendPrice) < 0) return `Khung giờ ${i + 1}: giá không được âm.`;
        }
        return null;
    };

    const handleCreate = async () => {
        setError("");
        const err = validate();
        if (err) { setError(err); return; }

        const dto: UpsertSystemPriceRequest = {
            slots: slots.map(s => ({
                startTime: toHHmmss(s.startTime),
                endTime: toHHmmss(s.endTime),
                weekdayPrice: Number(s.weekdayPrice),
                weekendPrice: Number(s.weekendPrice),
            })),
        };

        const ok = await onSubmit(effectiveFrom, dto);
        if (ok) handleClose();
    };

    const handleClose = () => {
        setError("");
        setEffectiveFrom("");
        setBaseType("copy");
        setBaseVersion("");
        setSlots([{ startTime: "06:00", endTime: "22:00", weekdayPrice: 0, weekendPrice: 0 }]);
        onClose();
    };

    return (
        <Modal isOpen={open} onClose={handleClose} title="Tạo phiên bản giá mới" maxWidth="xl">
            <div className="space-y-4 p-4">
                {/* Effective From */}
                <div className="bg-surface-2/50 p-2 rounded-2xl border border-border/50">
                    <Input
                        label="Ngày hiệu lực"
                        type="date"
                        value={effectiveFrom}
                        min={todayStr()}
                        onChange={e => setEffectiveFrom(e.target.value)}
                        required
                        leftIcon={<Calendar className="h-5 w-5" />}
                    />
                    <p className="mt-3 text-[11px] text-muted flex items-center gap-1.5">
                        <Info className="h-3.5 w-3.5" />
                        Giá sẽ được áp dụng tự động từ ngày này.
                    </p>
                </div>

                {/* Base Version Selection */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2 px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Khởi tạo dữ liệu từ
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={cn(
                            "p-4 rounded-xl border-2 transition-all cursor-pointer",
                            baseType === "empty" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 bg-surface-2"
                        )} onClick={() => {
                            setBaseType("empty");
                            setSlots([{ startTime: "06:00", endTime: "22:00", weekdayPrice: 0, weekendPrice: 0 }]);
                        }}>
                            <Radio
                                label="Phiên bản trống"
                                checked={baseType === "empty"}
                                readOnly
                                description="Bắt đầu nhập giá từ đầu"
                            />
                        </div>
                        <div className={cn(
                            "p-4 rounded-xl border-2 transition-all cursor-pointer",
                            baseType === "copy" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 bg-surface-2"
                        )} onClick={() => setBaseType("copy")}>
                            <Radio
                                label="Sao chép từ có sẵn"
                                checked={baseType === "copy"}
                                readOnly
                                description="Kế thừa giá từ phiên bản cũ"
                            />
                        </div>
                    </div>

                    {baseType === "copy" && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <Select
                                value={baseVersion}
                                onChange={handleBaseVersionChange}
                                className="w-full"
                            >
                                <option value="">— Chọn phiên bản gốc —</option>
                                {existingVersions.map(v => (
                                    <option key={v.effectiveFrom} value={v.effectiveFrom}>
                                        {fmtDate(v.effectiveFrom)} ({STATUS_MAP[v.status as keyof typeof STATUS_MAP]?.label})
                                    </option>
                                ))}
                            </Select>
                        </div>
                    )}
                </div>

                {/* Slots Management */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between px-1">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Cấu hình khung giờ & giá
                        </h4>
                        <Button
                            onClick={addSlot}
                            variant="secondary"
                            size="sm"
                            leftIcon={<Plus className="h-4 w-4" weight="bold" />}
                        >
                            Thêm khung giờ
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {slots.map((s, i) => (
                            <div key={i} className="group relative bg-surface-1 border border-border rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2 border-b border-border/50">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" /> Giờ bắt đầu
                                        </label>
                                        <Select value={s.startTime} onChange={v => updateSlot(i, "startTime", v)} className="w-full">
                                            {TIME_OPTIONS.filter(t => t !== "24:00").map(t => <option key={t}>{t}</option>)}
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" weight="fill" /> Giờ kết thúc
                                        </label>
                                        <Select value={s.endTime} onChange={v => updateSlot(i, "endTime", v)} className="w-full">
                                            {TIME_OPTIONS.filter(t => t !== "00:00").map(t => <option key={t}>{t}</option>)}
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                                            <CurrencyCircleDollar className="h-3.5 w-3.5 text-primary" /> Giá ngày thường (đ)
                                        </label>
                                        <input
                                            type="number" min="0" step="1000" value={s.weekdayPrice} placeholder="100.000"
                                            onChange={e => updateSlot(i, "weekdayPrice", e.target.value)}
                                            className="w-full rounded-xl border-2 border-border bg-surface-2 px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                                            <CurrencyCircleDollar className="h-3.5 w-3.5 text-amber-600" weight="fill" /> Giá cuối tuần (đ)
                                        </label>
                                        <input
                                            type="number" min="0" step="1000" value={s.weekendPrice} placeholder="120.000"
                                            onChange={e => updateSlot(i, "weekendPrice", e.target.value)}
                                            className="w-full rounded-xl border-2 border-border bg-surface-2 px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                </div>

                                {slots.length > 1 && (
                                    <button
                                        onClick={() => removeSlot(i)}
                                        className="absolute -top-2 -right-2 h-8 w-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                        title="Xoá khung giờ"
                                    >
                                        <Trash className="h-4 w-4" weight="bold" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <p className="text-[11px] text-muted italic flex items-center gap-1.5 px-1 py-2 rounded-lg bg-surface-2 border border-border/50">
                        <Info className="h-4 w-4 shrink-0" />
                        Lưu ý: Khung giờ phải bắt đầu/kết thúc theo bội số 30 phút.
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 animate-in fade-in shake">
                        <WarningCircle className="h-5 w-5 text-red-500 shrink-0" weight="fill" />
                        <p className="text-xs font-bold text-red-600">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end items-center gap-4 pt-4 border-t border-border">
                    <Button variant="secondary" onClick={handleClose} disabled={isSubmitting} className="min-w-[100px]">
                        Huỷ bỏ
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreate}
                        disabled={isSubmitting}
                        className="min-w-[140px]"
                        isLoading={isSubmitting}
                    >
                        Tạo phiên bản
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
