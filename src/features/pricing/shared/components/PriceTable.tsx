import { Skeleton } from "@/src/shared/components/feedback";
import { UpsertSystemPriceItem } from "@/src/features/pricing/shared/types/pricing.types";
import { cn } from "@/src/shared/utils/cn";

// Normalise HH:mm:ss → HH:mm for display / select comparison
const toHHmm = (t: string) => t.slice(0, 5);
const fmt = (n?: number) => (n != null ? n.toLocaleString("vi-VN") + "đ" : "—");

export function PriceTable({ slots, compact = false }: { slots: UpsertSystemPriceItem[]; compact?: boolean }) {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-surface-2/50 border-b border-border">
                        <th className={cn(
                            "text-left text-[10px] font-bold text-muted uppercase tracking-wider",
                            compact ? "px-4 py-3" : "px-6 py-4"
                        )}>
                            Khung giờ
                        </th>
                        <th className={cn(
                            "text-right text-[10px] font-bold text-muted uppercase tracking-wider",
                            compact ? "px-4 py-3" : "px-6 py-4"
                        )}>
                            Ngày thường
                        </th>
                        <th className={cn(
                            "text-right text-[10px] font-bold text-muted uppercase tracking-wider",
                            compact ? "px-4 py-3" : "px-6 py-4"
                        )}>
                            Cuối tuần
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                    {slots.map((s, i) => (
                        <tr
                            key={i}
                            className="hover:bg-surface-2/30 transition-colors duration-150 group"
                        >
                            <td className={cn(
                                "font-bold text-foreground",
                                compact ? "px-4 py-3 text-xs" : "px-6 py-4 text-sm"
                            )}>
                                {toHHmm(s.startTime)} – {toHHmm(s.endTime)}
                            </td>
                            <td className={cn(
                                "text-right font-bold text-primary",
                                compact ? "px-4 py-3 text-xs" : "px-6 py-4 text-sm"
                            )}>
                                {fmt(s.weekdayPrice)}
                            </td>
                            <td className={cn(
                                "text-right font-bold text-amber-600",
                                compact ? "px-4 py-3 text-xs" : "px-6 py-4 text-sm"
                            )}>
                                {fmt(s.weekendPrice)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export function PriceTableSkeleton({ compact = false }: { compact?: boolean }) {
    return (
        <div className="w-full">
            <table className="w-full border-collapse">
                <tbody>
                    {[1, 2, 3, 4].map(i => (
                        <tr key={i} className="border-b border-border/40">
                            <td className={cn("w-1/3", compact ? "px-4 py-3" : "px-6 py-4")}>
                                <Skeleton className="h-4 w-24" />
                            </td>
                            <td className={cn(compact ? "px-4 py-3" : "px-6 py-4")}>
                                <Skeleton className="h-4 w-16 ml-auto" />
                            </td>
                            <td className={cn(compact ? "px-4 py-3" : "px-6 py-4")}>
                                <Skeleton className="h-4 w-16 ml-auto" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
