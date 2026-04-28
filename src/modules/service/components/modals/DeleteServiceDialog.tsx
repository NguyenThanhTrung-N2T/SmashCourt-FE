"use client";

import { useState } from "react";
import { Trash, Coffee } from "@phosphor-icons/react";

import { Button } from "@/src/shared/components/ui/Button";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Flex } from "@/src/shared/components/layout/Flex";

import type { Service } from "@/src/shared/types/service.types";

export function DeleteServiceDialog({
  service,
  onConfirm,
  onClose,
}: {
  service: Service;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Xác nhận ngưng kinh doanh"
      subtitle="QUẢN LÝ DỊCH VỤ"
      icon={<Coffee className="h-5 w-5" />}
      maxWidth="md"
      headerGradient="from-red-500 to-rose-600"
    >
      <div className="px-8 py-6">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100">
              <Coffee className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Ngưng kinh doanh "{service.name}"
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Dịch vụ này sẽ bị ẩn khỏi hệ thống và không thể đặt mới. 
                Dữ liệu lịch sử và các giao dịch đã thực hiện sẽ không bị ảnh hưởng.
              </p>
            </div>
          </div>
        </div>

        <Flex justify="end" spacing="md">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={deleting}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={deleting}
            isLoading={deleting}
            leftIcon={<Trash className="h-4 w-4" />}
          >
            Xác nhận ngưng
          </Button>
        </Flex>
      </div>
    </Modal>
  );
}
