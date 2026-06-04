"use client";

import { useState } from "react";
import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Textarea } from "@/src/shared/components/ui/Textarea";
import { Select } from "@/src/shared/components/ui/Select";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Flex } from "@/src/shared/components/layout/Flex";
import type { CourtType } from "@/src/features/court-type/shared/types/court-type.types";

interface CourtFormProps {
    initialName?: string;
    initialDescription?: string;
    initialCourtTypeId?: string;
    courtTypes: CourtType[];
    onCancel: () => void;
    onSubmit: (name: string, description: string, courtTypeId: string) => Promise<void>;
    saving: boolean;
    buttonText: string;
    buttonIcon: React.ReactNode;
    error?: string;
}

export function CourtForm({
    initialName = "",
    initialDescription = "",
    initialCourtTypeId = "",
    courtTypes,
    onCancel,
    onSubmit,
    saving,
    buttonText,
    buttonIcon,
    error: submitError,
}: CourtFormProps) {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription);
    const [courtTypeId, setCourtTypeId] = useState(initialCourtTypeId);
    const [validationError, setValidationError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            setValidationError("Tên sân không được để trống");
            return;
        }
        if (!courtTypeId) {
            setValidationError("Vui lòng chọn loại sân");
            return;
        }
        setValidationError("");
        await onSubmit(name.trim(), description.trim(), courtTypeId);
    }

    const displayError = validationError || submitError;

    const initialNameTrim = (initialName ?? "").trim();
    const initialDescriptionTrim = (initialDescription ?? "").trim();
    const currentNameTrim = name.trim();
    const currentDescriptionTrim = description.trim();

    const isChanged =
        currentNameTrim !== initialNameTrim ||
        currentDescriptionTrim !== initialDescriptionTrim ||
        (courtTypeId || "") !== (initialCourtTypeId || "");

    const isValid = currentNameTrim.length > 0 && (courtTypeId || "").length > 0;

    const submitDisabled = saving || !isChanged || !isValid;

    return (
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            {displayError && (
                <Alert variant="error" className="py-2">
                    {displayError}
                </Alert>
            )}

            <Input
                label="Tên sân *"
                type="text"
                value={name}
                onChange={(e) => {
                    setName(e.target.value);
                    setValidationError("");
                }}
                placeholder="Ví dụ: Sân số 1"
                maxLength={255}
                autoFocus
            />

            <Select
                value={courtTypeId}
                onChange={(v) => setCourtTypeId(v)}
                placeholder="Chọn loại sân *"
            >
                {courtTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                        {t.name}
                    </option>
                ))}
            </Select>

            <Textarea
                label="Mô tả (tùy chọn)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn"
                rows={3}
            />

            <Flex spacing="md" className="pt-2">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={saving} className="flex-1">
                    Hủy
                </Button>
                <Button type="submit" disabled={submitDisabled} isLoading={saving} className="flex-1" leftIcon={buttonIcon}>
                    {buttonText}
                </Button>
            </Flex>
        </form>
    );
}
