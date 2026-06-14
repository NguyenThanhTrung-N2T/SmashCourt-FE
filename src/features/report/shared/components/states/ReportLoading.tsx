import { CardSkeleton } from '@/src/shared/components/feedback/CardSkeleton';
import { TableSkeleton } from '@/src/shared/components/feedback/TableSkeleton';

export function ReportLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>
            <div className="bg-surface-1 rounded-2xl border border-border p-6">
                <div className="h-64 bg-surface-2 rounded-xl mb-6"></div>
                <TableSkeleton rows={5} />
            </div>
        </div>
    );
}
