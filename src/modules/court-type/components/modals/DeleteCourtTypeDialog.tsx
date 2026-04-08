"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/src/shared/components/ui/Button";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Flex } from "@/src/shared/components/layout/Flex";
import type { CourtType } from "@/src/shared/types/court-type.types";

export function DeleteCourtTypeDialog({ courtType, onClose, onConfirm }: { courtType: CourtType; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Loại sân"
      subtitle="Xác nhận xóa"
      icon={<AlertTriangle className="h-5 w-5" />}
      maxWidth="md"
      headerGradient="from-red-500 to-pink-500"
    >
      <div className="px-6 py-6">
        <Alert variant="warning" title="Bạn có chắc muốn xóa loại sân này?" className="mb-5">
          Loại sân <span className="font-bold">&quot;{courtType.name}&quot;</span> sẽ bị ẩn khỏi hệ thống.
        </Alert>
        <Flex spacing="md">
          <Button
            onClick={onClose}
            variant="ghost"
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            variant="danger"
            className="flex-1"
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Xác nhận xóa
          </Button>
        </Flex>
      </div>
    </Modal>
  );
}
