import React from "react";

interface InsightCardProps {
    icon: React.ElementType;
    label: string;
    value: string;
    bgColor: string;
    iconColor: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
    icon: Icon,
    label,
    value,
    bgColor,
    iconColor,
}) => {
    return (
        <div className="bg-surface-1 border border-border rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-sm">
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: bgColor }}
            >
                <Icon size={24} weight="duotone" style={{ color: iconColor }} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
                    {label}
                </p>
                <p className="text-[17px] font-bold text-foreground leading-tight mt-1 truncate">
                    {value}
                </p>
            </div>
        </div>
    );
};
