import { Skeleton } from "@/src/shared/components/feedback";

interface CustomerTableLoadingProps {
    isOwner?: boolean;
    rowCount?: number;
}

export function CustomerTableLoading({ isOwner = false, rowCount = 5 }: CustomerTableLoadingProps) {
    return (
        <div className="rounded-2xl border border-border bg-surface-1 shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full">
                    <thead className="bg-surface-2 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                                Khách hàng
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                                Liên hệ
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                                Hạng thành viên
                            </th>
                            {isOwner && (
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                                    Điểm tích lũy
                                </th>
                            )}
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                                Số booking
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                                Trạng thái
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                                Ngày tạo
                            </th>
                            {isOwner && (
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted">
                                    Thao tác
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {Array.from({ length: rowCount }).map((_, index) => (
                            <tr key={index} className="animate-pulse hover:bg-surface-2 transition-colors cursor-pointer">
                                {/* Customer Name */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Skeleton className="h-5 w-32" />
                                </td>
                                
                                {/* Contact */}
                                <td className="px-6 py-4 min-w-[200px]">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        {isOwner && <Skeleton className="h-4 w-40" />}
                                    </div>
                                </td>
                                
                                {/* Loyalty Tier */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Skeleton className="h-7 w-20 rounded-full" />
                                </td>
                                
                                {/* Points (Owner only) */}
                                {isOwner && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Skeleton className="h-5 w-16" />
                                    </td>
                                )}
                                
                                {/* Booking Count */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Skeleton className="h-5 w-8" />
                                </td>
                                
                                {/* Status */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                </td>
                                
                                {/* Created Date */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Skeleton className="h-4 w-24" />
                                </td>
                                
                                {/* Actions (Owner only) */}
                                {isOwner && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Skeleton className="h-8 w-20 rounded-xl" />
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
