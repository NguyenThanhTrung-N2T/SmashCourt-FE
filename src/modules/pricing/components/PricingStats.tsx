import type React from "react";

interface StatItem {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    val: number;
}

interface PricingStatsProps {
    stats: StatItem[];
}

export function PricingStats({ stats }: PricingStatsProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s) => (
                <div
                    key={s.label}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
                >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B5E38]/10 text-[#1B5E38]">
                        <s.icon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-2xl font-extrabold text-slate-900 leading-none">{s.val}</p>
                        <p className="mt-0.5 text-xs font-semibold text-slate-500">{s.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
