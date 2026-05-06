import { Warning } from "@phosphor-icons/react";

interface PricingErrorStateProps {
    message: string;
}

export function PricingErrorState({ message }: PricingErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-1 rounded-4xl border border-red-500/30 shadow-sm mx-8 mt-6">
            <Warning className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-lg font-bold text-red-600">Lỗi khi tải dữ liệu bảng giá</p>
            <p className="text-sm text-red-500 mt-1 max-w-sm">{message}</p>
        </div>
    );
}
