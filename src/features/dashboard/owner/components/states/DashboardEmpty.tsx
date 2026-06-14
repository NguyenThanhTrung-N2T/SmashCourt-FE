import React from 'react';
import { ChartLine, Calendar, Info } from '@phosphor-icons/react';
import { EmptyState } from '@/src/shared/components/feedback';

interface DashboardEmptyProps {
    title?: string;
    description?: string;
    icon?: 'chart' | 'calendar' | 'info';
}

export function DashboardEmpty({
    title = "Không có dữ liệu",
    description = "Hiện tại không có dữ liệu để hiển thị cho kỳ này.",
    icon = 'chart'
}: DashboardEmptyProps) {
    const icons = {
        chart: <ChartLine size={48} weight="duotone" />,
        calendar: <Calendar size={48} weight="duotone" />,
        info: <Info size={48} weight="duotone" />
    };

    return (
        <div className="w-full flex items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <EmptyState
                icon={icons[icon]}
                title={title}
                description={description}
            />
        </div>
    );
}
