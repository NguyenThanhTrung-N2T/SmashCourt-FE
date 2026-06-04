import React from "react";
import { ManagerDashboardActionItemDto } from "@/src/features/report/shared/report.types";
import { formatTimeRange, formatCurrency, getActionTypeConfig } from "../utils/dashboard-helpers";
import { User, Phone, CourtBasketball, Clock, CalendarBlank } from "@phosphor-icons/react";
import { Badge } from "@/src/shared/components/ui/Badge";

interface ActionQueueItemProps {
    action: ManagerDashboardActionItemDto;
    onClick?: () => void;
}

export function ActionQueueItem({ action, onClick }: ActionQueueItemProps) {
    const actionConfig = getActionTypeConfig(action.actionType);
    const createdDate = new Date(action.createdAt);
    const formattedDate = createdDate.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div
            onClick={onClick}
            className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 transition-all duration-200 ${
                onClick ? 'cursor-pointer hover:shadow-md hover:border-primary' : ''
            }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant={actionConfig.variant} size="sm">
                            {actionConfig.label}
                        </Badge>
                    </div>
                    <h4 className="text-sm font-extrabold text-primary truncate">
                        {action.bookingCode}
                    </h4>
                </div>
                <div className="text-right ml-3">
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(action.amount)}
                    </p>
                </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm">
                    <User size={16} weight="duotone" className="text-slate-400 flex-shrink-0" />
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate">
                        {action.customerName}
                    </span>
                </div>

                {action.customerPhone && (
                    <div className="flex items-center gap-2 text-sm">
                        <Phone size={16} weight="duotone" className="text-slate-400 flex-shrink-0" />
                        <span className="font-medium text-slate-500 dark:text-slate-400">
                            {action.customerPhone}
                        </span>
                    </div>
                )}
            </div>

            {/* Courts (if available) */}
            {action.courts.length > 0 && (
                <div className="mb-3">
                    <div className="flex items-start gap-2">
                        <CourtBasketball size={16} weight="duotone" className="text-slate-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-1.5">
                                {action.courts.map((court, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded"
                                    >
                                        {court.courtName}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Time (if available) */}
            {action.startTime && action.endTime && (
                <div className="flex items-center gap-2 text-sm mb-2">
                    <Clock size={16} weight="duotone" className="text-slate-400 flex-shrink-0" />
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                        {formatTimeRange(action.startTime, action.endTime)}
                    </span>
                </div>
            )}

            {/* Created At */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs">
                    <CalendarBlank size={14} weight="duotone" className="text-slate-400 flex-shrink-0" />
                    <span className="font-medium text-slate-400 dark:text-slate-500">
                        Tạo lúc: {formattedDate}
                    </span>
                </div>
            </div>
        </div>
    );
}
