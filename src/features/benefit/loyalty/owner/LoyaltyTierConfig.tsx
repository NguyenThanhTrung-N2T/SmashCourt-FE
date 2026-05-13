import React from "react";
import {
    Medal,
    Crown,
    Diamond,
    Stack,
    Sparkle,
} from "@phosphor-icons/react";

export type TierCfg = {
    gradient: string;
    gradientText: string;
    icon: React.ElementType;
    saveBg: string;
    pillBg: string;
    pillText: string;
    cardBorder: string;
    cardBg: string;
    formBg: string;
    inputFocus: string;
};

export function getTierCfg(name: string): TierCfg {
    const n = name.toLowerCase();
    if (n.includes("diamond") || n.includes("kim cương"))
        return {
            gradient: "from-violet-500 to-fuchsia-600",
            gradientText: "from-violet-600 to-fuchsia-700 ",
            icon: Diamond,
            saveBg: "bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white",
            pillBg: "bg-violet-100/90",
            pillText: "text-violet-900",
            cardBorder: "border-violet-400 ",
            cardBg: "bg-violet-50/40 ",
            formBg: "bg-violet-50/30 ",
            inputFocus: "focus:border-violet-500 focus:ring-violet-500/20",
        };
    if (n.includes("platinum") || n.includes("bạch kim"))
        return {
            gradient: "from-cyan-300 to-sky-400",
            gradientText: "from-cyan-500 to-sky-600 ",
            icon: Sparkle,
            saveBg: "bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white",
            pillBg: "bg-cyan-100/90",
            pillText: "text-cyan-900",
            cardBorder: "border-cyan-300 ",
            cardBg: "bg-cyan-50/50 ",
            formBg: "bg-cyan-50/40 ",
            inputFocus: "focus:border-cyan-500 focus:ring-cyan-500/20",
        };
    if (n.includes("gold") || n.includes("vàng"))
        return {
            gradient: "from-yellow-400 to-amber-500",
            gradientText: "from-yellow-600 to-amber-700 ",
            icon: Crown,
            saveBg: "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white",
            pillBg: "bg-amber-100/90",
            pillText: "text-amber-900",
            cardBorder: "border-amber-400 ",
            cardBg: "bg-amber-50/40 ",
            formBg: "bg-amber-50/30 ",
            inputFocus: "focus:border-amber-500 focus:ring-amber-500/20",
        };
    if (n.includes("silver") || n.includes("bạc"))
        return {
            gradient: "from-zinc-400 to-zinc-600",
            gradientText: "from-zinc-600 to-zinc-800 ",
            icon: Medal,
            saveBg: "bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-white",
            pillBg: "bg-surface-3",
            pillText: "text-foreground",
            cardBorder: "border-slate-400 ",
            cardBg: "bg-surface-2/80",
            formBg: "bg-surface-2/50",
            inputFocus: "focus:border-slate-500 focus:ring-slate-500/20",
        };
    if (n.includes("bronze") || n.includes("đồng"))
        return {
            gradient: "from-amber-600 to-amber-800",
            gradientText: "from-amber-700 to-amber-900 ",
            icon: Medal,
            saveBg: "bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white",
            pillBg: "bg-orange-100/90",
            pillText: "text-orange-900",
            cardBorder: "border-orange-400 ",
            cardBg: "bg-orange-50/40 ",
            formBg: "bg-orange-50/30 ",
            inputFocus: "focus:border-orange-500 focus:ring-orange-500/20",
        };
    return {
        gradient: "from-slate-400 to-slate-600",
        gradientText: "from-slate-600 to-slate-800 ",
        icon: Stack,
        saveBg: "bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-white",
        pillBg: "bg-surface-3",
        pillText: "text-foreground",
        cardBorder: "border-border/50",
        cardBg: "bg-slate-50/70 ",
        formBg: "bg-surface-2/50",
        inputFocus: "focus:border-slate-500 focus:ring-slate-500/20",
    }
}
