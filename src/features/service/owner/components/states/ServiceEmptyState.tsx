import { Coffee, Plus } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";

interface ServiceEmptyStateProps {
    onCreateClick: () => void;
}

export function ServiceEmptyState({ onCreateClick }: ServiceEmptyStateProps) {
    return (
        <div className="rounded-2xl border border-dashed border-border bg-surface-1 px-8 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <Coffee className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Chưa có dịch vụ nào</h3>
            <p className="text-sm text-muted mb-4">
                Tạo mới các sản phẩm như nước giải khát, quần áo hoặc dịch vụ thuê vợt để cung cấp cho người chơi.
            </p>
            <Button variant="primary" onClick={onCreateClick}>
                <Plus className="h-4 w-4" />
                Tạo dịch vụ đầu tiên
            </Button>
        </div>
    );
}
