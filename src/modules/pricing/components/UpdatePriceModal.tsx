import { useState } from "react";
import {
  CheckCircle,
  PencilSimpleLine,
  X,
} from "@phosphor-icons/react";
import { fmt, todayStr } from "../utils";
import type { PriceRow } from "../types";

interface UpdatePriceModalProps {
    row: PriceRow;
    onClose: () => void;
    onSave: (patch: {
        applyAll: boolean;
        effectiveFrom: string;
        weekday: number;
        weekend: number;
    }) => void;
}

export function UpdatePriceModal({ row, onClose, onSave }: UpdatePriceModalProps) {
    const [effectiveFrom, setEffectiveFrom] = useState(todayStr());
    const [applyAll, setApplyAll] = useState(false);
    const [weekday, setWeekday] = useState(String(row.weekdayPrice));
    const [weekend, setWeekend] = useState(String(row.weekendPrice));

    function handleSave() {
        const wd = Number(weekday);
        const we = Number(weekend);
        if (!effectiveFrom || isNaN(wd) || wd < 1 || isNaN(we) || we < 1) return;
        if (effectiveFrom < todayStr()) {
            alert("Ngày áp dụng không được ở trong quá khứ");
            return;
        }
        onSave({ applyAll, effectiveFrom, weekday: wd, weekend: we });
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-slide-up">
                {/* Header */}
                <div
                    className="px-6 py-5 flex items-center justify-between"
                    style={{ background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)" }}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                            <PencilSimpleLine className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-green-200 uppercase tracking-wide">Cập nhật giá</p>
                            <p className="text-sm font-bold text-white">{row.slotLabel}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Effective from */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                            Áp dụng từ ngày *
                        </label>
                        <input
                            type="date"
                            min={todayStr()}
                            value={effectiveFrom}
                            onChange={(e) => setEffectiveFrom(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#1B5E38] focus:ring-4 focus:ring-[#1B5E38]/10"
                        />
                    </div>

                    {/* Apply scope */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                            Phạm vi áp dụng
                        </label>
                        <div className="space-y-2">
                            {[
                                { value: false, label: "Chỉ slot này", sub: row.slotLabel },
                                { value: true, label: "Tất cả slot", sub: "Áp dụng cho toàn bộ khung giờ" },
                            ].map((opt) => (
                                <button
                                    key={String(opt.value)}
                                    onClick={() => setApplyAll(opt.value)}
                                    className={`w-full flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-all ${applyAll === opt.value
                                            ? "border-[#1B5E38]/40 bg-[#1B5E38]/5"
                                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                >
                                    <div
                                        className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${applyAll === opt.value ? "border-[#1B5E38] bg-[#1B5E38]" : "border-slate-300"
                                            }`}
                                    >
                                        {applyAll === opt.value && (
                                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{opt.label}</p>
                                        <p className="text-xs text-slate-500">{opt.sub}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {applyAll && (
                            <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2 animate-slide-up">
                                <p className="text-xs font-semibold text-amber-800">
                                    ⚠️ Lưu ý: Tùy chọn này sẽ ghi đè giá cho TẤT CẢ các khung giờ của loại sân này.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Price inputs */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                                Ngày thường
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min={1000}
                                    step={1000}
                                    value={weekday}
                                    onChange={(e) => setWeekday(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-8 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#1B5E38] focus:ring-4 focus:ring-[#1B5E38]/10"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">đ</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                                Cuối tuần
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min={1000}
                                    step={1000}
                                    value={weekend}
                                    onChange={(e) => setWeekend(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-8 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#1B5E38] focus:ring-4 focus:ring-[#1B5E38]/10"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">đ</span>
                            </div>
                        </div>
                    </div>

                    {/* Preview diff */}
                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Xem trước thay đổi</p>
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase">Ngày thường</p>
                                <p className="text-base font-extrabold text-slate-400 line-through">{fmt(row.weekdayPrice)}</p>
                                <p className="text-lg font-extrabold text-[#1B5E38]">
                                    {Number(weekday) > 0 ? fmt(Number(weekday)) : "–"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-semibold uppercase">Cuối tuần</p>
                                <p className="text-base font-extrabold text-slate-400 line-through">{fmt(row.weekendPrice)}</p>
                                <p className="text-lg font-extrabold text-[#1B5E38]">
                                    {Number(weekend) > 0 ? fmt(Number(weekend)) : "–"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)" }}
                    >
                        <CheckCircle className="h-4 w-4" />
                        Lưu bảng giá
                    </button>
                </div>
            </div>
        </div>
    );
}
