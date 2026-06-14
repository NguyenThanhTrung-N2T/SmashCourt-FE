import { EmptyState } from '@/src/shared/components/feedback/EmptyState';
import { ChartBar } from '@phosphor-icons/react';

interface ReportEmptyProps {
    message?: string;
}

export function ReportEmpty({ message }: ReportEmptyProps) {
    return (
        <div className="py-12 bg-surface-1 rounded-2xl border border-border">
            <EmptyState
                title="Không có dữ liệu"
                description={message || "Không tìm thấy dữ liệu báo cáo cho khoảng thời gian và tiêu chí đã chọn."}
                icon={<ChartBar size={48} weight="duotone" className="text-muted" />}
            />
        </div>
    );
}
