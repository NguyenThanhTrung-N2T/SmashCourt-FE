"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { authLogin2fa } from "@/src/auth/api/authApi";
import OtpInput from "@/src/auth/components/OtpInput";
import { getRedirectPathByRole } from "@/src/auth/constants";
import { getTempToken, setAccessToken } from "@/src/auth/session/sessionStore";
import { isValidOtp, normalizeOtp } from "@/src/auth/validators";

export default function TwoFactorPage() {
  const router = useRouter();

  // Temp token và OTP code
  const [tempToken, setTempTokenState] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");

  // Trạng thái loading và error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy temp token từ session
  useEffect(() => {
    try {
      setTempTokenState(getTempToken() ?? null);
    } catch {
      setTempTokenState(null);
    }
  }, []);

  // Nhập mã OTP và xác thực 2FA
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!tempToken) return setError("Thiếu mã 2FA. Vui lòng đăng nhập lại.");

    const normalized = normalizeOtp(otpCode);
    setOtpCode(normalized);
    if (!isValidOtp(normalized)) return setError("Mã OTP phải có 6 chữ số.");

    try {
      setLoading(true);
      const data = await authLogin2fa({ tempToken, otpCode: normalized });

      if (data.status === "Success") {
        if (data.accessToken) setAccessToken(data.accessToken);
        const role = data.user?.role as string | undefined;
        router.push(getRedirectPathByRole(role));
        return;
      }

      setError(data.message ?? "Xác thực 2FA thất bại.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xác thực 2FA thất bại.");
    } finally {
      setLoading(false);
    }
  }

  if (!tempToken) {
    return (
      <section>
        <h2 className="text-2xl font-semibold">Xác thực 2FA</h2>
        <p className="mt-2 text-sm opacity-80">
          Thiếu trạng thái 2FA. Vui lòng đăng nhập lại.
        </p>
        <div className="mt-4">
          <Link className="font-medium underline" href="/auth/login">
            Quay về trang đăng nhập
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold">Xác thực 2FA</h2>
      <p className="mt-2 text-sm opacity-80">
        Nhập mã OTP 6 chữ số từ authenticator / email của bạn.
      </p>

      <form className="mt-6 flex max-w-xl flex-col gap-4" onSubmit={onSubmit}>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Mã OTP</span>
          <OtpInput value={otpCode} onChange={setOtpCode} autoFocus />
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="h-10 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Đang xác thực..." : "Xác thực"}
        </button>

        <div className="text-sm opacity-80">
          <Link className="font-medium underline" href="/auth/login">
            Quay lại đăng nhập
          </Link>
        </div>
      </form>
    </section>
  );
}
