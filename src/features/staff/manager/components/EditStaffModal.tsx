"use client";

import { useState } from "react";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Input } from "@/src/shared/components/ui/Input";
import { Button } from "@/src/shared/components/ui/Button";
import { ImageUploader } from "@/src/shared/components/ui/ImageUploader";
import { PencilSimple } from "@phosphor-icons/react";
import { updateUser } from "@/src/api/user-management.api";
import { AuthApiError } from "@/src/api/core";
import type { StaffUserDetail } from "@/src/features/staff/types/user.type";

interface EditStaffModalProps {
  staff: StaffUserDetail;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export function EditStaffModal({ staff, onClose, onSuccess, onError }: EditStaffModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: staff.fullName,
    phone: staff.phone || "",
    avatarUrl: staff.avatarUrl || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const payload: {
        fullName: string;
        phone?: string;
        avatarUrl?: string;
      } = {
        fullName: formData.fullName.trim(),
      };

      if (formData.phone.trim()) {
        payload.phone = formData.phone.trim();
      }

      if (formData.avatarUrl.trim()) {
        payload.avatarUrl = formData.avatarUrl.trim();
      }

      await updateUser(staff.id, payload);
      onSuccess();
    } catch (err) {
      if (err instanceof AuthApiError && err.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(err.errors).forEach(([field, messages]) => {
          const lowerField = field.toLowerCase();
          if (messages && messages.length > 0) {
            fieldErrors[lowerField] = messages[0];
          }
        });
        setErrors(fieldErrors);
      } else {
        onError(err instanceof Error ? err.message : "Không thể cập nhật nhân viên");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Chỉnh sửa nhân viên"
      subtitle="Quản lý nhân viên"
      icon={<PencilSimple className="h-5 w-5" />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="rounded-xl bg-surface-2 p-4 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Email</p>
          <p className="text-sm font-bold text-foreground">{staff.email}</p>
          <p className="text-xs text-muted">Email không thể thay đổi</p>
        </div>

        <Input
          label="Họ và tên"
          type="text"
          placeholder="Nguyễn Văn A"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          error={errors.fullname}
          required
        />

        <Input
          label="Số điện thoại"
          type="tel"
          placeholder="+84901234567"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          error={errors.phone}
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

        <div className="flex items-center gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={loading} disabled={loading || isUploading} className="flex-1">
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
}
