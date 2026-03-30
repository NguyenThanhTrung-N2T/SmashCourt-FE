"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BadgePercent,
  CheckCircle2,
  Clock3,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  TimerReset,
} from "lucide-react";

import { AuthApiError } from "@/src/auth/api/authApi";
import {
  createCancelPolicy,
  deleteCancelPolicy,
  fetchCancelPolicies,
  updateCancelPolicy,
} from "@/src/common/cancellationPolicyApi";
import {
  formatPolicyHours,
  formatRefundPercent,
  getPolicyRangeDescription,
  getPolicyRangeLabel,
  normalizePolicyDescription,
  sortCancelPolicies,
  type CancelPolicyDto,
  type CancelPolicyMutationDto,
} from "@/src/common/cancellationPolicy";

type ToastState = {
  visible: boolean;
  tone: "success" | "error";
  message: string;
};

type EditableCancelPolicy = CancelPolicyDto & {
  clientId: string;
  isNew: boolean;
};

function useToast() {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    tone: "success",
    message: "",
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show(tone: ToastState["tone"], message: string) {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setToast({ visible: true, tone, message });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3200);
  }

  return { toast, show };
}

function toEditablePolicy(policy: CancelPolicyDto): EditableCancelPolicy {
  return {
    ...policy,
    clientId: policy.id,
    isNew: false,
  };
}

function toMutationDto(policy: EditableCancelPolicy): CancelPolicyMutationDto {
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

  if (!usedHours.has(0)) {
    return 0;
  }

  return 720;
}

