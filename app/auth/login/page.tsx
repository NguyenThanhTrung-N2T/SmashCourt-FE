"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Lock, LogIn, Mail } from "lucide-react";

import {
  authGoogleUrl,
  authLogin,
  hasAuthErrorCode,
} from "@/src/api/auth.api";
import AuthStatusToast from "@/src/modules/auth/components/AuthStatusToast";
import {
  consumePostVerifyLoginHint,
  getEmail,
  setEmail,
  setAuthenticatedSession,
  setTempToken,
  startTwoFactorVerifySession,
} from "@/src/modules/auth/session/sessionStore";
import { useAuthRedirect } from "@/src/modules/auth/hooks/useAuthRedirect";
import { useAuthErrors } from "@/src/modules/auth/hooks/useAuthError";
import { useAuthErrorLogger } from "@/src/modules/auth/hooks/useAuthError";
import type { AuthFormEvent } from "@/src/modules/auth/types/forms";

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isAccountLockedError(input: unknown) {
  if (hasAuthErrorCode(input, "ACCOUNT_LOCKED")) {
    return true;
  }

  const message =
    typeof input === "string"
      ? input
      : input instanceof Error
        ? input.message
        : undefined;
  const normalized = normalizeText(message);
  const lockedPatterns = [
    "tam khoa",
    "khoa",
    "locked",
    "lock",
    "tai khoan da bi khoa",
  ];
  return lockedPatterns.some((pattern) => normalized.includes(pattern));
}

function GoogleMark() {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M21.35 11.1H12v2.98h5.35c-.23 1.52-1.76 4.46-5.35 4.46a6 6 0 1 1 0-12c2.04 0 3.4.87 4.18 1.61l2.85-2.76C17.2 3.69 14.87 2.7 12 2.7a9.3 9.3 0 1 0 0 18.6c5.37 0 8.93-3.77 8.93-9.08 0-.61-.07-.85-.16-1.12Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmailState] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verifyHint, setVerifyHint] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Use new hooks for error handling and redirects
  const { errors, showError, clearAllErrors } = useAuthErrors({
    types: ["form", "locked"],
    autoDismiss: { locked: true },
    dismissDelay: { locked: 3500 },
  });

  const { scheduleRedirectByRole, isRedirecting } = useAuthRedirect({
    delay: 2000,
  });

  const logError = useAuthErrorLogger("login");

  useEffect(() => {
    setMounted(true);
    try {
      const hint = consumePostVerifyLoginHint();
      if (hint) setVerifyHint(hint);
      const saved = getEmail();
      if (saved) setEmailState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  async function onSubmit(e: AuthFormEvent) {
    e.preventDefault();
    if (isRedirecting || googleLoading) return;
    clearAllErrors();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      showError("form", new Error("Vui lòng nhập email."), "login");
      return;
    }
    if (!password) {
      showError("form", new Error("Vui lòng nhập mật khẩu."), "login");
      return;
    }

    try {
      setLoading(true);
      const data = await authLogin({ email: trimmedEmail, password });

      if (data.status === "2fa_required") {
        if (!data.tempToken) {
          showError("form", new Error("Thiếu mã 2FA. Vui lòng thử lại."), "login");
          return;
        }
        setEmail(trimmedEmail);
        setTempToken(data.tempToken);
        startTwoFactorVerifySession(trimmedEmail, data.tempToken);
        router.push("/auth/2fa");
        return;
      }

      if (data.status === "Success") {
        if (data.accessToken && data.user) {
          setAuthenticatedSession({
            accessToken: data.accessToken,
            user: data.user,
          });
        }
        scheduleRedirectByRole(data.user?.role);
        return;
      }

      const errorMessage = data.message ?? "Đăng nhập thất bại.";
      if (isAccountLockedError(errorMessage)) {
        showError("locked", new Error(errorMessage), "login");
      } else {
        showError("form", new Error(errorMessage), "login");
      }
    } catch (err) {
      logError(err);
      if (isAccountLockedError(err)) {
        showError("locked", err, "login");
      } else {
        showError("form", err, "login");
      }
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleLogin() {
    if (loading || isRedirecting || googleLoading) return;
    clearAllErrors();

    try {
      setGoogleLoading(true);
      const data = await authGoogleUrl();
      window.location.assign(data.url);
    } catch (err) {
      setGoogleLoading(false);
      logError(err);
      if (isAccountLockedError(err)) {
        showError("locked", err, "oauth");
      } else {
        showError("form", err, "oauth");
      }
    }
  }

  const controlsDisabled = loading || googleLoading || isRedirecting;

  return (
    <section
      className={`w-full transform transition-all duration-700 ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Đăng nhập
        </h2>
        <p className="mt-3 text-base font-medium text-slate-600">
          Mừng bạn trở lại hệ thống quản lý SmashCourt!
        </p>
      </div>

      {verifyHint ? (
        <div
          className="mb-6 flex gap-3 rounded-xl border-2 border-emerald-400 bg-emerald-50 p-4 text-left shadow-md shadow-emerald-500/10"
          role="status"
        >
          <CheckCircle2
            className="h-6 w-6 shrink-0 text-emerald-600"
            strokeWidth={2.25}
            aria-hidden
          />
          <p className="text-sm font-bold text-emerald-950">{verifyHint}</p>
        </div>
      ) : null}

      {errors.form ? (
        <div className="mb-6 flex gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4 shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="flex-1 text-sm font-bold leading-relaxed text-red-800">
            {errors.form}
          </p>
        </div>
      ) : null}

      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">Email</label>
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
              disabled={controlsDisabled}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">Mật khẩu</label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-emerald-600">
              <Lock className="h-5 w-5" />
            </div>
            <input
              className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 font-medium text-slate-900 outline-none transition-all duration-300 placeholder:font-normal placeholder:text-slate-400 hover:border-emerald-300 hover:shadow-md focus:-translate-y-0.5 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:shadow-lg"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
              disabled={controlsDisabled}
            />
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <Link
            className="text-sm font-bold text-emerald-600 transition-colors hover:text-emerald-500 hover:underline"
            href="/auth/forgot-password"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={controlsDisabled}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-4 text-base font-extrabold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-60"
        >
          {loading ? (
            "Đang xử lý..."
          ) : (
            <>
              Đăng nhập tài khoản <LogIn className="h-5 w-5" />
            </>
          )}
        </button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              Hoặc
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={controlsDisabled}
          className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-4 py-4 text-base font-bold text-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md disabled:opacity-60"
        >
          <GoogleMark />
          <span>
            {googleLoading ? "Đang kết nối Google..." : "Đăng nhập với Google"}
          </span>
        </button>

        <p className="mt-8 text-center text-base font-medium text-slate-600">
          Chưa có tài khoản nội bộ?{" "}
          <Link
            href="/auth/register"
            className="inline-flex min-h-12 items-center justify-center rounded-xl px-4 text-lg font-extrabold text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-500 hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </form>

      <AuthStatusToast
        visible={isRedirecting}
        tone="success"
        message="Đăng nhập thành công"
      />
      <AuthStatusToast
        visible={!!errors.locked}
        tone="danger"
        message={errors.locked ?? ""}
      />
    </section>
  );
}
