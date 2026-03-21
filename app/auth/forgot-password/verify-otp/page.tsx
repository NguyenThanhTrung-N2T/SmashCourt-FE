"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { KeyRound } from "lucide-react";

import {
  authForgotPasswordVerifyOtp,
  authResendOtp,
} from "@/src/auth/api/authApi";
import AuthStatusToast from "@/src/auth/components/AuthStatusToast";
import CountdownButton from "@/src/auth/components/CountdownButton";
import OtpInput from "@/src/auth/components/OtpInput";
import { OtpType } from "@/src/auth/constants";
import {
  consumeForgotPasswordFlashMessage,
  getEmail,
  setResetToken,
} from "@/src/auth/session/sessionStore";
import {
  AUTH_GENERIC,
  formatEmailShort,
  logAuthClientError,
} from "@/src/auth/utils/clientErrors";
import { isValidOtp, normalizeOtp } from "@/src/auth/validators";

const REDIRECT_MS = 1800;

export default function VerifyOtpPage() {
  const router = useRouter();
  const resendSuccessClearRef = useRef<number | null>(null);
  const redirectTimeoutRef = useRef<number | null>(null);

  const [email, setEmailState] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    try {
      setEmailState(getEmail() ?? null);
      const flashMessage = consumeForgotPasswordFlashMessage();
      if (flashMessage) {
        setResendSuccess(flashMessage);
        resendSuccessClearRef.current = window.setTimeout(() => {
          setResendSuccess(null);
          resendSuccessClearRef.current = null;
        }, 8000);
      }
    } catch {
      setEmailState(null);
    }

    const frameId = requestAnimationFrame(() => setEntered(true));
    return () => {
      cancelAnimationFrame(frameId);
      if (resendSuccessClearRef.current) {
        clearTimeout(resendSuccessClearRef.current);
      }
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || redirecting) return;

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
      const data = await authForgotPasswordVerifyOtp({
        email,
        otpCode: normalized,
      });

      if (data.resetToken) {
        setResetToken(data.resetToken);
        setRedirecting(true);
        redirectTimeoutRef.current = window.setTimeout(() => {
          router.push("/auth/reset-password");
        }, REDIRECT_MS);
        return;
      }

      logAuthClientError("forgot-verify-otp-no-token", data);
      setSubmitError(AUTH_GENERIC.verifyFailed);
    } catch (err) {
      logAuthClientError("forgot-verify-otp", err);
      setSubmitError(
        err instanceof Error ? err.message : AUTH_GENERIC.verifyFailed,
      );
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (!email || redirecting) return;

    setSubmitError(null);
    setResendError(null);
    setResendSuccess(null);
    if (resendSuccessClearRef.current) {
      clearTimeout(resendSuccessClearRef.current);
      resendSuccessClearRef.current = null;
    }

    try {
      const data = await authResendOtp({
        email,
        type: OtpType.FORGOT_PASSWORD,
      });
      setResendSuccess(
        data.message ?? "Mã OTP khôi phục đã được gửi lại qua email.",
      );
      resendSuccessClearRef.current = window.setTimeout(() => {
        setResendSuccess(null);
        resendSuccessClearRef.current = null;
      }, 8000);
    } catch (err) {
      logAuthClientError("resend-forgot-otp", err);
      const nextMessage =
        err instanceof Error ? err.message : AUTH_GENERIC.resendFailed;
      setResendError(nextMessage);
      throw err;
    }
  }

  const controlsDisabled = loading || redirecting;

  if (!email) {
    return (
      <section className="mx-auto max-w-md text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Mã xác thực
        </h2>
        <p className="mt-3 text-base font-medium text-slate-600">
          {AUTH_GENERIC.sessionInvalid}
        </p>
        <div className="mt-4">
          <Link
            href="/auth/forgot-password"
            className="font-bold text-emerald-600 underline-offset-2 hover:underline"
          >
            Quên mật khẩu
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
          disabled={controlsDisabled}
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
            className="min-h-9 border-slate-200 px-4 py-2 text-[13px] font-medium text-slate-500 shadow-none hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            disabled={controlsDisabled}
          />
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
        visible={redirecting}
        tone="success"
        message="Xác thực thành công"
      />
    </section>
  );
}

