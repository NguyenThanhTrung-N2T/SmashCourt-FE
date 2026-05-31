import { BranchService } from "../../shared/types/service.types";
import { formatCurrency, isEnabled } from "../utils/utils";
import { Badge, Button, SmartImage } from "@/src/shared/components/ui";
import { PencilSimpleLine, Trash, Coffee } from "@phosphor-icons/react";
import { PriceEditInline } from "./PriceEditInline";

interface ServiceCardProps {
    service: BranchService;
    index: number;
    editingServiceId: string | null;
    actionLoading: boolean;
    onEditStart: (service: BranchService) => void;
    onEditCancel: () => void;
    onPriceSave: (serviceId: string, price: number) => Promise<void>;
    onDisable: (service: BranchService) => void;
}

export function ServiceCard({
    service,
    index,
    editingServiceId,
    actionLoading,
    onEditStart,
    onEditCancel,
    onPriceSave,
    onDisable,
}: ServiceCardProps) {
    const active = isEnabled(service.status);
    const isEditing = editingServiceId === service.serviceId;

    return (
        <div
            className="group relative flex flex-col rounded-[24px] border border-border bg-surface-1 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 overflow-hidden animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            {/* Image */}
            <div className="relative aspect-[4/3] w-full bg-surface-2 overflow-hidden border-b border-border">
                {service.serviceDisplayUrl ? (
                    <SmartImage
                        src={service.serviceDisplayUrl}
                        alt={service.serviceName}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary/40">
                        <Coffee className="h-16 w-16 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                    <Badge
                        variant={active ? "success" : "neutral"}
                        size="sm"
                        className="shadow-md backdrop-blur-md bg-white/90 dark:bg-slate-900/90 font-black uppercase text-[9px] tracking-widest px-2.5 py-1 border-none"
                    >
                        {active ? "Đang hoạt động" : "Đã tắt"}
                    </Badge>
                </div>

                {/* Hover action overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <Button
                        size="md"
                        variant="secondary"
                        onClick={() => onEditStart(service)}
                        className="rounded-full bg-white text-slate-900 hover:bg-white/90 border-none shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75"
                    >
                        <PencilSimpleLine className="h-4 w-4" />
                    </Button>
                    <Button
                        size="md"
                        variant="danger"
                        onClick={() => onDisable(service)}
                        className="rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-150"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="text-lg font-black text-foreground leading-tight group-hover:text-primary transition-colors">
                        {service.serviceName}
                    </h3>
                    <span className="shrink-0 text-[10px] font-black uppercase tracking-wider bg-surface-3 text-muted px-2 py-1 rounded-lg border border-border">
                        {service.unit}
                    </span>
                </div>

                <p className="text-sm text-muted line-clamp-2 mb-4 min-h-[40px]">
                    {service.description || (
                        <span className="italic opacity-50">Không có mô tả chi tiết</span>
                    )}
                </p>

                <div className="mt-auto pt-4 border-t border-dashed border-border">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
                            Giá chi nhánh
                        </p>
                        {service.effectivePrice !== service.defaultPrice && (
                            <span className="text-sm font-semibold text-muted line-through">
                                {formatCurrency(service.defaultPrice)}đ
                            </span>
                        )}
                    </div>

                    {isEditing ? (
                        <PriceEditInline
                            service={service}
                            actionLoading={actionLoading}
                            onSave={onPriceSave}
                            onCancel={onEditCancel}
                        />
                    ) : (
                        <div
                            className="flex items-end justify-between cursor-pointer group/price"
                            onClick={() => onEditStart(service)}
                        >
                            <p className="text-xl font-black text-foreground group-hover/price:text-primary transition-colors">
                                {formatCurrency(service.effectivePrice)}{" "}
                                <span className="text-xs font-bold text-muted ml-0.5">đ</span>
                            </p>
                            <span className="opacity-0 group-hover/price:opacity-100 transition-opacity text-[10px] font-bold text-primary flex items-center gap-1">
                                <PencilSimpleLine className="h-3 w-3" />
                                Sửa giá
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
