"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { KeyRound } from "lucide-react";

import {
  AuthApiError,
  authForgotPasswordVerifyOtp,
  authResendOtp,
} from "@/src/auth/api/authApi";
import AuthStatusToast from "@/src/auth/components/AuthStatusToast";
import CountdownButton from "@/src/auth/components/CountdownButton";
import OtpInput from "@/src/auth/components/OtpInput";
import { OtpType } from "@/src/auth/constants";
import {
  clearAuthSession,
  clearForgotPasswordVerifySession,
  consumeForgotPasswordFlashMessage,
  getEmail,
  getForgotPasswordVerifySession,
  setEmail,
  setForgotPasswordVerifySession,
  startForgotPasswordVerifySession,
  setResetToken,
  type ForgotPasswordVerifySession,
} from "@/src/auth/session/sessionStore";
import {
  AUTH_GENERIC,
  formatEmailShort,
  logAuthClientError,
} from "@/src/auth/utils/clientErrors";
import { isValidOtp, normalizeOtp } from "@/src/auth/validators";

const REDIRECT_MS = 2000;
const RESET_REDIRECT_MS = 3500;
const SUCCESS_MESSAGE_CLEAR_MS = 8000;
const MAX_VERIFY_ATTEMPTS = 3;
const MAX_RESEND_ATTEMPTS = 3;
const VERIFY_SESSION_RESET_PATTERNS = [
  "otp da bi khoa",
  "da het han",
  "yeu cau ma moi",
  "email da duoc xac thuc truoc do",
  "tai khoan khong ton tai",
  "dang ky lai",
  "da gui otp qua so lan cho phep",
  "da het luot gui lai otp",
  "het luot gui lai",
] as const;
const VERIFY_SESSION_RESET_STATUS_PATTERNS = [
  "lock",
  "locked",
  "invalid",
  "expired",
] as const;

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function shouldResetVerifySession(status?: string, message?: string) {
  const normalizedStatus = normalizeText(status);
  if (
    VERIFY_SESSION_RESET_STATUS_PATTERNS.some((pattern) =>
      normalizedStatus.includes(pattern),
    )
  ) {
    return true;
  }

  const normalizedMessage = normalizeText(message);
  return VERIFY_SESSION_RESET_PATTERNS.some((pattern) =>
    normalizedMessage.includes(pattern),
  );
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const verifySessionRef = useRef<ForgotPasswordVerifySession | null>(null);

  const [email, setEmailState] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resettingSession, setResettingSession] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [toastError, setToastError] = useState<string | null>(null);

  const resendSuccessClearRef = useRef<number | null>(null);
  const resetRedirectRef = useRef<number | null>(null);
  const successRedirectRef = useRef<number | null>(null);

  function clearResendSuccessLater() {
    if (resendSuccessClearRef.current) {
      clearTimeout(resendSuccessClearRef.current);
    }
    resendSuccessClearRef.current = window.setTimeout(() => {
      setResendSuccess(null);
      resendSuccessClearRef.current = null;
    }, SUCCESS_MESSAGE_CLEAR_MS);
  }

  function syncVerifySession(nextSession: ForgotPasswordVerifySession | null) {
    verifySessionRef.current = nextSession;

    if (!nextSession) {
      setFailedAttempts(0);
      setResendCount(0);
      clearForgotPasswordVerifySession();
      return;
    }

    setFailedAttempts(nextSession.failedAttempts);
    setResendCount(nextSession.resendCount);
    setForgotPasswordVerifySession(nextSession);
  }

  function ensureVerifySession(currentEmail: string) {
    const normalizedEmail = currentEmail.trim().toLowerCase();
    const currentSession = verifySessionRef.current;

    if (currentSession?.email === normalizedEmail) {
      return currentSession;
    }

    const storedSession = getForgotPasswordVerifySession();
    if (storedSession?.email === normalizedEmail) {
      syncVerifySession(storedSession);
      return storedSession;
    }

    const freshSession = startForgotPasswordVerifySession(normalizedEmail);
    syncVerifySession(freshSession);
    return freshSession;
  }

  function updateVerifySession(
    updater: (session: ForgotPasswordVerifySession) => ForgotPasswordVerifySession,
  ) {
    if (!email) return null;
    const nextSession = updater(ensureVerifySession(email));
    syncVerifySession(nextSession);
    return nextSession;
  }

  function clearVerifySessionAndRestart(message?: string) {
    syncVerifySession(null);
    clearAuthSession();
    setResettingSession(true);
    setOtpCode("");
    setSubmitError(null);
    setToastError(message ?? "Phiên xác thực chờ OTP đã hết hiệu lực. Bạn sẽ được đưa về trang trước sau ít giây.");
    setResendError(null);
    setResendSuccess(null);

    if (resetRedirectRef.current) {
      clearTimeout(resetRedirectRef.current);
    }
    resetRedirectRef.current = window.setTimeout(() => {
      setEmailState(null);
      router.replace("/auth/forgot-password");
    }, RESET_REDIRECT_MS);
  }

  useEffect(() => {
    try {
      const storedEmail = getEmail()?.trim().toLowerCase() ?? null;
      setEmailState(storedEmail);

      if (storedEmail) {
        setEmail(storedEmail);

        const storedSession = getForgotPasswordVerifySession();
        if (storedSession?.email === storedEmail) {
          verifySessionRef.current = storedSession;
          setFailedAttempts(storedSession.failedAttempts);
          setResendCount(storedSession.resendCount);
        } else {
          const freshSession = startForgotPasswordVerifySession(storedEmail);
          verifySessionRef.current = freshSession;
          setFailedAttempts(freshSession.failedAttempts);
          setResendCount(freshSession.resendCount);
        }
      }

      const flashMessage = consumeForgotPasswordFlashMessage();
      if (flashMessage) {
        setResendSuccess(flashMessage);
        clearResendSuccessLater();
      }
    } catch {
      setEmailState(null);
    }

    const frameId = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || resettingSession || verified) return;

    setSubmitError(null);
    setResendError(null);
    setResendSuccess(null);
    if (resendSuccessClearRef.current) {
      clearTimeout(resendSuccessClearRef.current);
      resendSuccessClearRef.current = null;
    }

    const normalized = normalizeOtp(otpCode);
    setOtpCode(normalized);
    if (!isValidOtp(normalized)) {
      setSubmitError("Vui lòng nhập đủ 6 chữ số.");
      return;
    }

    try {
      setLoading(true);
      const data = await authForgotPasswordVerifyOtp({ email, otpCode: normalized });

      if (!data.resetToken) {
        const nextSession = updateVerifySession((currentSession) => ({
          ...currentSession,
          failedAttempts: currentSession.failedAttempts + 1,
        }));

        logAuthClientError("forgot-verify-otp-no-token", data);

        if (
          shouldResetVerifySession(undefined, data.message) ||
          (nextSession?.failedAttempts ?? MAX_VERIFY_ATTEMPTS) >=
            MAX_VERIFY_ATTEMPTS
        ) {
          clearVerifySessionAndRestart(
            data.message ??
              "Mã OTP không còn hợp lệ. Bạn sẽ được đưa về trang trước sau ít giây.",
          );
          return;
        }

        setSubmitError(data.message ?? AUTH_GENERIC.verifyFailed);
        return;
      }

      if (data.resetToken) {
        setResetToken(data.resetToken);
        clearForgotPasswordVerifySession();
        verifySessionRef.current = null;
        setFailedAttempts(0);
        setResendCount(0);
        setSubmitError(null);
        setResendError(null);
        setResendSuccess(null);
        setVerified(true);
        
        if (successRedirectRef.current) {
          clearTimeout(successRedirectRef.current);
        }
        successRedirectRef.current = window.setTimeout(() => {
          router.push("/auth/reset-password");
        }, REDIRECT_MS);
        return;
      }
      
      logAuthClientError("forgot-verify-otp-no-token", data);
      setSubmitError(AUTH_GENERIC.verifyFailed);

    } catch (err) {
      logAuthClientError("forgot-verify-otp", err);

      if (err instanceof AuthApiError) {
        const nextSession = updateVerifySession((currentSession) => ({
          ...currentSession,
          failedAttempts: currentSession.failedAttempts + 1,
        }));

        if (
          shouldResetVerifySession(undefined, err.message) ||
          (nextSession?.failedAttempts ?? MAX_VERIFY_ATTEMPTS) >=
            MAX_VERIFY_ATTEMPTS
        ) {
          clearVerifySessionAndRestart(
            err.message ||
              "Phiên xác thực đã hết hiệu lực. Bạn sẽ được đưa về trang trước sau ít giây.",
          );
          return;
        }

        setSubmitError(err.message || AUTH_GENERIC.verifyFailed);
        return;
      }

      setSubmitError(AUTH_GENERIC.verifyFailed);
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (!email || resettingSession || verified) return;

    setSubmitError(null);
    setResendError(null);
    setResendSuccess(null);
    if (resendSuccessClearRef.current) {
      clearTimeout(resendSuccessClearRef.current);
      resendSuccessClearRef.current = null;
    }

    const currentSession = ensureVerifySession(email);
    if (currentSession.resendCount >= MAX_RESEND_ATTEMPTS) {
      setResendError("Bạn đã dùng hết lượt gửi lại OTP.");
      throw new Error("resend-limit-reached");
    }

    try {
      await authResendOtp({ email, type: OtpType.FORGOT_PASSWORD });
      const nextSession = updateVerifySession((storedSession) => ({
        ...storedSession,
        failedAttempts: 0,
        resendCount: storedSession.resendCount + 1,
      }));

      const remainingResends = Math.max(
        0,
        MAX_RESEND_ATTEMPTS - (nextSession?.resendCount ?? MAX_RESEND_ATTEMPTS),
      );
      const successMessage =
        remainingResends > 0
          ? `Mã OTP khôi phục đã được gửi lại, hiệu lực 5 phút. Còn ${remainingResends} lần gửi lại.`
          : "Mã OTP khôi phục đã được gửi lại, hiệu lực 5 phút. Đây là lần gửi lại cuối cùng.";

      setResendSuccess(successMessage);
      clearResendSuccessLater();
    } catch (err) {
      logAuthClientError("resend-forgot-otp", err);

      if (err instanceof AuthApiError) {
        if (shouldResetVerifySession(undefined, err.message)) {
          clearVerifySessionAndRestart(err.message);
          throw err;
        }

        setResendError(err.message || AUTH_GENERIC.resendFailed);
        throw err;
      }

      setResendError((currentError) => currentError ?? AUTH_GENERIC.resendFailed);
      throw err;
    }
  }

  useEffect(() => {
    return () => {
      if (resendSuccessClearRef.current) {
        clearTimeout(resendSuccessClearRef.current);
      }
      if (resetRedirectRef.current) {
        clearTimeout(resetRedirectRef.current);
      }
      if (successRedirectRef.current) {
        clearTimeout(successRedirectRef.current);
      }
    };
  }, []);

  if (!email) {
    return (
      <section
        className={`mx-auto max-w-md text-center transition-opacity duration-500 ease-out motion-reduce:transition-none ${
          entered ? "opacity-100" : "opacity-0"
        }`}
      >
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Mã xác thực
        </h2>
        <p className="mt-3 text-base font-medium text-slate-600">
          {AUTH_GENERIC.sessionInvalid}
        </p>
        <div className="mt-4">
          <Link
            className="cursor-pointer font-bold text-emerald-600 underline-offset-2 transition-colors hover:text-emerald-700 hover:underline"
            href="/auth/forgot-password"
          >
            Quên mật khẩu
          </Link>
        </div>
      </section>
    );
  }

  const remainingVerifyAttempts = Math.max(
    0,
    MAX_VERIFY_ATTEMPTS - failedAttempts,
  );
  const remainingResends = Math.max(0, MAX_RESEND_ATTEMPTS - resendCount);
  const resendLimitReached = remainingResends === 0;

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
          Mã xác thực
        </h2>
      </header>

      <div
        className={`mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 ${
          entered ? "auth-animate-fade-up-delay" : ""
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
          <KeyRound className="h-5 w-5 text-emerald-600" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Gửi tới
          </p>
          <p
            className="truncate font-mono text-sm font-semibold text-slate-800"
            title={email}
          >
            {formatEmailShort(email)}
          </p>
        </div>
      </div>

      <p
        className={`mt-3 text-center text-sm font-medium text-slate-600 ${
          entered ? "auth-animate-fade-up-delay" : ""
        }`}
      >
        Nhập 6 chữ số trong email để xác nhận yêu cầu đổi mật khẩu.
      </p>

      <form
        className={`mt-8 flex flex-col gap-6 ${
          verified ? "pointer-events-none opacity-40" : ""
        }`}
        onSubmit={onSubmit}
        {...(verified ? { "aria-hidden": true } : {})}
      >
        <div
          className={`flex justify-center ${
            entered ? "auth-animate-fade-up-delay-2" : ""
          }`}
        >
          <OtpInput
            value={otpCode}
            onChange={setOtpCode}
            autoFocus={!verified}
            disabled={verified || resettingSession}
          />
        </div>

        {failedAttempts > 0 && remainingVerifyAttempts > 0 ? (
          <p className="text-center text-sm font-semibold text-red-600">
            Bạn còn {remainingVerifyAttempts} lần nhập với mã hiện tại.
          </p>
        ) : null}

        {submitError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-800">
            {submitError}
          </div>
        ) : null}

        {resendError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-800">
            {resendError}
          </div>
        ) : null}

        {resendSuccess ? (
          <div
            className="overflow-x-auto whitespace-nowrap rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-[13px] font-semibold text-emerald-900"
            role="status"
            aria-live="polite"
          >
            {resendSuccess}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || verified || resettingSession}
          className="h-12 w-full cursor-pointer rounded-xl bg-slate-900 text-sm font-bold text-white shadow-md transition-all duration-200 ease-out hover:bg-slate-800 hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:active:scale-100"
        >
          {loading ? "Đang xử lý..." : "Xác thực"}
        </button>

        <div className="flex flex-col items-center gap-3 border-t border-slate-200 pt-6">
          <CountdownButton
            onResend={onResend}
            seconds={60}
            initialCooldownSeconds={60}
            label={resendLimitReached ? "Đã hết lượt gửi lại" : "Gửi lại mã"}
            resendLabel="Gửi lại sau"
            variant="outline"
            className="min-h-9 border-slate-200 px-4 py-2 text-[13px] font-medium text-slate-500 shadow-none hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            disabled={verified || resettingSession || resendLimitReached}
          />
          {remainingResends === 1 ? (
            <p className="text-sm font-semibold text-amber-600">
              Chỉ còn 1 lượt gửi lại OTP.
            </p>
          ) : null}
          {resendLimitReached ? (
            <p className="text-sm font-semibold text-red-600">
              Bạn đã dùng hết 3 lượt gửi lại OTP.
            </p>
          ) : null}
        </div>

        <p className="pt-1 text-center text-sm font-medium text-slate-600">
          <Link
            href="/auth/forgot-password"
            className="inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-base font-bold text-emerald-600 underline-offset-2 transition-colors hover:bg-emerald-50 hover:text-emerald-700 hover:underline"
          >
            Quay lại bước nhập email
          </Link>
        </p>
      </form>

      <AuthStatusToast
        visible={verified}
        tone="success"
        message="Xác thực thành công"
      />
      <AuthStatusToast
        visible={resettingSession}
        tone="danger"
        message={toastError ?? ""}
      />
    </section>
  );
}
