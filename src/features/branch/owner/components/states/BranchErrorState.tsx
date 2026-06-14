import { Warning } from "@phosphor-icons/react";

interface BranchErrorStateProps {
    message: string;
}

export function BranchErrorState({ message }: BranchErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-surface-1 rounded-2xl border border-red-500/30 shadow-sm">
            <Warning className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-lg font-bold text-red-600">Lỗi khi tải dữ liệu</p>
            <p className="text-sm text-red-500 mt-1 max-w-sm">{message}</p>
        </div>
    );
}
