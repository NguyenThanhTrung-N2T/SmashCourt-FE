"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { KeyRound, Lock } from "lucide-react";

import {
  authForgotPasswordReset,
  getAuthFieldError,
} from "@/src/auth/api/authApi";
import AuthStatusToast from "@/src/auth/components/AuthStatusToast";
import {
  clearEmail,
  clearResetToken,
  getResetToken,
} from "@/src/auth/session/sessionStore";
import { isValidPassword } from "@/src/auth/validators";

const REDIRECT_MS = 2000;

export default function ResetPasswordPage() {
  const router = useRouter();
  const redirectTimeoutRef = useRef<number | null>(null);

  const [resetToken, setResetTokenState] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setResetTokenState(getResetToken() ?? null);
    } catch {
      setResetTokenState(null);
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!resetToken) {
      setError("KhÃ´ng tÃ¬m tháº¥y phiÃªn Ä‘áº·t láº¡i máº­t kháº©u. Vui lÃ²ng thá»±c hiá»‡n láº¡i.");
      return;
    }

    if (!newPassword) {
      setError("Vui lÃ²ng nháº­p máº­t kháº©u má»›i.");
      return;
    }

    if (!confirmPassword) {
      setError("Vui lÃ²ng xÃ¡c nháº­n láº¡i máº­t kháº©u má»›i.");
      return;
    }

    if (!isValidPassword(newPassword)) {
      setError(
        "Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 8 kÃ½ tá»±, gá»“m 1 chá»¯ hoa, 1 sá»‘ vÃ  1 kÃ½ tá»± Ä‘áº·c biá»‡t.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p.");
      return;
    }

    try {
      setLoading(true);
      await authForgotPasswordReset({
        resetToken,
        newPassword,
        confirmPassword,
      });

      clearResetToken();
      clearEmail();
      setRedirecting(true);
      redirectTimeoutRef.current = window.setTimeout(() => {
        router.push("/auth/login");
      }, REDIRECT_MS);
    } catch (err) {
      const fieldError = getAuthFieldError(err, [
        "resetToken",
        "newPassword",
        "confirmPassword",
      ]);

      setError(
        fieldError ??
          (err instanceof Error ? err.message : "Äáº·t láº¡i máº­t kháº©u tháº¥t báº¡i."),
      );
    } finally {
      setLoading(false);
    }
  }

  if (!resetToken) {
    return (
      <section className="mx-auto max-w-md text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Äáº·t láº¡i máº­t kháº©u
        </h2>
        <p className="mt-3 text-base font-medium text-slate-600">
          KhÃ´ng tÃ¬m tháº¥y phiÃªn Ä‘áº·t láº¡i máº­t kháº©u. Vui lÃ²ng yÃªu cáº§u OTP má»›i.
        </p>
        <div className="mt-4">
          <Link
            className="font-bold text-emerald-600 underline-offset-2 hover:underline"
            href="/auth/forgot-password"
          >
            Äáº¿n trang quÃªn máº­t kháº©u
          </Link>
        </div>
      </section>
    );
  }

  const controlsDisabled = loading || redirecting;

  return (
    <section
      className={`w-full transform transition-all duration-700 motion-reduce:transform-none motion-reduce:transition-none ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <KeyRound className="h-6 w-6" />
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Äáº·t láº¡i máº­t kháº©u
        </h2>
        <p className="mt-3 text-base font-medium text-slate-600">
          Thiáº¿t láº­p máº­t kháº©u má»›i Ä‘á»ƒ quay láº¡i Ä‘Äƒng nháº­p an toÃ n.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-sm font-bold text-red-800 shadow-sm">
          {error}
        </div>
      ) : null}

      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">
            Máº­t kháº©u má»›i
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-emerald-600">
              <Lock className="h-5 w-5" />
            </div>
            <input
              className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 font-medium text-slate-900 outline-none transition-all duration-300 placeholder:font-normal placeholder:text-slate-400 hover:border-emerald-300 hover:shadow-md focus:-translate-y-0.5 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:shadow-lg"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
              disabled={controlsDisabled}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">
            XÃ¡c nháº­n máº­t kháº©u
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-emerald-600">
              <Lock className="h-5 w-5" />
            </div>
            <input
              className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 font-medium text-slate-900 outline-none transition-all duration-300 placeholder:font-normal placeholder:text-slate-400 hover:border-emerald-300 hover:shadow-md focus:-translate-y-0.5 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:shadow-lg"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
              disabled={controlsDisabled}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium leading-6 text-slate-600">
          Máº­t kháº©u cáº§n cÃ³ Ã­t nháº¥t 8 kÃ½ tá»±, gá»“m 1 chá»¯ hoa, 1 sá»‘ vÃ  1 kÃ½ tá»± Ä‘áº·c biá»‡t.
        </div>

        <button
          type="submit"
          disabled={controlsDisabled}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-4 text-base font-extrabold text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-60"
        >
          {loading ? "Äang Ä‘áº·t láº¡i..." : "Äáº·t láº¡i máº­t kháº©u"}
        </button>

        <p className="mt-6 text-center text-sm font-medium text-slate-600">
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-base font-bold text-emerald-600 underline-offset-2 transition-colors hover:bg-emerald-50 hover:text-emerald-700 hover:underline"
            href="/auth/login"
          >
            Quay láº¡i Ä‘Äƒng nháº­p
          </Link>
        </p>
      </form>

      <AuthStatusToast
        visible={redirecting}
        tone="success"
        message="Äáº·t láº¡i máº­t kháº©u thÃ nh cÃ´ng"
      />
    </section>
  );
}
