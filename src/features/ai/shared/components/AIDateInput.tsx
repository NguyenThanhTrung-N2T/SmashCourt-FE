"use client";

import { useState, useEffect } from "react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Converts internal yyyy-MM-dd → display dd/MM/yyyy */
function toDisplay(iso: string): string {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    if (!y || !m || !d) return "";
    return `${d}/${m}/${y}`;
}

/** Converts display dd/MM/yyyy → internal yyyy-MM-dd, or null if incomplete/invalid */
function toISO(display: string): string | null {
    const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    const [, d, m, y] = match;
    const day = parseInt(d, 10);
    const month = parseInt(m, 10);
    const year = parseInt(y, 10);
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2000 || year > 2100) return null;
    return `${y}-${m}-${d}`;
}

/**
 * Auto-inserts slashes as the user types digits:
 *   "01"       → "01"
 *   "012"      → "01/2"
 *   "01052"    → "01/05/2"
 *   "01052026" → "01/05/2026"
 */
function applyMask(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

// ---------------------------------------------------------------------------
// AIDateInput
// ---------------------------------------------------------------------------

interface AIDateInputProps {
    /** Internal value: yyyy-MM-dd or "" */
    value: string;
    /** Emits yyyy-MM-dd when the user has typed a valid complete date, or "" on clear */
    onChange: (isoValue: string) => void;
    /** Extra Tailwind classes to apply to the <input> element */
    className?: string;
    /** Accessible id for the input */
    id?: string;
}

/**
 * A masked text input that displays and accepts dates in **dd/MM/yyyy** format
 * while keeping internal state and API values in **yyyy-MM-dd** format.
 *
 * - Slashes are inserted automatically as the user types digits.
 * - `onChange` is only fired when a syntactically valid date is entered.
 * - Partial input is shown visually but not emitted until complete.
 */
export function AIDateInput({ value, onChange, className, id }: AIDateInputProps) {
    const [display, setDisplay] = useState(() => toDisplay(value));

    // Sync display when the parent resets the value externally
    useEffect(() => {
        setDisplay(toDisplay(value));
    }, [value]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const masked = applyMask(e.target.value);
        setDisplay(masked);

        if (masked === "") {
            onChange("");
            return;
        }

        const iso = toISO(masked);
        if (iso) {
            onChange(iso);
        }
        // Partial / invalid input: update display only, don't call onChange
    }

    return (
        <input
            id={id}
            type="text"
            inputMode="numeric"
            value={display}
            onChange={handleChange}
            placeholder="dd/MM/yyyy"
            maxLength={10}
            autoComplete="off"
            className={
                className ??
                "w-full rounded-xl border-2 border-border bg-surface-2 px-3 py-2 text-sm font-medium text-foreground outline-none transition-all focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
            }
        />
    );
}
