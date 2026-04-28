"use client";

import { useState } from "react";
import {
  ShieldCheck,
} from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Flex } from "@/src/shared/components/layout/Flex";
import { Grid } from "@/src/shared/components/layout/Grid";

export interface CreateCancelPolicyPayload {
  hoursBefore: number;
  refundPercent: number;
  description: string;
}

export function CreateCancelPolicyModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (payload: CreateCancelPolicyPayload) => void;
}) {
  const [hoursBefore, setHoursBefore] = useState(0);
  const [refundPercent, setRefundPercent] = useState(100);
  const [description, setDescription] = useState("");

  const handleConfirm = () => {
    onConfirm({
      hoursBefore,
      refundPercent,
      description,
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Thêm Mốc Hủy mới"
      subtitle="CẤU HÌNH CHÍNH SÁCH HOÀN TIỀN"
      icon={<ShieldCheck className="h-5 w-5" />}
      maxWidth="lg"
      headerGradient="from-[#1B5E38] to-[#2A9D5C]"
    >
      <div className="p-6 space-y-6">
        <Grid cols={2} spacing="md">
          <div>
            <Input
              label="Hủy trước (thời gian)"
              type="number"
              min={0}
              max={720}
              step={1}
              value={hoursBefore}
              onChange={(e) => setHoursBefore(Number(e.target.value))}
              rightIcon={<span className="text-sm font-bold text-slate-400">giờ</span>}
              className="text-base shadow-sm focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
            />
          </div>

          <div>
            <Input
              label="Hoàn tiền theo tỷ lệ"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={refundPercent}
              onChange={(e) => setRefundPercent(Number(e.target.value))}
              rightIcon={<span className="text-sm font-bold opacity-50">%</span>}
              className="text-base shadow-sm focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
            />
          </div>
        </Grid>

        <div>
          <Input
            label="Ghi chú bổ sung (hiển thị cho khách)"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="VD: Không áp dụng hoàn tiền dịp Lễ Tết..."
            className="text-base shadow-sm focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
          />
        </div>
      </div>

      <Flex align="center" justify="end" spacing="md" className="border-t border-slate-100 px-8 py-5 bg-slate-50/50 rounded-b-2xl">
        <Button onClick={onClose} variant="ghost">
          Hủy bỏ
        </Button>
        <Button
          onClick={handleConfirm}
          variant="primary"
        >
          Xác nhận Thêm
        </Button>
      </Flex>
    </Modal>
  );
}
