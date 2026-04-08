"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";

import { AuthApiError } from "@/src/api/auth.api";
import {
  createCancelPolicy,
  deleteCancelPolicy,
  fetchCancelPolicies,
  updateCancelPolicy,
} from "@/src/api/cancel-policy.api";
import {
  formatPolicyHours,
  getPolicyRangeLabel,
  sortCancelPolicies,
} from "@/src/modules/policy/utils/cancellationPolicy";
import type {
  CancelPolicy,
  SaveCancelPolicyRequest,
} from "@/src/shared/types/cancel-policy.types";
import { useToast } from "@/src/shared/hooks/useToast";

import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Modal } from "@/src/shared/components/ui/Modal";
import { Flex } from "@/src/shared/components/layout/Flex";
import { Grid } from "@/src/shared/components/layout/Grid";
import { Badge } from "@/src/shared/components/ui/Badge";
import { CreateCancelPolicyModal, type CreateCancelPolicyPayload } from "./modals/CreateCancelPolicyModal";

// ─────────────────────────────────────────────────────────
// TYPINGS & UTILS
// ─────────────────────────────────────────────────────────

type EditableCancelPolicy = CancelPolicy & {
  clientId: string;
  isNew: boolean;
};

function toEditablePolicy(policy: CancelPolicy): EditableCancelPolicy {
  return {
    ...policy,
    clientId: policy.id,
    isNew: false,
  };
}

function toMutationDto(policy: EditableCancelPolicy): SaveCancelPolicyRequest {
  const description = policy.description?.trim();
  return {
    hoursBefore: policy.hoursBefore,
    refundPercent: policy.refundPercent,
    description: description ? description : null,
  };
}

function toComparablePolicy(policies: EditableCancelPolicy[]) {
  return sortCancelPolicies(policies).map((policy) => ({
    id: policy.isNew ? policy.clientId : policy.id,
    hoursBefore: policy.hoursBefore,
    refundPercent: policy.refundPercent,
    description: policy.description?.trim() ?? "",
    isNew: policy.isNew,
  }));
}

function serializePolicies(policies: EditableCancelPolicy[]) {
  return JSON.stringify(toComparablePolicy(policies));
}

function getNextAvailableHours(policies: EditableCancelPolicy[]) {
  const usedHours = new Set(policies.map((policy) => policy.hoursBefore));
  for (let value = 1; value <= 720; value += 1) {
    if (!usedHours.has(value)) {
      return value;
    }
  }
  if (!usedHours.has(0)) return 0;
  return 720;
}

function allocateTemporaryHours(count: number, forbiddenHours: Set<number>) {
  const temporaryHours: number[] = [];
  for (
    let value = 720;
    value >= 0 && temporaryHours.length < count;
    value -= 1
  ) {
    if (forbiddenHours.has(value)) continue;
    temporaryHours.push(value);
    forbiddenHours.add(value);
  }
  if (temporaryHours.length < count) {
    throw new Error("Không đủ mốc giờ trống để xử lý cập nhật tạm thời.");
  }
  return temporaryHours;
}

function validatePolicies(policies: EditableCancelPolicy[]) {
  if (policies.length === 0) {
    return "Cần giữ lại ít nhất 1 gốc chính sách.";
  }
  const usedHours = new Set<number>();
  for (const policy of policies) {
    if (
      !Number.isInteger(policy.hoursBefore) ||
      policy.hoursBefore < 0 ||
      policy.hoursBefore > 720
    ) {
      return "Số giờ phải là số nguyên trong khoảng từ 0 đến 720.";
    }
    if (policy.refundPercent < 0 || policy.refundPercent > 100) {
      return "Tỷ lệ hoàn tiền phải nằm trong khoảng từ 0% đến 100%.";
    }
    if (usedHours.has(policy.hoursBefore)) {
      return "Mỗi mốc giờ chỉ được xuất hiện một lần.";
    }
    usedHours.add(policy.hoursBefore);
  }
  return null;
}

function resolveErrorMessage(error: unknown) {
  if (error instanceof AuthApiError || error instanceof Error) {
    return error.message;
  }
  return "Đã xảy ra lỗi khi làm việc với chính sách hủy.";
}

function getRefundColor(percent: number) {
  if (percent >= 80) {
    return {
      bar: "from-emerald-500 to-teal-400",
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: "text-emerald-600 bg-emerald-100",
      badgeVariant: "success" as const,
    };
  }
  if (percent >= 40) {
    return {
      bar: "from-amber-500 to-orange-400",
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: "text-amber-600 bg-amber-100",
      badgeVariant: "warning" as const,
    };
  }
  return {
    bar: "from-rose-500 to-red-400",
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: "text-rose-600 bg-rose-100",
    badgeVariant: "danger" as const,
  };
}

// ─────────────────────────────────────────────────────────
// EDITOR ROW COMPONENT
// ─────────────────────────────────────────────────────────

