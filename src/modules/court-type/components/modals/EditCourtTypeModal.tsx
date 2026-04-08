"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";
import { Modal } from "@/src/shared/components/ui/Modal";
import { CourtTypeForm } from "./CourtTypeForm";
import { updateCourtType } from "@/src/api/court-type.api";
import type { CourtType, UpdateCourtTypeRequest } from "@/src/shared/types/court-type.types";
import { AuthApiError } from "@/src/api/auth.api";

export function EditCourtTypeModal({ courtType, onClose, onSaved }: { courtType: CourtType; onClose: () => void; onSaved: (c: CourtType) => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(name: string, description: string) {
    setSaving(true);
    setError("");
    try {
      const dto: UpdateCourtTypeRequest = { name, ...(description && { description }) };
      const updated = await updateCourtType(courtType.id, dto);
      onSaved(updated);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={courtType.name}
      subtitle="Chỉnh sửa"
      icon={<Edit3 className="h-5 w-5" />}
      maxWidth="lg"
      headerGradient="from-indigo-500 to-violet-500"
    >
      <CourtTypeForm
        initialName={courtType.name}
        initialDescription={courtType.description ?? ""}
        onCancel={onClose}
        onSubmit={handleSubmit}
        saving={saving}
        buttonText="Lưu thay đổi"
        buttonIcon={<Edit3 className="h-4 w-4" />}
        error={error}
      />
    </Modal>
  );
}
