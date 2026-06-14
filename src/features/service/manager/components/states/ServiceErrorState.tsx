import { Warning, ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui";

interface ServiceErrorStateProps {
    error: string;
    onRetry: () => void;
}

export function ServiceErrorState({ error, onRetry }: ServiceErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-red-500/20 bg-red-500/5 px-8 py-16 text-center animate-slide-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 mb-5">
                <Warning className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-base font-extrabold text-foreground mb-1">
                Không tải được dữ liệu
            </h3>
            <p className="text-sm text-muted max-w-sm mb-6">{error}</p>
            <Button variant="secondary" size="md" onClick={onRetry}>
                <ArrowClockwise className="h-3.5 w-3.5" />
                Thử lại
            </Button>
        </div>
    );
}