"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  seconds?: number;
  disabled?: boolean;
  label?: string;
  resendLabel?: string;
  onResend: () => void | Promise<void>;
};

export default function CountdownButton({
  seconds = 60,
  disabled,
  label = "Gửi lại OTP",
  resendLabel,
  onResend,
}: Props) {
  const [remaining, setRemaining] = useState(0);

  const isCooldown = remaining > 0;
  const buttonLabel = useMemo(() => {
    if (!isCooldown) return label;
    const r = Math.max(0, remaining);
    return `${resendLabel ?? label} (${r}s)`;
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
    setRemaining(seconds);
    await onResend();
  }

  return (
    <button
      type="button"
      disabled={disabled || isCooldown}
      onClick={handleClick}
      className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {buttonLabel}
    </button>
  );
}
