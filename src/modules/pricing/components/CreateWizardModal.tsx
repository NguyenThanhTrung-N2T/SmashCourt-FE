import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CaretRight,
  Stack,
  Plus,
  X,
} from "@phosphor-icons/react";
import { fmt, fmtDate, todayStr } from "../utils";
import type { CourtType, TimeSlot, WizardSlotPrice } from "../types";

interface CreateWizardModalProps {
    onClose: () => void;
    courtTypes: CourtType[];
    timeSlots: TimeSlot[];
    onSave: (data: { courtTypeId: string; effectiveFrom: string; prices: any[] }) => Promise<void>;
}

export function CreateWizardModal({
    onClose,
    courtTypes,
    timeSlots,
    onSave,
}: CreateWizardModalProps) {
    const [step, setStep] = useState(1);
    const [courtTypeId, setCourtTypeId] = useState(courtTypes[0]?.id || "");
    const [effectiveFrom, setEffectiveFrom] = useState(todayStr());
    const [slotPrices, setSlotPrices] = useState<WizardSlotPrice[]>(
        timeSlots.map((s) => ({
            slotId: s.id,
            slotLabel: s.label,
            startTime: s.startTime,
            endTime: s.endTime,
            weekday: "30000",
            weekend: "50000",
        }))
    );
    const [submitError, setSubmitError] = useState<string | null>(null);

    function updateSlot(slotId: string, field: "weekday" | "weekend", val: string) {
        setSlotPrices((prev) => prev.map((r) => (r.slotId === slotId ? { ...r, [field]: val } : r)));
    }

    function applyToAll(field: "weekday" | "weekend", val: string) {
        setSlotPrices((prev) => prev.map((r) => ({ ...r, [field]: val })));
    }

    const selectedCourtType = courtTypes.find((c) => c.id === courtTypeId)!;
    const isStep1Valid = courtTypeId && effectiveFrom;
    const isStep2Valid = slotPrices.every((r) => Number(r.weekday) > 0 && Number(r.weekend) > 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
                {/* Header */}
                <div
                    className="px-6 py-5 flex items-center justify-between shrink-0"
                    style={{ background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)" }}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                            <Plus className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-green-200 uppercase tracking-wide">Tạo bảng giá mới</p>
                            <p className="text-sm font-bold text-white">
                                Bước {step} / 3 —{" "}
                                {step === 1 ? "Chọn loại sân & ngày hiệu lực" : step === 2 ? "Nhập giá từng slot" : "Xác nhận"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Step indicator */}
                <div className="shrink-0 px-6 py-4 flex items-center gap-2 border-b border-slate-100 bg-slate-50/50">
                    {[1, 2, 3].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${s < step
                                        ? "bg-[#1B5E38] text-white"
                                        : s === step
                                            ? "bg-[#1B5E38] text-white shadow-lg shadow-[#1B5E38]/30"
                                            : "bg-slate-200 text-slate-500"
                                    }`}
                            >
                                {s < step ? <CheckCircle className="h-3.5 w-3.5" /> : s}
                            </div>
                            <span className={`text-xs font-bold ${s === step ? "text-slate-900" : "text-slate-400"}`}>
                                {s === 1 ? "Cấu hình" : s === 2 ? "Nhập giá" : "Xác nhận"}
                            </span>
                            {i < 2 && <CaretRight className="h-3.5 w-3.5 text-slate-300 mx-1" />}
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Step 1 */}
                    {step === 1 && (
                        <Step1
                            courtTypes={courtTypes}
                            courtTypeId={courtTypeId}
                            setCourtTypeId={setCourtTypeId}
                            effectiveFrom={effectiveFrom}
                            setEffectiveFrom={setEffectiveFrom}
                        />
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <Step2
                            slotPrices={slotPrices}
                            updateSlot={updateSlot}
                            applyToAll={applyToAll}
                        />
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                        <Step3
                            selectedCourtType={selectedCourtType}
                            effectiveFrom={effectiveFrom}
                            slotPrices={slotPrices}
                            submitError={submitError}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 px-6 pb-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                        onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {step === 1 ? "Hủy" : "Quay lại"}
                    </button>
                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={(step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)}
                            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)" }}
                        >
                            Tiếp tục
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            onClick={async () => { 
                                setSubmitError(null);
                                try { 
                                    await onSave({ 
                                        courtTypeId: selectedCourtType.id, 
                                        effectiveFrom: effectiveFrom.includes("T") ? effectiveFrom : `${effectiveFrom}T00:00:00`, 
                                        prices: slotPrices.map(sp => ({ 
                                            startTime: sp.startTime.length === 5 ? `${sp.startTime}:00` : sp.startTime, 
                                            endTime: sp.endTime.length === 5 ? `${sp.endTime}:00` : sp.endTime, 
                                            weekdayPrice: Number(sp.weekday), 
                                            weekendPrice: Number(sp.weekend) 
                                        })) 
                                    }); 
                                    onClose(); 
                                } catch (err) { 
                                    setSubmitError(err instanceof Error ? err.message : "Có lỗi xảy ra");
                                    console.error(err); 
                                } 
                            }}
                            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                            style={{ background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)" }}
                        >
                            <CheckCircle className="h-4 w-4" />
                            Xác nhận tạo bảng giá
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Step Components ──────────────────────────────────────────────────────────

function Step1({
    courtTypes,
    courtTypeId,
    setCourtTypeId,
    effectiveFrom,
    setEffectiveFrom,
}: {
    courtTypes: CourtType[];
    courtTypeId: string;
    setCourtTypeId: (id: string) => void;
    effectiveFrom: string;
    setEffectiveFrom: (date: string) => void;
}) {
    return (
        <div className="space-y-5">
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    Loại sân *
                </label>
                <div className="grid grid-cols-3 gap-3">
                    {courtTypes.map((ct) => (
                        <button
                            key={ct.id}
                            onClick={() => setCourtTypeId(ct.id)}
                            className={`rounded-2xl border-2 p-4 text-center transition-all ${courtTypeId === ct.id
                                    ? "border-[#1B5E38]/40 bg-[#1B5E38]/5"
                                    : "border-slate-200 hover:border-slate-300"
                                }`}
                        >
                            <div
                                className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${courtTypeId === ct.id ? "bg-[#1B5E38]" : "bg-slate-100"
                                    }`}
                            >
                                <Stack
                                    className={`h-5 w-5 ${courtTypeId === ct.id ? "text-white" : "text-slate-400"}`}
                                />
                            </div>
                            <p
                                className={`text-sm font-bold ${courtTypeId === ct.id ? "text-[#1B5E38]" : "text-slate-700"
                                    }`}
                            >
                                {ct.name}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Ngày hiệu lực *
                </label>
                <input
                    type="date"
                    min={todayStr()}
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#1B5E38] focus:ring-4 focus:ring-[#1B5E38]/10"
                />
                <p className="mt-1 text-xs text-slate-500">
                    Bảng giá sẽ được áp dụng từ ngày này trở đi. Các đơn cũ không bị ảnh hưởng.
                </p>
            </div>

            <div className="rounded-2xl border border-[#1B5E38]/15 bg-[#1B5E38]/5 p-4">
                <p className="text-xs font-bold text-[#1B5E38] uppercase tracking-wide mb-2">Lưu ý</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                    Hệ thống không UPDATE giá cũ. Mỗi lần thay đổi sẽ tạo bản ghi mới với ngày hiệu lực.
                    Bảng giá có ngày hiệu lực mới nhất &amp; nhỏ hơn hoặc bằng hôm nay sẽ được áp dụng.
                </p>
            </div>
        </div>
    );
}

function Step2({
    slotPrices,
    updateSlot,
    applyToAll,
}: {
    slotPrices: WizardSlotPrice[];
    updateSlot: (slotId: string, field: "weekday" | "weekend", val: string) => void;
    applyToAll: (field: "weekday" | "weekend", val: string) => void;
}) {
    return (
        <div className="space-y-4">
            {/* Quick-fill row */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3">
                    Điền nhanh cho tất cả slot
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Ngày thường:</span>
                        <div className="relative">
                            <input
                                type="number"
                                min={1000}
                                step={1000}
                                placeholder="30000"
                                className="w-28 rounded-lg border border-slate-200 bg-white pl-3 pr-6 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1B5E38]"
                                onChange={(e) => {
                                    if (e.target.value) applyToAll("weekday", e.target.value);
                                }}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                                đ
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Cuối tuần:</span>
                        <div className="relative">
                            <input
                                type="number"
                                min={1000}
                                step={1000}
                                placeholder="50000"
                                className="w-28 rounded-lg border border-slate-200 bg-white pl-3 pr-6 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#1B5E38]"
                                onChange={(e) => {
                                    if (e.target.value) applyToAll("weekend", e.target.value);
                                }}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                                đ
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slot table */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <span>🕐</span>
                                    Khung giờ
                                </div>
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                Ngày thường (đ)
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                Cuối tuần (đ)
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {slotPrices.map((row, i) => (
                            <tr key={row.slotId} className={`transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                                <td className="px-5 py-2.5">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-[#1B5E38]/10 text-[10px] font-bold text-[#1B5E38]">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm font-semibold text-slate-700">{row.slotLabel}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-2.5">
                                    <div className="relative w-32">
                                        <input
                                            type="number"
                                            min={1000}
                                            step={1000}
                                            value={row.weekday}
                                            onChange={(e) => updateSlot(row.slotId, "weekday", e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 bg-white pl-3 pr-6 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#1B5E38] focus:ring-2 focus:ring-[#1B5E38]/10"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                                            đ
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-2.5">
                                    <div className="relative w-32">
                                        <input
                                            type="number"
                                            min={1000}
                                            step={1000}
                                            value={row.weekend}
                                            onChange={(e) => updateSlot(row.slotId, "weekend", e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 bg-white pl-3 pr-6 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#1B5E38] focus:ring-2 focus:ring-[#1B5E38]/10"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                                            đ
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Step3({
    selectedCourtType,
    effectiveFrom,
    slotPrices,
    submitError,
}: {
    selectedCourtType: CourtType;
    effectiveFrom: string;
    slotPrices: WizardSlotPrice[];
    submitError: string | null;
}) {
    return (
        <div className="space-y-5">
            {submitError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 animate-slide-up">
                    <p className="text-sm font-bold text-red-700">Lỗi khi tạo bảng giá</p>
                    <p className="text-sm text-red-600 mt-1">{submitError}</p>
                </div>
            )}
            <div className="rounded-2xl border border-[#1B5E38]/20 bg-[#1B5E38]/5 p-5">
                <p className="text-xs font-bold text-[#1B5E38] uppercase tracking-wide mb-3">Tóm tắt</p>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600 font-semibold">Loại sân</span>
                        <span className="font-bold text-slate-900">{selectedCourtType.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600 font-semibold">Ngày hiệu lực</span>
                        <span className="font-bold text-slate-900">{fmtDate(effectiveFrom)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600 font-semibold">Số slot</span>
                        <span className="font-bold text-slate-900">{slotPrices.length} khung giờ</span>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 grid grid-cols-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <span>Khung giờ</span>
                    <span>Ngày thường</span>
                    <span>Cuối tuần</span>
                </div>
                <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                    {slotPrices.map((row) => (
                        <div key={row.slotId} className="grid grid-cols-3 px-5 py-2.5 text-sm hover:bg-slate-50/50">
                            <span className="font-semibold text-slate-700">{row.slotLabel}</span>
                            <span className="font-bold text-slate-900">{fmt(Number(row.weekday))}</span>
                            <span className="font-bold text-slate-900">{fmt(Number(row.weekend))}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">⚠ Lưu ý trước khi xác nhận</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                    Sau khi tạo, bảng giá sẽ có hiệu lực từ <strong>{fmtDate(effectiveFrom)}</strong>.
                    Thao tác này không thể hoàn tác. Các đơn đã đặt trước đó sẽ không bị ảnh hưởng.
                </p>
            </div>
        </div>
    );
}
