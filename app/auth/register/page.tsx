"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, Lock, Mail, Phone, User, UserPlus } from "lucide-react";

import {
  authRegister,
  getAuthFieldError,
  hasAuthErrorCode,
} from "@/src/auth/api/authApi";
import AuthStatusToast from "@/src/auth/components/AuthStatusToast";
import {
  setEmail,
  setRegisterFlashMessage,
  startRegisterVerifySession,
} from "@/src/auth/session/sessionStore";
import { isValidPassword } from "@/src/auth/validators";

function isAlternativeLoginMethodError(message?: string) {
  const normalized = (message ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return (
    normalized.includes("da dang ky bang google") ||
    normalized.includes("dang nhap bang google") ||
    normalized.includes("da dang ky bang mat khau") ||
    normalized.includes("dang nhap bang email")
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmailState] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!toastError) return;

    const timer = window.setTimeout(() => {
      setToastError(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [toastError]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setToastError(null);

    const trimmedEmail = email.trim();
    const trimmedFullName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedEmail) return setError("Vui lòng nhập email.");
    if (!trimmedFullName) return setError("Vui lòng nhập họ và tên.");
    if (!password) return setError("Vui lòng nhập mật khẩu.");

    if (!isValidPassword(password)) {
      return setError(
        "Mật khẩu phải có ít nhất 8 ký tự, gồm 1 chữ hoa, 1 số và 1 ký tự đặc biệt.",
      );
    }

    try {
      setLoading(true);
      const response = await authRegister({
        email: trimmedEmail,
        password,
        fullName: trimmedFullName,
        phone: trimmedPhone || undefined,
      });

      if (response.message) {
        setRegisterFlashMessage(response.message);
      }

      setEmail(trimmedEmail);
      startRegisterVerifySession(trimmedEmail);
      router.push("/auth/verify-email");
    } catch (err) {
      const fieldError =
        getAuthFieldError(err, ["email", "fullName", "phone", "password"]) ??
        null;
      const errorMessage =
        fieldError ??
        (err instanceof Error ? err.message : "Đăng ký thất bại.");

      if (
        hasAuthErrorCode(err, "CONFLICT") &&
        isAlternativeLoginMethodError(errorMessage)
      ) {
        setToastError(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className={`w-full transform transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Mở tài khoản
        </h2>
        <p className="mt-3 text-base font-medium text-slate-600">
          Dành cho hội viên trực thuộc hệ thống chi nhánh.
        </p>
      </div>

      {error ? (
        <div className="mb-6 flex gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-4 shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="flex-1 text-sm font-bold leading-relaxed text-red-800">
            {error}
          </p>
        </div>
      ) : null}

      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">
            Email cá nhân
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-emerald-600">
              <Mail className="h-5 w-5" />
            </div>
            <input
              className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 font-medium text-slate-900 outline-none transition-all duration-200 ease-out placeholder:font-normal placeholder:text-slate-400 hover:border-emerald-300 hover:shadow-md focus:bg-white focus:border-emerald-500 focus:shadow-lg focus:ring-4 focus:ring-emerald-500/10 focus:duration-150 motion-reduce:transition-none"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmailState(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">Họ và tên</label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-emerald-600">
              <User className="h-5 w-5" />
            </div>
            <input
              className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 font-medium text-slate-900 outline-none transition-all duration-200 ease-out placeholder:font-normal placeholder:text-slate-400 hover:border-emerald-300 hover:shadow-md focus:bg-white focus:border-emerald-500 focus:shadow-lg focus:ring-4 focus:ring-emerald-500/10 focus:duration-150 motion-reduce:transition-none"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">
            Số điện thoại{" "}
          </label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-emerald-600">
              <Phone className="h-5 w-5" />
            </div>
            <input
              className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 font-medium text-slate-900 outline-none transition-all duration-200 ease-out placeholder:font-normal placeholder:text-slate-400 hover:border-emerald-300 hover:shadow-md focus:bg-white focus:border-emerald-500 focus:shadow-lg focus:ring-4 focus:ring-emerald-500/10 focus:duration-150 motion-reduce:transition-none"
              placeholder="0912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">Mật khẩu</label>
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-emerald-600">
              <Lock className="h-5 w-5" />
            </div>
            <input
              className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 font-medium text-slate-900 outline-none transition-all duration-200 ease-out placeholder:font-normal placeholder:text-slate-400 hover:border-emerald-300 hover:shadow-md focus:bg-white focus:border-emerald-500 focus:shadow-lg focus:ring-4 focus:ring-emerald-500/10 focus:duration-150 motion-reduce:transition-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-4 text-base font-extrabold text-white shadow-lg shadow-slate-900/20 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/30 active:translate-y-0 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
        >
          {loading ? (
            "Đang xử lý..."
          ) : (
            <>
              Tạo tài khoản ngay <UserPlus className="h-5 w-5" />
            </>
          )}
        </button>

        <p className="mt-8 text-center text-base font-medium text-slate-600">
          Đã có mã hội viên?{" "}
          <Link
            href="/auth/login"
            className="inline-flex min-h-12 items-center justify-center rounded-xl px-4 text-lg font-extrabold text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-500 hover:underline"
          >
            Đăng nhập hệ thống
          </Link>
        </p>
      </form>

      <AuthStatusToast
        visible={toastError !== null}
        tone="danger"
        message={toastError ?? ""}
      />
    </section>
  );
}
