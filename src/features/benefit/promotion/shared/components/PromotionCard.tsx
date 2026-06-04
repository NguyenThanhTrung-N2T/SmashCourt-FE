"use client";

import { CalendarBlank, Tag, Ticket, PencilSimple, Trash } from "@phosphor-icons/react";
import { cn } from "@/src/shared/utils/cn";
import type { Promotion } from "@/src/features/benefit/promotion/shared/types/promotion.types";
import { Badge } from "@/src/shared/components/ui/Badge";
import { SmartImage } from "@/src/shared/components/ui/SmartImage";
import { getStatusCfg, formatDate } from "@/src/features/benefit/utils";
import { formatDiscountDisplay } from "@/src/api/promotion.api";

interface PromotionCardProps {
    promotion: Promotion;
    onEdit?: (promotion: Promotion) => void;
    onDelete?: (promotion: Promotion) => void;
    onClick?: (promotion: Promotion) => void;
    readOnly?: boolean;
}

export function PromotionCard({
    promotion,
    onEdit,
    onDelete,
    onClick,
    readOnly = false,
}: PromotionCardProps) {
    const statusCfg = getStatusCfg(promotion.status);

    return (
        <div
            onClick={() => onClick?.(promotion)}
            className={cn(
                "group relative flex flex-row items-center overflow-hidden rounded-2xl border border-border bg-surface-1 p-3 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5",
                onClick && "cursor-pointer"
            )}
        >
            {/* Left Side: Square Image */}
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-border/50 bg-primary/5">
                {promotion.promoDisplayUrl ? (
                    <SmartImage
                        src={promotion.promoDisplayUrl}
                        alt={promotion.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary/40">
                        <div className="absolute inset-0 opacity-[0.08]"
                            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '10px 10px' }}
                        />
                        <Ticket className="h-8 w-8 mb-1" weight="duotone" />
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Ưu đãi</span>
                    </div>
                )}
            </div>

            {/* Right Side: Promotion Content */}
            <div className="ml-4 flex flex-1 flex-col justify-center min-w-0">
                <div className="space-y-1">
                    {/* Header: Title and Status */}
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-1 text-[13px] font-bold text-foreground" title={promotion.name}>
                            {promotion.name}
                        </h3>
                        <Badge variant={statusCfg.variant} size="sm" className="h-[22px] px-1.5 text-[10px] shrink-0">
                            {statusCfg.label}
                        </Badge>
                    </div>

                    {/* Discount Display */}
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-primary leading-none">
                            {formatDiscountDisplay(promotion)}
                        </span>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2">
                    {/* Code or Expiry */}
                    {promotion.code && (
                        <div className="flex items-center gap-1.5 text-primary">
                            <Tag className="h-3.5 w-3.5" weight="bold" />
                            <span className="font-mono text-[14px] font-bold tracking-tight">{promotion.code}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <CalendarBlank className="h-3.5 w-3.5" />
                        <span className="truncate">Đến {formatDate(promotion.endDate)}</span>
                    </div>

                    {/* Action Buttons - Only show if NOT readOnly and handlers provided */}
                    {!readOnly && (onEdit || onDelete) && (
                        <div className="flex gap-1 shrink-0">
                            {onEdit && (
                                <button
                                    onClick={() => onEdit(promotion)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                                    aria-label="Chỉnh sửa khuyến mãi"
                                >
                                    <PencilSimple className="h-4 w-4" weight="bold" />
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={() => onDelete(promotion)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-500/10 hover:text-red-500 text-muted-foreground transition-colors"
                                    aria-label="Xóa khuyến mãi"
                                >
                                    <Trash className="h-4 w-4" weight="bold" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
