"use client";

import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

type AuthStatusToastProps = {
  visible: boolean;
  message: string;
  tone?: "success" | "danger";
};

export default function AuthStatusToast({
  visible,
  message,
  tone = "success",
}: AuthStatusToastProps) {
  if (!visible || typeof document === "undefined") return null;

  const isSuccess = tone === "success";

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center px-4 pt-5">
      <div
        className={`auth-animate-scale-in w-full max-w-sm rounded-2xl border bg-white/95 px-5 py-4 text-center shadow-xl backdrop-blur ${
          isSuccess
            ? "border-emerald-200 shadow-emerald-500/10 ring-1 ring-emerald-100"
            : "border-red-200 shadow-red-500/10 ring-1 ring-red-100"
        }`}
        role="status"
        aria-live="assertive"
      >
        <div
          className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${
            isSuccess
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="h-6 w-6" strokeWidth={2.25} aria-hidden />
          ) : (
            <AlertTriangle className="h-6 w-6" strokeWidth={2.25} aria-hidden />
          )}
        </div>
        <p
          className={`mt-3 text-sm font-semibold ${
            isSuccess ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {message}
        </p>
      </div>
    </div>,
    document.body,
  );
}
