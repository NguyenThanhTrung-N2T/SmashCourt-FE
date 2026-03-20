"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Mail, Lock, User, Phone, UserPlus } from "lucide-react";

import { authRegister } from "@/src/auth/api/authApi";
import { isValidPassword } from "@/src/auth/validators";
import { setEmail } from "@/src/auth/session/sessionStore";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmailState] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
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
      const res = await authRegister({
        email: trimmedEmail,
        password,
        fullName: trimmedFullName,
        phone: trimmedPhone || undefined,
      });

      void res;
      setEmail(trimmedEmail);
      router.push("/auth/verify-email");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={`w-full transition-all duration-700 transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Mở tài khoản</h2>
        <p className="mt-3 text-base text-slate-600 font-medium">
          Dành cho hội viên trực thuộc hệ thống chi nhánh.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-800 font-bold shadow-sm">
          {error}
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

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">Họ và tên</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors z-10">
              <User className="h-5 w-5" />
            </div>
            <input
              className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 hover:border-emerald-300 hover:shadow-md focus:shadow-lg focus:-translate-y-0.5"
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
            Số điện thoại <span className="opacity-70 font-medium">(tuỳ chọn)</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors z-10">
              <Phone className="h-5 w-5" />
            </div>
            <input
              className="block w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 hover:border-emerald-300 hover:shadow-md focus:shadow-lg focus:-translate-y-0.5"
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
              autoComplete="new-password"
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
              Tạo tài khoản ngay <UserPlus className="h-5 w-5" />
            </>
          )}
        </button>

        <p className="mt-8 text-center text-sm font-medium text-slate-600">
          Đã có mã hội viên?{" "}
          <Link href="/auth/login" className="font-bold text-emerald-600 hover:text-emerald-500 hover:underline transition-colors">
            Đăng nhập hệ thống
          </Link>
        </p>
      </form>
    </section>
  );
}
