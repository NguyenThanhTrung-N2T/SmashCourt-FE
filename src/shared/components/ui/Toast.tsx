"use client";

import { CheckCircle, XCircle } from "@phosphor-icons/react";
import type { ToastState } from "@/src/shared/hooks/useToast";

interface ToastProps {
  toast: ToastState;
}

export function Toast({ toast }: ToastProps) {
  if (!toast.visible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
      <div
        className={`flex items-start gap-3 rounded-xl border-2 px-5 py-4 shadow-2xl backdrop-blur-sm ${
          toast.tone === "success"
            ? "border-emerald-200 bg-emerald-50/95"
            : "border-red-200 bg-red-50/95"
        }`}
      >
        {toast.tone === "success" ? (
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="h-5 w-5 shrink-0 text-red-600" />
        )}
        <p
          className={`text-sm font-bold ${
            toast.tone === "success" ? "text-emerald-900" : "text-red-900"
          }`}
        >
          {toast.message}
        </p>
      </div>
    </div>
  );
}
