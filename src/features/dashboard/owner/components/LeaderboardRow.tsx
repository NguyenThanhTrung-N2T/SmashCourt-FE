import React from "react";
import { SmartImage } from "@/src/shared/components/ui/SmartImage";

interface LeaderboardRowProps {
    index: number;
    name: string;
    value: string;
    subLabel?: string;
    progress?: number;
    avatar?: string;
    avatarInitials?: string;
    avatarColor?: string;
    avatarTextColor?: string;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
    index,
    name,
    value,
    subLabel,
    progress,
    avatar,
    avatarInitials,
    avatarColor,
    avatarTextColor,
}) => {
    return (
        <div className="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 px-2 -mx-2 rounded-xl transition-colors">
            {/* Rank badge or Avatar */}
            {avatar || avatarInitials ? (
                <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-extrabold border border-slate-200/50 dark:border-slate-700/50 overflow-hidden flex-shrink-0 ${avatarColor || ""} ${avatarTextColor || ""}`}
                >
                    {avatar ? (
                        <SmartImage
                            src={avatar}
                            alt={name}
                            width={36}
                            height={36}
                            className="object-cover"
                        />
                    ) : (
                        avatarInitials
                    )}
                </div>
            ) : (
                <div className="w-7 h-7 flex-shrink-0 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
                    {index}
                </div>
            )}

            {/* Name + stats */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{name}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white shrink-0">{value}</p>
                </div>

                {progress !== undefined ? (
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700/80 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                                width: `${progress}%`,
                                background: "linear-gradient(90deg, #2A9D5C, #1B5E38)",
                            }}
                        />
                    </div>
                ) : (
                    subLabel && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border border-current/20 ${avatarColor} ${avatarTextColor}`}>
                            {subLabel}
                        </span>
                    )
                )}
            </div>
        </div>
    );
};
