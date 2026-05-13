"use client";

import { useState, useRef } from "react";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Flex } from "@/src/shared/components/layout/Flex";
import { createPromotion } from "@/src/api/promotion.api";
import { AuthApiError } from "@/src/api/auth.api";
import type { Promotion, SavePromotionRequest } from "@/src/shared/types/promotion.types";
import { PromotionForm, type PromotionFormData, type PromotionFormErrors, type PromotionFormHandle } from "../forms/PromotionForm";
import { toIsoDateString } from "@/src/features/benefit/utils";

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
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<PromotionFormErrors>({});
    const formRef = useRef<PromotionFormHandle>(null);

    function validate(data: PromotionFormData) {
        const e: PromotionFormErrors = {};
        if (!data.name.trim()) e.name = "Tên khuyến mãi không được để trống";
        else if (data.name.trim().length > 255) e.name = "Tên khuyến mãi tối đa 255 ký tự";

        if (data.code.trim() && data.code.trim().length > 50) e.code = "Mã khuyến mãi tối đa 50 ký tự";

        const d = Number(data.discountValue);
        if (!data.discountValue.trim() || isNaN(d) || d <= 0) {
            e.discountValue = "Giá trị giảm giá phải lớn hơn 0";
        } else if (data.discountType === 0 && (d < 0.01 || d > 100)) {
            e.discountValue = "Tỷ lệ giảm giá phải từ 0.01 đến 100";
        }

        if (data.maxDiscountAmount.trim()) {
            const max = Number(data.maxDiscountAmount);
            if (isNaN(max) || max <= 0) {
                e.maxDiscountAmount = "Giảm giá tối đa phải lớn hơn 0";
            }
        }

        if (!data.startDate) e.startDate = "Ngày bắt đầu không được để trống";
        if (!data.endDate) e.endDate = "Ngày kết thúc không được để trống";
        if (data.startDate && data.endDate && data.startDate > data.endDate)
            e.endDate = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu";

        return e;
    }

    async function handleSubmit(formData: PromotionFormData) {
        const e = validate(formData);
        if (Object.keys(e).length) {
            setErrors(e);
            return;
        }
        setErrors({});
        setSaving(true);
        try {
            const dto: SavePromotionRequest = {
                name: formData.name.trim(),
                code: formData.code.trim() || undefined,
                promoDisplayUrl: formData.promoDisplayUrl || undefined,
                description: formData.description.trim() || undefined,
                discountType: formData.discountType,
                discountValue: Number(formData.discountValue),
                maxDiscountAmount: formData.maxDiscountAmount.trim() ? Number(formData.maxDiscountAmount) : undefined,
                usageLimit: formData.usageLimit.trim() ? Number(formData.usageLimit) : undefined,
                usagePerUserLimit: formData.usagePerUserLimit.trim() ? Number(formData.usagePerUserLimit) : undefined,
                startDate: toIsoDateString(formData.startDate),
                endDate: toIsoDateString(formData.endDate),
                conditions: formData.conditions,
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
            maxWidth="2xl"
            headerGradient=""
        >
            <div className="px-8 py-6">
                {errors.general && (
                    <Alert variant="error" className="mb-6 py-2">
                        {errors.general}
                    </Alert>
                )}

                <PromotionForm
                    ref={formRef}
                    initialData={{
                        name: "",
                        code: "",
                        description: "",
                        discountType: 0,
                        discountValue: "",
                        maxDiscountAmount: "",
                        usageLimit: "",
                        usagePerUserLimit: "",
                        startDate: getTodayStr(),
                        endDate: "",
                        conditions: [],
                    }}
                    onSubmit={handleSubmit}
                    errors={errors}
                    setErrors={setErrors}
                    isSubmitting={saving}
                    showToast={showToast}
                />
            </div>

            {/* Footer */}
            <Flex className="border-t border-border bg-surface-2/50 px-8 py-5" justify="end" align="center" spacing="md">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={saving}
                >
                    Hủy bỏ
                </Button>
                <Button
                    variant="primary"
                    onClick={() => formRef.current?.submit()}
                    disabled={saving}
                    isLoading={saving}
                    className="shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none border-none"
                >
                    Tạo khuyến mãi
                </Button>
            </Flex>
        </Modal>
    );
}

