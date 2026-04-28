"use client";

import { useState } from "react";
import {
  PencilSimpleLine,
  CheckCircle,
} from "@phosphor-icons/react";

import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Textarea } from "@/src/shared/components/ui/Textarea";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Flex } from "@/src/shared/components/layout/Flex";
import { Grid } from "@/src/shared/components/layout/Grid";

import { updateService } from "@/src/api/service.api";
import { AuthApiError } from "@/src/api/auth.api";
import type { SaveServiceRequest, Service } from "@/src/shared/types/service.types";

export function EditServiceModal({
  service,
  onSaved,
  onClose,
}: {
  service: Service;
  onSaved: (updated: Service) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description || "");
  const [unit, setUnit] = useState(service.unit);
  const [defaultPrice, setDefaultPrice] = useState(String(service.defaultPrice));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    unit?: string;
    defaultPrice?: string;
    general?: string;
  }>({});

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Tên dịch vụ không được trống";
    else if (name.trim().length > 255) e.name = "Tối đa 255 ký tự";

    if (!unit.trim()) e.unit = "Đơn vị tính không được trống";
    else if (unit.trim().length > 50) e.unit = "Tối đa 50 ký tự";

    const d = Number(defaultPrice);
    if (!defaultPrice.trim() || isNaN(d) || d < 1)
      e.defaultPrice = "Giá mặc định phải > 0";

    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const dto: SaveServiceRequest = {
        name: name.trim(),
        description: description.trim() || null,
        unit: unit.trim(),
        defaultPrice: Number(defaultPrice),
      };
      const updated = await updateService(service.id, dto);
      onSaved(updated);
      onClose();
    } catch (err) {
      const msg = err instanceof AuthApiError ? err.message : "Đã có lỗi xảy ra.";
      setErrors({ general: msg });
    } finally {
      setSaving(false);
    }
  }

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
      <div className="px-8 py-6">
        {errors.general && (
          <Alert variant="error" className="mb-6">
            {errors.general}
          </Alert>
        )}

        <Grid cols={1} spacing="lg">
          <Input
            label="Tên mặt hàng/dịch vụ *"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((p) => ({ ...p, name: undefined }));
            }}
            placeholder="VD: Nước suối Aquafina"
            error={errors.name}
            className="text-base shadow-sm focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
          />

          <Textarea
            label="Mô tả thêm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Dành riêng cho miêu tả (không bắt buộc)..."
            className="text-sm shadow-sm focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
          />

          <Grid cols={2} spacing="md">
            <div>
              <Input
                label="Giá niêm yết *"
                type="number"
                min={1}
                value={defaultPrice}
                onChange={(e) => {
                  setDefaultPrice(e.target.value);
                  setErrors((p) => ({ ...p, defaultPrice: undefined }));
                }}
                placeholder="VD: 10000"
                error={errors.defaultPrice}
                rightIcon={<span className="text-sm font-bold text-slate-400">đ</span>}
                className="text-base shadow-sm focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
              />
            </div>
            <div>
              <Input
                label="Đơn vị tính *"
                type="text"
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value);
                  setErrors((p) => ({ ...p, unit: undefined }));
                }}
                placeholder="VD: Chai, Lượt..."
                error={errors.unit}
                className="text-base shadow-sm focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
              />
            </div>
          </Grid>
        </Grid>
      </div>

      <Flex align="center" justify="end" spacing="md" className="border-t border-slate-100 px-8 py-5 bg-slate-50/50 rounded-b-2xl">
        <Button onClick={onClose} disabled={saving} variant="ghost">
          Hủy bỏ
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          isLoading={saving}
          leftIcon={<CheckCircle className="h-4 w-4" />}
          variant="primary"
        >
          Lưu thay đổi
        </Button>
      </Flex>
    </Modal>
  );
}
