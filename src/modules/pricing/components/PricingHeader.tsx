import {
  Plus,
} from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";

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
            <Button
                variant="primary"
                size="md"
                onClick={onCreateClick}
            >
                <Plus className="h-3.5 w-3.5" />
                Tạo bảng giá mới
            </Button>
        </div>
    );
}