function PolicyEditorRow({
  policy,
  allPolicies,
  onChange,
  onRemove,
  disableRemove,
  index,
}: {
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
}) {
  const color = getRefundColor(policy.refundPercent);

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-900/5 animate-slide-up"
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
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <Flex align="center" spacing="sm">
                <h3 className="text-lg font-bold text-slate-900">
                  {formatPolicyHours(policy.hoursBefore)}
                </h3>
                {policy.isNew && (
                  <Badge variant="primary" size="sm" icon={<Sparkles className="h-3 w-3" />}>Mới</Badge>
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
            <Trash2 className="h-4 w-4" />
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
              className="text-base font-extrabold shadow-sm focus:border-indigo-500 focus:ring-indigo-100"
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
              className={`text-base font-extrabold shadow-sm focus:border-indigo-500 focus:ring-indigo-100 ${color.text} ${color.bg}`}
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
              className="text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN MANAGER
// ─────────────────────────────────────────────────────────

export default function CancellationPolicyManager() {
  const [savedPolicies, setSavedPolicies] = useState<EditableCancelPolicy[]>([]);
  const [draftPolicies, setDraftPolicies] = useState<EditableCancelPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPolicyCounter, setNewPolicyCounter] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast, show } = useToast();

  const isDirty = useMemo(
    () => serializePolicies(savedPolicies) !== serializePolicies(draftPolicies),
    [savedPolicies, draftPolicies],
  );

  const loadPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCancelPolicies();
      const editablePolicies =
        sortCancelPolicies(response).map(toEditablePolicy);
      setSavedPolicies(editablePolicies);
      setDraftPolicies(editablePolicies.map((policy) => ({ ...policy })));
    } catch (err) {
      setError(resolveErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPolicies();
  }, [loadPolicies]);

  function handleOpenAddModal() {
    setShowAddModal(true);
  }

  function handleConfirmAdd(payload: CreateCancelPolicyPayload) {
    const nextId = `temp-${newPolicyCounter}`;
    setNewPolicyCounter((prev) => prev + 1);

    setDraftPolicies((prev) =>
      sortCancelPolicies([
        ...prev,
        {
          id: nextId,
          clientId: nextId,
          isNew: true,
          hoursBefore: payload.hoursBefore,
          refundPercent: payload.refundPercent,
          description: payload.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]),
    );
    setShowAddModal(false);
    show("success", `Đã thêm mốc ${payload.hoursBefore} giờ vào danh sách chờ.`);
  }

  function handleChange(
    policyId: string,
    key: "hoursBefore" | "refundPercent" | "description",
    value: string | number,
  ) {
    setDraftPolicies((prev) =>
      sortCancelPolicies(
        prev.map((policy) =>
          policy.clientId === policyId ? { ...policy, [key]: value } : policy,
        ),
      ),
    );
  }

  function handleRemove(policyId: string) {
    if (draftPolicies.length <= 1) {
      show("error", "Cần giữ lại ít nhất 1 chính sách hủy.");
      return;
    }
    setDraftPolicies((prev) =>
      prev.filter((policy) => policy.clientId !== policyId),
    );
  }

  function handleReset() {
    setDraftPolicies(savedPolicies.map((policy) => ({ ...policy })));
    show("success", "Đã khôi phục dữ liệu ban đầu.");
  }

  async function handleSave() {
    const validationError = validatePolicies(draftPolicies);
    if (validationError) {
      show("error", validationError);
      return;
    }

    const retainedExistingPolicies = draftPolicies.filter(
      (policy) => !policy.isNew,
    );
    if (savedPolicies.length > 0 && retainedExistingPolicies.length === 0) {
      show(
        "error",
        "Tránh thay thế toàn bộ chính sách. Cần giữ lại ít nhất 1 mốc đang có trên hệ thống.",
      );
      return;
    }

    setSaving(true);
    try {
      const savedMap = new Map(
        savedPolicies.map((policy) => [policy.id, policy]),
      );
      const removedPolicies = savedPolicies.filter(
        (savedPolicy) =>
          !draftPolicies.some(
            (draftPolicy) =>
              !draftPolicy.isNew && draftPolicy.id === savedPolicy.id,
          ),
      );
      const newPolicies = draftPolicies.filter((policy) => policy.isNew);
      const changedHoursPolicies = retainedExistingPolicies.filter((policy) => {
        const savedPolicy = savedMap.get(policy.id);
        return savedPolicy
          ? savedPolicy.hoursBefore !== policy.hoursBefore
          : false;
      });
      const directUpdatePolicies = retainedExistingPolicies.filter((policy) => {
        const savedPolicy = savedMap.get(policy.id);
        if (!savedPolicy) return false;
        return (
          savedPolicy.hoursBefore === policy.hoursBefore &&
          (savedPolicy.refundPercent !== policy.refundPercent ||
            (savedPolicy.description ?? "").trim() !==
              (policy.description ?? "").trim())
        );
      });

      const forbiddenHours = new Set([
        ...savedPolicies.map((policy) => policy.hoursBefore),
        ...draftPolicies.map((policy) => policy.hoursBefore),
      ]);
      const temporaryHours = allocateTemporaryHours(
        changedHoursPolicies.length,
        forbiddenHours,
      );

      for (const [index, policy] of changedHoursPolicies.entries()) {
        await updateCancelPolicy(policy.id, {
          ...toMutationDto(policy),
          hoursBefore: temporaryHours[index],
        });
      }
      for (const policy of removedPolicies) {
        await deleteCancelPolicy(policy.id);
      }
      for (const policy of newPolicies) {
        await createCancelPolicy(toMutationDto(policy));
      }
      for (const policy of changedHoursPolicies) {
        await updateCancelPolicy(policy.id, toMutationDto(policy));
      }
      for (const policy of directUpdatePolicies) {
        await updateCancelPolicy(policy.id, toMutationDto(policy));
      }

      await loadPolicies();
      show("success", "Đã lưu bản cập nhật chính sách thành công.");
    } catch (err) {
      show("error", resolveErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-slide-up w-full text-slate-900 pb-20">
      {/* Minimal Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-8 text-white shadow-xl shadow-slate-900/10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-[60px]" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-[50px]" />

        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center w-full">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-300">
              <ShieldCheck className="h-3.5 w-3.5" /> Quản trị
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-white">
              Chính sách{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                Hủy sân
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-md">
              Điều chỉnh các mốc hoàn tiền linh hoạt. Đảm bảo trải nghiệm minh
              bạch cho toàn hệ thống.
            </p>
          </div>

          <div className="hidden shrink-0 sm:flex items-center justify-center pr-4">
            <div
              className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-500/10 border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.15)] animate-pulse"
              style={{ animationDuration: "3s" }}
            >
              <div
                className="absolute inset-2 rounded-3xl border border-indigo-500/20 border-dashed animate-spin"
                style={{ animationDuration: "15s" }}
              />
              <ShieldCheck className="relative h-10 w-10 text-indigo-400 shadow-indigo-500/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Compact Action Bar */}
      <Flex justify="between" align="center" wrap="wrap" className="mt-2 mb-2">
        <Flex align="center" spacing="sm">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            Danh sách thiết lập
          </h2>
          <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            {draftPolicies.length} mốc
          </span>
          {isDirty && (
            <Badge variant="warning" dot className="ml-2 animate-pulse">
              Chưa lưu
            </Badge>
          )}
        </Flex>

        <Flex align="center" spacing="sm">
          {isDirty && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              leftIcon={<Undo2 className="h-3.5 w-3.5" />}
            >
              Hoàn tác
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadPolicies()}
            disabled={loading || saving}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            Làm mới
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100 shadow-sm"
            onClick={handleOpenAddModal}
            disabled={loading || saving}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Thêm chính sách
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="bg-slate-900 text-white hover:bg-slate-800 shadow-md"
            onClick={handleSave}
            disabled={!isDirty || saving || loading}
            isLoading={saving}
            leftIcon={<Save className="h-3.5 w-3.5" />}
          >
            Lưu thay đổi
          </Button>
        </Flex>
      </Flex>

      {/* List Content */}
      {loading ? (
        <div className="space-y-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 w-full animate-pulse rounded-2xl bg-slate-100 border border-slate-200"
            />
          ))}
        </div>
      ) : error ? (
        <Alert variant="error" className="mt-4 py-8 flex flex-col items-center text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
          <p className="font-bold text-red-800">Lỗi kết nối</p>
          <p className="mt-1 text-sm text-red-600 max-w-sm">{error}</p>
        </Alert>
      ) : draftPolicies.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center mt-4 transition hover:border-indigo-300">
          <ShieldCheck className="h-10 w-10 text-slate-300 mb-4" />
          <p className="text-sm font-bold text-slate-600">
            Chưa có chính sách nào được thiết lập
          </p>
          <Button
            variant="outline"
            className="mt-4 text-indigo-600 border-slate-200 hover:border-indigo-200 hover:bg-indigo-50"
            onClick={handleOpenAddModal}
          >
            Tạo mốc đầu tiên
          </Button>
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          {draftPolicies.map((policy, index) => (
            <PolicyEditorRow
              key={policy.clientId}
              policy={policy}
              allPolicies={draftPolicies}
              onChange={handleChange}
              onRemove={handleRemove}
              disableRemove={draftPolicies.length <= 1}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Add Policy Modal */}
      {showAddModal && (
        <CreateCancelPolicyModal
          onClose={() => setShowAddModal(false)}
          onConfirm={handleConfirmAdd}
        />
      )}

      {/* Global Toast */}
      {toast.visible && (
        <div className="fixed bottom-8 right-8 z-[100] transition-all duration-300 animate-slide-up">
          <div
            className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-5 py-3.5 shadow-xl ${
              toast.tone === "success" ? "border-emerald-200" : "border-red-200"
            }`}
          >
            {toast.tone === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
            <p
              className={`text-sm font-bold ${
                toast.tone === "success" ? "text-emerald-800" : "text-red-800"
              }`}
            >
              {toast.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
