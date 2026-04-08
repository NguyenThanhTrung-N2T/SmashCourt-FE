"use client";

import { useState } from "react";
import { Plus, Edit3 } from "lucide-react";
import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Textarea } from "@/src/shared/components/ui/Textarea";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Flex } from "@/src/shared/components/layout/Flex";

interface CourtTypeFormProps {
  initialName?: string;
  initialDescription?: string;
  onCancel: () => void;
  onSubmit: (name: string, description: string) => Promise<void>;
  saving: boolean;
  buttonText: string;
  buttonIcon: React.ReactNode;
  error?: string;
}

export function CourtTypeForm({
  initialName = "",
  initialDescription = "",
  onCancel,
  onSubmit,
  saving,
  buttonText,
  buttonIcon,
  error: submitError,
}: CourtTypeFormProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError("Tên loại sân không được để trống");
      return;
    }
    setValidationError("");
    await onSubmit(name.trim(), description.trim());
  }

  const displayError = validationError || submitError;

  return (
    <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
      {displayError && (
        <Alert variant="error" className="py-2">
          {displayError}
        </Alert>
      )}
      <Input
        label="Tên loại sân *"
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setValidationError("");
        }}
        placeholder="Ví dụ: Sân đơn, Sân đôi..."
        maxLength={255}
        autoFocus
        className="focus:border-indigo-400 focus:ring-indigo-100"
      />
      <Textarea
        label="Mô tả (tùy chọn)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Mô tả chi tiết..."
        rows={3}
        className="focus:border-violet-400 focus:ring-violet-100"
      />
      <Flex spacing="md" className="pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={saving}
          className="flex-1"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          disabled={saving}
          isLoading={saving}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg hover:shadow-xl"
          leftIcon={buttonIcon}
        >
          {buttonText}
        </Button>
      </Flex>
    </form>
  );
}
