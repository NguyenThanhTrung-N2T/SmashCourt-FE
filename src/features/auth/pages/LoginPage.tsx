"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Envelope,
  Lock,
  Eye,
  EyeSlash,
  WarningCircle,
  CheckCircle,
  Spinner
} from "@phosphor-icons/react";

import {
  authGoogleUrl,
  authLogin,
  hasAuthErrorCode,
} from "@/src/api/auth.api";
import AuthStatusToast from "@/src/features/auth/components/AuthStatusToast";
import { getRedirectPathByRole } from "../constants";
import {
  clearTwoFactorVerifySession,
  consumePostVerifyLoginHint,
  getEmail,
  setEmail,
  setAuthenticatedSession,
  setTempToken,
  setPostVerifyLoginHint,
  startPasswordChangeSession,
  startTwoFactorVerifySession,
  getAuthUser,
} from "@/src/features/auth/session/sessionStore";
import { useAuthRedirect } from "@/src/features/auth/hooks/useAuthRedirect";
import { useAuthErrors } from "@/src/features/auth/hooks/useAuthError";
import { useAuthErrorLogger } from "@/src/features/auth/hooks/useAuthError";
import type { AuthFormEvent } from "@/src/features/auth/types/forms";
import Image from "next/image";

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Check if locked
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
    <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24">
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [verifyHint, setVerifyHint] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showVerifyLink, setShowVerifyLink] = useState(false);

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
    // Redirect if already authenticated
    const user = getAuthUser();
    if (user) {
      router.replace(getRedirectPathByRole(user.role));
      return;
    }

    setMounted(true);
    try {
      const hint = consumePostVerifyLoginHint();
      if (hint) setVerifyHint(hint);
      const saved = getEmail();
      if (saved) setEmailState(saved);
    } catch {
      /* ignore */
    }
  }, [router]);

  async function onSubmit(e: AuthFormEvent) {
    e.preventDefault();
    if (isRedirecting || googleLoading) return;
    clearAllErrors();
    setShowVerifyLink(false);

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
      clearTwoFactorVerifySession();
      const data = await authLogin({ email: trimmedEmail, password });

      if (data.status === "2fa_required") {
        if (!data.tempToken) {
          showError("form", new Error("Thiếu mã 2FA. Vui lòng thử lại."), "login");
          return;
        }
        setEmail(trimmedEmail);
        setTempToken(data.tempToken);
        startTwoFactorVerifySession(trimmedEmail, data.tempToken);
        setPostVerifyLoginHint("Mã OTP đã được gửi đến email của bạn. Vui lòng nhập để hoàn tất đăng nhập.");
        router.push("/auth/2fa");
        return;
      }

      if (data.status === "must_change_password") {
        if (!data.tempToken) {
          showError("form", new Error("Phiên đổi mật khẩu không hợp lệ. Vui lòng thử lại."), "login");
          return;
        }
        setEmail(trimmedEmail);
        setTempToken(data.tempToken);
        startPasswordChangeSession(trimmedEmail, data.tempToken);
        router.push("/auth/change-password");
        return;
      }

      if (data.status === "Success") {
        clearTwoFactorVerifySession();

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

      // Check for email not verified error
      if (hasAuthErrorCode(err, "EMAIL_NOT_VERIFIED")) {
        setShowVerifyLink(true);
        showError("form", err, "login");
        return;
      }

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
    <div
      className={`w-full bg-white rounded-[2rem] p-8 sm:p-10 border border-slate-200/50 shadow-xl shadow-slate-900/5 transform transition-all duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-6 w-6 text-[#071F14] shrink-0">
          <Image
            src="/images/logo.webp"
            alt="Logo SmashCourt"
            width={100}
            height={100}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <span className="text-lg font-black tracking-tight text-[#071F14]">SmashCourt</span>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-[#071F14]">
          Chào mừng trở lại
        </h2>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Nhập thông tin tài khoản của bạn để tiếp tục.
        </p>
      </div>

      {verifyHint ? (
        <div
          className="mb-6 flex gap-3 rounded-2xl border border-emerald-450/30 bg-emerald-50/50 p-4 text-left shadow-sm backdrop-blur-md"
          role="status"
        >
          <CheckCircle
            className="h-6 w-6 shrink-0 text-emerald-600"
            weight="bold"
            aria-hidden
          />
          <p className="text-sm font-bold text-emerald-950">{verifyHint}</p>
        </div>
      ) : null}

      {errors.form ? (
        <div className="mb-6 flex gap-3 rounded-2xl border border-red-200/80 bg-red-50/60 p-4 shadow-sm backdrop-blur-md">
          <WarningCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-650" weight="bold" />
          <div className="flex-1">
            <p className="text-sm font-bold leading-relaxed text-red-800">
              {errors.form}
            </p>
            {showVerifyLink && (
              <Link
                href="/auth/register"
                className="mt-2 inline-block text-sm font-bold text-emerald-600 hover:text-emerald-500 hover:underline"
              >
                Đăng ký lại để nhận mã xác thực →
              </Link>
            )}
          </div>
        </div>
      ) : null}

      <form className="flex flex-col gap-5" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Địa chỉ Email</label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-[#071F14]">
              <Envelope size={18} weight="bold" />
            </div>
            <input
              className="block w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 font-semibold text-[#071F14] outline-none transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-350 focus:border-[#071F14] focus:ring-4 focus:ring-[#071F14]/5 text-sm"
              placeholder="athlete@example.com"
              value={email}
              onChange={(e) => setEmailState(e.target.value)}
              type="email"
              autoComplete="email"
              required
              disabled={controlsDisabled}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="group relative order-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-[#071F14]">
              <Lock size={18} weight="bold" />
            </div>
            <input
              className="block w-full rounded-xl border-2 border-slate-200 bg-white py-3.5 pl-12 pr-12 font-semibold text-[#071F14] outline-none transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-355 focus:border-[#071F14] focus:ring-4 focus:ring-[#071F14]/5 text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              disabled={controlsDisabled}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 z-10 flex items-center pr-4 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} weight="bold" />}
            </button>
          </div>
          <div className="flex items-center justify-between order-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Mật khẩu</label>
            <Link
              className="text-[10px] font-black uppercase tracking-widest text-[#071F14] hover:underline"
              href="/auth/forgot-password"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="keep-logged-in"
            type="checkbox"
            className="h-4.5 w-4.5 rounded border-slate-300 text-[#071F14] focus:ring-[#071F14]/10 cursor-pointer accent-[#071F14]"
          />
          <label htmlFor="keep-logged-in" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
            Duy trì đăng nhập
          </label>
        </div>

        <button
          type="submit"
          disabled={controlsDisabled}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#B3F56E] hover:bg-[#a2e05f] py-4 text-xs font-extrabold tracking-widest text-[#071F14] uppercase shadow-lg shadow-lime-500/10 transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
        >
          {loading ? (
            <Spinner className="animate-spin h-4 w-4" weight="bold" />
          ) : (
            "ĐĂNG NHẬP"
          )}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
              Hoặc kết nối với
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={controlsDisabled}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-xs font-bold text-slate-800 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 active:scale-98 disabled:opacity-60"
        >
          <GoogleMark />
          <span>
            {googleLoading ? "Đang kết nối Google..." : "Tài khoản Google"}
          </span>
        </button>

        <p className="mt-4 text-center text-xs font-medium text-slate-500">
          Chưa có tài khoản?{" "}
          <Link
            href="/auth/register"
            className="font-bold text-[#071F14] hover:underline"
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
    </div>
  );
}
