"use client";

import { useState, useRef, useEffect } from "react";
import {
    X,
    ShieldCheck,
    ShieldSlash,
    EnvelopeSimple,
    Warning,
} from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui";

// ─── Constants ───────────────────────────────────────────────────────────────
const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 5 * 60; // matches backend: 5 minutes

function useCountdown(totalSeconds: number, active: boolean) {
    const [prevActive, setPrevActive] = useState(active);
    const [prevTotalSeconds, setPrevTotalSeconds] = useState(totalSeconds);
    const [remaining, setRemaining] = useState(totalSeconds);

    if (active !== prevActive || totalSeconds !== prevTotalSeconds) {
        setPrevActive(active);
        setPrevTotalSeconds(totalSeconds);
        setRemaining(totalSeconds);
    }

    useEffect(() => {
        if (!active) return;

        const id = setInterval(() => {
            setRemaining((r) => Math.max(0, r - 1));
        }, 1000);

        return () => clearInterval(id);
    }, [active, totalSeconds]);

    const mm = Math.floor(remaining / 60).toString().padStart(2, "0");
    const ss = (remaining % 60).toString().padStart(2, "0");

    return { remaining, formatted: `${mm}:${ss}` };
}

// ─── OTP digit inputs ─────────────────────────────────────────────────────────
interface OtpInputProps {
    value: string;
    onChange: (v: string) => void;
    disabled: boolean;
    hasError: boolean;
}

function OtpInput({ value, onChange, disabled, hasError }: OtpInputProps) {
    const refs = useRef<(HTMLInputElement | null)[]>([]);
    const digits = value.padEnd(OTP_LENGTH, " ").split("").slice(0, OTP_LENGTH);

    useEffect(() => {
        refs.current[0]?.focus();
    }, []); // auto-focus on mount

    const update = (index: number, char: string) => {
        const next = [...digits];
        next[index] = char.replace(/\D/g, "").slice(-1) || " ";
        onChange(next.join("").trimEnd());
        if (char && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            if (digits[index].trim()) {
                const next = [...digits];
                next[index] = " ";
                onChange(next.join("").trimEnd());
            } else if (index > 0) {
                refs.current[index - 1]?.focus();
                const next = [...digits];
                next[index - 1] = " ";
                onChange(next.join("").trimEnd());
            }
        }
        if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
        if (e.key === "ArrowRight" && index < OTP_LENGTH - 1)
            refs.current[index + 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, OTP_LENGTH);
        onChange(pasted);
        refs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

    return (
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {Array.from({ length: OTP_LENGTH }).map((_, i) => {
                const filled = digits[i]?.trim();
                return (
                    <input
                        key={i}
                        ref={(el) => {
                            refs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={filled || ""}
                        disabled={disabled}
                        onChange={(e) => update(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className={[
                            "w-11 h-14 text-center text-xl font-bold rounded-xl border-2",
                            "bg-background transition-all duration-150 focus:outline-none",
                            "disabled:opacity-40 disabled:cursor-not-allowed",
                            hasError
                                ? "border-red-400 dark:border-red-500 text-red-600 dark:text-red-400"
                                : filled
                                    ? "border-primary text-foreground"
                                    : "border-border text-muted focus:border-primary",
                        ].join(" ")}
                    />
                );
            })}
        </div>
    );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export interface OtpModalProps {
    open: boolean;
    /** Whether the OTP is for enabling or disabling 2FA. Also used for login flow — pass null when used outside of 2FA settings. */
    action: "enable" | "disable" | "login" | null;
    isLoading: boolean;
    error: string | null;
    onVerify: (otp: string) => void;
    onResend: () => void;
    onCancel: () => void;
}

export function OtpModal({
    open,
    action,
    isLoading,
    error,
    onVerify,
    onResend,
    onCancel,
}: OtpModalProps) {
    const [otp, setOtp] = useState("");
    const [prevOpen, setPrevOpen] = useState(open);

    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setOtp("");
        }
    }

    const { remaining, formatted } = useCountdown(OTP_EXPIRY_SECONDS, open);
    const isExpired = remaining === 0;
    const filled = otp.trim().length === OTP_LENGTH;

    if (!open) return null;

    const isEnable = action === "enable";
    const isDisable = action === "disable";

    const icon = isEnable ? (
        <ShieldCheck
            className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
            weight="fill"
        />
    ) : (
        <ShieldSlash
            className="h-6 w-6 text-red-600 dark:text-red-400"
            weight="fill"
        />
    );

    const iconBg = isEnable
        ? "bg-emerald-100 dark:bg-emerald-900/30"
        : "bg-red-100 dark:bg-red-900/30";

    const title = isEnable
        ? "Bật xác thực 2 lớp"
        : isDisable
            ? "Tắt xác thực 2 lớp"
            : "Xác thực 2 yếu tố";

    const confirmLabel = isEnable ? "Bật 2FA" : isDisable ? "Tắt 2FA" : "Xác nhận";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Card */}
            <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${iconBg}`}>{icon}</div>
                        <div>
                            <h3 className="font-bold text-foreground text-lg">{title}</h3>
                            <p className="text-sm text-muted">
                                Nhập mã OTP được gửi về email của bạn
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Email hint */}
                <div className="flex items-center gap-2 px-3 py-2.5 bg-surface-2 rounded-xl text-sm text-muted">
                    <EnvelopeSimple className="h-4 w-4 shrink-0" />
                    <span>
                        Mã có hiệu lực trong{" "}
                        <span className="font-semibold text-foreground">5 phút</span>
                    </span>
                </div>

                {/* OTP inputs */}
                <OtpInput
                    value={otp}
                    onChange={setOtp}
                    disabled={isLoading || isExpired}
                    hasError={!!error}
                />

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
                        <Warning className="h-4 w-4 shrink-0" weight="fill" />
                        {error}
                    </div>
                )}

                {/* Countdown / resend */}
                <p className="text-center text-sm text-muted">
                    {isExpired ? (
                        <>
                            OTP đã hết hạn.{" "}
                            <button
                                onClick={() => {
                                    setOtp("");
                                    onResend();
                                }}
                                className="text-primary font-semibold hover:underline"
                            >
                                Gửi lại
                            </button>
                        </>
                    ) : (
                        <>
                            Hết hạn sau{" "}
                            <span
                                className={`font-mono font-bold tabular-nums ${remaining < 60 ? "text-red-500" : "text-foreground"
                                    }`}
                            >
                                {formatted}
                            </span>
                        </>
                    )}
                </p>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                    <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button
                        className="flex-1"
                        onClick={() => onVerify(otp.trim())}
                        isLoading={isLoading}
                        disabled={isLoading || !filled || isExpired}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}