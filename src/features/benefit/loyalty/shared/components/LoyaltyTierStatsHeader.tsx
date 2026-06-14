import { Trophy, Percent, Lightning, Users, ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import type { LoyaltyTier } from "@/src/features/benefit/loyalty/shared/types/loyalty-tier.types";

export function LoyaltyTierStatsHeader({
    tiers,
    loading,
    onRefresh,
    readOnly = false,
}: {
    tiers: LoyaltyTier[];
    loading: boolean;
    onRefresh: () => void;
    readOnly?: boolean;
}) {

    return (
        <>
            {/* Page Header — matches dashboard style */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight text-foreground">
                        Hạng thành viên
                    </h1>
                    <p className="text-sm font-medium text-muted mt-1">
                        {readOnly
                            ? "Xem thông tin ngưỡng điểm và tỷ lệ ưu đãi của hệ thống."
                            : "Thiết lập ngưỡng điểm xét hạng và tỷ lệ ưu đãi cho hệ thống."}
                    </p>
                </div>
                {!readOnly && (
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
                )}
            </div>
        </>
    );
}
