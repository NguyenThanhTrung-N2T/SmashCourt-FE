"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { Modal } from "@/src/shared/components/ui/Modal";
import { CourtForm } from "./CourtForm";
import { createCourt } from "@/src/api/court.api";
import type { CourtDto } from "@/src/features/court/shared/types/court.types";
import type { CourtType } from "@/src/features/court-type/shared/types/court-type.types";
import { AuthApiError } from "@/src/api/auth.api";

export function CreateCourtModal({
    courtTypes,
    onClose,
    onCreated,
}: {
    courtTypes: CourtType[];
    onClose: () => void;
    onCreated: (c: CourtDto) => void;
}) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(name: string, description: string, courtTypeId: string) {
        setSaving(true);
        setError("");
        try {
            const dto = { name, ...(description && { description }), courtTypeId };
            const created = await createCourt(dto);
            onCreated(created);
        } catch (err) {
            setError(err instanceof AuthApiError ? err.message : "Tạo sân thất bại");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Tạo sân"
            subtitle="Tạo mới"
            icon={<Plus className="h-5 w-5" />}
            maxWidth="lg"
        >
            <CourtForm
                courtTypes={courtTypes}
                onCancel={onClose}
                onSubmit={handleSubmit}
                saving={saving}
                buttonText="Tạo sân"
                buttonIcon={<Plus className="h-4 w-4" />}
                error={error}
            />
        </Modal>
    );
}
