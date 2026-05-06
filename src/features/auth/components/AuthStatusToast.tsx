"use client";

import { createPortal } from "react-dom";
import {
  Warning,
  CheckCircle,
} from "@phosphor-icons/react";

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
    <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center px-4 pt-5 sm:pt-6">
      <div
        className={`auth-animate-scale-in w-full max-w-lg rounded-3xl border bg-white/98 px-6 py-5 text-center shadow-2xl backdrop-blur ${
          isSuccess
            ? "border-emerald-200 shadow-emerald-500/15 ring-1 ring-emerald-100"
            : "border-red-200 shadow-red-500/15 ring-1 ring-red-100"
        }`}
        role="status"
        aria-live="assertive"
      >
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            isSuccess
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isSuccess ? (
            <CheckCircle className="h-7 w-7" strokeWidth={2.3} aria-hidden />
          ) : (
            <Warning className="h-7 w-7" strokeWidth={2.3} aria-hidden />
          )}
        </div>
        <p
          className={`mt-3 text-xs font-extrabold tracking-[0.22em] ${
            isSuccess ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {isSuccess ? "Thông báo thành công" : "Thông báo hệ thống"}
        </p>
        <p
          className={`mt-2 text-base font-extrabold leading-6 sm:text-lg ${
            isSuccess ? "text-emerald-800" : "text-red-800"
          }`}
        >
          {message}
        </p>
      </div>
    </div>,
    document.body,
  );
}
