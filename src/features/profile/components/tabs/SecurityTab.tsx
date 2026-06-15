/**
 * Change Password Tab Component
 *
 * Allows users to change their password and manage 2FA settings.
 */

"use client";

import { useState } from "react";
import { Input, Button } from "@/src/shared/components/ui";
import {
  Lock,
  Eye,
  EyeSlash,
  CheckCircle,
  Warning,
  ShieldCheck,
  ShieldSlash,
  ShieldStar,
} from "@phosphor-icons/react";
import { useChangePassword } from "@/src/features/profile/hooks";
import { use2FA } from "@/src/features/profile/hooks";
import { OtpModal } from "@/src/features/profile/components/dialog/OtpModal";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/src/features/profile/types/profile.types";
import type { ChangePasswordRequest } from "@/src/features/profile/types/profile.types";
import type { ToastState } from "@/src/shared/hooks/useToast";

interface SecurityTabProps {
  profile: UserProfile; // expects profile.twoFactorEnabled: boolean
  showToast: (tone: ToastState["tone"], message: string) => void;
}

export function SecurityTab({ profile, showToast }: SecurityTabProps) {
  const router = useRouter();
  const { changePassword, isLoading, error } = useChangePassword();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  // ─── 2FA ────────────────────────────────────────────────────────────────────
  const twoFA = use2FA({
    initialEnabled: profile.is2faEnabled,
    onSuccess: (msg) => showToast("success", msg),
    onError: (msg) => showToast("error", msg),
  });

  // ─── OAuth guard ─────────────────────────────────────────────────────────────
  const isOAuthUser = profile.email.includes("@oauth.");

  // ─── Password helpers ─────────────────────────────────────────────────────────
  const passwordsMatch = formData.newPassword === formData.confirmPassword;
  const hasAllFields =
    formData.currentPassword && formData.newPassword && formData.confirmPassword;
  const isFormValid = hasAllFields && passwordsMatch;

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
    if (!/[A-Z]/.test(password)) return "Mật khẩu phải có ít nhất 1 chữ hoa";
    if (!/[a-z]/.test(password)) return "Mật khẩu phải có ít nhất 1 chữ thường";
    if (!/[0-9]/.test(password)) return "Mật khẩu phải có ít nhất 1 chữ số";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) { setValidationError(passwordError); return; }
    if (formData.newPassword !== formData.confirmPassword) {
      setValidationError("Mật khẩu xác nhận không khớp"); return;
    }
    if (formData.currentPassword === formData.newPassword) {
      setValidationError("Mật khẩu mới phải khác mật khẩu hiện tại"); return;
    }

    const request: ChangePasswordRequest = {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    };

    const result = await changePassword(request);

    if (result.success) {
      showToast("success", result.message || "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      setTimeout(() => router.push("/auth/login"), 2000);
    } else {
      showToast("error", result.error || "Đổi mật khẩu thất bại");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-background text-xs text-muted uppercase tracking-widest font-medium">
            Đổi mật khẩu
          </span>
        </div>
      </div>
      {/* ── Password Section ─────────────────────────────────────────────────── */}
      {isOAuthUser ? (
        <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <div className="flex items-start gap-3">
            <Warning
              className="h-6 w-6 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5"
              weight="fill"
            />
            <div className="space-y-2">
              <h3 className="font-bold text-yellow-900 dark:text-yellow-100">
                Không thể đổi mật khẩu
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Tài khoản của bạn được đăng nhập qua Google OAuth. Để thay đổi mật khẩu, vui lòng truy cập cài đặt tài khoản Google của bạn.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {(error || validationError) && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
              {error || validationError}
            </div>
          )}

          <Input
            label="Mật khẩu hiện tại"
            leftIcon={<Lock className="h-5 w-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                }
                className="text-muted hover:text-foreground transition-colors"
              >
                {showPasswords.current ? (
                  <EyeSlash className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
            type={showPasswords.current ? "text" : "password"}
            value={formData.currentPassword}
            onChange={(e) =>
              setFormData({ ...formData, currentPassword: e.target.value })
            }
            placeholder="Nhập mật khẩu hiện tại"
            required
          />

          <Input
            label="Mật khẩu mới"
            leftIcon={<Lock className="h-5 w-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                }
                className="text-muted hover:text-foreground transition-colors"
              >
                {showPasswords.new ? (
                  <EyeSlash className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
            type={showPasswords.new ? "text" : "password"}
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            placeholder="Nhập mật khẩu mới"
            required
          />

          <Input
            label="Xác nhận mật khẩu mới"
            leftIcon={<Lock className="h-5 w-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                }
                className="text-muted hover:text-foreground transition-colors"
              >
                {showPasswords.confirm ? (
                  <EyeSlash className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
            type={showPasswords.confirm ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            placeholder="Nhập lại mật khẩu mới"
            required
            error={
              formData.confirmPassword && !passwordsMatch
                ? "Mật khẩu xác nhận không khớp"
                : undefined
            }
          />

          {/* Password requirements */}
          <div className="p-4 bg-surface-2 rounded-xl border border-border space-y-2">
            <p className="text-sm font-semibold text-foreground">Yêu cầu mật khẩu:</p>
            <ul className="space-y-1 text-xs text-muted">
              {[
                "Ít nhất 8 ký tự",
                "Có chữ hoa và chữ thường",
                "Có ít nhất 1 chữ số",
                "Có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)",
              ].map((req) => (
                <li key={req} className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" weight="fill" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={isLoading || !isFormValid}
            >
              Đổi mật khẩu
            </Button>
          </div>
        </form>
      )}

      {/* ── Warning note ─────────────────────────────────────────────────────── */}
      {!isOAuthUser && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <div className="flex items-start gap-3">
            <Warning
              className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5"
              weight="fill"
            />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                Lưu ý quan trọng
              </p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Sau khi đổi mật khẩu, tất cả thiết bị khác sẽ bị đăng xuất trong vòng 15 phút. Bạn sẽ cần đăng nhập lại ngay để đảm bảo an toàn.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Divider ──────────────────────────────────────────────────────────── */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-background text-xs text-muted uppercase tracking-widest font-medium">
            Xác thực hai yếu tố
          </span>
        </div>
      </div>

      {/* ── 2FA Section ──────────────────────────────────────────────────────── */}
      <div className="p-5 bg-surface-2 border border-border rounded-xl space-y-4">
        {/* Status row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${twoFA.isEnabled
                ? "bg-emerald-100 dark:bg-emerald-900/30"
                : "bg-surface border border-border"
                }`}
            >
              <ShieldStar
                className={`h-5 w-5 ${twoFA.isEnabled
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted"
                  }`}
                weight={twoFA.isEnabled ? "fill" : "regular"}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Xác thực 2 yếu tố (2FA)
              </p>
              <p className="text-xs text-muted mt-0.5">
                Bảo vệ tài khoản bằng mã OTP gửi qua email khi đăng nhập
              </p>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${twoFA.isEnabled
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-surface border border-border text-muted"
              }`}
          >
            {twoFA.isEnabled ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5" weight="fill" />
                Đang bật
              </>
            ) : (
              <>
                <ShieldSlash className="h-3.5 w-3.5" />
                Đang tắt
              </>
            )}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted leading-relaxed">
          {twoFA.isEnabled
            ? "2FA đang được bật. Mỗi lần đăng nhập bạn sẽ cần nhập mã OTP từ email. Điều này giúp ngăn chặn truy cập trái phép ngay cả khi mật khẩu bị lộ."
            : "Khi bật 2FA, mỗi lần đăng nhập bạn sẽ cần nhập thêm mã OTP được gửi đến email. Đây là lớp bảo mật quan trọng giúp bảo vệ tài khoản."}
        </p>

        {/* Toggle button */}
        <div className="flex justify-end pt-1">
          {twoFA.isEnabled ? (
            <Button
              variant="secondary"
              isLoading={twoFA.isRequestLoading}
              disabled={twoFA.isRequestLoading}
              onClick={twoFA.requestDisable}
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <ShieldSlash className="h-4 w-4 mr-2" />
              Tắt 2FA
            </Button>
          ) : (
            <Button
              isLoading={twoFA.isRequestLoading}
              disabled={twoFA.isRequestLoading}
              onClick={twoFA.requestEnable}
            >
              <ShieldCheck className="h-4 w-4 mr-2" weight="fill" />
              Bật 2FA
            </Button>
          )}
        </div>
      </div>

      {/* ── OTP Modal ────────────────────────────────────────────────────────── */}
      <OtpModal
        open={twoFA.showOtpModal}
        action={twoFA.action}
        isLoading={twoFA.isVerifyLoading}
        error={twoFA.otpError}
        onVerify={twoFA.verify2FA}
        onResend={twoFA.resend2FA}
        onCancel={twoFA.cancelOtp}
      />
    </div>
  );
}