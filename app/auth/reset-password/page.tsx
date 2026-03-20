"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { authForgotPasswordReset } from "@/src/auth/api/authApi";
import { isValidPassword } from "@/src/auth/validators";
import { getResetToken } from "@/src/auth/session/sessionStore";

export default function ResetPasswordPage() {
  const router = useRouter();

  // Reset token
  const [resetToken, setResetTokenState] = useState<string | null>(null);

  // Mật khẩu mới và xác nhận mật khẩu
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Trạng thái loading và error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy reset token từ session
  useEffect(() => {
    try {
      setResetTokenState(getResetToken() ?? null);
    } catch {
      setResetTokenState(null);
    }
  }, []);

  // Gửi yêu cầu đặt lại mật khẩu
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!resetToken)
      return setError("Không tìm thấy mã reset. Vui lòng bắt đầu lại.");

    if (!newPassword) return setError("Vui lòng nhập mật khẩu mới.");
    if (!confirmPassword)
      return setError("Vui lòng xác nhận lại mật khẩu mới.");
    if (!isValidPassword(newPassword)) {
      return setError(
        "Mật khẩu phải có ít nhất 8 ký tự, gồm 1 chữ hoa, 1 số và 1 ký tự đặc biệt.",
      );
    }
    if (newPassword !== confirmPassword)
      return setError("Mật khẩu không khớp.");

    try {
      setLoading(true);
      await authForgotPasswordReset({
        resetToken,
        newPassword,
        confirmPassword,
      });
      router.push("/auth/login");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đặt lại mật khẩu thất bại.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!resetToken) {
    return (
      <section>
        <h2 className="text-2xl font-semibold">Đặt lại mật khẩu</h2>
        <p className="mt-2 text-sm opacity-80">
          Không tìm thấy mã reset. Vui lòng yêu cầu OTP mới.
        </p>
        <div className="mt-4">
          <Link className="font-medium underline" href="/auth/forgot-password">
            Đến trang Quên mật khẩu
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold">Đặt lại mật khẩu</h2>
      <p className="mt-2 text-sm opacity-80">
        Thiết lập mật khẩu mới cho tài khoản của bạn.
      </p>

      <form className="mt-6 flex max-w-xl flex-col gap-4" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Mật khẩu mới</span>
          <input
            className="h-10 rounded-md border border-zinc-300 bg-transparent px-3 outline-none focus:border-zinc-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Xác nhận mật khẩu</span>
          <input
            className="h-10 rounded-md border border-zinc-300 bg-transparent px-3 outline-none focus:border-zinc-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            required
          />
        </label>

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
          {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
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
