"use client";

import { useState, useEffect } from "react";
import { PencilSimpleLine } from "@phosphor-icons/react";
import { Modal } from "@/src/shared/components/ui/Modal";
import { CourtForm } from "./CourtForm";
import { updateCourt, fetchCourtById } from "@/src/api/court.api";
import { AuthApiError } from "@/src/api/auth.api";
import type { CourtDto } from "@/src/features/court/shared/types/court.types";
import type { CourtType } from "@/src/features/court-type/shared/types/court-type.types";

export function EditCourtModal({
    courtId,
    courtTypes,
    onClose,
    onSaved,
}: {
    courtId: string;
    courtTypes: CourtType[];
    onClose: () => void;
    onSaved: (c: CourtDto) => void;
}) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [initial, setInitial] = useState<{ name: string; description: string; courtTypeId: string } | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchCourtById(courtId)
            .then((c) => {
                if (!cancelled) setInitial({ name: c.name, description: c.description ?? "", courtTypeId: c.courtTypeId });
            })
            .catch(() => {
                if (!cancelled) setError("Không thể tải dữ liệu sân");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [courtId]);

    async function handleSubmit(name: string, description: string, courtTypeId: string) {
        setSaving(true);
        setError("");
        try {
            const dto = { name, ...(description && { description }), courtTypeId };
            const updated = await updateCourt(courtId, dto);
            onSaved(updated);
        } catch (err) {
            setError(err instanceof AuthApiError ? err.message : "Cập nhật sân thất bại");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return null;

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={initial?.name ?? "Sửa sân"}
            subtitle="Chỉnh sửa"
            icon={<PencilSimpleLine className="h-5 w-5" />}
            maxWidth="lg"
        >
            <CourtForm
                initialName={initial?.name}
                initialDescription={initial?.description}
                initialCourtTypeId={initial?.courtTypeId}
                courtTypes={courtTypes}
                onCancel={onClose}
                onSubmit={handleSubmit}
                saving={saving}
                buttonText="Lưu thay đổi"
                buttonIcon={<PencilSimpleLine className="h-4 w-4" />}
                error={error}
            />
        </Modal>
    );
}
