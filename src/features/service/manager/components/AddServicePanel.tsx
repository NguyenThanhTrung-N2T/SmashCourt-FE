import { useState } from "react";
import { Coffee, Plus, ArrowClockwise, X, Check, } from "@phosphor-icons/react";
import type { BranchService, Service } from "../../shared/types/service.types";
import { formatCurrency } from "../utils/utils";
import { SmartImage, Button } from "@/src/shared/components/ui";
import { Portal } from "@/src/shared/components/ui/Portal";


interface AddServicePanelProps {
    availableServices: Service[];
    actionLoading: boolean;
    onAdd: (serviceId: string, price: number) => Promise<void>;
    onClose: () => void;
}

export function AddServicePanel({ availableServices, actionLoading, onAdd, onClose }: AddServicePanelProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [price, setPrice] = useState<string>("");

    const selected = availableServices.find((s) => s.id === selectedId);
    const numericPrice = Number(price);
    const isPriceValid = price !== "" && !isNaN(numericPrice) && numericPrice >= 1;

    const handleSelectService = (service: Service) => {
        setSelectedId(service.id);
        setPrice(String(service.defaultPrice));
    };

    const handleSubmit = async () => {
        if (!selectedId || !isPriceValid) return;
        await onAdd(selectedId, numericPrice);
        onClose();
    };

    return (
        <Portal>
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 animate-fade-in">
                <div className="w-full sm:max-w-lg mx-auto bg-surface-1 rounded-t-[28px] sm:rounded-[28px] border border-border shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <div>
                            <h2 className="text-xl font-black text-foreground">Thêm dịch vụ</h2>
                            <p className="text-sm text-muted mt-0.5">
                                Chọn dịch vụ để thêm vào chi nhánh này
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted hover:bg-surface-3 transition-all"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Service List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-2">
                        {availableServices.length === 0 ? (
                            <div className="text-center py-10 text-muted">
                                <Coffee className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-medium">Tất cả dịch vụ đã được thêm</p>
                            </div>
                        ) : (
                            availableServices.map((service) => {
                                const isSelected = selectedId === service.id;
                                return (
                                    <button
                                        key={service.id}
                                        onClick={() => handleSelectService(service)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${isSelected
                                            ? "border-primary bg-primary/5"
                                            : "border-border bg-surface-2 hover:border-primary/40 hover:bg-surface-1"
                                            }`}
                                    >
                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-3 border border-border">
                                            {service.serviceDisplayUrl ? (
                                                <SmartImage
                                                    src={service.serviceDisplayUrl}
                                                    alt={service.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                                                    <Coffee className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-foreground truncate">{service.name}</p>
                                            <p className="text-xs text-muted mt-0.5">
                                                Giá mặc định:{" "}
                                                <span className="text-primary font-bold">
                                                    {formatCurrency(service.defaultPrice)}đ
                                                </span>
                                                {" "}/ {service.unit}
                                            </p>
                                        </div>
                                        <div
                                            className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                ? "border-primary bg-primary"
                                                : "border-border"
                                                }`}
                                        >
                                            {isSelected && <Check className="h-3 w-3 text-white" />}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Price Input & Submit */}
                    {selected && (
                        <div className="p-6 border-t border-border space-y-4">
                            <div>
                                <label className="text-xs font-extrabold uppercase tracking-widest text-muted mb-2 block">
                                    Giá áp dụng tại chi nhánh (đ)
                                </label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full h-11 rounded-xl border border-border bg-surface-2 px-4 text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:font-normal placeholder:text-muted"
                                    placeholder="Nhập giá..."
                                />
                            </div>
                            <Button
                                variant="primary"
                                size="md"
                                onClick={handleSubmit}
                                disabled={!selectedId || !isPriceValid || actionLoading}
                                className="w-full justify-center"
                            >
                                {actionLoading ? (
                                    <ArrowClockwise className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                                Thêm "{selected.name}" vào chi nhánh
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Portal>
    );
}
