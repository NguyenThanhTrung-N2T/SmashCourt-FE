import {
  Storefront,
  Stack,
  Tag,
  Plus,
} from "@phosphor-icons/react";
import type { CourtType, TabId } from "../../types";

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
            <div className="flex items-center gap-1 rounded-2xl border border-border bg-surface-2 p-1 w-fit">
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
                                    ? "bg-surface-1 text-primary shadow-md"
                                    : "text-muted hover:text-foreground hover:bg-surface-1/50"
                            }`}
                        >
                            <div
                                className={`flex h-6 w-6 items-center justify-center rounded-lg transition-all ${
                                    active ? "bg-primary shadow-sm" : "bg-surface-3"
                                }`}
                            >
                                <Icon className={`h-3 w-3 ${active ? "text-white" : "text-muted"}`} />
                            </div>
                            {t.label}
                            {active && (
                                <span className="absolute -bottom-1.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Court type pills */}
            <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wide mb-3">Lọc theo loại sân</p>
                <div className="flex items-center gap-2 flex-wrap">
                    {courtTypes.map((ct) => (
                        <button
                            key={ct.id}
                            onClick={() => onCourtTypeChange(ct.id)}
                            className={`relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all ${
                                selectedCourtType === ct.id
                                    ? "border-primary/30 bg-primary/8 text-primary"
                                    : "border-border bg-surface-1 text-muted hover:border-border hover:bg-surface-2 hover:text-foreground"
                            }`}
                        >
                            <Stack
                                className={`h-3.5 w-3.5 ${selectedCourtType === ct.id ? "text-primary" : "text-muted"}`}
                            />
                            {ct.name}
                            {selectedCourtType === ct.id && (
                                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-surface-1" />
                            )}
                        </button>
                    ))}
                    {activeTab === "branch" && onManageCourtTypes && (
                        <button
                            onClick={onManageCourtTypes}
                            className="flex items-center gap-1.5 rounded-full border border-dashed border-border bg-surface-1 px-4 py-2 text-sm font-bold text-muted hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all ml-2"
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
