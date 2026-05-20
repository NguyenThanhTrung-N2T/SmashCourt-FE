"use client";

import { useState, useMemo } from "react";
import { Modal, Input, Select, Button, ImageUploader } from "@/src/shared/components/ui";
import { UserPlus } from "@phosphor-icons/react";
import { createUser } from "@/src/api/user-management.api";
import { AuthApiError } from "@/src/api/core";
import {
  createValidatedChangeHandler,
  createTrimOnBlurHandler,
  ValidationRules,
} from "@/src/shared/utils/inputValidation";
import { UserRole } from "@/src/features/branch/shared/types/branch.types";

interface CreateStaffModalProps {
  branchId?: string; // Optional for owner view, omitted for manager view
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function CreateStaffModal({ branchId, onClose, onSuccess, onError }: CreateStaffModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    requestedRole: "STAFF" as "STAFF" | "BRANCH_MANAGER",
    temporaryPassword: "",
    avatarUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  const isOwner = branchId !== undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const payload: {
        email: string;
        fullName: string;
        requestedRole: UserRole;
        branchId?: string;
        phone?: string;
        temporaryPassword?: string;
        avatarUrl?: string;
      } = {
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        requestedRole: !isOwner || formData.requestedRole === "STAFF" ? UserRole.STAFF : UserRole.BRANCH_MANAGER,
      };

      if (isOwner) {
        payload.branchId = branchId;
      }

      if (formData.phone.trim()) {
        payload.phone = formData.phone.trim();
      }

      if (formData.temporaryPassword.trim()) {
        payload.temporaryPassword = formData.temporaryPassword.trim();
      }

      if (formData.avatarUrl.trim()) {
        payload.avatarUrl = formData.avatarUrl.trim();
      }

      await createUser(payload);
      onSuccess();
    } catch (err) {
      if (err instanceof AuthApiError && err.errors) {
        // Map backend validation errors to form fields
        const fieldErrors: Record<string, string> = {};
        let errorMessage = "";
        Object.entries(err.errors).forEach(([field, messages]) => {
          const lowerField = field.toLowerCase();
          if (messages && messages.length > 0) {
            fieldErrors[lowerField] = messages[0];
            if (!errorMessage) {
              errorMessage = messages[0];
            }
          }
        });
        setErrors(fieldErrors);
        onError(errorMessage || "Không thể tạo nhân viên");
      } else {
        onError(err instanceof Error ? err.message : "Không thể tạo nhân viên");
      }
    } finally {
      setLoading(false);
    }
  };
  const canSubmit = useMemo(() => {
    const requiredFields = [
      formData.email,
      formData.fullName,
    ];

    const hasEmptyRequiredFields = requiredFields.some(
      (field) => field.trim() === ""
    );

    const hasValidationErrors = Object.values(errors).some(
      (error) => error?.trim()
    );

    return (
      !hasEmptyRequiredFields &&
      !hasValidationErrors &&
      !loading &&
      !isUploading
    );
  }, [formData, errors, loading, isUploading]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  fullName: "Tên không hợp lệ",
                }));
              } else {
                setErrors((prev) => ({
                  ...prev,
                  fullName: "",
                }));
              }
            }}
            error={errors.fullName}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {isOwner ? (
            <div className="w-full flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.requestedRole}
                onChange={(value) => setFormData({ ...formData, requestedRole: value as "STAFF" | "BRANCH_MANAGER" })}
              >
                <option value="STAFF">Nhân viên</option>
                <option value="BRANCH_MANAGER">Quản lý chi nhánh</option>
              </Select>
              {errors.requestedrole && (
                <p className="text-xs text-red-500">{errors.requestedrole}</p>
              )}
            </div>
          ) : (
            <div className="hidden md:block" /> // empty block for spacing in manager layout
          )}
        </div>

        <Input
          label="Mật khẩu tạm thời"
          type="password"
          placeholder="Để trống để tự động tạo"
          value={formData.temporaryPassword}
          onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
          error={errors.temporarypassword}
        />

        <ImageUploader
          label="Ảnh đại diện"
          folder="avatars"
          value={formData.avatarUrl}
          onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
          onClear={() => setFormData({ ...formData, avatarUrl: '' })}
          onUploadingChange={setIsUploading}
          error={errors.avatarurl}
        />

        <p className="text-xs text-muted">
          * Nếu không nhập mật khẩu tạm thời, hệ thống sẽ tự động tạo và gửi qua email.
        </p>

        <div className="flex items-center gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Hủy
          </Button>
          <Button type="submit" variant="primary" disabled={!canSubmit} isLoading={loading} className="flex-1">
            Tạo nhân viên
          </Button>
        </div>
      </form>
    </Modal>
  );
}
