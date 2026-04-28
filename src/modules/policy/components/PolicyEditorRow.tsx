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
} from "@/src/modules/policy/utils/cancellationPolicy";
import type { CancelPolicy } from "@/src/shared/types/cancel-policy.types";

type EditableCancelPolicy = CancelPolicy & {
  clientId: string;
  isNew: boolean;
};

function getRefundColor(percent: number) {
  if (percent >= 80) {
    return {
      bar: "from-emerald-500 to-teal-400",
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: "text-emerald-600 bg-emerald-100",
    };
  }
  if (percent >= 40) {
    return {
      bar: "from-amber-500 to-orange-400",
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: "text-amber-600 bg-amber-100",
    };
  }
  return {
    bar: "from-rose-500 to-red-400",
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: "text-rose-600 bg-rose-100",
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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-[#1B5E38]/30 hover:shadow-lg hover:shadow-[#1B5E38]/5 animate-slide-up"
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
                <h3 className="text-lg font-bold text-slate-900">
                  {formatPolicyHours(policy.hoursBefore)}
                </h3>
                {policy.isNew && (
                  <Badge variant="info" size="sm" icon={<Sparkle className="h-3 w-3" />}>
                    Mới
                  </Badge>
                )}
              </Flex>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
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
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
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
              onChange={(event) =>
                onChange(
                  policy.clientId,
                  "hoursBefore",
                  Number(event.target.value),
                )
              }
              rightIcon={<span className="text-sm font-bold text-slate-400">giờ</span>}
              className="text-base font-extrabold shadow-sm focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
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
              onChange={(event) =>
                onChange(
                  policy.clientId,
                  "refundPercent",
                  Number(event.target.value),
                )
              }
              rightIcon={<span className="text-sm font-extrabold opacity-50">%</span>}
              className={`text-base font-extrabold shadow-sm focus:border-[#1B5E38] focus:ring-[#1B5E38]/10 ${color.text} ${color.bg}`}
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
              className="text-base shadow-sm focus:border-[#1B5E38] focus:ring-[#1B5E38]/10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
