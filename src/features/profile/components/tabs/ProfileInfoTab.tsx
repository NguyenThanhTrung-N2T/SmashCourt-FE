/**
 * Profile Info Tab Component
 * 
 * Edit basic profile information.
 */

"use client";

import { useState, useEffect } from "react";
import { Input, Button } from "@/src/shared/components/ui";
import { User, Phone } from "@phosphor-icons/react";
import { useUpdateProfile } from "@/src/features/profile/hooks";
import { UserProfile } from "@/src/features/profile/types/profile.types";
import type { ToastState } from "@/src/shared/hooks/useToast";
import {
  createValidatedChangeHandler,
  createTrimOnBlurHandler,
  ValidationRules,
} from "@/src/shared/utils/inputValidation";

interface ProfileInfoTabProps {
  profile: UserProfile;
  onUpdate: () => void;
  showToast: (tone: ToastState["tone"], message: string) => void;
}

export function ProfileInfoTab({ profile, onUpdate, showToast }: ProfileInfoTabProps) {
  const { updateProfile, isLoading, error } = useUpdateProfile();
  const [formData, setFormData] = useState({
    fullName: profile.fullName,
    phone: profile.phone || "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ tên";
    } else if (!ValidationRules.vietnameseText(formData.fullName)) {
      errors.fullName = "Họ tên chỉ được chứa chữ cái";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^0\d{9}$/.test(formData.phone)) {
      errors.phone = "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      fullName: profile.fullName,
      phone: profile.phone || "",
    });
  }, [profile.fullName, profile.phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await updateProfile({
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      avatarUrl: profile.avatarUrl || undefined,
    });

    if (result.success) {
      showToast("success", "Cập nhật thông tin thành công!");
      onUpdate();
    } else {
      showToast("error", result.error || "Cập nhật thông tin thất bại");
    }
  };

  const hasChanges =
    formData.fullName !== profile.fullName ||
    formData.phone !== (profile.phone || "");

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Info Note about Avatar */}


        {/* Full Name */}
        <Input
          label="Họ và tên"
          leftIcon={<User className="h-4 w-4" />}
          value={formData.fullName}
          onChange={createValidatedChangeHandler(
            (val) => handleChange("fullName", val),
            ValidationRules.vietnameseText
          )}
          onBlur={createTrimOnBlurHandler((val) => handleChange("fullName", val))}
          placeholder="Nhập họ và tên"
          error={validationErrors.fullName}
          required
          maxLength={100}
        />

        {/* Phone */}
        <Input
          label="Số điện thoại"
          leftIcon={<Phone className="h-4 w-4" />}
          value={formData.phone}
          onChange={createValidatedChangeHandler(
            (val) => handleChange("phone", val),
            ValidationRules.phoneFormat
          )}
          placeholder="Ví dụ: 0901234567"
          error={validationErrors.phone}
          required
        />

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!hasChanges || isLoading}
          >
            Lưu thay đổi
          </Button>
        </div>
      </form>

      {/* Info Note */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Lưu ý:</strong> Email không thể thay đổi. Nếu bạn cần thay đổi email, vui lòng liên hệ bộ phận hỗ trợ.
        </p>
      </div>
    </div>
  );
}
