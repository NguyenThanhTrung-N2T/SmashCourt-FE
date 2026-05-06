import { useState, useEffect } from "react";
import { Calendar, CheckCircle, PencilSimpleLine, Megaphone, Percent, Trash, ArrowClockwise } from "@phosphor-icons/react";
import { updatePromotion, deletePromotion } from "@/src/api/promotion.api";
import type { Promotion, SavePromotionRequest } from "@/src/shared/types/promotion.types";
import { AuthApiError } from "@/src/api/auth.api";
import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Alert } from "@/src/shared/components/ui/Alert";
import { ConfirmationDialog } from "@/src/shared/components/ui/ConfirmationDialog";
import { Flex } from "@/src/shared/components/layout/Flex";
import { Grid } from "@/src/shared/components/layout/Grid";
import { Badge } from "@/src/shared/components/ui/Badge";
import { getStatusCfg, formatDate, toInputDate } from "../utils";

export function PromotionDetailPanel({
    promotion,
    onSaved,
    onDeleted,
    showToast,
}: {
    promotion: Promotion;
    onSaved: (p: Promotion) => void;
    onDeleted: (id: string) => void;
    showToast: (tone: "success" | "error", msg: string) => void;
}) {
    const [name, setName] = useState(promotion.name);
    const [discountRate, setDiscountRate] = useState(String(promotion.discountRate));
    const [startDate, setStartDate] = useState(toInputDate(promotion.startDate));
    const [endDate, setEndDate] = useState(toInputDate(promotion.endDate));
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [errors, setErrors] = useState<{
        name?: string;
        discountRate?: string;
        startDate?: string;
        endDate?: string;
        general?: string;
    }>({});

    useEffect(() => {
        setName(promotion.name);
        setDiscountRate(String(promotion.discountRate));
        setStartDate(toInputDate(promotion.startDate));
        setEndDate(toInputDate(promotion.endDate));
        setErrors({});
        setShowDeleteConfirm(false);
    }, [promotion.id, promotion.name, promotion.discountRate, promotion.startDate, promotion.endDate]);

    const isDirty =
        name !== promotion.name ||
        Number(discountRate) !== Number(promotion.discountRate) ||
        startDate !== toInputDate(promotion.startDate) ||
        endDate !== toInputDate(promotion.endDate);

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

    async function handleSave() {
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
            const updated = await updatePromotion(promotion.id, dto);
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
            await deletePromotion(promotion.id);
            onDeleted(promotion.id);
            showToast("success", `Đã xóa "${promotion.name}"`);
        } catch (err) {
            const msg = err instanceof AuthApiError ? err.message : "Không thể xóa khuyến mãi.";
            showToast("error", msg);
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    }

    const statusCfg = getStatusCfg(promotion.status);

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-border bg-surface-1 shadow-xl shadow-border/50">
            {/* Visual Banner */}
            <div
                className="relative h-28 w-full"
                style={{ background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)" }}
            >
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                <div className="absolute -bottom-10 left-8">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-1 p-2 shadow-lg shadow-primary/20">
                        <div
                            className="flex h-full w-full items-center justify-center rounded-xl"
                            style={{ background: "linear-gradient(145deg, #2D7A50 0%, #1B5E38 100%)" }}
                        >
                            <Megaphone className="h-8 w-8 text-white drop-shadow-md" />
                        </div>
                    </div>
                </div>
                {/* Status Badge */}
                <div className="absolute top-4 right-6">
                    <Badge variant={statusCfg.variant} dot>
                        {statusCfg.label}
                    </Badge>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-6 pt-14">
                <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#2A9D5C] to-[#1B5E38] bg-clip-text text-transparent">
                    {promotion.name}
                </h2>

                {/* Info Highlights */}
                <Grid cols={3} className="mt-6" spacing="md">
                    <Flex align="center" spacing="md" className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-600">
                            <Percent className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">Tỷ lệ giảm</p>
                            <p className="text-xl font-black text-indigo-600">{Number(promotion.discountRate)}%</p>
                        </div>
                    </Flex>
                    <Flex align="center" spacing="md" className="rounded-2xl border border-border bg-surface-2/50 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted">Bắt đầu</p>
                            <p className="text-lg font-black text-foreground">{formatDate(promotion.startDate)}</p>
                        </div>
                    </Flex>
                    <Flex align="center" spacing="md" className="rounded-2xl border border-border bg-surface-2/50 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted">Kết thúc</p>
                            <p className="text-lg font-black text-foreground">{formatDate(promotion.endDate)}</p>
                        </div>
                    </Flex>
                </Grid>

                {/* PencilSimple Form */}
                <div className="mt-8 rounded-3xl border border-primary/15 bg-primary/5 p-6">
                    <Flex justify="between" align="center" className="mb-6">
                        <Flex align="center" spacing="sm">
                            <PencilSimpleLine className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-bold text-foreground">Chỉnh sửa khuyến mãi</h3>
                        </Flex>
                        {isDirty && (
                            <Badge variant="warning" className="animate-pulse">
                                CHƯA LƯU
                            </Badge>
                        )}
                    </Flex>

                    {errors.general && (
                        <Alert variant="error" className="mb-6 py-2">
                            {errors.general}
                        </Alert>
                    )}

                    <Grid cols={2} spacing="lg">
                        {/* Name */}
                        <div className="col-span-2">
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
                                className="text-base focus:border-primary focus:ring-primary/10"
                            />
                            {!errors.name && (
                                <p className="mt-2 text-xs font-medium text-muted">
                                    Tên hiển thị cho khách hàng khi chọn khuyến mãi lúc đặt sân.
                                </p>
                            )}
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
                                error={errors.discountRate}
                                rightIcon={<span className="text-sm font-bold text-slate-400">%</span>}
                                className="text-base focus:border-primary focus:ring-primary/10"
                            />
                            {!errors.discountRate && (
                                <p className="mt-2 text-xs font-medium text-muted leading-relaxed">
                                    Từ 0.01% đến 100%.
                                </p>
                            )}
                        </div>

                        {/* Empty cell for alignment */}
                        <div />

                        {/* Start Date */}
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
                                className="text-base focus:border-primary focus:ring-primary/10"
                            />
                        </div>

                        {/* End Date */}
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
                                className="text-base focus:border-primary focus:ring-primary/10"
                            />
                            {!errors.endDate && (
                                <p className="mt-2 text-xs font-medium text-muted">
                                    Phải bằng hoặc sau ngày bắt đầu.
                                </p>
                            )}
                        </div>
                    </Grid>
                </div>
            </div>

            {/* Floating Action Footer */}
            <Flex className="shrink-0 border-t border-border bg-surface-2/80 px-8 py-5" justify="between" align="center">
                <Flex align="center" spacing="sm">
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setName(promotion.name);
                            setDiscountRate(String(promotion.discountRate));
                            setStartDate(toInputDate(promotion.startDate));
                            setEndDate(toInputDate(promotion.endDate));
                            setErrors({});
                        }}
                        disabled={!isDirty || saving}
                        leftIcon={<ArrowClockwise className="h-4 w-4" />}
                    >
                        Reset
                    </Button>
                    {/* Delete Button */}
                    <Button
                        variant="dangerSoft"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={deleting || saving}
                        leftIcon={<Trash className="h-4 w-4" />}
                    >
                        Xóa
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

            {/* Delete Confirmation Overlay */}
            {showDeleteConfirm && (
                <ConfirmationDialog
                    title="Xác nhận xóa"
                    message={`Bạn có chắc muốn xóa chương trình "${promotion.name}"? Khuyến mãi sẽ bị ẩn khỏi hệ thống. Booking cũ vẫn giữ nguyên.`}
                    confirmText="Xóa khuyến mãi"
                    cancelText="Hủy bỏ"
                    variant="danger"
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}
        </div>
    );
}
