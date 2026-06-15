"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, Shield } from "lucide-react";

import {
  authLogin2fa,
  authResendOtp,
  hasAuthErrorCode,
} from "@/src/api/auth.api";
import AuthStatusToast from "@/src/features/auth/components/AuthStatusToast";
import CountdownButton from "@/src/features/auth/components/CountdownButton";
import OtpInput from "@/src/features/auth/components/OtpInput";
import { OtpType } from "@/src/features/auth/constants";
import {
  clearAuthSession,
  clearEmail,
  clearTempToken,
  clearTwoFactorVerifySession,
  getEmail,
  getTempToken,
  getTwoFactorVerifySession,
  setAuthenticatedSession,
  setTwoFactorVerifySession,
  type TwoFactorVerifySession,
} from "@/src/features/auth/session/sessionStore";
import { formatEmailShort } from "@/src/features/auth/utils/clientErrors";
import { isValidOtp, normalizeOtp } from "@/src/features/auth/validators";
import { useAuthRedirect } from "@/src/features/auth/hooks/useAuthRedirect";
import { useAuthError } from "@/src/features/auth/hooks/useAuthError";
import { useAuthErrorLogger } from "@/src/features/auth/hooks/useAuthError";
import type { AuthFormEvent } from "@/src/features/auth/types/forms";

const RESET_REDIRECT_MS = 3500;
const MAX_VERIFY_ATTEMPTS = 3;
const MAX_RESEND_ATTEMPTS = 3;
const TEMP_TOKEN_TTL_MS = 5 * 60 * 1000;

const TEXT = {
  pageTitle: "Xác thực 2 bước",
  codeTitle: "Mã xác thực 2 bước",
  sentTo: "Gửi tới",
  prompt: "Nhập 6 chữ số trong email để hoàn tất đăng nhập.",
  loginLabel: "Đăng nhập",
  submitLabel: "Xác thực",
  loadingLabel: "Đang xử lý...",
  resendLabel: "Gửi lại mã",
  resendCooldownLabel: "Gửi lại sau",
  resendSuccess: "OTP đã được gửi lại.",
  successToast: "Đăng nhập thành công",
  resetToast: "Phiên xác thực đã hết hiệu lực",
  sessionExpired:
    "Phiên xác thực 2 bước đã hết hiệu lực. Bạn sẽ được đưa về trang đăng nhập sau ít giây.",
  sessionExpiredShort:
    "Phiên xác thực 2 bước đã hết hiệu lực, vui lòng đăng nhập lại.",
  invalidOtp: "Vui lòng nhập đủ 6 chữ số.",
  sessionInvalid: "Phiên không hợp lệ. Vui lòng thực hiện lại từ đầu.",
} as const;

function shouldResetTwoFactorSession(input?: unknown) {
  return hasAuthErrorCode(input, [
    "TOKEN_INVALID",
    "OTP_LIMIT_EXCEEDED",
    "ACCOUNT_LOCKED",
    "UNAUTHORIZED",
    "FORBIDDEN",
    "NOT_FOUND",
  ]);
}

function isChallengeExpired(session?: TwoFactorVerifySession | null) {
  if (!session) return true;
  return Date.now() - session.startedAt >= TEMP_TOKEN_TTL_MS;
}

