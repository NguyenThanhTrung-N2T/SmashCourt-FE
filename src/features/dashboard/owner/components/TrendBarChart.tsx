import React from "react";

interface BarData {
    totalCount: number;
    completedCount: number;
    label: string;
    isToday?: boolean;
}

interface TrendBarChartProps {
    data: BarData[];
    height?: string;
}

export const TrendBarChart: React.FC<TrendBarChartProps> = ({
    data,
    height = "h-48",
}) => {
    const maxVal = Math.max(...data.map(d => d.totalCount), 1);

    return (
        <div className={`${height} flex items-end justify-between gap-2`}>
            {data.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2.5 h-full group">
                    <div className="relative flex-1 w-full max-w-[40px] flex items-end justify-center">
                        {/* Hover tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-inverse text-inverse text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-10 pointer-events-none border border-white/10">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#A7D7B8]" />
                                    <span>Tổng: {bar.totalCount}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#1B5E38]" />
                                    <span>Hoàn thành: {bar.completedCount}</span>
                                </div>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-surface-inverse" />
                        </div>

                        {/* Track */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full rounded-full bg-slate-100 dark:bg-slate-700/50" style={{ height: "100%" }} />

                        {/* Total Bar (Pale Green) */}
                        <div
                            className="absolute bottom-0 w-full rounded-full overflow-hidden transition-all duration-500"
                            style={{
                                height: `${(bar.totalCount / maxVal) * 100}%`,
                                background: "#A7D7B8",
                            }}
                        >
                            {/* Completed Portion */}
                            <div
                                className="absolute bottom-0 left-0 w-full rounded-full transition-all duration-500"
                                style={{
                                    height:
                                        bar.totalCount > 0
                                            ? `${(bar.completedCount / bar.totalCount) * 100}%`
                                            : "0%",
                                    background:
                                        "linear-gradient(180deg, #2A9D5C 0%, #1B5E38 100%)",
                                    boxShadow: bar.isToday
                                        ? "0 4px 12px rgba(27,94,56,0.30)"
                                        : "none",
                                }}
                            />
                        </div>
                    </div>
                    <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${bar.isToday ? "text-[#1B5E38] dark:text-[#2A9D5C]" : "text-slate-400"
                            }`}
                    >
                        {bar.label}
                    </span>
                </div>
            ))}
        </div>
    );
};
