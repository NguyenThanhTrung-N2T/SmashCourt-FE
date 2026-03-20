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

  useEffect(() => {
    // If user pastes fewer digits than needed, keep focus on the first empty.
    const idx = values.findIndex((v) => v === "");
    const target = idx === -1 ? 5 : idx;
    if (autoFocus && inputRefs.current[target]) {
      inputRefs.current[target]?.focus();
    }
  }, [autoFocus, values]);

  function commitAt(index: number, rawChar: string) {
    const char = rawChar.replace(/\D/g, "").slice(0, 1);
    const next = values.map((v, i) => {
      if (i !== index) return v;
      return char;
    });
    const joined = next.join("").replace(/\D/g, "").slice(0, 6);
    onChange(joined);
  }

  return (
    <div className="flex items-center gap-2">
      {values.map((v, i) => (
        <input
          title="Mã OTP"
          placeholder="Mã OTP"
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          className="h-11 w-11 rounded-md border border-zinc-300 bg-transparent text-center text-lg outline-none focus:border-zinc-400 disabled:opacity-60"
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={v}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text");
            const normalized = pasted.replace(/\D/g, "").slice(0, 6);
            if (normalized.length) {
              onChange(normalized);
              // Di chuyển focus đến chữ số cuối cùng đã được điền.
              const lastIndex = normalized.length - 1;
              inputRefs.current[lastIndex]?.focus();
            }
            e.preventDefault();
          }}
          onChange={(e) => {
            commitAt(i, e.target.value);
            if (e.target.value) {
              inputRefs.current[Math.min(i + 1, 5)]?.focus();
            }
          }}
          onKeyDown={(e) => {
            if (e.key !== "Backspace") return;
            if (values[i] !== "") return;
            if (i <= 0) return;
            inputRefs.current[i - 1]?.focus();
          }}
        />
      ))}
    </div>
  );
}
