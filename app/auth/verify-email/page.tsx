"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { authResendOtp, authVerifyEmail } from "@/src/auth/api/authApi";
import CountdownButton from "@/src/auth/components/CountdownButton";
import OtpInput from "@/src/auth/components/OtpInput";
import { OtpType } from "@/src/auth/constants";
import { isValidOtp, normalizeOtp } from "@/src/auth/validators";
import { getEmail, setEmail } from "@/src/auth/session/sessionStore";

export default function VerifyEmailPage() {
  const router = useRouter();

  // Email và OTP code
  const [email, setEmailState] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedEmail = getEmail();
      setEmailState(storedEmail ?? null);
      // Keep session value aligned if user navigates back and edits.
      if (storedEmail) setEmail(storedEmail);
    } catch {
      setEmailState(null);
    }
  }, []);

  // Gửi yêu cầu xác thực email
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitError(null);

    const normalized = normalizeOtp(otpCode);
    setOtpCode(normalized);
    if (!isValidOtp(normalized)) {
      return setSubmitError("Mã OTP phải có 6 chữ số.");
    }

    try {
      setLoading(true);
      await authVerifyEmail({ email, otpCode: normalized });
      router.push("/auth/login");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Xác thực thất bại.");
    } finally {
      setLoading(false);
    }
  }

  // Gửi lại OTP
  async function onResend() {
    if (!email) return;
    setResendError(null);
    try {
      await authResendOtp({ email, type: OtpType.EMAIL_VERIFY });
    } catch (err) {
      setResendError(
        err instanceof Error ? err.message : "Gửi lại mã thất bại.",
      );
    }
  }

  if (!email) {
    return (
      <section>
        <h2 className="text-2xl font-semibold">Xác thực email</h2>
        <p className="mt-2 text-sm opacity-80">
          Không tìm thấy email trong phiên. Vui lòng đăng ký lại.
        </p>
        <div className="mt-4">
          <Link className="font-medium underline" href="/auth/register">
            Đến trang đăng ký
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold">Xác thực email</h2>
      <p className="mt-2 text-sm opacity-80">
        Nhập mã OTP 6 chữ số đã được gửi tới email của bạn.
      </p>

      <form className="mt-6 flex max-w-xl flex-col gap-4" onSubmit={onSubmit}>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Mã OTP</span>
          <OtpInput value={otpCode} onChange={setOtpCode} />
        </div>

        {submitError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        {resendError ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {resendError}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="h-10 flex-1 rounded-md bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Đang xác thực..." : "Xác thực"}
          </button>

          <CountdownButton
            onResend={onResend}
            seconds={60}
            label="Gửi lại OTP"
          />
        </div>

        <div className="text-sm opacity-80">
          Quay lại{" "}
          <Link className="font-medium underline" href="/auth/login">
            Đăng nhập
          </Link>
        </div>
      </form>
    </section>
  );
}
