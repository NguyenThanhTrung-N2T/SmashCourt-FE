import { TableSkeleton } from "@/src/shared/components/feedback";

export function ServiceLoadingState() {
    return (
        <div className="w-full animate-slide-up">
            <TableSkeleton rows={5} columns={6} />
        </div>
    );
}
