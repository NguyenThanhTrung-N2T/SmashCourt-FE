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
import type { UserProfile } from "@/src/features/profile/types/profile.types";
import type { ToastState } from "@/src/shared/hooks/useToast";

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

  useEffect(() => {
    setFormData({
      fullName: profile.fullName,
      phone: profile.phone || "",
    });
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          leftIcon={<User className="h-5 w-5" />}
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="Nhập họ và tên"
          required
          maxLength={100}
        />

        {/* Phone */}
        <Input
          label="Số điện thoại"
          leftIcon={<Phone className="h-5 w-5" />}
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Nhập số điện thoại"
          required
          type="tel"
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
