"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, Shield } from "lucide-react";

import { AuthApiError, authLogin2fa } from "@/src/auth/api/authApi";
import AuthStatusToast from "@/src/auth/components/AuthStatusToast";
import OtpInput from "@/src/auth/components/OtpInput";
import { getRedirectPathByRole } from "@/src/auth/constants";
import {
  clearEmail,
  clearTempToken,
  clearTwoFactorVerifySession,
  getEmail,
  getTempToken,
  getTwoFactorVerifySession,
  setAuthenticatedSession,
  setTwoFactorVerifySession,
  startTwoFactorVerifySession,
  type TwoFactorVerifySession,
} from "@/src/auth/session/sessionStore";
import {
  AUTH_GENERIC,
  formatEmailShort,
  logAuthClientError,
} from "@/src/auth/utils/clientErrors";
import { isValidOtp, normalizeOtp } from "@/src/auth/validators";

const REDIRECT_MS = 1800;
const RESET_REDIRECT_MS = 3500;
const MAX_VERIFY_ATTEMPTS = 3;
const TEMP_TOKEN_TTL_MS = 5 * 60 * 1000;
const TWO_FACTOR_RESET_PATTERNS = [
  "phien xac thuc khong hop le hoac da het han",
  "otp khong hop le hoac da het han",
  "otp da bi khoa do nhap sai qua 3 lan",
  "vui long dang nhap lai",
  "tai khoan khong ton tai",
  "tai khoan tam khoa",
  "tai khoan cua ban da bi khoa",
] as const;

const TEXT = {
  pageTitle:
    "\u0058\u00e1\u0063 \u0074\u0068\u1ef1\u0063 \u0032 \u0062\u01b0\u1edb\u0063",
  codeTitle:
    "\u004d\u00e3 \u0078\u00e1\u0063 \u0074\u0068\u1ef1\u0063 \u0032 \u0062\u01b0\u1edb\u0063",
  sentTo: "\u0047\u1eedi \u0074\u1edbi",
  prompt:
    "\u004e\u0068\u1ead\u0070 \u0036 \u0063\u0068\u1eef \u0073\u1ed1 \u0074\u0072\u006f\u006e\u0067 \u0065\u006d\u0061\u0069\u006c \u0111\u1ec3 \u0068\u006f\u00e0\u006e \u0074\u1ea5\u0074 \u0111\u0103\u006e\u0067 \u006e\u0068\u1ead\u0070\u002e",
  loginLabel: "\u0110\u0103\u006e\u0067 \u006e\u0068\u1ead\u0070",
  submitLabel: "\u0058\u00e1\u0063 \u0074\u0068\u1ef1\u0063",
  loadingLabel:
    "\u0110\u0061\u006e\u0067 \u0078\u1eed \u006c\u00fd\u002e\u002e\u002e",
  successToast:
    "\u0110\u0103\u006e\u0067 \u006e\u0068\u1ead\u0070 \u0074\u0068\u00e0\u006e\u0068 \u0063\u00f4\u006e\u0067",
  resetToast:
    "\u0050\u0068\u0069\u00ea\u006e \u0078\u00e1\u0063 \u0074\u0068\u1ef1\u0063 \u0111\u00e3 \u0068\u1ebf\u0074 \u0068\u0069\u1ec7\u0075 \u006c\u1ef1\u0063",
  sessionExpired:
    "\u0050\u0068\u0069\u00ea\u006e \u0078\u00e1\u0063 \u0074\u0068\u1ef1\u0063 \u0032 \u0062\u01b0\u1edb\u0063 \u0111\u00e3 \u0068\u1ebf\u0074 \u0068\u0069\u1ec7\u0075 \u006c\u1ef1\u0063\u002e \u0042\u1ea1\u006e \u0073\u1ebd \u0111\u01b0\u1ee3\u0063 \u0111\u01b0\u0061 \u0076\u1ec1 \u0074\u0072\u0061\u006e\u0067 \u0111\u0103\u006e\u0067 \u006e\u0068\u1ead\u0070 \u0073\u0061\u0075 \u00ed\u0074 \u0067\u0069\u00e2\u0079\u002e",
  sessionExpiredShort:
    "\u0050\u0068\u0069\u00ea\u006e \u0078\u00e1\u0063 \u0074\u0068\u1ef1\u0063 \u0032 \u0062\u01b0\u1edb\u0063 \u0111\u00e3 \u0068\u1ebf\u0074 \u0068\u0069\u1ec7\u0075 \u006c\u1ef1\u0063\u002c \u0076\u0075\u0069 \u006c\u00f2\u006e\u0067 \u0111\u0103\u006e\u0067 \u006e\u0068\u1ead\u0070 \u006c\u1ea1\u0069\u002e",
  invalidOtp:
    "\u0056\u0075\u0069 \u006c\u00f2\u006e\u0067 \u006e\u0068\u1ead\u0070 \u0111\u1ee7 \u0036 \u0063\u0068\u1eef \u0073\u1ed1\u002e",
} as const;

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function shouldResetTwoFactorSession(message?: string) {
  const normalizedMessage = normalizeText(message);
  return TWO_FACTOR_RESET_PATTERNS.some((pattern) =>
    normalizedMessage.includes(pattern),
  );
}

