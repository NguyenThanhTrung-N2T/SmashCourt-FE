import {
  Storefront,
  Stack,
  Tag,
  Plus,
} from "@phosphor-icons/react";
import type { CourtType, TabId } from "../types";

interface PricingTabsProps {
    activeTab: TabId;
    onTabChange: (tab: TabId) => void;
    courtTypes: CourtType[];
    selectedCourtType: string;
    onCourtTypeChange: (id: string) => void;
    onManageCourtTypes?: () => void;
}

export function PricingTabs({
    activeTab,
    onTabChange,
    courtTypes,
    selectedCourtType,
    onCourtTypeChange,
    onManageCourtTypes,
}: PricingTabsProps) {
    return (
        <div className="space-y-5">
            {/* Tab bar */}
            <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-100/80 p-1 w-fit">
                {(
                    [
                        { id: "system" as const, label: "Giá hệ thống", icon: Tag },
                        { id: "branch" as const, label: "Giá chi nhánh", icon: Storefront },
                    ] as const
                ).map((t) => {
                    const Icon = t.icon;
                    const active = activeTab === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => onTabChange(t.id)}
                            className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
                                active
                                    ? "bg-white text-[#1B5E38] shadow-md shadow-slate-200/50"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                            }`}
                        >
                            <div
                                className={`flex h-6 w-6 items-center justify-center rounded-lg transition-all ${
                                    active ? "bg-[#1B5E38] shadow-sm" : "bg-slate-200/80"
                                }`}
                            >
                                <Icon className={`h-3 w-3 ${active ? "text-white" : "text-slate-500"}`} />
                            </div>
                            {t.label}
                            {active && (
                                <span className="absolute -bottom-1.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-[#1B5E38]" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Court type pills */}
            <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Lọc theo loại sân</p>
                <div className="flex items-center gap-2 flex-wrap">
                    {courtTypes.map((ct) => (
                        <button
                            key={ct.id}
                            onClick={() => onCourtTypeChange(ct.id)}
                            className={`relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all ${
                                selectedCourtType === ct.id
                                    ? "border-[#1B5E38]/30 bg-[#1B5E38]/8 text-[#1B5E38]"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                        >
                            <Stack
                                className={`h-3.5 w-3.5 ${selectedCourtType === ct.id ? "text-[#1B5E38]" : "text-slate-400"}`}
                            />
                            {ct.name}
                            {selectedCourtType === ct.id && (
                                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#1B5E38] border-2 border-white" />
                            )}
                        </button>
                    ))}
                    {activeTab === "branch" && onManageCourtTypes && (
                        <button
                            onClick={onManageCourtTypes}
                            className="flex items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-500 hover:border-[#1B5E38]/50 hover:text-[#1B5E38] hover:bg-[#1B5E38]/5 transition-all ml-2"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Quản lý loại sân
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
