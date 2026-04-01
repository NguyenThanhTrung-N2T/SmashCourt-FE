"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Shield } from "lucide-react";

import {
  AuthApiError,
  authGoogleCallback,
  hasAuthErrorCode,
} from "@/src/api/auth.api";
import AuthStatusToast from "@/src/modules/auth/components/AuthStatusToast";
import { getRedirectPathByRole } from "@/src/modules/auth/constants";
import { setAuthenticatedSession } from "@/src/modules/auth/session/sessionStore";

const REDIRECT_MS = 2000;

function isAlternativeLoginMethodError(input: unknown, message?: string) {
  if (!hasAuthErrorCode(input, ["CONFLICT", "BAD_REQUEST"])) {
    return false;
  }

  const normalized = (message ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return (
    normalized.includes("da dang ky bang mat khau") ||
    normalized.includes("dang nhap bang email") ||
    normalized.includes("da dang ky bang google") ||
    normalized.includes("dang nhap bang google")
  );
}

export default function GoogleOauthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTimeoutRef = useRef<number | null>(null);

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!showToast) return;

    const timer = window.setTimeout(() => {
      setShowToast(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [showToast]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      if (!code || !state) {
        setLoading(false);
        setError("Thiếu thông tin callback OAuth Google.");
        return;
      }

      try {
        const data = await authGoogleCallback({ code, state });

        if (data.status === "Success") {
          if (data.accessToken && data.user) {
            setAuthenticatedSession({
              accessToken: data.accessToken,
              user: data.user,
            });
          }

          const role = data.user?.role as string | undefined;

          if (!cancelled) {
            setRedirecting(true);
            redirectTimeoutRef.current = window.setTimeout(() => {
              router.push(getRedirectPathByRole(role));
            }, REDIRECT_MS);
          }
          return;
        }

        const errorMessage = data.message ?? "Đăng nhập Google thất bại.";
        if (isAlternativeLoginMethodError(data, errorMessage)) {
          setToastError(errorMessage);
          setShowToast(true);
        } else {
          setError(errorMessage);
        }
      } catch (err) {
        if (cancelled) return;

        const errorMessage =
          err instanceof AuthApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Đăng nhập Google thất bại.";

        if (isAlternativeLoginMethodError(err, errorMessage)) {
          setToastError(errorMessage);
          setShowToast(true);
        } else {
          setError(errorMessage);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [code, router, state]);

  return (
    <section
      className={`mx-auto max-w-md transition-all duration-500 ease-out motion-reduce:transition-none ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Đăng nhập với Google
        </h2>
        {loading && !error && !toastError ? (
          <p className="mt-4 animate-pulse text-lg font-bold text-emerald-600">
            Hoàn tất quá trình xác thực...
          </p>
        ) : null}
      </div>

      {loading && !error && !toastError ? (
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-emerald-100">
            <Shield className="h-8 w-8 text-emerald-600" />
          </div>

          <div className="w-full space-y-3 text-center">
            <p className="text-sm font-semibold text-slate-600">
              Đang kết nối với Google
            </p>
            <div className="flex justify-center gap-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-600" />
              <div className="animation-delay-100 h-2 w-2 animate-bounce rounded-full bg-emerald-600" />
              <div className="animation-delay-200 h-2 w-2 animate-bounce rounded-full bg-emerald-600" />
            </div>
          </div>

          <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">
              Vui lòng không đóng trang này trong khi xác thực thông tin của bạn
            </p>
          </div>
        </div>
      ) : error || toastError ? (
        <div className="space-y-4">
          {error ? (
            <div className="flex gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-6 w-6 shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-800">{error}</p>
              </div>
            </div>
          ) : null}

          <div className="space-y-3 text-center">
            <p className="mt-2 text-sm font-medium text-slate-600">
              {toastError
                ? "Tài khoản đã được đăng ký bằng phương thức khác. Vui lòng đăng nhập lại."
                : "Có vấn đề xảy ra. Vui lòng thử lại."}
            </p>
            <a
              href="/auth/login"
              className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-base font-extrabold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-500/40"
            >
              ← Quay lại đăng nhập
            </a>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>

          <div className="w-full text-center">
            <p className="text-sm font-semibold text-slate-600">
              Đăng nhập thành công!
            </p>
            <p className="mt-2 text-xs text-slate-500">Đang chuyển hướng...</p>
          </div>
        </div>
      )}

      <AuthStatusToast
        visible={redirecting}
        tone="success"
        message="Đăng nhập thành công"
      />
      <AuthStatusToast
        visible={showToast}
        tone="danger"
        message={toastError ?? ""}
      />
    </section>
  );
}
