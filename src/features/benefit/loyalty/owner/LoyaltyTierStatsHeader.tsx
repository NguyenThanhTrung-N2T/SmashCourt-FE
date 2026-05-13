import { Trophy, Percent, Lightning, Users, ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import type { LoyaltyTier } from "@/src/shared/types/loyalty-tier.types";

export function LoyaltyTierStatsHeader({
    tiers,
    loading,
    onRefresh,
}: {
    tiers: LoyaltyTier[];
    loading: boolean;
    onRefresh: () => void;
}) {
    const maxDiscount = tiers.length ? Math.max(...tiers.map((t) => Number(t.discountRate))) : 0;
    const maxPoints = tiers.length ? Math.max(...tiers.map((t) => t.minPoints)) : 0;

    return (
        <>
            {/* Page Header — matches dashboard style */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight text-foreground">
                        Hạng thành viên
                    </h1>
                    <p className="text-sm font-medium text-muted mt-1">
                        Thiết lập ngưỡng điểm xét hạng và tỷ lệ ưu đãi cho hệ thống.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={onRefresh}
                        disabled={loading}
                        leftIcon={<ArrowClockwise className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />}
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Stats Cards — same as dashboard KPI mini-cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { icon: Trophy, val: loading ? "–" : tiers.length, label: "Tổng số hạng" },
                    { icon: Percent, val: loading ? "–" : `${maxDiscount}%`, label: "Giảm giá tối đa" },
                    { icon: Lightning, val: loading ? "–" : maxPoints.toLocaleString("vi-VN"), label: "Ngưỡng điểm kịch trần" },
                    { icon: Users, val: "--", label: "Tổng thành viên (Sắp có)" },
                ].map((s, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-surface-1 p-4 shadow-sm hover:shadow-md transition-all">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <s.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-extrabold text-foreground leading-none">{s.val}</p>
                            <p className="mt-1 text-xs font-semibold text-muted">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
