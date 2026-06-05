"use client";

import { useState, ReactNode } from "react";
import { Robot, CaretDown } from "@phosphor-icons/react";

// ---------------------------------------------------------------------------
// AIPanelSection
// ---------------------------------------------------------------------------
// A simple controlled collapsible section used to embed AI panels into
// existing management pages without touching any of the existing page logic.
// ---------------------------------------------------------------------------

interface AIPanelSectionProps {
    /** Heading shown in the toggle bar, e.g. "AI Pricing Suggestions" */
    title: string;
    /** The AI panel component to render when expanded */
    children: ReactNode;
    /** Optional max-height for the expanded content area (default: 640px) */
    maxHeight?: string;
    /** Optional accent color for the left border & icon (Tailwind class, default: primary) */
    accentClass?: string;
}

export function AIPanelSection({
    title,
    children,
    maxHeight = "640px",
    accentClass = "text-primary border-primary/40",
}: AIPanelSectionProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`rounded-2xl border bg-surface-1 shadow-sm overflow-hidden border-l-4 ${accentClass}`}>
            {/* ── Toggle header ─────────────────────────────────────── */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
                {/* Robot icon */}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Robot className="h-4 w-4 text-primary" weight="duotone" />
                </span>

                {/* Title */}
                <span className="flex-1 text-sm font-bold text-foreground">
                    {title}
                </span>

                {/* AI badge */}
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    AI
                </span>

                {/* Chevron */}
                <CaretDown
                    className={`h-4 w-4 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                    weight="bold"
                />
            </button>

            {/* ── Collapsible content ────────────────────────────────── */}
            {/*
                We use max-height + opacity transition instead of conditional
                render to avoid remounting (and losing hook state) on close.
            */}
            <div
                className="transition-all duration-300 ease-in-out overflow-hidden"
                style={{
                    maxHeight: isOpen ? maxHeight : "0px",
                    opacity: isOpen ? 1 : 0,
                }}
                aria-hidden={!isOpen}
            >
                <div className="border-t border-border" style={{ height: isOpen ? maxHeight : 0, overflow: "auto" }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
