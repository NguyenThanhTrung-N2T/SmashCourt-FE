"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  X,
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
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${color.icon}`}
            >
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {formatPolicyHours(policy.hoursBefore)}
                </h3>
                {policy.isNew && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 border border-indigo-100">
                    <Sparkles className="h-3 w-3" />
                    Mới
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {getPolicyRangeLabel(
                  allPolicies,
                  allPolicies.findIndex(
                    (item) => item.clientId === policy.clientId,
                  ),
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onRemove(policy.clientId)}
            disabled={disableRemove}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-30"
            title="Xóa chính sách"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-1 items-start gap-6 sm:grid-cols-12 lg:grid-cols-12">
          <div className="col-span-1 sm:col-span-4 lg:col-span-2 xl:col-span-2">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Hủy trước
            </label>
            <div className="relative">
              <input
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
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-base font-extrabold text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100/50"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                giờ
              </span>
            </div>
          </div>

          <div className="col-span-1 sm:col-span-4 lg:col-span-2 xl:col-span-2">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Hoàn tiền
            </label>
            <div className="relative">
              <input
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
                className={`w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-base font-extrabold outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100/50 ${color.bg} ${color.text}`}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-extrabold opacity-50">
                %
              </span>
            </div>
          </div>

          <div className="col-span-1 sm:col-span-12 lg:col-span-8 xl:col-span-8">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Ghi chú
            </label>
            <input
              type="text"
              value={policy.description ?? ""}
              onChange={(event) =>
                onChange(policy.clientId, "description", event.target.value)
              }
              placeholder="VD: Không áp dụng hoàn tiền dịp Lễ Tết..."
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100/50"
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
  const [savedPolicies, setSavedPolicies] = useState<EditableCancelPolicy[]>(
    [],
  );
  const [draftPolicies, setDraftPolicies] = useState<EditableCancelPolicy[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPolicyCounter, setNewPolicyCounter] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    hoursBefore: 0,
    refundPercent: 0,
    description: "",
  });
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
    setAddForm({
      hoursBefore: getNextAvailableHours(draftPolicies),
      refundPercent: 0,
      description: "",
    });
    setShowAddModal(true);
  }

  function handleConfirmAdd() {
    const nextId = `temp-${newPolicyCounter}`;
    setNewPolicyCounter((prev) => prev + 1);

    setDraftPolicies((prev) =>
      sortCancelPolicies([
        ...prev,
        {
          id: nextId,
          clientId: nextId,
          isNew: true,
          hoursBefore: addForm.hoursBefore,
          refundPercent: addForm.refundPercent,
          description: addForm.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]),
    );
    setShowAddModal(false);
    show("success", "Đã thêm mốc chính sách vào danh sách chờ.");
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
    <div className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden w-full text-slate-900 antialiased selection:bg-indigo-500 selection:text-white pb-20 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
      <div className="p-4 sm:p-8 space-y-6 animate-slide-up mx-auto max-w-[1700px]">
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
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2 mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              Danh sách thiết lập
            </h2>
            <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {draftPolicies.length} mốc
            </span>
            {isDirty && (
              <span className="inline-flex items-center gap-1.5 ml-2 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 border border-amber-200 shadow-sm animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                Chưa lưu
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isDirty && (
              <button
                onClick={handleReset}
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-white px-3 text-xs font-bold text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Hoàn tác
              </button>
            )}
            <button
              onClick={() => void loadPolicies()}
              disabled={loading || saving}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-white px-3 text-xs font-bold text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Làm mới
            </button>
            <button
              onClick={handleOpenAddModal}
              disabled={loading || saving}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-indigo-50 px-4 text-xs font-bold text-indigo-700 border border-indigo-100 shadow-sm hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm chính sách
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || saving || loading}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white shadow-md hover:bg-slate-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Lưu thay đổi
            </button>
          </div>
        </div>

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
          <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50 py-12 px-6 text-center mt-4">
            <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
            <p className="font-bold text-red-800">Lỗi kết nối</p>
            <p className="mt-1 text-sm text-red-600 max-w-sm">{error}</p>
          </div>
        ) : draftPolicies.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center mt-4 transition hover:border-indigo-300">
            <ShieldCheck className="h-10 w-10 text-slate-300 mb-4" />
            <p className="text-sm font-bold text-slate-600">
              Chưa có chính sách nào được thiết lập
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 rounded-xl bg-white px-5 py-2 text-sm font-bold text-indigo-600 shadow-sm border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
            >
              Tạo mốc đầu tiên
            </button>
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
      </div>

      {/* Add Policy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Thêm Mốc Hủy mới
                  </h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Cấu hình chính sách hoàn tiền
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Hủy trước (thời gian)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={720}
                      step={1}
                      value={addForm.hoursBefore}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          hoursBefore: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 text-base font-extrabold text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100/50"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      giờ
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Hoàn tiền theo tỷ lệ
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={addForm.refundPercent}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          refundPercent: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 text-base font-extrabold text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100/50"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 opacity-50">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Ghi chú bổ sung (hiển thị cho khách)
                </label>
                <input
                  type="text"
                  value={addForm.description}
                  onChange={(e) =>
                    setAddForm({ ...addForm, description: e.target.value })
                  }
                  placeholder="VD: Không áp dụng hoàn tiền dịp Lễ Tết..."
                  className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3.5 text-base font-medium text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100/50"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmAdd}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-lg transition-all"
              >
                Xác nhận Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast */}
      <div
        className={`fixed bottom-8 right-8 z-[100] transition-all duration-300 ${
          toast.visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
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
    </div>
  );
}
