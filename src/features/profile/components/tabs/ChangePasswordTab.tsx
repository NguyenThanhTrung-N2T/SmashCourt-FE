/**
 * Change Password Tab Component
 * 
 * Allow users to change their password.
 */

"use client";

import { useState } from "react";
import { Input } from "@/src/shared/components/ui/Input";
import { Button } from "@/src/shared/components/ui/Button";
import { Lock, Eye, EyeSlash, CheckCircle, Warning } from "@phosphor-icons/react";
import { useChangePassword } from "../../hooks/useProfile";
import { useRouter } from "next/navigation";
import type { UserProfile } from "@/src/shared/types/profile.types";
import type { ChangePasswordRequest } from "@/src/shared/types/profile.types";
import type { ToastState } from "@/src/shared/hooks/useToast";

interface ChangePasswordTabProps {
  profile: UserProfile;
  showToast: (tone: ToastState["tone"], message: string) => void;
}

export function ChangePasswordTab({ profile, showToast }: ChangePasswordTabProps) {
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

  // Check if user is OAuth user
  const isOAuthUser = profile.email.includes("@oauth."); // Adjust based on your OAuth email pattern

  // Check if passwords match in real-time
  const passwordsMatch = formData.newPassword === formData.confirmPassword;
  const hasAllFields = formData.currentPassword && formData.newPassword && formData.confirmPassword;
  const isFormValid = hasAllFields && passwordsMatch;

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự";
    }
    if (!/[A-Z]/.test(password)) {
      return "Mật khẩu phải có ít nhất 1 chữ hoa";
    }
    if (!/[a-z]/.test(password)) {
      return "Mật khẩu phải có ít nhất 1 chữ thường";
    }
    if (!/[0-9]/.test(password)) {
      return "Mật khẩu phải có ít nhất 1 chữ số";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate new password
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }

    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setValidationError("Mật khẩu xác nhận không khớp");
      return;
    }

    // Check if new password is different from current
    if (formData.currentPassword === formData.newPassword) {
      setValidationError("Mật khẩu mới phải khác mật khẩu hiện tại");
      return;
    }
    
    const request: ChangePasswordRequest = {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    };
    
    const result = await changePassword(request);

    if (result.success) {
      // Show success message and redirect to login
      showToast("success", result.message || "Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } else {
      showToast("error", result.error || "Đổi mật khẩu thất bại");
    }
  };

  if (isOAuthUser) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <div className="flex items-start gap-3">
            <Warning className="h-6 w-6 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" weight="fill" />
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
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Messages */}
        {(error || validationError) && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
            {error || validationError}
          </div>
        )}

        {/* Current Password */}
        <Input
          label="Mật khẩu hiện tại"
          leftIcon={<Lock className="h-5 w-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              className="text-muted hover:text-foreground transition-colors"
            >
              {showPasswords.current ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
          type={showPasswords.current ? "text" : "password"}
          value={formData.currentPassword}
          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
          placeholder="Nhập mật khẩu hiện tại"
          required
        />

        {/* New Password */}
        <Input
          label="Mật khẩu mới"
          leftIcon={<Lock className="h-5 w-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              className="text-muted hover:text-foreground transition-colors"
            >
              {showPasswords.new ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
          type={showPasswords.new ? "text" : "password"}
          value={formData.newPassword}
          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          placeholder="Nhập mật khẩu mới"
          required
        />

        {/* Confirm Password */}
        <Input
          label="Xác nhận mật khẩu mới"
          leftIcon={<Lock className="h-5 w-5" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
              className="text-muted hover:text-foreground transition-colors"
            >
              {showPasswords.confirm ? <EyeSlash className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
          type={showPasswords.confirm ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          placeholder="Nhập lại mật khẩu mới"
          required
          error={formData.confirmPassword && !passwordsMatch ? "Mật khẩu xác nhận không khớp" : undefined}
        />

        {/* Password Requirements */}
        <div className="p-4 bg-surface-2 rounded-xl border border-border space-y-2">
          <p className="text-sm font-semibold text-foreground">Yêu cầu mật khẩu:</p>
          <ul className="space-y-1 text-xs text-muted">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" weight="fill" />
              Ít nhất 8 ký tự
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" weight="fill" />
              Có chữ hoa và chữ thường
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" weight="fill" />
              Có ít nhất 1 chữ số
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" weight="fill" />
              Có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={isLoading || !isFormValid}
          >
            Đổi mật khẩu
          </Button>
        </div>
      </form>

      {/* Warning Note */}
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
        <div className="flex items-start gap-3">
          <Warning className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" weight="fill" />
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
    </div>
  );
}