export default function TwoFactorPage() {
  const router = useRouter();
  const [session, setSession] = useState<TwoFactorVerifySession | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [entered, setEntered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resettingSession, setResettingSession] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const { error, showError, clearError } = useAuthError();
  const { scheduleRedirectByRole, isRedirecting } = useAuthRedirect({
    delay: 1800,
  });
  const logError = useAuthErrorLogger("login-2fa");

  const email = session?.email ?? null;
  const tempToken = session?.tempToken ?? null;
  const remainingAttempts = Math.max(0, MAX_VERIFY_ATTEMPTS - failedAttempts);
  const remainingResends = Math.max(0, MAX_RESEND_ATTEMPTS - (session?.resendCount ?? 0));
  const controlsDisabled = loading || isRedirecting || resettingSession;
  const resendDisabled =
    controlsDisabled || isResending || remainingResends === 0 || !email;

  function persistSession(next: TwoFactorVerifySession | null) {
    setSession(next);
    if (next) {
      setTwoFactorVerifySession(next);
    } else {
      clearTwoFactorVerifySession();
    }
  }

  function clearTwoFactorChallengeAndRestart(message?: string) {
    clearAuthSession();
    clearTwoFactorVerifySession();
    clearTempToken();

    setSession(null);
    setResettingSession(true);
    setOtpCode("");
    setFailedAttempts(0);
    setResendSuccess(null);
    clearError();
    showError(new Error(message ?? TEXT.sessionExpired), "2fa");

    setTimeout(() => {
      clearEmail();
      router.replace("/auth/login");
    }, RESET_REDIRECT_MS);
  }

  function incrementFailedAttempts() {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);

    if (session) {
      persistSession({
        ...session,
        failedAttempts: nextAttempts,
      });
    }

    return nextAttempts;
  }

  useEffect(() => {
    try {
      const storedSession = getTwoFactorVerifySession();
      const storedEmail = getEmail()?.trim().toLowerCase() ?? null;
      const storedTempToken = getTempToken() ?? null;

      let nextSession: TwoFactorVerifySession | null = null;

      if (
        storedSession?.email &&
        storedSession?.tempToken &&
        !isChallengeExpired(storedSession)
      ) {
        nextSession = storedSession;
      } else if (
        storedEmail &&
        storedTempToken
      ) {
        nextSession = {
          email: storedEmail,
          tempToken: storedTempToken,
          failedAttempts: 0,
          resendCount: 0,
          startedAt: Date.now(),
        };
        setTwoFactorVerifySession(nextSession);
      }

      if (!nextSession) {
        setSession(null);
        return;
      }

      setSession(nextSession);
      setFailedAttempts(nextSession.failedAttempts ?? 0);
    } catch {
      setSession(null);
    }

    const frameId = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!resendSuccess) return;

    const timer = setTimeout(() => {
      setResendSuccess(null);
    }, 2500);

    return () => clearTimeout(timer);
  }, [resendSuccess]);

  async function onSubmit(e: AuthFormEvent) {
    e.preventDefault();
    if (!tempToken || !email || resettingSession) return;

    clearError();
    setResendSuccess(null);

    const normalized = normalizeOtp(otpCode);
    if (normalized !== otpCode) {
      setOtpCode(normalized);
    }

    if (!isValidOtp(normalized)) {
      showError(new Error(TEXT.invalidOtp), "2fa");
      return;
    }

    const currentSession = getTwoFactorVerifySession();
    if (isChallengeExpired(currentSession)) {
      clearTwoFactorChallengeAndRestart(TEXT.sessionExpiredShort);
      return;
    }

    try {
      setLoading(true);

      const data = await authLogin2fa({
        tempToken,
        otpCode: normalized,
      });

      if (data.status === "Success") {
        if (data.accessToken && data.user) {
          setAuthenticatedSession({
            accessToken: data.accessToken,
            user: data.user,
          });
        }

        clearTwoFactorVerifySession();
        clearTempToken();
        setFailedAttempts(0);

        scheduleRedirectByRole(data.user?.role);
        return;
      }

      const nextAttempts = incrementFailedAttempts();
      logError(data);

      if (
        shouldResetTwoFactorSession(data.message) ||
        nextAttempts >= MAX_VERIFY_ATTEMPTS
      ) {
        clearTwoFactorChallengeAndRestart(
          data.message ?? TEXT.sessionExpiredShort,
        );
        return;
      }

      showError(new Error(data.message ?? "Xác thực 2FA thất bại"), "2fa");
    } catch (err) {
      logError(err);

      const nextAttempts = incrementFailedAttempts();

      if (
        shouldResetTwoFactorSession(err) ||
        nextAttempts >= MAX_VERIFY_ATTEMPTS
      ) {
        clearTwoFactorChallengeAndRestart(
          err instanceof Error ? err.message : TEXT.sessionExpiredShort,
        );
        return;
      }

      showError(
        err instanceof Error ? err : new Error("Xác thực 2FA thất bại"),
        "2fa",
      );
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (!email || resettingSession || isResending || remainingResends === 0) return;

    clearError();
    setResendSuccess(null);

    try {
      setIsResending(true);

      const result = await authResendOtp({
        email,
        type: OtpType.TWO_FA,
      });

      const currentSession = getTwoFactorVerifySession();
      const nextSession: TwoFactorVerifySession = {
        email,
        tempToken: tempToken ?? currentSession?.tempToken ?? "",
        failedAttempts: 0,
        resendCount: (currentSession?.resendCount ?? 0) + 1,
        startedAt: Date.now(),
      };

      if (nextSession.tempToken) {
        persistSession(nextSession);
      }

      setFailedAttempts(0);
      setOtpCode("");
      setResendSuccess(result.message ?? TEXT.resendSuccess);
    } catch (err) {
      logError(err);

      if (shouldResetTwoFactorSession(err)) {
        clearTwoFactorChallengeAndRestart(
          err instanceof Error ? err.message : TEXT.sessionExpiredShort,
        );
        return;
      }

      showError(
        err instanceof Error ? err : new Error("Không thể gửi lại OTP."),
        "2fa",
      );
    } finally {
      setIsResending(false);
    }
  }

  if (!tempToken || !email) {
    return (
      <section className="mx-auto max-w-md text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {TEXT.pageTitle}
        </h2>
        <p className="mt-3 text-base font-medium text-slate-600">
          {TEXT.sessionInvalid}
        </p>
        <div className="mt-4">
          <Link
            href="/auth/login"
            className="font-bold text-emerald-600 underline-offset-2 hover:underline"
          >
            {TEXT.loginLabel}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`mx-auto max-w-md transition-all duration-500 ease-out motion-reduce:transition-none ${entered
          ? "translate-y-0 opacity-100"
          : "translate-y-2 opacity-0 motion-reduce:translate-y-0"
        }`}
    >
      <header className={`text-center ${entered ? "auth-animate-fade-up" : ""}`}>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {TEXT.codeTitle}
        </h2>
      </header>

      <div
        className={`mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 ${entered ? "auth-animate-fade-up-delay" : ""
          }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
          <Shield className="h-5 w-5 text-emerald-600" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {TEXT.sentTo}
          </p>
          <p className="truncate font-mono text-sm font-semibold text-slate-800" title={email}>
            {formatEmailShort(email)}
          </p>
        </div>
      </div>

      <p
        className={`mt-3 text-center text-sm font-medium text-slate-600 ${entered ? "auth-animate-fade-up-delay" : ""
          }`}
      >
        {TEXT.prompt}
      </p>

      <form className="mt-8 flex flex-col gap-6" onSubmit={onSubmit}>
        <div
          className={`flex justify-center ${entered ? "auth-animate-fade-up-delay-2" : ""
            }`}
        >
          <OtpInput
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            disabled={controlsDisabled}
          />
        </div>

        {remainingAttempts > 0 && remainingAttempts < MAX_VERIFY_ATTEMPTS ? (
          <p className="text-center text-sm font-semibold text-red-600">
            Bạn còn {remainingAttempts} lần nhập với mã hiện tại.
          </p>
        ) : null}

        {error ? (
          <div
            className="flex gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4 animate-in fade-in duration-200"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <p className="flex-1 text-left text-sm font-bold leading-relaxed text-red-800">
              {error}
            </p>
          </div>
        ) : null}

        {resendSuccess ? (
          <AuthStatusToast
            visible={true}
            tone="success"
            message={resendSuccess}
          />
        ) : null}

        <button
          type="submit"
          disabled={controlsDisabled}
          className="h-12 w-full cursor-pointer rounded-xl bg-slate-900 text-sm font-bold text-white shadow-md transition-all duration-200 ease-out hover:bg-slate-800 hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:active:scale-100"
        >
          {loading ? TEXT.loadingLabel : TEXT.submitLabel}
        </button>

        <div className="flex flex-col items-center gap-3 border-t border-slate-200 pt-6">
          <CountdownButton
            onResend={onResend}
            seconds={60}
            initialCooldownSeconds={60}
            label={
              remainingResends === 0
                ? "Đã hết lượt gửi lại"
                : TEXT.resendLabel
            }
            resendLabel={TEXT.resendCooldownLabel}
            variant="outline"
            className="min-h-9 border-slate-200 px-4 py-2 text-[13px] font-medium text-slate-500 shadow-none hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            disabled={resendDisabled}
          />

          {remainingResends === 1 ? (
            <p className="text-sm font-semibold text-amber-600">
              Chỉ còn 1 lượt gửi lại OTP.
            </p>
          ) : null}

          {remainingResends === 0 ? (
            <p className="text-sm font-semibold text-red-600">
              Bạn đã dùng hết 3 lượt gửi lại OTP.
            </p>
          ) : null}
        </div>

        <p className="pt-1 text-center text-sm font-medium text-slate-600">
          <Link
            href="/auth/login"
            className="inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-base font-bold text-emerald-600 underline-offset-2 transition-colors hover:bg-emerald-50 hover:text-emerald-700 hover:underline"
          >
            {TEXT.loginLabel}
          </Link>
        </p>
      </form>

      <AuthStatusToast
        visible={isRedirecting}
        tone="success"
        message={TEXT.successToast}
      />
      <AuthStatusToast
        visible={resettingSession}
        tone="danger"
        message={TEXT.resetToast}
      />
    </section>
  );
}