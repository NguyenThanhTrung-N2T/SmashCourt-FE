import { ArrowClockwise, Plus, Tag, Sparkle, Percent } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { Flex } from "@/src/shared/components/layout/Flex";
import { PromotionStatus } from "@/src/shared/types/promotion.types";
import type { Promotion } from "@/src/shared/types/promotion.types";

export function PromotionStatsHeader({
    promotions,
    loading,
    onRefresh,
    onCreateNew,
}: {
    promotions: Promotion[];
    loading: boolean;
    onRefresh: () => void;
    onCreateNew: () => void;
}) {
    const activeCount = promotions.filter((p) => p.status === PromotionStatus.ACTIVE).length;
    const maxDiscount = promotions.length
        ? Math.max(...promotions.map((p) => Number(p.discountRate)))
        : 0;

    return (
        <>
            {/* Page Header — matches dashboard/service/loyalty style */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight text-foreground">
                        Khuyến mãi
                    </h1>
                    <p className="text-sm font-medium text-muted mt-1">
                        Tạo & quản lý các chương trình khuyến mãi cho hệ thống đặt sân.
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
                    <Button
                        variant="primary"
                        size="md"
                        onClick={onCreateNew}
                        leftIcon={<Plus className="h-3.5 w-3.5" />}
                    >
                        Tạo khuyến mãi
                    </Button>
                </div>
            </div>

            {/* KPI mini-cards — same visual as dashboard/service */}
            <div className="grid gap-4 grid-cols-3">
                {[
                    { icon: Tag, val: loading ? "–" : promotions.length, label: "Tổng số chương trình" },
                    { icon: Sparkle, val: loading ? "–" : activeCount, label: "Đang hoạt động" },
                    { icon: Percent, val: loading ? "–" : `${maxDiscount}%`, label: "Giảm giá cao nhất" },
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

            {/* List section label + action row */}
            <Flex justify="between" align="center" wrap="wrap">
                <Flex align="center" spacing="sm">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">Danh sách khuyến mãi</h2>
                    <span className="inline-flex items-center justify-center rounded-lg bg-surface-3 px-2 py-0.5 text-xs font-bold text-muted">
                        {promotions.length} chương trình
                    </span>
                </Flex>
            </Flex>
        </>
    );
}
