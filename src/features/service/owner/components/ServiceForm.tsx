"use client";

import { useState } from "react";
import { Plus, Lightning } from "@phosphor-icons/react";
import { Grid } from "@/src/shared/components/layout/Grid";
import { Flex } from "@/src/shared/components/layout/Flex";
import { Input } from "@/src/shared/components/ui/Input";
import { Textarea } from "@/src/shared/components/ui/Textarea";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Button } from "@/src/shared/components/ui/Button";
import { ImageUploader } from "@/src/shared/components/ui/ImageUploader";
import type { SaveServiceRequest } from "@/src/features/service/shared/types/service.types";
import {
  createNumericChangeHandler,
  createTrimOnBlurHandler,
} from "@/src/shared/utils/inputValidation";

interface ServiceFormProps {
  initialData?: {
    name: string;
    description: string;
    unit: string;
    defaultPrice: string;
    serviceDisplayUrl?: string;
  };
  onSubmit: (data: SaveServiceRequest) => Promise<void>;
  onCancel: () => void;
  submitText: string;
  generalError?: string | null;
}

export function ServiceForm({
  initialData,
  onSubmit,
  onCancel,
  submitText,
  generalError,
}: ServiceFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [unit, setUnit] = useState(initialData?.unit || "");
  const [defaultPrice, setDefaultPrice] = useState(initialData?.defaultPrice || "");
  const [serviceDisplayUrl, setServiceDisplayUrl] = useState(initialData?.serviceDisplayUrl || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
        serviceDisplayUrl: serviceDisplayUrl || undefined,
      });
    } catch (err) {
      // Error is handled by parent
    } finally {
      setSaving(false);
    }
  }

  const isChanged =
    name.trim() !== (initialData?.name || "") ||
    description.trim() !== (initialData?.description || "") ||
    unit.trim() !== (initialData?.unit || "") ||
    defaultPrice !== (initialData?.defaultPrice || "") ||
    serviceDisplayUrl !== (initialData?.serviceDisplayUrl || "");

  const canSubmit = isChanged && !uploading && !saving;

  return (
    <>
      <div className="px-8 py-6">
        {generalError && (
          <Alert variant="error" className="mb-6">
            {generalError}
          </Alert>
        )}

        <Grid cols={1} spacing="lg">
          {/* Image Upload Section */}
          <ImageUploader
            label="Hình ảnh minh họa"
            value={serviceDisplayUrl}
            onChange={setServiceDisplayUrl}
            onUploadingChange={setUploading}
            folder="services"
          />

          <Input
            label="Tên mặt hàng/dịch vụ *"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((p) => ({ ...p, name: undefined }));
            }}
            onBlur={createTrimOnBlurHandler(setName)}
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
                onChange={createNumericChangeHandler(
                  (val) => {
                    setDefaultPrice(val);
                    setErrors((p) => ({ ...p, defaultPrice: undefined }));
                  },
                  { min: 1, allowDecimal: false }
                )}
                placeholder="VD: 10000"
                error={errors.defaultPrice}
                rightIcon={<span className="text-sm font-bold text-slate-400">đ</span>}
                className="text-base shadow-sm focus:border-primary focus:ring-primary/10"
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
                onBlur={createTrimOnBlurHandler(setUnit)}
                placeholder="VD: Chai, Lượt..."
                error={errors.unit}
                className="text-base shadow-sm focus:border-primary focus:ring-primary/10"
              />
            </div>
          </Grid>
        </Grid>
      </div>

      <Flex align="center" justify="end" spacing="md" className="border-t border-border px-8 py-5 bg-surface-2 rounded-b-2xl">
        <button
          onClick={onCancel}
          disabled={saving || uploading}
          className="px-4 py-2 text-sm font-bold text-muted hover:text-foreground transition-colors disabled:opacity-50"
        >
          Hủy bỏ
        </button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          isLoading={saving}
          variant="primary"
        >
          {submitText}
        </Button>
      </Flex>
    </>
  );
}
