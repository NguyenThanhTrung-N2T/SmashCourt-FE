"use client";

import { Clock, Trash, Sparkle } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Flex } from "@/src/shared/components/layout/Flex";
import { Grid } from "@/src/shared/components/layout/Grid";
import {
    formatPolicyHours,
    getPolicyRangeLabel,
} from "@/src/features/policy/utils/cancellationPolicy";
import type { CancelPolicy } from "@/src/shared/types/cancel-policy.types";
import { createNumericChangeHandler } from "@/src/shared/utils/inputValidation";

type EditableCancelPolicy = CancelPolicy & {
    clientId: string;
    isNew: boolean;
};

function getRefundColor(percent: number) {
    if (percent >= 80) {
        return {
            bar: "from-emerald-500 to-teal-400",
            text: "text-emerald-600",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/30",
            icon: "text-emerald-500 bg-emerald-500/15",
        };
    }
    if (percent >= 40) {
        return {
            bar: "from-amber-500 to-orange-400",
            text: "text-amber-600",
            bg: "bg-amber-500/10",
            border: "border-amber-500/30",
            icon: "text-amber-500 bg-amber-500/15",
        };
    }
    return {
        bar: "from-rose-500 to-red-400",
        text: "text-rose-600",
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
        icon: "text-rose-500 bg-rose-500/15",
    };
}

interface PolicyEditorRowProps {
    policy: EditableCancelPolicy;
    allPolicies: EditableCancelPolicy[];
    onChange: (
        policyId: string,
        key: "hoursBefore" | "refundPercent" | "description",
        value: string | number,
    ) => void;
    onRemove: (policyId: string) => void;
    disableRemove: boolean;
    index: number;
}

export function PolicyEditorRow({
    policy,
    allPolicies,
    onChange,
    onRemove,
    disableRemove,
    index,
}: PolicyEditorRowProps) {
    const color = getRefundColor(policy.refundPercent);

    return (
        <div
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-1 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            {/* Top indicator line */}
            <div
                className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${color.bar}`}
            />

            <div className="flex flex-1 flex-col p-5">
                <Flex justify="between" align="center" className="mb-4">
                    <Flex align="center" spacing="md">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${color.icon}`}
                        >
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <Flex align="center" spacing="sm">
                                <h3 className="text-lg font-bold text-foreground">
                                    {formatPolicyHours(policy.hoursBefore)}
                                </h3>
                                {policy.isNew && (
                                    <Badge variant="info" size="sm" icon={<Sparkle className="h-3 w-3" />}>
                                        Mới
                                    </Badge>
                                )}
                            </Flex>
                            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-muted">
                                {getPolicyRangeLabel(
                                    allPolicies,
                                    allPolicies.findIndex(
                                        (item) => item.clientId === policy.clientId,
                                    ),
                                )}
                            </p>
                        </div>
                    </Flex>

                    <button
                        type="button"
                        onClick={() => onRemove(policy.clientId)}
                        disabled={disableRemove}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
                        title="Xóa chính sách"
                    >
                        <Trash className="h-4 w-4" />
                    </button>
                </Flex>

                <div className="mt-2 grid grid-cols-1 items-start gap-6 sm:grid-cols-12 lg:grid-cols-12">
                    <div className="col-span-1 sm:col-span-4 lg:col-span-2 xl:col-span-2">
                        <Input
                            label="Hủy trước"
                            type="number"
                            min={0}
                            max={720}
                            step={1}
                            value={policy.hoursBefore}
                            onChange={createNumericChangeHandler(
                                (val) => onChange(policy.clientId, "hoursBefore", Number(val)),
                                { min: 0, max: 720, allowDecimal: false }
                            )}
                            rightIcon={<span className="text-sm font-bold text-slate-400">giờ</span>}
                            className="text-base font-extrabold shadow-sm focus:border-primary focus:ring-primary/10"
                        />
                    </div>

                    <div className="col-span-1 sm:col-span-4 lg:col-span-2 xl:col-span-2">
                        <Input
                            label="Hoàn tiền"
                            type="number"
                            min={0}
                            max={100}
                            step={0.01}
                            value={policy.refundPercent}
                            onChange={createNumericChangeHandler(
                                (val) => onChange(policy.clientId, "refundPercent", Number(val)),
                                { min: 0, max: 100, allowDecimal: true }
                            )}
                            rightIcon={<span className="text-sm font-extrabold opacity-50">%</span>}
                            className={`text-base font-extrabold shadow-sm focus:border-primary focus:ring-primary/10 ${color.text} ${color.bg}`}
                        />
                    </div>

                    <div className="col-span-1 sm:col-span-12 lg:col-span-8 xl:col-span-8">
                        <Input
                            label="Ghi chú"
                            type="text"
                            value={policy.description ?? ""}
                            onChange={(event) =>
                                onChange(policy.clientId, "description", event.target.value)
                            }
                            placeholder="VD: Không áp dụng hoàn tiền dịp Lễ Tết..."
                            className="text-base shadow-sm focus:border-primary focus:ring-primary/10"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
