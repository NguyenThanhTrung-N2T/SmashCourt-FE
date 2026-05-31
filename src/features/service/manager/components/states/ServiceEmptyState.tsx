import { Coffee, Plus } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui";

interface ServiceEmptyStateProps {
    onCreateClick: () => void;
}

export function ServiceEmptyState({ onCreateClick }: ServiceEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-border bg-surface-1 px-8 py-20 text-center animate-slide-up">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/8 mb-6">
                <Coffee className="h-10 w-10 text-primary/60" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground mb-2">
                Chưa có dịch vụ nào
            </h3>
            <p className="text-sm text-muted max-w-xs mb-8">
                Thêm dịch vụ từ hệ thống để bắt đầu cung cấp cho khách hàng tại chi nhánh này.
            </p>
            <Button variant="primary" size="md" onClick={onCreateClick}>
                <Plus className="h-3.5 w-3.5" />
                Thêm dịch vụ
            </Button>
        </div>
    );
}