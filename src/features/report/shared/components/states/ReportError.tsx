import { ErrorState } from '@/src/shared/components/feedback/ErrorState';

interface ReportErrorProps {
    message?: string;
    onRetry?: () => void;
}

export function ReportError({ message, onRetry }: ReportErrorProps) {
    return (
        <div className="py-12 bg-surface-1 rounded-2xl border border-border">
            <ErrorState
                message={message || "Đã có lỗi xảy ra khi tải dữ liệu báo cáo. Vui lòng thử lại sau."}
                onRetry={onRetry}
            />
        </div>
    );
}
