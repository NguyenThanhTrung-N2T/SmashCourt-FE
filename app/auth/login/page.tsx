"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Mail, Lock, LogIn } from "lucide-react";

import { authLogin } from "@/src/auth/api/authApi";
import { getRedirectPathByRole } from "@/src/auth/constants";
import {
  setAccessToken,
  setEmail,
  setTempToken,
} from "@/src/auth/session/sessionStore";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmailState] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Entrance animation state
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return setError("Vui lòng nhập email.");
    if (!password) return setError("Vui lòng nhập mật khẩu.");

    try {
      setLoading(true);
      const data = await authLogin({ email: trimmedEmail, password });

      if (data.status === "2fa_required") {
        if (!data.tempToken) {
          return setError("Thiếu mã 2FA. Vui lòng thử lại.");
        }
        setEmail(trimmedEmail);
        setTempToken(data.tempToken);
        router.push("/auth/2fa");
        return;
      }

      if (data.status === "Success") {
        if (data.accessToken) setAccessToken(data.accessToken);
        const role = data.user?.role as string | undefined;
        router.push(getRedirectPathByRole(role));
        return;
      }

      setError(data.message ?? "Đăng nhập thất bại.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={`w-full transition-all duration-700 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Đăng nhập</h2>
        <p className="mt-3 text-base text-slate-600 font-medium">
          Mừng bạn trở lại hệ thống quản lý SmashCourt!
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-800 font-bold shadow-sm">
          {error}
        </div>
      ) : null}

      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">Email đăng nhập</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors z-10">
              <Mail className="h-5 w-5" />
            </div>
            <input
              className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 hover:border-emerald-300 hover:shadow-md focus:shadow-lg focus:-translate-y-0.5"
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
          <label className="text-sm font-bold text-slate-900">Mật khẩu</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors z-10">
              <Lock className="h-5 w-5" />
            </div>
            <input
              className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 hover:border-emerald-300 hover:shadow-md focus:shadow-lg focus:-translate-y-0.5"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-1">
          <Link className="text-sm font-bold text-emerald-600 hover:text-emerald-500 hover:underline transition-colors" href="/auth/forgot-password">
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-4 text-base font-extrabold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-60 transition-all duration-300"
        >
          {loading ? "Đang xử lý..." : (
            <>
              Đăng nhập tài khoản <LogIn className="h-5 w-5" />
            </>
          )}
        </button>

        <p className="mt-8 text-center text-sm font-medium text-slate-600">
          Chưa có tài khoản nội bộ?{" "}
          <Link href="/auth/register" className="font-bold text-emerald-600 hover:text-emerald-500 hover:underline transition-colors">
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </section>
  );
}
