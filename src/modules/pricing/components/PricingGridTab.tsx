import {
    Clock,
    PencilSimpleLine,
    Stack,
    Plus,
    ArrowClockwise,
    Tag,
    CaretDown,
} from "@phosphor-icons/react";
import { fmt, fmtDate } from "../utils";
import type { CourtType, PriceConfig, PriceRow, VersionItem } from "../types";

interface PricingGridTabProps {
    selectedCT: CourtType | undefined;
    currentConfig: PriceConfig | null;
    isEditable: boolean;
    versions: VersionItem[];
    selectedVersion: string;
    onVersionChange: (version: string) => void;
    onCreateClick: () => void;
    onEditRow: (row: PriceRow) => void;
    onRefresh: () => void;
    isCourtTypeActive?: boolean;
    onManageCourtTypes?: () => void;
}

export function PricingGridTab({
    selectedCT,
    currentConfig,
    isEditable,
    versions,
    selectedVersion,
    onVersionChange,
    onCreateClick,
    onEditRow,
    onRefresh,
    isCourtTypeActive = true,
    onManageCourtTypes,
}: PricingGridTabProps) {
    if (!selectedCT) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-4xl border border-slate-200 shadow-sm overflow-hidden relative">
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none" />

                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl mb-6 shadow-sm border border-slate-100 bg-white z-10">
                    <div className="absolute inset-0 bg-[#1B5E38]/5 rounded-3xl" />
                    <Stack className="h-10 w-10 text-[#1B5E38]" />
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-amber-400 rounded-full border-2 border-white" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 relative z-10">Chi nhánh chưa có loại sân</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm relative z-10">
                    Bạn cần chọn ít nhất một loại sân từ hệ thống để bắt đầu thiết lập bảng giá cho chi nhánh này.
                </p>
                {onManageCourtTypes && (
                    <button
                        onClick={onManageCourtTypes}
                        className="mt-8 flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-xl shadow-[#1B5E38]/20 hover:-translate-y-1 hover:shadow-[#1B5E38]/30 transition-all relative z-10"
                        style={{ background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)" }}
                    >
                        <Plus className="h-5 w-5" />
                        Thiết lập loại sân ngay
                    </button>
                )}
            </div>
        );
    }

    const canEdit = isEditable && isCourtTypeActive;

    return (
        <div className="rounded-4xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Table header info */}
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)" }}
                    >
                        <Stack className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-extrabold text-slate-900">{selectedCT.name}</p>
                        {!currentConfig && (
                            <p className="text-xs text-slate-500">Chưa có bảng giá</p>
                        )}
                    </div>
                </div>

                {versions.length > 0 && (
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <select
                                value={selectedVersion}
                                onChange={(e) => onVersionChange(e.target.value)}
                                className="appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2 pr-10 text-sm font-bold text-slate-700 outline-none transition-colors hover:border-[#1B5E38] focus:border-[#1B5E38] focus:ring-2 focus:ring-[#1B5E38]/20"
                            >
                                {versions.map((v, i) => {
                                    const vNum = versions.length - i;
                                    return (
                                        <option key={v.effectiveFrom} value={v.effectiveFrom}>
                                            {v.isCurrent ? "Phiên bản hiện tại" : `Phiên bản ${vNum}`} (từ {fmtDate(v.effectiveFrom)})
                                        </option>
                                    );
                                })}
                            </select>
                            <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>
                        <button onClick={onRefresh} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            <ArrowClockwise className="h-4 w-4" />
                            Làm mới
                        </button>
                    </div>
                )}
            </div>

            {!isEditable && currentConfig && (
                <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center gap-2">
                    <p className="text-sm font-semibold text-amber-800">
                        ⚠️ Đây là phiên bản quá khứ (chỉ đọc). Bạn chỉ có thể chỉnh sửa phiên bản mới nhất.
                    </p>
                </div>
            )}

            {!currentConfig ? (
                <div className="flex flex-col items-center justify-center py-24 text-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#1B5E38]/5 to-transparent pointer-events-none" />
                    <div
                        className="relative flex h-20 w-20 items-center justify-center rounded-3xl mb-6 shadow-xl shadow-[#1B5E38]/10 z-10"
                        style={{ background: "linear-gradient(145deg, #2D7A50 0%, #1B5E38 100%)" }}
                    >
                        <Tag className="h-10 w-10 text-white" />
                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100">
                            <Plus className="h-3.5 w-3.5 text-[#1B5E38] font-bold" />
                        </div>
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-800 relative z-10">Chưa có bảng giá nào</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-sm relative z-10">
                        Loại sân <span className="font-bold text-slate-700">{selectedCT.name}</span> chưa được thiết lập giá. Hãy tạo bảng giá đầu tiên để bắt đầu nhận đặt sân.
                    </p>
                    {isCourtTypeActive && (
                        <button
                            onClick={onCreateClick}
                            className="mt-8 flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-xl shadow-[#1B5E38]/20 hover:-translate-y-1 hover:shadow-[#1B5E38]/30 transition-all relative z-10"
                            style={{ background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)" }}
                        >
                            <Plus className="h-5 w-5" />
                            Tạo bảng giá đầu tiên
                        </button>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    {(() => {
                        const hasSource = currentConfig.rows.some((r) => r.priceSource !== undefined);
                        return (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                Khung giờ
                                            </div>
                                        </th>
                                        <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Ngày thường
                                        </th>
                                        <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Cuối tuần
                                        </th>
                                        <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Chênh lệch
                                        </th>
                                        {hasSource && (
                                            <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                                                Nguồn
                                            </th>
                                        )}
                                        {isEditable && (
                                            <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                                                Hành động
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {currentConfig.rows.map((row, i) => {
                                        console.log(row);
                                        const diff = row.weekendPrice - row.weekdayPrice;
                                        const isPeak =
                                            row.slotLabel.startsWith("17") ||
                                            row.slotLabel.startsWith("18") ||
                                            row.slotLabel.startsWith("19") ||
                                            row.slotLabel.startsWith("20");
                                        if (row.priceSource != undefined && row.priceSource !== null) {
                                            console.log(row.priceSource);
                                        }
                                        const isOverride = row.priceSource === "BRANCH_OVERRIDE" &&
                                            (row.weekdayPrice !== row.systemWeekdayPrice || row.weekendPrice !== row.systemWeekendPrice);

                                        return (
                                            <tr
                                                key={row.slotId}
                                                className={`transition-colors group ${isOverride ? "bg-amber-50/50 hover:bg-amber-50" : "hover:bg-[#1B5E38]/3"}`}
                                            >
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-extrabold text-slate-500 shrink-0">
                                                            {i + 1}
                                                        </span>
                                                        <span className="text-sm font-semibold text-slate-800">{row.slotLabel}</span>
                                                        {isPeak && (
                                                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-amber-700">
                                                                Giờ vàng
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-sm font-extrabold text-slate-900">{fmt(row.weekdayPrice)}</span>
                                                        {isOverride && row.systemWeekdayPrice !== undefined && row.systemWeekdayPrice !== row.weekdayPrice && (
                                                            <span className="text-[10px] font-semibold text-amber-600/80">
                                                                gốc: <span className="line-through">{fmt(row.systemWeekdayPrice)}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-sm font-extrabold text-slate-900">{fmt(row.weekendPrice)}</span>
                                                        {isOverride && row.systemWeekendPrice !== undefined && row.systemWeekendPrice !== row.weekendPrice && (
                                                            <span className="text-[10px] font-semibold text-amber-600/80">
                                                                gốc: <span className="line-through">{fmt(row.systemWeekendPrice)}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 text-right">
                                                    <span className="text-xs font-bold text-[#1B5E38]">+{fmt(diff)}</span>
                                                </td>
                                                {hasSource && (
                                                    <td className="px-6 py-3.5 text-center">
                                                        {isOverride ? (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-amber-700 uppercase">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                                Ghi đè
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-slate-600 uppercase">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                                Hệ thống
                                                            </span>
                                                        )}
                                                    </td>
                                                )}
                                                {isEditable && (
                                                    <td className="px-6 py-3.5 text-right">
                                                        <button
                                                            onClick={() => onEditRow(row)}
                                                            disabled={!isCourtTypeActive}
                                                            className={`inline-flex items-center gap-1.5 rounded-xl border border-[#1B5E38]/20 bg-[#1B5E38]/5 px-3 py-1.5 text-xs font-bold text-[#1B5E38] transition-colors ${!isCourtTypeActive ? "opacity-50 cursor-not-allowed" : "hover:bg-[#1B5E38]/10 opacity-0 group-hover:opacity-100"}`}
                                                        >
                                                            <PencilSimpleLine className="h-3 w-3" />
                                                            Cập nhật
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
