"use client";

import { useState } from "react";
import { Plus, Lightning } from "@phosphor-icons/react";

import { Modal } from "@/src/shared/components/ui/Modal";
import { ServiceForm } from "../components/ServiceForm";

import { createService } from "@/src/api/service.api";
import { AuthApiError } from "@/src/api/auth.api";
import type { SaveServiceRequest, Service } from "@/src/features/service/shared/types/service.types";

export function CreateServiceModal({
  onCreated,
  onClose,
}: {
  onCreated: (p: Service) => void;
  onClose: () => void;
}) {
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleSubmit = async (dto: SaveServiceRequest) => {
    setGeneralError(null);
    try {
      const created = await createService(dto);
      onCreated(created);
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
      title="Tạo dịch vụ mới"
      subtitle="MỞ BÁN SẢN PHẨM"
      icon={<Plus className="h-5 w-5" />}
      maxWidth="xl"
      headerGradient="from-[#1B5E38] to-[#2A9D5C]"
    >
      <ServiceForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitText="Lưu và Kinh doanh"
        submitIcon={<Lightning className="h-4 w-4" />}
        generalError={generalError}
      />
    </Modal>
  );
}

