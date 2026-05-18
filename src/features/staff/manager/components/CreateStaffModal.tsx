"use client";

import { useState } from "react";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Input } from "@/src/shared/components/ui/Input";
import { Button } from "@/src/shared/components/ui/Button";
import { UserPlus } from "@phosphor-icons/react";
import { createUser } from "@/src/api/user-management.api";
import { AuthApiError } from "@/src/api/core";
import {
  createValidatedChangeHandler,
  createTrimOnBlurHandler,
  ValidationRules,
} from "@/src/shared/utils/inputValidation";
import { UserRole } from "@/src/features/branch/types/branch.types";

interface CreateStaffModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function CreateStaffModal({ onClose, onSuccess, onError }: CreateStaffModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    temporaryPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const payload: {
        email: string;
        fullName: string;
        requestedRole: UserRole;
        phone?: string;
        temporaryPassword?: string;
      } = {
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        requestedRole: UserRole.STAFF,
      };

      if (formData.phone.trim()) {
        payload.phone = formData.phone.trim();
      }

      if (formData.temporaryPassword.trim()) {
        payload.temporaryPassword = formData.temporaryPassword.trim();
      }

      // Note: branchId is not needed for BRANCH_MANAGER - backend auto-assigns to their branch
      await createUser(payload);
      onSuccess();
    } catch (err) {
      if (err instanceof AuthApiError && err.errors) {
        // Map backend validation errors to form fields
        const fieldErrors: Record<string, string> = {};
        Object.entries(err.errors).forEach(([field, messages]) => {
          const lowerField = field.toLowerCase();
          if (messages && messages.length > 0) {
            fieldErrors[lowerField] = messages[0];
          }
        });
        setErrors(fieldErrors);
      } else {
        onError(err instanceof Error ? err.message : "Không thể tạo nhân viên");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Thêm nhân viên mới"
      subtitle="Quản lý nhân viên"
      icon={<UserPlus className="h-5 w-5" />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="example@email.com"
          value={formData.email}
          onChange={createValidatedChangeHandler(
            (val) => setFormData({ ...formData, email: val }),
            ValidationRules.emailFormat
          )}
          onBlur={createTrimOnBlurHandler((val) => setFormData({ ...formData, email: val }))}
          error={errors.email}
          required
        />

        <Input
          label="Họ và tên"
          type="text"
          placeholder="Nguyễn Văn A"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({
              ...formData,
              fullName: e.target.value,
            })
          }
          onBlur={(e) => {
            const trimmed = e.target.value.trim();

            setFormData({
              ...formData,
              fullName: trimmed,
            });

            // Optional validation
            if (!/^[\p{L}\s]+$/u.test(trimmed)) {
              setErrors((prev) => ({
                ...prev,
                fullname: "Tên không hợp lệ",
              }));
            } else {
              setErrors((prev) => ({
                ...prev,
                fullname: "",
              }));
            }
          }}
          error={errors.fullname}
          required
        />

        <Input
          label="Số điện thoại"
          type="tel"
          placeholder="+84901234567"
          value={formData.phone}
          onChange={createValidatedChangeHandler(
            (val) => setFormData({ ...formData, phone: val }),
            ValidationRules.phoneFormat
          )}
          error={errors.phone}
        />

        <Input
          label="Mật khẩu tạm thời"
          type="password"
          placeholder="Để trống để tự động tạo"
          value={formData.temporaryPassword}
          onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
          error={errors.temporarypassword}
        />

        <p className="text-xs text-muted">
          * Nếu không nhập mật khẩu tạm thời, hệ thống sẽ tự động tạo và gửi qua email.
        </p>

        <div className="flex items-center gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={loading} className="flex-1">
            Tạo nhân viên
          </Button>
        </div>
      </form>
    </Modal>
  );
}
