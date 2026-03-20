"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Mail, Send } from "lucide-react";

import { authForgotPassword } from "@/src/auth/api/authApi";
import { setEmail } from "@/src/auth/session/sessionStore";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmailState] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Entrance animation state
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) return setError("Vui lòng nhập email.");

    try {
      setLoading(true);
      const data = await authForgotPassword({ email: trimmedEmail });
      setMessage(data.message ?? "Nếu email tồn tại, bạn sẽ nhận được mã OTP.");
      setEmail(trimmedEmail);
      router.push("/auth/forgot-password/verify-otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gửi yêu cầu thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={`w-full transition-all duration-700 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Quên mật khẩu</h2>
        <p className="mt-3 text-base text-slate-600 font-medium">
          Nhập email của bạn để nhận mã OTP khôi phục.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-800 font-bold shadow-sm">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mb-6 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-4 text-sm text-emerald-800 font-bold shadow-sm">
          {message}
        </div>
      ) : null}

      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">Email cá nhân</label>
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

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-4 text-base font-extrabold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-60 transition-all duration-300"
        >
          {loading ? "Đang xử lý..." : (
            <>
              Gửi mã OTP ngay <Send className="h-5 w-5" />
            </>
          )}
        </button>

        <p className="mt-8 text-center text-sm font-medium text-slate-600">
          <Link href="/auth/login" className="font-bold text-emerald-600 hover:text-emerald-500 hover:underline transition-colors">
            Quay lại trang đăng nhập
          </Link>
        </p>
      </form>
    </section>
  );
}
