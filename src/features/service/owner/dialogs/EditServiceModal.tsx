"use client";

import { useState } from "react";
import { PencilSimpleLine, CheckCircle } from "@phosphor-icons/react";

import { Modal } from "@/src/shared/components/ui/Modal";
import { ServiceForm } from "../components/ServiceForm";

import { updateService } from "@/src/api/service.api";
import { AuthApiError } from "@/src/api/auth.api";
import type { SaveServiceRequest, Service } from "@/src/features/service/shared/types/service.types";

export function EditServiceModal({
  service,
  onSaved,
  onClose,
}: {
  service: Service;
  onSaved: (updated: Service) => void;
  onClose: () => void;
}) {
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (dto: SaveServiceRequest) => {
    setGeneralError(null);
    try {
      const updated = await updateService(service.id, dto);
      onSaved(updated);
      onClose();
    } catch (err) {
      setGeneralError(err instanceof AuthApiError ? err.message : "Đã có lỗi xảy ra.");
      throw err;
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Chỉnh sửa dịch vụ"
      subtitle="CẬP NHẬT THÔNG TIN"
      icon={<PencilSimpleLine className="h-5 w-5" />}
      maxWidth="xl"
      headerGradient="from-[#1B5E38] to-[#2A9D5C]"
    >
      <ServiceForm
        initialData={{
          name: service.name,
          description: service.description || "",
          unit: service.unit,
          defaultPrice: String(service.defaultPrice),
          serviceDisplayUrl: service.serviceDisplayUrl,
        }}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText="Lưu thay đổi"
        generalError={generalError}
      />
    </Modal>
  );
}

