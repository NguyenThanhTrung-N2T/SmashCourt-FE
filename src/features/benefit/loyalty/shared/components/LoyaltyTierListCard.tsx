import { Lightning, Percent } from "@phosphor-icons/react";
import type { LoyaltyTier } from "@/src/features/benefit/loyalty/shared/types/loyalty-tier.types";
import { getTierCfg } from "../configs/loyalty-tier.config";

export function LoyaltyTierListCard({
    tiers,
    selectedId,
    onSelect,
}: {
    tiers: LoyaltyTier[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}) {
    return (
        <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-border bg-surface-1 shadow-lg shadow-border/40">
            <div className="border-b border-border bg-surface-2 px-6 py-5">
                <h2 className="text-base font-bold text-foreground">Danh sách hạng</h2>
                <p className="text-xs text-muted">Thứ tự từ hạng mới đến cao nhất</p>
            </div>

            <div className="flex-1 p-3 space-y-2">
                {tiers.map((tier, i) => {
                    const cfg = getTierCfg(tier.name);
                    const Icon = cfg.icon;
                    const isSelected = selectedId === tier.id;

                    return (
                        <button
                            key={tier.id}
                            onClick={() => onSelect(tier.id)}
                            className={`group flex w-full items-center gap-4 rounded-2xl border-2 p-3 text-left transition-all duration-200 hover:shadow-md ${isSelected ? `${cfg.cardBorder} ${cfg.cardBg} shadow-sm` : "border-transparent hover:border-border bg-transparent hover:bg-surface-1"}
 }`}
                        >
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cfg.gradient} shadow-inner`}>
                                <Icon className="h-6 w-6 text-white drop-shadow-sm" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className={`text-sm font-extrabold truncate ${isSelected ? "text-foreground" : "text-muted"}`}>
                                        {tier.name}
                                    </span>
                                    <span className="shrink-0 rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-black text-muted">
                                        #{i + 1}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${cfg.pillBg} ${cfg.pillText}`}>
                                        <Lightning className="h-2.5 w-2.5" /> {tier.minPoints.toLocaleString()} đ
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                                        <Percent className="h-2.5 w-2.5" /> {Number(tier.discountRate)}%
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
