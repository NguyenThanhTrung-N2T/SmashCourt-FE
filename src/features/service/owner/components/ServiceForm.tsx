"use client";

import { useState } from "react";
import { Grid } from "@/src/shared/components/layout/Grid";
import { Flex } from "@/src/shared/components/layout/Flex";
import { Input } from "@/src/shared/components/ui/Input";
import { Textarea } from "@/src/shared/components/ui/Textarea";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Button } from "@/src/shared/components/ui/Button";
import type { SaveServiceRequest } from "@/src/shared/types/service.types";

interface ServiceFormProps {
  initialData?: {
    name: string;
    description: string;
    unit: string;
    defaultPrice: string;
  };
  onSubmit: (data: SaveServiceRequest) => Promise<void>;
  onCancel: () => void;
  submitText: string;
  submitIcon: React.ReactNode;
  generalError?: string | null;
}

export function ServiceForm({
  initialData,
  onSubmit,
  onCancel,
  submitText,
  submitIcon,
  generalError,
}: ServiceFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [unit, setUnit] = useState(initialData?.unit || "");
  const [defaultPrice, setDefaultPrice] = useState(initialData?.defaultPrice || "");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    unit?: string;
    defaultPrice?: string;
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

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        unit: unit.trim(),
        defaultPrice: Number(defaultPrice),
      });
    } catch (err) {
      // Error is caught here just to prevent unhandled promise rejection if parent throws
      // The parent will handle displaying the general error
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="px-8 py-6">
        {generalError && (
          <Alert variant="error" className="mb-6">
            {generalError}
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
            className="text-base shadow-sm focus:border-primary focus:ring-primary/10"
          />

          <Textarea
            label="Mô tả thêm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Dành riêng cho miêu tả (không bắt buộc)..."
            className="text-sm shadow-sm focus:border-primary focus:ring-primary/10"
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

      <Flex align="center" justify="end" spacing="md" className="border-t border-border px-8 py-5 bg-surface-2 rounded-b-2xl">
        <Button onClick={onCancel} disabled={saving} variant="ghost">
          Hủy bỏ
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          isLoading={saving}
          leftIcon={submitIcon}
          variant="primary"
        >
          {submitText}
        </Button>
      </Flex>
    </>
  );
}
