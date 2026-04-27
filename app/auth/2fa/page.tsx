"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, Shield } from "lucide-react";

import {
  authLogin2fa,
  hasAuthErrorCode,
} from "@/src/api/auth.api";
import AuthStatusToast from "@/src/modules/auth/components/AuthStatusToast";
import OtpInput from "@/src/modules/auth/components/OtpInput";
import {
  clearEmail,
  clearTempToken,
  clearTwoFactorVerifySession,
  getEmail,
  getTempToken,
  getTwoFactorVerifySession,
  setAuthenticatedSession,
  startTwoFactorVerifySession,
  type TwoFactorVerifySession,
} from "@/src/modules/auth/session/sessionStore";
import { formatEmailShort } from "@/src/modules/auth/utils/clientErrors";
import { isValidOtp, normalizeOtp } from "@/src/modules/auth/validators";
import { useAuthRedirect } from "@/src/modules/auth/hooks/useAuthRedirect";
import { useAuthError } from "@/src/modules/auth/hooks/useAuthError";
import { useAuthErrorLogger } from "@/src/modules/auth/hooks/useAuthError";
import type { AuthFormEvent } from "@/src/modules/auth/types/forms";

const RESET_REDIRECT_MS = 3500;
const MAX_VERIFY_ATTEMPTS = 3;
const TEMP_TOKEN_TTL_MS = 5 * 60 * 1000;

const TEXT = {
  pageTitle: "Xác thực 2 bước",
  codeTitle: "Mã xác thực 2 bước",
  sentTo: "Gửi tới",
  prompt: "Nhập 6 chữ số trong email để hoàn tất đăng nhập.",
  loginLabel: "Đăng nhập",
  submitLabel: "Xác thực",
  loadingLabel: "Đang xử lý...",
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
  ]);
}

export default function TwoFactorPage() {
  const router = useRouter();
  const [tempToken, setTempTokenState] = useState<string | null>(null);
  const [mailHint, setMailHint] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [entered, setEntered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resettingSession, setResettingSession] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Use new hooks
  const { error, showError, clearError } = useAuthError();
  const { scheduleRedirectByRole, isRedirecting } = useAuthRedirect({
    delay: 1800,
  });
  const logError = useAuthErrorLogger("login-2fa");

  function isTempTokenExpired(session: TwoFactorVerifySession) {
    return Date.now() - session.startedAt >= TEMP_TOKEN_TTL_MS;
  }

  function clearTwoFactorChallengeAndRestart(message?: string) {
    clearTwoFactorVerifySession();
    clearTempToken();
    setTempTokenState(null);
    setResettingSession(true);
    setOtpCode("");
    clearError();
    showError(new Error(message ?? TEXT.sessionExpired), "2fa");

    setTimeout(() => {
      clearEmail();
      setMailHint(null);
      router.replace("/auth/login");
    }, RESET_REDIRECT_MS);
  }

  useEffect(() => {
    try {
      const storedEmail = getEmail()?.trim().toLowerCase() ?? null;
      const storedTempToken = getTempToken() ?? null;
      setMailHint(storedEmail);
      setTempTokenState(storedTempToken);

      if (storedEmail && storedTempToken) {
        const storedSession = getTwoFactorVerifySession();
        if (
          storedSession?.email === storedEmail &&
          storedSession.tempToken === storedTempToken
        ) {
          setFailedAttempts(storedSession.failedAttempts);
        } else {
          startTwoFactorVerifySession(storedEmail, storedTempToken);
        }
      }
    } catch {
      setTempTokenState(null);
      setMailHint(null);
    }

    const frameId = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  async function onSubmit(e: AuthFormEvent) {
    e.preventDefault();
    if (!tempToken || !mailHint || resettingSession) return;

    clearError();

    const normalized = normalizeOtp(otpCode);
    setOtpCode(normalized);
    if (!isValidOtp(normalized)) {
      showError(new Error(TEXT.invalidOtp), "2fa");
      return;
    }

    const currentSession = getTwoFactorVerifySession();
    if (currentSession && isTempTokenExpired(currentSession)) {
      clearTwoFactorChallengeAndRestart(TEXT.sessionExpiredShort);
      return;
    }

    try {
      setLoading(true);
      const data = await authLogin2fa({ tempToken, otpCode: normalized });

      if (data.status === "Success") {
        if (data.accessToken && data.user) {
          setAuthenticatedSession({
            accessToken: data.accessToken,
            user: data.user,
          });
        }
        clearTwoFactorVerifySession();
        clearTempToken();
        scheduleRedirectByRole(data.user?.role);
        return;
      }

      setFailedAttempts((prev) => prev + 1);
      logError(data);

      if (
        shouldResetTwoFactorSession(data.message) ||
        failedAttempts + 1 >= MAX_VERIFY_ATTEMPTS
      ) {
        clearTwoFactorChallengeAndRestart(
          data.message ?? TEXT.sessionExpiredShort
        );
        return;
      }

      showError(new Error(data.message ?? "Xác thực 2FA thất bại"), "2fa");
    } catch (err) {
      logError(err);
      setFailedAttempts((prev) => prev + 1);

      if (
        shouldResetTwoFactorSession(err) ||
        failedAttempts + 1 >= MAX_VERIFY_ATTEMPTS
      ) {
        clearTwoFactorChallengeAndRestart(
          err instanceof Error ? err.message : TEXT.sessionExpiredShort
        );
        return;
      }

      showError(err, "2fa");
    } finally {
      setLoading(false);
    }
  }

  if (!tempToken || !mailHint) {
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

  const controlsDisabled = loading || isRedirecting || resettingSession;

  return (
    <section
      className={`mx-auto max-w-md transition-all duration-500 ease-out motion-reduce:transition-none ${
        entered
          ? "translate-y-0 opacity-100"
          : "translate-y-2 opacity-0 motion-reduce:translate-y-0"
      }`}
    >
      <header
        className={`text-center ${entered ? "auth-animate-fade-up" : ""}`}
      >
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {TEXT.codeTitle}
        </h2>
      </header>

      <div
        className={`mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 ${
          entered ? "auth-animate-fade-up-delay" : ""
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
          <Shield className="h-5 w-5 text-emerald-600" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {TEXT.sentTo}
          </p>
          <p
            className="truncate font-mono text-sm font-semibold text-slate-800"
            title={mailHint}
          >
            {formatEmailShort(mailHint)}
          </p>
        </div>
      </div>

      <p
        className={`mt-3 text-center text-sm font-medium text-slate-600 ${
          entered ? "auth-animate-fade-up-delay" : ""
        }`}
      >
        {TEXT.prompt}
      </p>

      <form className="mt-8 flex flex-col gap-6" onSubmit={onSubmit}>
        <div
          className={`flex justify-center ${
            entered ? "auth-animate-fade-up-delay-2" : ""
          }`}
        >
          <OtpInput
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            disabled={controlsDisabled}
          />
        </div>

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

        <button
          type="submit"
          disabled={controlsDisabled}
          className="h-12 w-full cursor-pointer rounded-xl bg-slate-900 text-sm font-bold text-white shadow-md transition-all duration-200 ease-out hover:bg-slate-800 hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:active:scale-100"
        >
          {loading ? TEXT.loadingLabel : TEXT.submitLabel}
        </button>

        <p className="border-t border-slate-200 pt-6 text-center text-sm font-medium text-slate-600">
          <Link
            href="/auth/login"
            className="inline-flex min-h-14 items-center justify-center rounded-xl px-6 text-lg font-extrabold text-emerald-600 underline-offset-2 transition-colors hover:bg-emerald-50 hover:text-emerald-700 hover:underline"
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
