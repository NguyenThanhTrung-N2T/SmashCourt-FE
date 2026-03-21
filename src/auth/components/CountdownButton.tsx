"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  seconds?: number;
  disabled?: boolean;
  label?: string;
  resendLabel?: string;
  variant?: "solid" | "outline";
  /**
   * Đếm ngược ngay khi hiển thị — nút chỉ bật sau N giây (OTP vừa được gửi).
   */
  initialCooldownSeconds?: number;
  onResend: () => void | Promise<void>;
};

export default function CountdownButton({
  seconds = 60,
  disabled,
  label = "Gửi lại OTP",
  resendLabel,
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
    const r = Math.max(0, remaining);
    return `${resendLabel ?? "Chờ"} ${r}s`;
  }, [isCooldown, label, remaining, resendLabel]);

  useEffect(() => {
    if (!isCooldown) return;

    const id = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [isCooldown]);

  async function handleClick() {
    if (disabled || isCooldown) return;
    try {
      await onResend();
      setRemaining(seconds);
    } catch {
      // Không bật cooldown nếu gửi lại thất bại
    }
  }

  const base =
    "min-h-10 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out motion-reduce:transition-none active:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed";
  const solid =
    "cursor-pointer bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white";
  const outlineIdle =
    "cursor-pointer border-2 border-slate-400 bg-white font-bold text-slate-900 shadow-sm " +
    "hover:border-emerald-600 hover:bg-emerald-100 hover:text-emerald-950 hover:shadow-md " +
    "dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 " +
    "dark:hover:border-emerald-500 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-100";
  const outlineWait =
    "cursor-not-allowed border-2 border-slate-200 bg-slate-50 text-slate-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400";

  const outlineClass =
    variant === "outline"
      ? isCooldown || disabled
        ? outlineWait
        : outlineIdle
      : "";

  const solidClass = variant === "solid" ? solid : "";

  return (
    <button
      type="button"
      disabled={disabled || isCooldown}
      onClick={handleClick}
      className={`${base} ${variant === "outline" ? outlineClass : solidClass}`}
    >
      {buttonLabel}
    </button>
  );
}
