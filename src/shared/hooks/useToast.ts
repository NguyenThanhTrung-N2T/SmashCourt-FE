"use client";

import { useCallback, useRef, useState } from "react";

export type ToastState = {
  visible: boolean;
  tone: "success" | "error";
  message: string;
};

/**
 * Reusable toast notification hook.
 * Shows a toast with a tone (success/error) and message, auto-hides after `durationMs`.
 */
export function useToast(durationMs = 3500) {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    tone: "success",
    message: "",
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (tone: ToastState["tone"], message: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ visible: true, tone, message });
      timerRef.current = setTimeout(
        () => setToast((prev) => ({ ...prev, visible: false })),
        durationMs,
      );
    },
    [durationMs],
  );

  return { toast, show };
}
