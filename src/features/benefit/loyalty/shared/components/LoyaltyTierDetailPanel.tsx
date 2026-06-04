import { useState, useEffect } from "react";
import { Lightning, Percent, PencilSimpleLine, ArrowCounterClockwise, FloppyDisk } from "@phosphor-icons/react";
import { updateLoyaltyTier } from "@/src/api/loyalty-tier.api";
import type { LoyaltyTier } from "@/src/features/benefit/loyalty/shared/types/loyalty-tier.types";
import { AuthApiError } from "@/src/api/auth.api";
import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Flex } from "@/src/shared/components/layout/Flex";
import { Grid } from "@/src/shared/components/layout/Grid";
import { getTierCfg } from "../configs/loyalty-tier.config";
import { createNumericChangeHandler } from "@/src/shared/utils/inputValidation";

export function LoyaltyTierDetailPanel({
    tier,
    onSaved,
    showToast,
    readOnly = false,
}: {
    tier: LoyaltyTier;
    onSaved?: (u: LoyaltyTier) => void;
    showToast?: (tone: "success" | "error", msg: string) => void;
    readOnly?: boolean;
}) {
    const cfg = getTierCfg(tier.name);
    const Icon = cfg.icon;

    const [minPoints, setMinPoints] = useState(String(tier.minPoints));
    const [discountRate, setDiscountRate] = useState(String(tier.discountRate));
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<{ minPoints?: string; discountRate?: string; general?: string }>({});

    useEffect(() => {
        setMinPoints(String(tier.minPoints));
        setDiscountRate(String(tier.discountRate));
        setErrors({});
    }, [tier.id, tier.minPoints, tier.discountRate]);

    const isDirty = Number(minPoints) !== tier.minPoints || Number(discountRate) !== Number(tier.discountRate);

    function validate() {
        const e: typeof errors = {};
        const p = Number(minPoints);
        const d = Number(discountRate);
        if (!minPoints.trim() || isNaN(p) || p < 0) e.minPoints = "Vui lòng nhập số hợp lệ ≥ 0";
        if (!discountRate.trim() || isNaN(d) || d < 0 || d > 100) e.discountRate = "Vui lòng nhập tỷ lệ từ 0 đến 100";
        return e;
    }

    async function handleSave() {
        if (readOnly || !onSaved || !showToast) return;
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({});
        setSaving(true);
        try {
            const updated = await updateLoyaltyTier(tier.id, { minPoints: Number(minPoints), discountRate: Number(discountRate) });
            onSaved(updated);
            showToast("success", `Cập nhật hạng "${updated.name}" thành công`);
        } catch (err) {
            const msg = err instanceof AuthApiError ? err.message : "Đã có lỗi xảy ra, không thể lưu hệ thống.";
            setErrors({ general: msg });
            showToast("error", msg);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-border bg-surface-1 shadow-xl shadow-border/50">
            {/* ── Visual Banner ── */}
            <div className={`relative h-28 w-full bg-gradient-to-r ${cfg.gradient}`}>
                <div className="absolute -bottom-10 left-8">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-1 border-4 border-surface-1 p-2 shadow-lg">
                        <div className={`flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br ${cfg.gradient}`}>
                            <Icon className="h-8 w-8 text-white drop-shadow-md" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-8 pb-6 pt-14">
                <h2 className={`text-2xl font-black tracking-tight bg-gradient-to-r ${cfg.gradientText} bg-clip-text text-transparent`}>
                    {tier.name}
                </h2>

                {/* Info Highlights */}
                <Grid cols={2} spacing="md" className="mt-6">
                    <Flex align="center" spacing="md" className="rounded-2xl border border-border bg-surface-2 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-500">
                            <Lightning className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted">Điểm tối thiểu</p>
                            <p className="text-xl font-black text-foreground">{tier.minPoints.toLocaleString("vi-VN")}</p>
                        </div>
                    </Flex>
                    <Flex align="center" spacing="md" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600">
                            <Percent className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-500/70">Tỷ lệ giảm giá</p>
                            <p className="text-xl font-black text-emerald-600">{Number(tier.discountRate)}%</p>
                        </div>
                    </Flex>
                </Grid>

                {/* PencilSimple Form Area - Only show if NOT readOnly */}
                {!readOnly && (
                    <div className={`mt-8 rounded-3xl border border-border ${cfg.formBg} p-6`}>
                        <Flex align="center" justify="between" className="mb-6">
                            <Flex align="center" spacing="sm">
                                <PencilSimpleLine className="h-5 w-5 text-muted" />
                                <h3 className="text-base font-bold text-foreground">Cấu hình điều kiện hạng</h3>
                            </Flex>
                            {isDirty && (
                                <span className="animate-pulse rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-600">
                                    CHƯA LƯU
                                </span>
                            )}
                        </Flex>

                        {errors.general && (
                            <Alert variant="error" className="mb-6">
                                {errors.general}
                            </Alert>
                        )}

                        <Grid cols={2} spacing="lg">
                            {/* Field 1 */}
                            <div>
                                <Input
                                    id={`min-pts-${tier.id}`}
                                    type="number"
                                    min={0}
                                    value={minPoints}
                                    onChange={createNumericChangeHandler(
                                        (val) => { setMinPoints(val); setErrors((p) => ({ ...p, minPoints: undefined })); },
                                        { min: 0, allowDecimal: false }
                                    )}
                                    error={errors.minPoints}
                                    className={`text-base shadow-sm ${cfg.inputFocus}`}
                                    rightIcon={<span className="text-sm font-bold text-slate-400">Pts</span>}
                                    label="Điểm tích lũy tối thiểu"
                                />
                                {!errors.minPoints && (
                                    <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">Người dùng sẽ tự động nâng lên hạng này khi đạt số điểm tích lũy trên.</p>
                                )}
                            </div>

                            {/* Field 2 */}
                            <div>
                                <Input
                                    id={`disc-${tier.id}`}
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={0.1}
                                    value={discountRate}
                                    onChange={createNumericChangeHandler(
                                        (val) => { setDiscountRate(val); setErrors((p) => ({ ...p, discountRate: undefined })); },
                                        { min: 0, max: 100, allowDecimal: true }
                                    )}
                                    error={errors.discountRate}
                                    className={`text-base shadow-sm ${cfg.inputFocus}`}
                                    rightIcon={<span className="text-sm font-bold text-slate-400">%</span>}
                                    label="Tỷ lệ chiết khấu (%)"
                                />
                                {!errors.discountRate && (
                                    <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">Mức giảm giá sẽ được tự động áp dụng vào tổng hóa đơn khi đặt sân.</p>
                                )}
                            </div>
                        </Grid>
                    </div>
                )}

                {readOnly && (
                    <div className="mt-8 rounded-3xl border border-dashed border-border bg-surface-2/50 p-8 flex flex-col items-center text-center">
                        <div className="h-16 w-16 rounded-full bg-surface-1 flex items-center justify-center shadow-sm mb-4">
                            <Icon className={`h-8 w-8 text-muted`} />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">Chi tiết hạng {tier.name}</h3>
                        <p className="text-sm text-muted max-w-md leading-relaxed">
                            Mọi thay đổi về cấu hình hạng thành viên chỉ có thể thực hiện bởi cấp Quản lý hệ thống (Owner). Nhân viên chỉ có quyền xem thông tin hiện tại.
                        </p>
                    </div>
                )}
            </div>

            {/* Floating Action Footer - Only show if NOT readOnly */}
            {!readOnly && (
                <Flex align="center" justify="between" className="shrink-0 border-t border-border bg-surface-2 px-8 py-5">
                    <Button
                        variant="ghost"
                        onClick={() => { setMinPoints(String(tier.minPoints)); setDiscountRate(String(tier.discountRate)); setErrors({}); }}
                        disabled={!isDirty || saving}
                        leftIcon={<ArrowCounterClockwise className="h-4 w-4" />}
                    >
                        Reset
                    </Button>

                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                        isLoading={saving}
                        className={cfg.saveBg}
                        leftIcon={<FloppyDisk className="h-5 w-5" />}
                    >
                        Lưu cấu hình
                    </Button>
                </Flex>
            )}
        </div>
    );
}
