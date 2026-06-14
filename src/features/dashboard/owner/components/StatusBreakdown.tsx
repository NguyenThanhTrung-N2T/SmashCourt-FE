import React from "react";

interface StatusBreakdownItem {
    label: string;
    value: number | string;
    percent: number;
    color: string;
}

interface StatusBreakdownProps {
    items: StatusBreakdownItem[];
}

export const StatusBreakdown: React.FC<StatusBreakdownProps> = ({ items }) => {
    return (
        <div className="space-y-4">
            {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-2.5 h-2.5 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            {item.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.value}
                        </span>
                        <span className="text-xs font-medium text-slate-400 min-w-[40px] text-right">
                            ({item.percent}%)
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};
