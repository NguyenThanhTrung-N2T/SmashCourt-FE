import { useMemo } from "react";
import { MagnifyingGlass, Tag, Megaphone, Percent } from "@phosphor-icons/react";
import { Input } from "@/src/shared/components/ui/Input";
import { Badge } from "@/src/shared/components/ui/Badge";
import type { Promotion } from "@/src/shared/types/promotion.types";
import { getStatusCfg } from "../utils";

export function PromotionListCard({
    promotions,
    selectedId,
    onSelect,
    searchQuery,
    onSearchChange,
}: {
    promotions: Promotion[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    searchQuery: string;
    onSearchChange: (q: string) => void;
}) {
    const filtered = useMemo(() => {
        if (!searchQuery.trim()) return promotions;
        const q = searchQuery.toLowerCase();
        return promotions.filter((p) => p.name.toLowerCase().includes(q));
    }, [promotions, searchQuery]);

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-border bg-surface-1 shadow-lg shadow-border/40">
            <div className="border-b border-border bg-surface-2/50 px-6 py-5">
                <h2 className="text-base font-bold text-foreground">Chương trình</h2>
                <p className="text-xs text-muted">Chọn để xem chi tiết & chỉnh sửa</p>
                <div className="mt-3">
                    <Input
                        leftIcon={<MagnifyingGlass className="h-3.5 w-3.5" />}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Tìm khuyến mãi..."
                        className="py-2 text-xs focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {filtered.length === 0 && (
                    <div className="py-8 text-center">
                        <Tag className="mx-auto h-8 w-8 text-slate-300" />
                        <p className="mt-2 text-sm font-semibold text-slate-400">
                            {searchQuery ? "Không tìm thấy" : "Chưa có khuyến mãi"}
                        </p>
                    </div>
                )}
                {filtered.map((promo) => {
                    const statusCfg = getStatusCfg(promo.status);
                    const isSelected = selectedId === promo.id;

                    return (
                        <button
                            key={promo.id}
                            onClick={() => onSelect(promo.id)}
                            className={`group relative flex w-full items-center gap-4 rounded-2xl border p-3 text-left transition-all duration-200 ${isSelected
                                    ? "border-primary/25 bg-primary/5 shadow-sm ring-1 ring-primary/15"
                                    : "border-transparent hover:border-border bg-transparent hover:bg-surface-1 hover:shadow-sm"
                                }`}
                        >
                            {isSelected && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-[#1B5E38]" />
                            )}
                            <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all ${isSelected
                                        ? "bg-[#1B5E38] shadow-lg shadow-[#1B5E38]/30"
                                        : "bg-slate-100 group-hover:bg-[#1B5E38]/80"
                                    }`}
                            >
                                <Megaphone className="h-6 w-6 text-white drop-shadow-sm" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span
                                        className={`text-sm font-extrabold truncate ${isSelected ? "text-foreground" : "text-foreground"
                                            }`}
                                    >
                                        {promo.name}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    <Badge variant="neutral" size="sm" icon={<Percent className="h-2.5 w-2.5" />}>
                                        {Number(promo.discountRate)}%
                                    </Badge>
                                    <Badge variant={statusCfg.variant} size="sm" dot>
                                        {statusCfg.label}
                                    </Badge>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
