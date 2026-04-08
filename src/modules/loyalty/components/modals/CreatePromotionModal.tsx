"use client";

import { useState } from "react";
import { Plus, Zap } from "lucide-react";

import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Flex } from "@/src/shared/components/layout/Flex";
import { Stack } from "@/src/shared/components/layout/Stack";
import { Grid } from "@/src/shared/components/layout/Grid";

import { createPromotion } from "@/src/api/promotion.api";
import { AuthApiError } from "@/src/api/auth.api";
import type { Promotion, SavePromotionRequest } from "@/src/shared/types/promotion.types";

function getTodayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function CreatePromotionModal({
  onCreated,
  onClose,
  showToast,
}: {
  onCreated: (p: Promotion) => void;
  onClose: () => void;
  showToast: (tone: "success" | "error", msg: string) => void;
}) {
  const today = getTodayStr();
  const [name, setName] = useState("");
  const [discountRate, setDiscountRate] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    discountRate?: string;
    startDate?: string;
    endDate?: string;
    general?: string;
  }>({});

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Tên khuyến mãi không được để trống";
    else if (name.trim().length > 255) e.name = "Tên khuyến mãi tối đa 255 ký tự";

    const d = Number(discountRate);
    if (!discountRate.trim() || isNaN(d) || d < 0.01 || d > 100)
      e.discountRate = "Tỷ lệ giảm giá phải từ 0.01 đến 100";

    if (!startDate) e.startDate = "Ngày bắt đầu không được để trống";
    if (!endDate) e.endDate = "Ngày kết thúc không được để trống";
    if (startDate && endDate && startDate > endDate)
      e.endDate = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu";

    return e;
  }

  async function handleCreate() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const dto: SavePromotionRequest = {
        name: name.trim(),
        discountRate: Number(discountRate),
        startDate,
        endDate,
      };
      const created = await createPromotion(dto);
      onCreated(created);
      showToast("success", `Tạo "${created.name}" thành công`);
      onClose();
    } catch (err) {
      const msg = err instanceof AuthApiError ? err.message : "Đã có lỗi xảy ra, không thể tạo khuyến mãi.";
      setErrors({ general: msg });
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Tạo khuyến mãi mới"
      subtitle="Nhập thông tin chương trình khuyến mãi"
      icon={<Plus className="h-5 w-5" />}
      maxWidth="xl"
      headerGradient="from-fuchsia-500 to-violet-600"
    >
      <div className="px-8 py-6">
        {errors.general && (
          <Alert variant="error" className="mb-6 py-2">
            {errors.general}
          </Alert>
        )}

        <Stack spacing="lg">
          {/* Name */}
          <div>
            <Input
              label="Tên chương trình *"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((p) => ({ ...p, name: undefined }));
              }}
              placeholder="VD: Khuyến mãi hè 2026"
              error={errors.name}
              className="text-base focus:border-fuchsia-500 focus:ring-fuchsia-100"
            />
          </div>

          {/* Discount Rate */}
          <div>
            <Input
              label="Tỷ lệ giảm giá (%) *"
              type="number"
              min={0.01}
              max={100}
              step={0.01}
              value={discountRate}
              onChange={(e) => {
                setDiscountRate(e.target.value);
                setErrors((p) => ({ ...p, discountRate: undefined }));
              }}
              placeholder="VD: 15"
              error={errors.discountRate}
              rightIcon={<span className="text-sm font-bold text-slate-400">%</span>}
              className="text-base focus:border-fuchsia-500 focus:ring-fuchsia-100"
            />
          </div>

          {/* Dates */}
          <Grid cols={2} spacing="md">
            <div>
              <Input
                label="Ngày bắt đầu *"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setErrors((p) => ({ ...p, startDate: undefined, endDate: undefined }));
                }}
                error={errors.startDate}
                className="text-base focus:border-fuchsia-500 focus:ring-fuchsia-100"
              />
            </div>
            <div>
              <Input
                label="Ngày kết thúc *"
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setErrors((p) => ({ ...p, endDate: undefined }));
                }}
                error={errors.endDate}
                className="text-base focus:border-fuchsia-500 focus:ring-fuchsia-100"
              />
            </div>
          </Grid>
        </Stack>
      </div>

      {/* Footer */}
      <Flex className="border-t border-slate-100 px-8 py-5" justify="end" align="center" spacing="md">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={saving}
        >
          Hủy bỏ
        </Button>
        <Button
          variant="primary"
          onClick={handleCreate}
          disabled={saving}
          isLoading={saving}
          className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white shadow-md shadow-fuchsia-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none border-none"
          leftIcon={<Zap className="h-4 w-4" />}
        >
          Tạo khuyến mãi
        </Button>
      </Flex>
    </Modal>
  );
}
