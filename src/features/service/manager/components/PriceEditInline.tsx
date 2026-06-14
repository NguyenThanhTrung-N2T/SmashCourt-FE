import { useState } from "react";
import { ArrowClockwise, Check, X } from "@phosphor-icons/react";
import { BranchService } from "../../shared/types/service.types";

interface PriceEditProps {
    service: BranchService;
    actionLoading: boolean;
    onSave: (serviceId: string, price: number) => Promise<void>;
    onCancel: () => void;
}

export function PriceEditInline({ service, actionLoading, onSave, onCancel }: PriceEditProps) {
    const [editPrice, setEditPrice] = useState(String(service.effectivePrice));

    const numericPrice = Number(editPrice);
    const isValid = editPrice !== "" && !isNaN(numericPrice) && numericPrice >= 1;

    return (
        <div className="flex items-center gap-2">
            <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Nhập giá..."
                className="h-9 w-full rounded-xl border border-primary bg-surface-2 px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/30 placeholder:font-normal placeholder:text-muted"
                autoFocus
            />
            <button
                disabled={actionLoading || !isValid}
                onClick={() => onSave(service.serviceId, numericPrice)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {actionLoading ? (
                    <ArrowClockwise className="h-4 w-4 animate-spin" />
                ) : (
                    <Check className="h-4 w-4" />
                )}
            </button>
            <button
                onClick={onCancel}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted transition-all hover:bg-surface-3"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
