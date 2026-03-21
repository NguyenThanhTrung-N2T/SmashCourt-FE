"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Shield } from "lucide-react";

import { authLogin2fa, authResendOtp } from "@/src/auth/api/authApi";
import CountdownButton from "@/src/auth/components/CountdownButton";
import OtpInput from "@/src/auth/components/OtpInput";
import { getRedirectPathByRole, OtpType } from "@/src/auth/constants";
import {
  getEmail,
  getTempToken,
  setAuthenticatedSession,
} from "@/src/auth/session/sessionStore";
import {
  AUTH_GENERIC,
  formatEmailShort,
  logAuthClientError,
} from "@/src/auth/utils/clientErrors";
import { isValidOtp, normalizeOtp } from "@/src/auth/validators";

export default function TwoFactorPage() {
  const router = useRouter();

  const [tempToken, setTempTokenState] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const resendSuccessClearRef = useRef<number | null>(null);
  const [entered, setEntered] = useState(false);
  const [mailHint, setMailHint] = useState<string | null>(null);

  useEffect(() => {
    try {
      setTempTokenState(getTempToken() ?? null);
      setMailHint(getEmail());
    } catch {
      setTempTokenState(null);
    }
    const t = requestAnimationFrame(() => setEntered(true));
    return () => {
      cancelAnimationFrame(t);
      if (resendSuccessClearRef.current)
        clearTimeout(resendSuccessClearRef.current);
    };
  }, []);

  async function onResend() {
    const mail = getEmail();
    if (!mail) {
      setResendError(AUTH_GENERIC.sessionInvalid);
      throw new Error("no email");
    }
    setResendError(null);
    setResendSuccess(null);
    if (resendSuccessClearRef.current) {
      clearTimeout(resendSuccessClearRef.current);
      resendSuccessClearRef.current = null;
    }
    try {
      await authResendOtp({ email: mail, type: OtpType.TWO_FA });
      setResendSuccess(AUTH_GENERIC.resendOtpSuccess);
      resendSuccessClearRef.current = window.setTimeout(() => {
        setResendSuccess(null);
        resendSuccessClearRef.current = null;
      }, 8000);
    } catch (err) {
      logAuthClientError("resend-2fa", err);
      setResendError(AUTH_GENERIC.resendFailed);
      throw err;
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResendSuccess(null);
    if (resendSuccessClearRef.current) {
      clearTimeout(resendSuccessClearRef.current);
      resendSuccessClearRef.current = null;
    }

    if (!tempToken) {
      setError(AUTH_GENERIC.sessionInvalid);
      return;
    }

    const normalized = normalizeOtp(otpCode);
    setOtpCode(normalized);
    if (!isValidOtp(normalized)) {
      setError("Vui lòng nhập đủ 6 chữ số.");
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
        const role = data.user?.role as string | undefined;
        router.push(getRedirectPathByRole(role));
        return;
      }

      logAuthClientError("login-2fa-unexpected-status", data);
      setError(AUTH_GENERIC.twoFaFailed);
    } catch (err) {
      logAuthClientError("login-2fa", err);
      setError(AUTH_GENERIC.twoFaFailed);
    } finally {
      setLoading(false);
    }
  }

  if (!tempToken) {
    return (
      <section className="mx-auto max-w-md text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Xác thực 2 bước
        </h2>
        <p className="mt-3 text-base font-medium text-slate-600">
          {AUTH_GENERIC.sessionInvalid}
        </p>
        <div className="mt-4">
          <Link
            href="/auth/login"
            className="cursor-pointer font-bold text-emerald-600 underline-offset-2 hover:underline"
          >
            Đăng nhập
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
      <header className={`text-center ${entered ? "auth-animate-fade-up" : ""}`}>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Mã xác thực
        </h2>
      </header>

      {mailHint ? (
        <div
          className={`mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 ${entered ? "auth-animate-fade-up-delay" : ""}`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80">
            <Shield className="h-5 w-5 text-emerald-600" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Gửi tới
            </p>
            <p
              className="truncate font-mono text-sm font-semibold text-slate-800"
              title={mailHint}
            >
              {formatEmailShort(mailHint)}
            </p>
          </div>
        </div>
      ) : null}

      <p
        className={`mt-3 text-center text-sm font-medium text-slate-600 ${entered ? "auth-animate-fade-up-delay" : ""}`}
      >
        Nhập 6 chữ số trong email.
      </p>

      <form className="mt-8 flex flex-col gap-6" onSubmit={onSubmit}>
        <div
          className={`flex justify-center ${entered ? "auth-animate-fade-up-delay-2" : ""}`}
        >
          <OtpInput value={otpCode} onChange={setOtpCode} autoFocus />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-800">
            {error}
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
          disabled={loading}
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
          />
        </div>

        <p className="text-center text-sm font-medium text-slate-600">
          <Link
            href="/auth/login"
            className="cursor-pointer font-bold text-emerald-600 underline-offset-2 hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </form>
    </section>
  );
}
