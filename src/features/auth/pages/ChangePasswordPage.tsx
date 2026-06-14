"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, KeyRound, Lock } from "lucide-react";

import {
  authChangePasswordWithTempToken,
  getAuthFieldError,
} from "@/src/api/auth.api";
import AuthStatusToast from "@/src/features/auth/components/AuthStatusToast";
import {
  clearEmail,
  clearPasswordChangeSession,
  clearTempToken,
  getEmail,
  getPasswordChangeSession,
  getTempToken,
} from "@/src/features/auth/session/sessionStore";
import { isValidPassword } from "@/src/features/auth/validators";

const REDIRECT_MS = 2000;
const TEMP_TOKEN_TTL_MS = 10 * 60 * 1000;

export default function ChangePasswordPage() {
  const router = useRouter();
  const redirectTimeoutRef = useRef<number | null>(null);

  const [tempToken, setTempTokenState] = useState<string | null>(null);
  const [email, setEmailState] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const storedToken = getTempToken();
      const storedEmail = getEmail();
      const session = getPasswordChangeSession();
      const isExpired = session
        ? Date.now() - session.startedAt >= TEMP_TOKEN_TTL_MS
        : false;

      if (!storedToken || !session || session.tempToken !== storedToken || isExpired) {
        clearPasswordChangeSession();
        clearTempToken();
        setTempTokenState(null);
        setEmailState(null);
        return;
      }

      setTempTokenState(storedToken);
      setEmailState(session.email || storedEmail);
    } catch {
      setTempTokenState(null);
      setEmailState(null);
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!tempToken) {
      setError("Phiên đổi mật khẩu không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới.");
      return;
    }

    if (!confirmPassword) {
      setError("Vui lòng xác nhận lại mật khẩu mới.");
      return;
    }

    if (!isValidPassword(newPassword)) {
      setError(
        "Mật khẩu phải có ít nhất 8 ký tự, gồm 1 chữ hoa, 1 số và 1 ký tự đặc biệt.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);
      await authChangePasswordWithTempToken({
        tempToken,
        newPassword,
        confirmPassword,
      });

      clearPasswordChangeSession();
      clearTempToken();
      clearEmail();
      setRedirecting(true);
      redirectTimeoutRef.current = window.setTimeout(() => {
        router.push("/auth/login");
      }, REDIRECT_MS);
    } catch (err) {
      const fieldError = getAuthFieldError(err, [
        "tempToken",
        "newPassword",
        "confirmPassword",
      ]);

      setError(
        fieldError ??
          (err instanceof Error ? err.message : "Đổi mật khẩu thất bại."),
      );
    } finally {
      setLoading(false);
    }
  }

  if (!tempToken) {
    return (
      <section className="mx-auto max-w-md text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Đổi mật khẩu
        </h2>
        <p className="mt-3 text-base font-medium text-slate-600">
          Không tìm thấy phiên đổi mật khẩu. Vui lòng đăng nhập lại để tiếp tục.
        </p>
        <div className="mt-4">
          <Link
            className="font-bold text-emerald-600 underline-offset-2 hover:underline"
            href="/auth/login"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </section>
    );
  }

  const controlsDisabled = loading || redirecting;

  return (
    <section
      className={`w-full transform transition-all duration-700 motion-reduce:transform-none motion-reduce:transition-none ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <KeyRound className="h-6 w-6" />
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Đổi mật khẩu
        </h2>
        <p className="mt-3 text-base font-medium text-slate-600">
          Tài khoản mới cần đặt mật khẩu riêng trước khi sử dụng hệ thống.
        </p>
        {email ? (
          <p className="mt-2 truncate text-sm font-semibold text-emerald-700">
            {email}
          </p>
        ) : null}
      </div>

      {error ? (
        <div
          className="mb-6 flex gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4 shadow-sm"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="flex-1 text-sm font-bold leading-relaxed text-red-800">
            {error}
          </p>
        </div>
      ) : null}

      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">
            Mật khẩu mới
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-emerald-600">
              <Lock className="h-5 w-5" />
            </div>
            <input
              className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 font-medium text-slate-900 outline-none transition-all duration-300 placeholder:font-normal placeholder:text-slate-400 hover:border-emerald-300 hover:shadow-md focus:-translate-y-0.5 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:shadow-lg"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
              disabled={controlsDisabled}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">
            Xác nhận mật khẩu
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-emerald-600">
              <Lock className="h-5 w-5" />
            </div>
            <input
              className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 font-medium text-slate-900 outline-none transition-all duration-300 placeholder:font-normal placeholder:text-slate-400 hover:border-emerald-300 hover:shadow-md focus:-translate-y-0.5 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:shadow-lg"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
              disabled={controlsDisabled}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium leading-6 text-slate-600">
          Mật khẩu cần có ít nhất 8 ký tự, gồm 1 chữ hoa, 1 số và 1 ký tự đặc
          biệt.
        </div>

        <button
          type="submit"
          disabled={controlsDisabled}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-4 text-base font-extrabold text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-60"
        >
          {loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
        </button>
      </form>

      <AuthStatusToast
        visible={redirecting}
        tone="success"
        message="Đổi mật khẩu thành công. Vui lòng đăng nhập lại."
      />
    </section>
  );
}
