"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, Mail, Send } from "lucide-react";

import {
  authForgotPassword,
  getAuthFieldError,
} from "@/src/auth/api/authApi";
import AuthStatusToast from "@/src/auth/components/AuthStatusToast";
import {
  setEmail,
  setForgotPasswordFlashMessage,
} from "@/src/auth/session/sessionStore";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmailState] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!toastError) return;

    const timer = window.setTimeout(() => {
      setToastError(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [toastError]);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Vui lÃ²ng nháº­p email.");
      return;
    }

    try {
      setLoading(true);
      const data = await authForgotPassword({ email: trimmedEmail });
      setEmail(trimmedEmail);
      setForgotPasswordFlashMessage(
        data.message ??
          "Náº¿u email tá»“n táº¡i, mÃ£ OTP sáº½ Ä‘Æ°á»£c gá»­i tá»›i há»™p thÆ° cá»§a báº¡n.",
      );
      router.push("/auth/forgot-password/verify-otp");
    } catch (err) {
      const fieldError = getAuthFieldError(err, "email");
      setToastError(
        fieldError ??
          (err instanceof Error
            ? err.message
            : "Gá»­i yÃªu cáº§u khÃ´i phá»¥c tháº¥t báº¡i."),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className={`w-full transform transition-all duration-700 motion-reduce:transform-none motion-reduce:transition-none ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
          QuÃªn máº­t kháº©u
        </h2>
        <p className="mt-3 text-base font-medium text-slate-600">
          Nháº­p email cá»§a báº¡n Ä‘á»ƒ nháº­n mÃ£ OTP khÃ´i phá»¥c.
        </p>
      </div>

      {error ? (
        <div className="mb-6 flex gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4 shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="flex-1 text-sm font-bold leading-relaxed text-red-800">
            {error}
          </p>
        </div>
      ) : null}

      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">
            Email cÃ¡ nhÃ¢n
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-emerald-600">
              <Mail className="h-5 w-5" />
            </div>
            <input
              className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 font-medium text-slate-900 outline-none transition-all duration-300 placeholder:font-normal placeholder:text-slate-400 hover:border-emerald-300 hover:shadow-md focus:-translate-y-0.5 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:shadow-lg"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmailState(e.target.value)}
              type="email"
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-4 text-base font-extrabold text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-60"
        >
          {loading ? (
            "Äang xá»­ lÃ½..."
          ) : (
            <>
              Gá»­i mÃ£ OTP ngay <Send className="h-5 w-5" />
            </>
          )}
        </button>

        <p className="mt-8 text-center text-sm font-medium text-slate-600">
          <Link
            href="/auth/login"
            className="inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-base font-bold text-emerald-600 underline-offset-2 transition-colors hover:bg-emerald-50 hover:text-emerald-700 hover:underline"
          >
            Quay láº¡i trang Ä‘Äƒng nháº­p
          </Link>
        </p>
      </form>

      <AuthStatusToast
        visible={!!toastError}
        tone="danger"
        message={toastError ?? ""}
      />
    </section>
  );
}
