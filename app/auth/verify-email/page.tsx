"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Mail } from "lucide-react";

import {
  AuthApiError,
  authResendOtp,
  authVerifyEmail,
} from "@/src/auth/api/authApi";
import CountdownButton from "@/src/auth/components/CountdownButton";
import OtpInput from "@/src/auth/components/OtpInput";
import { OtpType } from "@/src/auth/constants";
import {
  clearAuthSession,
  consumeRegisterFlashMessage,
  getEmail,
  setEmail,
  setPostVerifyLoginHint,
} from "@/src/auth/session/sessionStore";
import {
  AUTH_GENERIC,
  formatEmailShort,
  logAuthClientError,
} from "@/src/auth/utils/clientErrors";
import { isValidOtp, normalizeOtp } from "@/src/auth/validators";

const REDIRECT_MS = 2000;
const RESET_REDIRECT_MS = 3500;
const MAX_VERIFY_ATTEMPTS = 3;
const VERIFY_SESSION_RESET_PATTERNS = [
  "otp da bi khoa",
  "otp khong hop le",
  "da het han",
  "yeu cau ma moi",
  "email da duoc xac thuc truoc do",
  "tai khoan khong ton tai",
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

export default function VerifyEmailPage() {
  const router = useRouter();

  const [email, setEmailState] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const resendSuccessClearRef = useRef<number | null>(null);
  const resetRedirectRef = useRef<number | null>(null);
  const failedVerifyAttemptsRef = useRef(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resettingSession, setResettingSession] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    try {
      const storedEmail = getEmail();
      setEmailState(storedEmail ?? null);
      if (storedEmail) setEmail(storedEmail);
      consumeRegisterFlashMessage();
    } catch {
      setEmailState(null);
    }
    setPortalReady(true);
    const t = requestAnimationFrame(() => setEntered(true));
    return () => {
      cancelAnimationFrame(t);
      setPortalReady(false);
    };
  }, []);

  function clearVerifySessionAndRestart(message?: string) {
    failedVerifyAttemptsRef.current = 0;
    clearAuthSession();
    setResettingSession(true);
    setOtpCode("");
    setSubmitError(
      message ??
        "Phiên xác thực đã hết hiệu lực. Bạn sẽ được đưa về trang đăng ký sau ít giây.",
    );
    setResendError(null);
    setResendSuccess(null);
    if (resetRedirectRef.current) {
      clearTimeout(resetRedirectRef.current);
    }
    resetRedirectRef.current = window.setTimeout(() => {
      setEmailState(null);
      router.replace("/auth/register");
    }, RESET_REDIRECT_MS);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || resettingSession) return;
    setSubmitError(null);
    setResendSuccess(null);
    if (resendSuccessClearRef.current) {
      clearTimeout(resendSuccessClearRef.current);
      resendSuccessClearRef.current = null;
    }

    const normalized = normalizeOtp(otpCode);
    setOtpCode(normalized);
    if (!isValidOtp(normalized)) {
      return setSubmitError("Vui lòng nhập đủ 6 chữ số.");
    }

    try {
      setLoading(true);
      const data = await authVerifyEmail({ email, otpCode: normalized });

      if (data.status && normalizeText(data.status) !== "success") {
        failedVerifyAttemptsRef.current += 1;
        logAuthClientError("verify-email-unexpected-status", data);

        if (
          shouldResetVerifySession(data.status, data.message) ||
          failedVerifyAttemptsRef.current >= MAX_VERIFY_ATTEMPTS
        ) {
          clearVerifySessionAndRestart(
            data.message ??
              "Mã OTP không còn hợp lệ. Bạn sẽ được đưa về trang đăng ký sau ít giây.",
          );
          return;
        }

        setSubmitError(data.message ?? AUTH_GENERIC.verifyFailed);
        return;
      }

      setPostVerifyLoginHint(
        "Email đã xác thực thành công. Bạn có thể đăng nhập.",
      );
      failedVerifyAttemptsRef.current = 0;
      setVerified(true);
      window.setTimeout(() => {
        router.push("/auth/login");
      }, REDIRECT_MS);
    } catch (err) {
      logAuthClientError("verify-email", err);

      if (err instanceof AuthApiError) {
        failedVerifyAttemptsRef.current += 1;

        if (
          err.status === 404 ||
          shouldResetVerifySession(undefined, err.message) ||
          failedVerifyAttemptsRef.current >= MAX_VERIFY_ATTEMPTS
        ) {
          clearVerifySessionAndRestart(
            err.message ||
              "Phiên xác thực đã hết hiệu lực. Bạn sẽ được đưa về trang đăng ký sau ít giây.",
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
    if (!email || resettingSession) return;
    setResendError(null);
    setResendSuccess(null);
    if (resendSuccessClearRef.current) {
      clearTimeout(resendSuccessClearRef.current);
      resendSuccessClearRef.current = null;
    }
    try {
      await authResendOtp({ email, type: OtpType.EMAIL_VERIFY });
      failedVerifyAttemptsRef.current = 0;
      setResendSuccess(AUTH_GENERIC.resendOtpSuccess);
      resendSuccessClearRef.current = window.setTimeout(() => {
        setResendSuccess(null);
        resendSuccessClearRef.current = null;
      }, 8000);
    } catch (err) {
      logAuthClientError("resend-email-verify", err);
      setResendError(AUTH_GENERIC.resendFailed);
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
          Xác thực email
        </h2>
        <p className="mt-3 text-base font-medium text-slate-600">
          {AUTH_GENERIC.sessionInvalid}
        </p>
        <div className="mt-4">
          <Link
            className="cursor-pointer font-bold text-emerald-600 underline-offset-2 transition-colors hover:text-emerald-700 hover:underline"
            href="/auth/register"
          >
            Đăng ký
          </Link>
        </div>
      </section>
    );
  }

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
          <Mail className="h-5 w-5 text-emerald-600" aria-hidden />
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
        Nhập 6 chữ số trong email.
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
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-900"
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
            label="Gửi lại mã"
            resendLabel="Gửi lại sau"
            variant="outline"
            disabled={verified || resettingSession}
          />
        </div>

        <p className="text-center text-sm font-medium text-slate-600">
          <Link
            href="/auth/login"
            className="cursor-pointer font-bold text-emerald-600 underline-offset-2 transition-colors hover:text-emerald-700 hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </form>

      {portalReady && (resettingSession || verified)
        ? createPortal(
            <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center px-4 pt-5">
              <div
                className={`auth-animate-scale-in w-full max-w-sm rounded-2xl border bg-white/95 px-5 py-4 text-center shadow-xl backdrop-blur ${
                  verified
                    ? "border-emerald-200 shadow-emerald-500/10 ring-1 ring-emerald-100"
                    : "border-red-200 shadow-red-500/10 ring-1 ring-red-100"
                }`}
                role="status"
                aria-live="assertive"
              >
                <div
                  className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${
                    verified
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <CheckCircle2
                    className="h-6 w-6"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                </div>
                <p
                  className={`mt-3 text-sm font-semibold ${
                    verified ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {verified
                    ? "Đang chuyển đến trang đăng nhập..."
                    : "Đang quay lại trang đăng ký..."}
                </p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
