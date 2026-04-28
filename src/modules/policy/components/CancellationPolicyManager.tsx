"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Warning,
  CheckCircle,
  CircleNotch,
  Plus,
  ArrowClockwise,
  FloppyDisk,
  ShieldCheck,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";

import { AuthApiError } from "@/src/api/auth.api";
import {
  createCancelPolicy,
  deleteCancelPolicy,
  fetchCancelPolicies,
  updateCancelPolicy,
} from "@/src/api/cancel-policy.api";
import { sortCancelPolicies } from "@/src/modules/policy/utils/cancellationPolicy";
import type {
  CancelPolicy,
  SaveCancelPolicyRequest,
} from "@/src/shared/types/cancel-policy.types";
import { useToast } from "@/src/shared/hooks/useToast";

import { Button } from "@/src/shared/components/ui/Button";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Flex } from "@/src/shared/components/layout/Flex";
import { Badge } from "@/src/shared/components/ui/Badge";
import { PolicyEditorRow } from "./PolicyEditorRow";
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
    <div className="space-y-6 animate-slide-up w-full text-slate-900 px-8 pt-6 pb-12">
      {/* Page Header — matches dashboard style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight text-slate-900">
            Chính sách hủy sân
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Điều chỉnh các mốc hoàn tiền linh hoạt. Đảm bảo trải nghiệm minh bạch cho toàn hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={() => void loadPolicies()}
            disabled={loading || saving}
            leftIcon={<ArrowClockwise className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            Làm mới
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAddModal}
            disabled={loading || saving}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Thêm chính sách
          </Button>
        </div>
      </div>

      {/* List section label + action row */}
      <Flex justify="between" align="center" wrap="wrap">
        <Flex align="center" spacing="sm">
          <h2 className="text-lg font-bold tracking-tight text-slate-800">Danh sách thiết lập</h2>
          <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            {draftPolicies.length} mốc
          </span>
          {isDirty && (
            <Badge variant="warning" dot className="animate-pulse">
              Chưa lưu
            </Badge>
          )}
        </Flex>

        <Flex align="center" spacing="sm">
          {isDirty && (
            <Button
              variant="ghost"
              size="md"
              onClick={handleReset}
              leftIcon={<ArrowCounterClockwise className="h-3.5 w-3.5" />}
            >
              Hoàn tác
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={!isDirty || saving || loading}
            isLoading={saving}
            leftIcon={<FloppyDisk className="h-3.5 w-3.5" />}
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
          <Warning className="h-10 w-10 text-red-500 mb-3" />
          <p className="font-bold text-red-800">Lỗi kết nối</p>
          <p className="mt-1 text-sm text-red-600 max-w-sm">{error}</p>
        </Alert>
      ) : draftPolicies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1B5E38]/10 mb-4">
            <ShieldCheck className="h-8 w-8 text-[#1B5E38]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Chưa có chính sách nào</h3>
          <p className="text-sm text-slate-600 mb-4">
            Tạo chính sách hủy đầu tiên để thiết lập quy định hoàn tiền.
          </p>
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            leftIcon={<Plus className="h-4 w-4" />}
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
            className={`flex items-start gap-3 rounded-xl border-2 px-5 py-4 shadow-2xl backdrop-blur-sm ${
              toast.tone === "success"
                ? "border-emerald-200 bg-emerald-50/95"
                : "border-red-200 bg-red-50/95"
            }`}
          >
            {toast.tone === "success" ? (
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <Warning className="h-5 w-5 shrink-0 text-red-600" />
            )}
            <p
              className={`text-sm font-bold ${
                toast.tone === "success" ? "text-emerald-900" : "text-red-900"
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
