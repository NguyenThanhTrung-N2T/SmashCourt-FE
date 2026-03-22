"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  seconds?: number;
  disabled?: boolean;
  label?: string;
  resendLabel?: string;
  className?: string;
  variant?: "solid" | "outline";
  initialCooldownSeconds?: number;
  onResend: () => void | Promise<void>;
};

export default function CountdownButton({
  seconds = 60,
  disabled,
  label = "Gửi lại OTP",
  resendLabel,
  className,
  variant = "solid",
  initialCooldownSeconds = 0,
  onResend,
}: Props) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, initialCooldownSeconds),
  );

  const isCooldown = remaining > 0;
  const buttonLabel = useMemo(() => {
    if (!isCooldown) return label;
    const safeRemaining = Math.max(0, remaining);
    return `${resendLabel ?? "Chờ"} ${safeRemaining}s`;
  }, [isCooldown, label, remaining, resendLabel]);

  useEffect(() => {
    if (!isCooldown) return;

    const timerId = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isCooldown]);

  async function handleClick() {
    if (disabled || isCooldown) return;

    try {
      await onResend();
      setRemaining(seconds);
    } catch {
      // Keep the button available if resend failed.
    }
  }

  const baseClassName =
    "min-h-10 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out motion-reduce:transition-none active:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed";
  const solidClassName =
    "cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white";
  const outlineIdleClassName =
    "cursor-pointer border-2 border-slate-300 bg-white text-slate-600 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-800";
  const outlineDisabledClassName =
    "cursor-not-allowed border-2 border-slate-200 bg-slate-50 text-slate-400";

  const variantClassName =
    variant === "outline"
      ? isCooldown || disabled
        ? outlineDisabledClassName
        : outlineIdleClassName
      : solidClassName;

  return (
    <button
      type="button"
      disabled={disabled || isCooldown}
      onClick={handleClick}
      className={`${baseClassName} ${variantClassName} ${className ?? ""}`}
    >
      {buttonLabel}
    </button>
  );
}
