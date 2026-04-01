"use client";

import { useEffect, useMemo, useRef } from "react";

type Props = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

export default function OtpInput({
  value,
  onChange,
  disabled,
  autoFocus,
}: Props) {
  const digits = useMemo(() => value.replace(/\D/g, "").slice(0, 6), [value]);
  const values = useMemo(() => {
    const arr = Array.from({ length: 6 }, (_, i) => digits[i] ?? "");
    return arr;
  }, [digits]);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const didInitialFocus = useRef(false);

  // Chỉ focus ô đầu một lần khi mount — tránh cướp focus khi user chọn ô khác.
  useEffect(() => {
    if (!autoFocus || didInitialFocus.current) return;
    didInitialFocus.current = true;
    requestAnimationFrame(() => {
      inputRefs.current[0]?.focus();
    });
  }, [autoFocus]);

  function commitAt(index: number, rawChar: string) {
    const char = rawChar.replace(/\D/g, "").slice(-1) || "";
    const next = values.map((v, i) => {
      if (i !== index) return v;
      return char;
    });
    const joined = next.join("").replace(/\D/g, "").slice(0, 6);
    onChange(joined);
  }

  // Đồng bộ với input đăng ký: nền slate-50, viền slate-200, chữ slate (không đen đậm)
  const boxClass =
    "flex h-14 w-11 shrink-0 cursor-pointer rounded-xl border-2 border-slate-200 bg-slate-50 text-center text-2xl font-semibold tabular-nums text-slate-700 shadow-sm outline-none " +
    "transition-all duration-200 ease-out motion-reduce:transition-none " +
    "hover:border-emerald-500 hover:bg-emerald-50 hover:text-slate-900 hover:shadow-md hover:ring-2 hover:ring-emerald-200/90 " +
    "active:scale-[0.97] motion-reduce:active:scale-100 " +
    "focus:border-emerald-600 focus:bg-white focus:text-slate-900 focus:shadow-lg focus:ring-4 focus:ring-emerald-400/30 " +
    "disabled:cursor-not-allowed disabled:opacity-50 " +
    "dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 " +
    "dark:hover:border-emerald-400 dark:hover:bg-emerald-950/40 dark:hover:ring-emerald-500/30 " +
    "dark:focus:border-emerald-400 dark:focus:ring-emerald-500/35 " +
    "sm:h-16 sm:w-12 sm:text-[1.75rem]";

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
      role="group"
      aria-label="Mã OTP 6 chữ số"
    >
      {values.map((v, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          className={boxClass}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          pattern="\d*"
          maxLength={1}
          value={v}
          disabled={disabled}
          aria-label={`Chữ số thứ ${i + 1} trong mã OTP`}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text");
            const normalized = pasted.replace(/\D/g, "").slice(0, 6);
            if (normalized.length) {
              onChange(normalized);
              const lastIndex = Math.min(normalized.length - 1, 5);
              requestAnimationFrame(() => {
                inputRefs.current[lastIndex]?.focus();
              });
            }
            e.preventDefault();
          }}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            if (raw.length > 1) {
              onChange(raw.slice(0, 6));
              const last = Math.min(raw.length - 1, 5);
              requestAnimationFrame(() => {
                inputRefs.current[last]?.focus();
              });
              return;
            }
            commitAt(i, raw);
            if (raw) {
              requestAnimationFrame(() => {
                inputRefs.current[Math.min(i + 1, 5)]?.focus();
              });
            }
          }}
          onKeyDown={(e) => {
            if (e.key !== "Backspace") return;
            if (values[i] !== "") return;
            if (i <= 0) return;
            e.preventDefault();
            inputRefs.current[i - 1]?.focus();
          }}
        />
      ))}
    </div>
  );
}
