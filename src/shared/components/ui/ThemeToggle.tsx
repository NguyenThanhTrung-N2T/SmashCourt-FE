"use client";

import { useTheme } from "@/src/contexts/ThemeContext";
import { Sun, Moon, Monitor } from "@phosphor-icons/react";
import type { ThemePreference } from "@/src/shared/types/theme.types";

type ThemeToggleProps = {
    /** Visual style variant */
    variant?: "icon" | "pill";
    /** Extra className */
    className?: string;
};

const CYCLE: ThemePreference[] = ["light", "dark", "system"];

const ICON_MAP: Record<ThemePreference, React.ElementType> = {
    light: Sun,
    dark: Moon,
    system: Monitor,
};

const LABEL_MAP: Record<ThemePreference, string> = {
    light: "Sáng",
    dark: "Tối",
    system: "Hệ thống",
};

export default function ThemeToggle({
    variant = "icon",
    className = "",
}: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();

    function handleClick() {
        const currentIndex = CYCLE.indexOf(theme);
        const nextIndex = (currentIndex + 1) % CYCLE.length;
        setTheme(CYCLE[nextIndex]);
    }

    const Icon = ICON_MAP[theme];
    const label = LABEL_MAP[theme];

    if (variant === "pill") {
        return (
            <button
                onClick={handleClick}
                aria-label={`Chuyển sang chế độ ${LABEL_MAP[CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length]]}`}
                title={`Đang dùng: ${label}`}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200
 bg-surface-3 text-muted
 hover:bg-surface-3
 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E38]
 ${className}`}
            >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{label}</span>
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            aria-label={`Chuyển sang chế độ ${LABEL_MAP[CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length]]}`}
            title={`Đang dùng: ${label}`}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full
 bg-surface-1
 text-muted
 shadow-sm hover:text-foreground
 hover:bg-surface-2
 transition-all duration-200
 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E38]
 ${className}`}
        >
            <span
                key={theme}
                className="flex items-center justify-center animate-[auth-scale-in_0.2s_ease-out_both]"
            >
                <Icon className="h-[18px] w-[18px]" />
            </span>
        </button>
    );
}