function allocateTemporaryHours(count: number, forbiddenHours: Set<number>) {
  const temporaryHours: number[] = [];

  for (let value = 720; value >= 0 && temporaryHours.length < count; value -= 1) {
    if (forbiddenHours.has(value)) {
      continue;
    }

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
    return "Cần giữ lại ít nhất 1 mốc chính sách hủy.";
  }

  const usedHours = new Set<number>();

  for (const policy of policies) {
    if (!Number.isInteger(policy.hoursBefore) || policy.hoursBefore < 0 || policy.hoursBefore > 720) {
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

function MetricCards({ policies }: { policies: EditableCancelPolicy[] }) {
  const highestHours = policies.length > 0 ? Math.max(...policies.map((item) => item.hoursBefore)) : 0;
  const highestRefund = policies.length > 0 ? Math.max(...policies.map((item) => item.refundPercent)) : 0;

  const items = [
    {
      label: "Mốc sớm nhất",
      value: policies.length > 0 ? formatPolicyHours(highestHours) : "Chưa có",
      sub: "Mốc cao nhất khách có thể hủy",
      icon: Clock3,
      tone: "from-indigo-500 to-sky-500",
    },
    {
      label: "Hoàn tối đa",
      value: policies.length > 0 ? formatRefundPercent(highestRefund) : "0%",
      sub: "Tỷ lệ hoàn tiền cao nhất hiện tại",
      icon: BadgePercent,
      tone: "from-emerald-500 to-teal-500",
    },
    {
      label: "Số mốc áp dụng",
      value: `${policies.length}`,
      sub: "Đang được hiển thị ngoài public",
      icon: TimerReset,
      tone: "from-rose-500 to-orange-500",
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="rounded-[1.75rem] border border-white/50 bg-white/85 px-5 py-5 shadow-lg shadow-slate-200/60"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.tone} text-white shadow-lg`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-extrabold text-slate-900">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{item.sub}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PolicyEditorCard({
  policy,
  allPolicies,
  onChange,
  onRemove,
  disableRemove,
}: {
  policy: EditableCancelPolicy;
  allPolicies: EditableCancelPolicy[];
  onChange: (policyId: string, key: "hoursBefore" | "refundPercent" | "description", value: string | number) => void;
  onRemove: (policyId: string) => void;
  disableRemove: boolean;
}) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-600">
            {policy.isNew ? "Mốc mới" : "Mốc hiện có"}
          </div>
          <h3 className="mt-3 text-xl font-extrabold text-slate-900">
            {formatPolicyHours(policy.hoursBefore)}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {getPolicyRangeLabel(allPolicies, allPolicies.findIndex((item) => item.clientId === policy.clientId))}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onRemove(policy.clientId)}
          disabled={disableRemove}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-extrabold text-rose-700 transition-all hover:-translate-y-0.5 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Xóa mốc
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[0.85fr_0.85fr_1.3fr]">
        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
            Hủy trước (giờ)
          </label>
          <input
            type="number"
            min={0}
            max={720}
            step={1}
            value={policy.hoursBefore}
            onChange={(event) =>
              onChange(policy.clientId, "hoursBefore", Number(event.target.value))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
            Hoàn tiền (%)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={policy.refundPercent}
            onChange={(event) =>
              onChange(policy.clientId, "refundPercent", Number(event.target.value))
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-500">
            Mô tả hiển thị
          </label>
          <textarea
            rows={3}
            value={policy.description ?? ""}
            onChange={(event) =>
              onChange(policy.clientId, "description", event.target.value)
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
          Cách hiển thị ngoài public
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {getPolicyRangeDescription(allPolicies, allPolicies.findIndex((item) => item.clientId === policy.clientId))}
        </p>
      </div>
    </article>
  );
}

function PreviewPanel({ policies }: { policies: EditableCancelPolicy[] }) {
  const sortedPolicies = sortCancelPolicies(policies);

  return (
    <div className="sticky top-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/20">
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white">
          <ShieldCheck className="h-3.5 w-3.5" />
          Preview public
        </div>
        <h3 className="mt-4 text-2xl font-extrabold">Khách hàng sẽ thấy gì?</h3>
        <p className="mt-2 text-sm leading-6 text-white/85">
          Bản xem trước này bám theo dữ liệu bạn đang chỉnh. Sau khi lưu, landing page và khu vực giới thiệu sẽ đọc cùng nguồn dữ liệu từ BE.
        </p>
      </div>

      <div className="space-y-4 px-6 py-6">
        {sortedPolicies.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm leading-6 text-slate-300">
            Chưa có mốc nào để hiển thị.
          </div>
        ) : (
          sortedPolicies.map((policy, index) => (
            <div
              key={policy.clientId}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-white">
                    {formatPolicyHours(policy.hoursBefore)}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">
                    {getPolicyRangeLabel(sortedPolicies, index)}
                  </p>
                </div>
                <p className="text-2xl font-extrabold text-white">
                  {formatRefundPercent(policy.refundPercent)}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {normalizePolicyDescription(policy.description)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function CancellationPolicyManager() {
  const [savedPolicies, setSavedPolicies] = useState<EditableCancelPolicy[]>([]);
  const [draftPolicies, setDraftPolicies] = useState<EditableCancelPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPolicyCounter, setNewPolicyCounter] = useState(1);
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
      const editablePolicies = sortCancelPolicies(response).map(toEditablePolicy);
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

  function handleAddPolicy() {
    const nextId = `temp-${newPolicyCounter}`;
    setNewPolicyCounter((prev) => prev + 1);

    setDraftPolicies((prev) =>
      sortCancelPolicies([
        ...prev,
        {
          id: nextId,
          clientId: nextId,
          isNew: true,
          hoursBefore: getNextAvailableHours(prev),
          refundPercent: 0,
          description: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]),
    );
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
      show("error", "Cần giữ lại ít nhất 1 mốc chính sách hủy.");
      return;
    }

    setDraftPolicies((prev) => prev.filter((policy) => policy.clientId !== policyId));
  }

  function handleReset() {
    setDraftPolicies(savedPolicies.map((policy) => ({ ...policy })));
    show("success", "Đã khôi phục về dữ liệu đang có trên hệ thống.");
  }

  async function handleSave() {
    const validationError = validatePolicies(draftPolicies);
    if (validationError) {
      show("error", validationError);
      return;
    }

    const retainedExistingPolicies = draftPolicies.filter((policy) => !policy.isNew);
    if (savedPolicies.length > 0 && retainedExistingPolicies.length === 0) {
      show(
        "error",
        "Hiện tại cần giữ lại ít nhất 1 mốc đang có rồi lưu trước, sau đó mới thay thế hoàn toàn bằng mốc mới.",
      );
      return;
    }

    setSaving(true);

    try {
      const savedMap = new Map(savedPolicies.map((policy) => [policy.id, policy]));
      const removedPolicies = savedPolicies.filter(
        (savedPolicy) =>
          !draftPolicies.some(
            (draftPolicy) => !draftPolicy.isNew && draftPolicy.id === savedPolicy.id,
          ),
      );
      const newPolicies = draftPolicies.filter((policy) => policy.isNew);
      const changedHoursPolicies = retainedExistingPolicies.filter((policy) => {
        const savedPolicy = savedMap.get(policy.id);
        return savedPolicy ? savedPolicy.hoursBefore !== policy.hoursBefore : false;
      });
      const directUpdatePolicies = retainedExistingPolicies.filter((policy) => {
        const savedPolicy = savedMap.get(policy.id);
        if (!savedPolicy) {
          return false;
        }

        return (
          savedPolicy.hoursBefore === policy.hoursBefore &&
          (savedPolicy.refundPercent !== policy.refundPercent ||
            (savedPolicy.description ?? "").trim() !== (policy.description ?? "").trim())
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
      show("success", "Đã đồng bộ chính sách hủy với hệ thống.");
    } catch (err) {
      show("error", resolveErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="rounded-[2.25rem] border border-white/40 bg-white/85 px-8 py-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
              <TimerReset className="h-3.5 w-3.5" />
              Cancellation policy
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
              Quản lý chính sách hủy cho owner
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600 lg:text-base">
              Dữ liệu trong màn này được lấy trực tiếp từ BE và cũng là nguồn hiển thị ra ngoài public. Bạn có thể thêm, sửa, xóa các mốc hủy rồi lưu để cập nhật ngay cho khách hàng.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void loadPolicies()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Tải lại
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty || saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Hoàn tác
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || saving || loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 text-sm font-extrabold text-white shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>

      <MetricCards policies={draftPolicies} />

      <div className="grid gap-6 xl:grid-cols-[1.22fr_0.78fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/40 bg-white/85 px-6 py-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Các mốc hủy và hoàn tiền
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sắp xếp và nội dung ở đây sẽ được dùng trực tiếp cho phần khách hàng xem chính sách hủy trên landing page.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddPolicy}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-5 text-sm font-extrabold text-emerald-700 transition-all hover:-translate-y-0.5 hover:bg-emerald-100"
              >
                <Plus className="h-4 w-4" />
                Thêm mốc mới
              </button>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải dữ liệu chính sách hủy từ BE...
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-700">
                  {error}
                </div>
              ) : (
                <div className="space-y-4">
                  {draftPolicies.map((policy) => (
                    <PolicyEditorCard
                      key={policy.clientId}
                      policy={policy}
                      allPolicies={draftPolicies}
                      onChange={handleChange}
                      onRemove={handleRemove}
                      disableRemove={draftPolicies.length <= 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <PreviewPanel policies={draftPolicies} />
      </div>

      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          toast.visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div
          className={`flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 shadow-2xl ${
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
              toast.tone === "success" ? "text-emerald-800" : "text-red-700"
            }`}
          >
            {toast.message}
          </p>
        </div>
      </div>
    </div>
  );
}

