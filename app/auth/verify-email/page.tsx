"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail } from "lucide-react";

import { hasAuthErrorCode } from "@/src/api/auth.api";
import AuthStatusToast from "@/src/modules/auth/components/AuthStatusToast";
import CountdownButton from "@/src/modules/auth/components/CountdownButton";
import OtpInput from "@/src/modules/auth/components/OtpInput";
import { OtpType } from "@/src/modules/auth/constants";
import {
  clearAuthSession,
  clearRegisterVerifySession,
  consumeRegisterFlashMessage,
  getEmail,
  getRegisterVerifySession,
  setPostVerifyLoginHint,
} from "@/src/modules/auth/session/sessionStore";
import { formatEmailShort } from "@/src/modules/auth/utils/clientErrors";
import { useOtpVerification } from "@/src/modules/auth/hooks/useOtpVerification";
import { useAuthRedirect } from "@/src/modules/auth/hooks/useAuthRedirect";
import { useAuthErrors } from "@/src/modules/auth/hooks/useAuthError";
import type { AuthFormEvent } from "@/src/modules/auth/types/forms";

const RESET_REDIRECT_MS = 3500;
const MAX_VERIFY_ATTEMPTS = 3;
const MAX_RESEND_ATTEMPTS = 3;

function shouldResetVerifySession(input?: unknown) {
  return hasAuthErrorCode(input, [
    "OTP_LIMIT_EXCEEDED",
    "NOT_FOUND",
    "TOKEN_INVALID",
  ]);
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmailState] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resettingSession, setResettingSession] = useState(false);

  // Use new hooks
  const { errors, showError, clearAllErrors } = useAuthErrors({
    types: ["submit", "resend", "success"],
    autoDismiss: { success: true },
    dismissDelay: { success: 8000 },
  });

  const { scheduleRedirect } = useAuthRedirect({
    delay: 2000,
  });

  // Load initial session state
  const [initialState] = useState(() => {
    const storedSession = getRegisterVerifySession();
    return {
      failedAttempts: storedSession?.failedAttempts ?? 0,
      resendCount: storedSession?.resendCount ?? 0,
    };
  });

  const {
    otpCode,
    setOtpCode,
    verify,
    resend,
    remainingAttempts,
    remainingResends,
    isVerifying,
    isResending,
    isValidFormat,
  } = useOtpVerification({
    email: email ?? "",
    type: OtpType.EMAIL_VERIFY,
    maxAttempts: MAX_VERIFY_ATTEMPTS,
    maxResends: MAX_RESEND_ATTEMPTS,
    initialFailedAttempts: initialState.failedAttempts,
    initialResendCount: initialState.resendCount,
    onSuccess: () => {
      clearRegisterVerifySession();
      clearAllErrors();
      setPostVerifyLoginHint("Email đã xác thực thành công. Bạn có thể đăng nhập.");
      setVerified(true);
      scheduleRedirect("/auth/login");
    },
    onError: (err) => {
      if (shouldResetVerifySession(err)) {
        clearVerifySessionAndRestart(
          err instanceof Error ? err.message : "Phiên xác thực đã hết hiệu lực."
        );
      } else {
        showError("submit", err, "verify-email");
      }
    },
    onResendSuccess: (message) => {
      clearAllErrors();
      showError("success", new Error(message ?? "OTP đã được gửi lại"), "verify-email");
    },
    onResendError: (err) => {
      if (shouldResetVerifySession(err)) {
        clearVerifySessionAndRestart(
          err instanceof Error ? err.message : "Phiên xác thực đã hết hiệu lực."
        );
      } else {
        showError("resend", err, "verify-email");
      }
    },
  });

  function clearVerifySessionAndRestart(message?: string) {
    clearRegisterVerifySession();
    clearAuthSession();
    setResettingSession(true);
    setOtpCode("");
    clearAllErrors();
    showError(
      "submit",
      new Error(
        message ??
          "Phiên xác thực đã hết hiệu lực. Bạn sẽ được đưa về trang đăng ký sau ít giây."
      ),
      "verify-email"
    );

    setTimeout(() => {
      setEmailState(null);
      router.replace("/auth/register");
    }, RESET_REDIRECT_MS);
  }

  useEffect(() => {
    try {
      const storedEmail = getEmail()?.trim().toLowerCase() ?? null;
      setEmailState(storedEmail);

      const flashMessage = consumeRegisterFlashMessage();
      if (flashMessage) {
        showError("success", new Error(flashMessage), "verify-email");
      }
    } catch {
      setEmailState(null);
    }

    const frameId = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  async function onSubmit(e: AuthFormEvent) {
    e.preventDefault();
    if (!email || resettingSession) return;

    clearAllErrors();

    if (!isValidFormat) {
      showError("submit", new Error("Vui lòng nhập đủ 6 chữ số."), "verify-email");
      return;
    }

    await verify();
  }

  async function onResend() {
    if (!email || resettingSession) return;
    clearAllErrors();
    await resend();
  }

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
          Phiên không hợp lệ. Vui lòng thực hiện lại từ đầu.
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

        {remainingAttempts > 0 && remainingAttempts < MAX_VERIFY_ATTEMPTS ? (
          <p className="text-center text-sm font-semibold text-red-600">
            Bạn còn {remainingAttempts} lần nhập với mã hiện tại.
          </p>
        ) : null}

        {errors.submit ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-800">
            {errors.submit}
          </div>
        ) : null}

        {errors.resend ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-800">
            {errors.resend}
          </div>
        ) : null}

        {errors.success ? (
          <div
            className="overflow-x-auto whitespace-nowrap rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-[13px] font-semibold text-emerald-900"
            role="status"
            aria-live="polite"
          >
            {errors.success}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isVerifying || verified || resettingSession}
          className="h-12 w-full cursor-pointer rounded-xl bg-slate-900 text-sm font-bold text-white shadow-md transition-all duration-200 ease-out hover:bg-slate-800 hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:active:scale-100"
        >
          {isVerifying ? "Đang xử lý..." : "Xác thực"}
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
            disabled={verified || resettingSession || resendLimitReached || isResending}
          />
          {remainingResends === 1 ? (
            <p className="text-sm font-semibold text-amber-600">
              Chỉ còn 1 lượt gửi lại OTP cuối cùng.
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
            href="/auth/login"
            className="inline-flex min-h-14 items-center justify-center rounded-xl px-6 text-lg font-extrabold text-emerald-600 underline-offset-2 transition-colors hover:bg-emerald-50 hover:text-emerald-700 hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </form>

      <AuthStatusToast
        visible={verified}
        tone="success"
        message="Xác thực email thành công"
      />
      <AuthStatusToast
        visible={resettingSession}
        tone="danger"
        message="Phiên xác thực đã hết hiệu lực"
      />
    </section>
  );
}


