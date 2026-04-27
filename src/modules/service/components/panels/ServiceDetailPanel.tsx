"use client";

import { useEffect, useState } from "react";
import {
  Coffee,
  PencilSimpleLine,
  CheckCircle,
  Trash,
  ArrowClockwise,
  Warning,
} from "@phosphor-icons/react";

import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Textarea } from "@/src/shared/components/ui/Textarea";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Flex } from "@/src/shared/components/layout/Flex";
import { Grid } from "@/src/shared/components/layout/Grid";
import { Badge } from "@/src/shared/components/ui/Badge";

import { updateService, deleteService } from "@/src/api/service.api";
import { AuthApiError } from "@/src/api/auth.api";
import { ServiceStatus } from "@/src/shared/types/service.types";
import type { SaveServiceRequest, Service } from "@/src/shared/types/service.types";
import { getStatusCfg } from "../ServiceManager";

export function ServiceDetailPanel({
  service,
  onSaved,
  onDeleted,
  showToast,
}: {
  service: Service;
  onSaved: (p: Service) => void;
  onDeleted: (id: string) => void;
  showToast: (tone: "success" | "error", msg: string) => void;
}) {
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(service.description || "");
  const [unit, setUnit] = useState(service.unit);
  const [defaultPrice, setDefaultPrice] = useState(String(service.defaultPrice));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    unit?: string;
    defaultPrice?: string;
    general?: string;
  }>({});

  useEffect(() => {
    setName(service.name);
    setDescription(service.description || "");
    setUnit(service.unit);
    setDefaultPrice(String(service.defaultPrice));
    setErrors({});
    setShowDeleteConfirm(false);
  }, [service.id, service.name, service.description, service.unit, service.defaultPrice]);

  const isDirty =
    name !== service.name ||
    description !== (service.description || "") ||
    unit !== service.unit ||
    Number(defaultPrice) !== Number(service.defaultPrice);

  function validate() {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Tên không được để trống";
    else if (name.trim().length > 255) e.name = "Tên tối đa 255 ký tự";

    if (!unit.trim()) e.unit = "Đơn vị tính không được rỗng";
    else if (unit.trim().length > 50) e.unit = "Đơn vị tính tối đa 50 ký tự";

    const d = Number(defaultPrice);
    if (!defaultPrice.trim() || isNaN(d) || d < 1)
      e.defaultPrice = "Giá mặc định phải lớn hơn 0";

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
      showToast("success", `Cập nhật "${updated.name}" thành công`);
    } catch (err) {
      const msg = err instanceof AuthApiError ? err.message : "Đã có lỗi xảy ra, không thể lưu.";
      setErrors({ general: msg });
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteService(service.id);
      onDeleted(service.id);
      showToast("success", `Đã ngưng kinh doanh "${service.name}"`);
    } catch (err) {
      const msg = err instanceof AuthApiError ? err.message : "Không thể xóa dịch vụ này.";
      showToast("error", msg);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  const statusCfg = getStatusCfg(service.status);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <div
        className="relative h-28 w-full"
        style={{ background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)" }}
      >
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="absolute -bottom-10 left-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2 shadow-lg shadow-[#1B5E38]/20">
            <div
              className="flex h-full w-full items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(145deg, #2D7A50 0%, #1B5E38 100%)" }}
            >
              <Coffee className="h-8 w-8 text-white drop-shadow-md" />
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-6">
          <Badge variant={statusCfg.variant} size="md" dot className="shadow-md">
            {statusCfg.label}
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-6 pt-14">
        <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#2A9D5C] to-[#1B5E38] bg-clip-text text-transparent">
          {service.name}
        </h2>
        {service.description && (
          <p className="mt-2 text-sm text-slate-500 max-w-lg">{service.description}</p>
        )}

        <div className="mt-8 rounded-3xl border border-[#1B5E38]/10 bg-[#1B5E38]/5 p-6">
          <Flex justify="between" align="center" className="mb-6">
            <Flex align="center" spacing="sm">
              <PencilSimpleLine className="h-5 w-5 text-[#1B5E38]" />
              <h3 className="text-base font-bold text-slate-800">Thông tin sản phẩm/dịch vụ</h3>
            </Flex>
            {isDirty && (
              <span className="animate-pulse rounded-full bg-[#1B5E38]/15 px-3 py-1 text-xs font-black text-[#1B5E38]">
                CHƯA LƯU
              </span>
            )}
          </Flex>

          {errors.general && (
            <Alert variant="error" className="mb-6">
              {errors.general}
            </Alert>
          )}

          <Grid cols={2} spacing="md">
            <div className="col-span-2">
              <Input
                label="Tên dịch vụ"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((p) => ({ ...p, name: undefined }));
                }}
                error={errors.name}
                className="text-base shadow-sm focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
              />
            </div>

            <div className="col-span-2">
              <Textarea
                label="Mô tả thêm (Không bắt buộc)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Nước suối đóng chai 500ml ướp lạnh..."
                rows={2}
                className="text-sm shadow-sm focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
              />
            </div>

            <div>
              <Input
                label="Giá mặc định (VNĐ)"
                type="number"
                min={1}
                step={1000}
                value={defaultPrice}
                onChange={(e) => {
                  setDefaultPrice(e.target.value);
                  setErrors((p) => ({ ...p, defaultPrice: undefined }));
                }}
                error={errors.defaultPrice}
                rightIcon={<span className="text-sm font-bold text-slate-400">đ</span>}
                className="text-base shadow-sm focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
              />
            </div>

            <div>
              <Input
                label="Đơn vị tính"
                type="text"
                value={unit}
                onChange={(e) => {
                  setUnit(e.target.value);
                  setErrors((p) => ({ ...p, unit: undefined }));
                }}
                placeholder="VD: Chai, Lon, Lượt..."
                error={errors.unit}
                className="text-base shadow-sm focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
              />
            </div>
          </Grid>
        </div>
      </div>

      <Flex align="center" justify="between" className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-8 py-5">
        <Flex align="center" spacing="sm">
          <Button
            variant="ghost"
            onClick={() => {
              setName(service.name);
              setDescription(service.description || "");
              setUnit(service.unit);
              setDefaultPrice(String(service.defaultPrice));
              setErrors({});
            }}
            disabled={!isDirty || saving}
            leftIcon={<ArrowClockwise className="h-4 w-4" />}
          >
            Reset
          </Button>

          <Button
            variant="dangerSoft"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting || saving || service.status === ServiceStatus.DELETED}
            leftIcon={<Trash className="h-4 w-4" />}
          >
            Ngưng kinh doanh
          </Button>
        </Flex>

        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving || !isDirty}
          isLoading={saving}
          leftIcon={<CheckCircle className="h-5 w-5" />}
        >
          Lưu thay đổi
        </Button>
      </Flex>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Xác nhận ngưng kinh doanh"
        subtitle="Hệ thống"
        icon={<Warning className="h-5 w-5" />}
        maxWidth="md"
        headerGradient="from-red-500 to-pink-500"
      >
        <div className="px-6 py-6">
          <Alert variant="warning" className="mb-5" title={`Hành động ngưng "${service.name}"`}>
            Bạn có chắc muốn xóa/ngưng <strong>&quot;{service.name}&quot;</strong>? Nó sẽ bị ẩn trên hệ thống. Dữ liệu lịch sử sẽ không bị ảnh hưởng.
          </Alert>
          <Flex justify="end" spacing="md">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
              isLoading={deleting}
              leftIcon={<Trash className="h-4 w-4" />}
            >
              Xác nhận ngưng
            </Button>
          </Flex>
        </div>
      </Modal>
    </div>
  );
}