function buildAttemptsLeftMessage(remainingVerifyAttempts: number) {
  return `\u0042\u1ea1\u006e \u0063\u00f2\u006e ${remainingVerifyAttempts} \u006c\u1ea7\u006e \u006e\u0068\u1ead\u0070 \u0076\u1edb\u0069 \u006d\u00e3 \u0068\u0069\u1ec7\u006e \u0074\u1ea1\u0069\u002e`;
}

export default function TwoFactorPage() {
  const router = useRouter();
  const verifySessionRef = useRef<TwoFactorVerifySession | null>(null);
  const redirectTimeoutRef = useRef<number | null>(null);
  const resetRedirectRef = useRef<number | null>(null);

  const [tempToken, setTempTokenState] = useState<string | null>(null);
  const [mailHint, setMailHint] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [entered, setEntered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [resettingSession, setResettingSession] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);

  function syncTwoFactorSession(nextSession: TwoFactorVerifySession | null) {
    verifySessionRef.current = nextSession;

    if (!nextSession) {
      setFailedAttempts(0);
      clearTwoFactorVerifySession();
      return;
    }

    setFailedAttempts(nextSession.failedAttempts);
    setTwoFactorVerifySession(nextSession);
  }

  function ensureTwoFactorSession(
    currentEmail: string,
    currentTempToken: string,
  ) {
    const normalizedEmail = currentEmail.trim().toLowerCase();
    const currentSession = verifySessionRef.current;

    if (
      currentSession?.email === normalizedEmail &&
      currentSession.tempToken === currentTempToken
    ) {
      return currentSession;
    }

    const storedSession = getTwoFactorVerifySession();
    if (
      storedSession?.email === normalizedEmail &&
      storedSession.tempToken === currentTempToken
    ) {
      syncTwoFactorSession(storedSession);
      return storedSession;
    }

    const freshSession = startTwoFactorVerifySession(
      normalizedEmail,
      currentTempToken,
    );
    syncTwoFactorSession(freshSession);
    return freshSession;
  }

  function updateTwoFactorSession(
    updater: (session: TwoFactorVerifySession) => TwoFactorVerifySession,
  ) {
    if (!mailHint || !tempToken) return null;
    const nextSession = updater(ensureTwoFactorSession(mailHint, tempToken));
    syncTwoFactorSession(nextSession);
    return nextSession;
  }

  function isTempTokenExpired(session: TwoFactorVerifySession) {
    return Date.now() - session.startedAt >= TEMP_TOKEN_TTL_MS;
  }

  function clearTwoFactorChallengeAndRestart(message?: string) {
    syncTwoFactorSession(null);
    clearTempToken();
    setTempTokenState(null);
    setResettingSession(true);
    setOtpCode("");
    setSubmitError(message ?? TEXT.sessionExpired);

    if (resetRedirectRef.current) {
      clearTimeout(resetRedirectRef.current);
    }
    resetRedirectRef.current = window.setTimeout(() => {
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
          verifySessionRef.current = storedSession;
          setFailedAttempts(storedSession.failedAttempts);
        } else {
          const freshSession = startTwoFactorVerifySession(
            storedEmail,
            storedTempToken,
          );
          verifySessionRef.current = freshSession;
          setFailedAttempts(freshSession.failedAttempts);
        }
      }
    } catch {
      setTempTokenState(null);
      setMailHint(null);
    }

    const frameId = requestAnimationFrame(() => setEntered(true));
    return () => {
      cancelAnimationFrame(frameId);
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      if (resetRedirectRef.current) {
        clearTimeout(resetRedirectRef.current);
      }
    };
  }, []);

  function scheduleRedirect(path: string) {
    setRedirecting(true);
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }
    redirectTimeoutRef.current = window.setTimeout(() => {
      router.push(path);
    }, REDIRECT_MS);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!tempToken || !mailHint || resettingSession) return;

    setSubmitError(null);

    const normalized = normalizeOtp(otpCode);
    setOtpCode(normalized);
    if (!isValidOtp(normalized)) {
      setSubmitError(TEXT.invalidOtp);
      return;
    }

    const currentSession = ensureTwoFactorSession(mailHint, tempToken);
    if (isTempTokenExpired(currentSession)) {
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
        scheduleRedirect(getRedirectPathByRole(data.user?.role));
        return;
      }

      const nextSession = updateTwoFactorSession((storedSession) => ({
        ...storedSession,
        failedAttempts: storedSession.failedAttempts + 1,
      }));

      logAuthClientError("login-2fa-unexpected-status", data);

      if (
        shouldResetTwoFactorSession(data.message) ||
        (nextSession?.failedAttempts ?? MAX_VERIFY_ATTEMPTS) >=
          MAX_VERIFY_ATTEMPTS
      ) {
        clearTwoFactorChallengeAndRestart(
          data.message ?? TEXT.sessionExpiredShort,
        );
        return;
      }

      setSubmitError(data.message ?? AUTH_GENERIC.twoFaFailed);
    } catch (err) {
      logAuthClientError("login-2fa", err);

      if (err instanceof AuthApiError) {
        const nextSession = updateTwoFactorSession((storedSession) => ({
          ...storedSession,
          failedAttempts: storedSession.failedAttempts + 1,
        }));

        if (
          shouldResetTwoFactorSession(err.message) ||
          (nextSession?.failedAttempts ?? MAX_VERIFY_ATTEMPTS) >=
            MAX_VERIFY_ATTEMPTS
        ) {
          clearTwoFactorChallengeAndRestart(
            err.message || TEXT.sessionExpiredShort,
          );
          return;
        }

        setSubmitError(err.message || AUTH_GENERIC.twoFaFailed);
        return;
      }

      setSubmitError(AUTH_GENERIC.twoFaFailed);
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
          {AUTH_GENERIC.sessionInvalid}
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

  const remainingVerifyAttempts = Math.max(
    0,
    MAX_VERIFY_ATTEMPTS - failedAttempts,
  );
  const controlsDisabled = loading || redirecting || resettingSession;

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

        {failedAttempts > 0 && remainingVerifyAttempts > 0 ? (
          <p className="text-center text-sm font-semibold text-red-600 animate-in fade-in duration-200">
            {buildAttemptsLeftMessage(remainingVerifyAttempts)}
          </p>
        ) : null}

        {submitError ? (
          <div
            className="flex gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4 animate-in fade-in duration-200"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <p className="flex-1 text-left text-sm font-bold leading-relaxed text-red-800">
              {submitError}
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
        visible={redirecting}
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
