import { Alert } from "@/src/shared/components/ui/Alert";
import { Button } from "@/src/shared/components/ui/Button";
import { ArrowClockwise } from "@phosphor-icons/react";

interface ServiceErrorStateProps {
    error: string;
    onRetry: () => void;
}

export function ServiceErrorState({ error, onRetry }: ServiceErrorStateProps) {
    return (
        <Alert variant="error" title="Không thể tải dữ liệu">
            <p className="mb-3">{error}</p>
            <Button variant="danger" size="sm" onClick={onRetry}>
                <ArrowClockwise className="h-4 w-4" />
                Thử lại
            </Button>
        </Alert>
    );
}
