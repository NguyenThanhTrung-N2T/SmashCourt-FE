"use client";

import { useState } from "react";
import {
  Plus,
} from "@phosphor-icons/react";
import { Modal } from "@/src/shared/components/ui/Modal";
import { CourtTypeForm } from "./CourtTypeForm";
import { createCourtType } from "@/src/api/court-type.api";
import type { CourtType, CreateCourtTypeRequest } from "@/src/shared/types/court-type.types";
import { AuthApiError } from "@/src/api/auth.api";

export function CreateCourtTypeModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: CourtType) => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(name: string, description: string) {
    setSaving(true);
    setError("");
    try {
      const dto: CreateCourtTypeRequest = { name, ...(description && { description }) };
      const created = await createCourtType(dto);
      onCreated(created);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : "Tạo thất bại");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Tạo loại sân"
      subtitle="Tạo mới"
      icon={<Plus className="h-5 w-5" />}
      maxWidth="lg"
      headerGradient="from-indigo-500 to-violet-500"
    >
      <CourtTypeForm
        onCancel={onClose}
        onSubmit={handleSubmit}
        saving={saving}
        buttonText="Tạo loại sân"
        buttonIcon={<Plus className="h-4 w-4" />}
        error={error}
      />
    </Modal>
  );
}
