import {
  Plus,
} from "@phosphor-icons/react";

interface PricingHeaderProps {
    onCreateClick: () => void;
}

export function PricingHeader({ onCreateClick }: PricingHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight text-slate-900">
                    Bảng giá
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-1">
                    Cấu hình giá hệ thống theo khung giờ & loại sân.
                </p>
            </div>
            <button
                onClick={onCreateClick}
                className="inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
                style={{
                    background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)",
                    boxShadow: "0 4px 14px rgba(27, 94, 56, 0.35)",
                }}
            >
                <Plus className="h-4 w-4" />
                Tạo bảng giá mới
            </button>
        </div>
    );
}
