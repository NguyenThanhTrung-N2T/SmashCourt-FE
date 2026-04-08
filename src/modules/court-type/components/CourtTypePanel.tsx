"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Grid3x3,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  fetchAllCourtTypes,
  createCourtType,
  updateCourtType,
  deleteCourtType,
} from "@/src/api/court-type.api";
import type {
  CourtType,
  CreateCourtTypeRequest,
  UpdateCourtTypeRequest,
} from "@/src/shared/types/court-type.types";
import { AuthApiError } from "@/src/api/auth.api";
import { useToast } from "@/src/shared/hooks/useToast";
import { Flex } from "@/src/shared/components/layout/Flex";
import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Alert } from "@/src/shared/components/ui/Alert";
import { Stack } from "@/src/shared/components/layout/Stack";
import { Badge } from "@/src/shared/components/ui/Badge";
import { CreateCourtTypeModal } from "./modals/CreateCourtTypeModal";
import { EditCourtTypeModal } from "./modals/EditCourtTypeModal";
import { DeleteCourtTypeDialog } from "./modals/DeleteCourtTypeDialog";

// Helper to check if court type is active
function isActive(status: string | number): boolean {
  // Handle both string "ACTIVE" and number 0
  if (typeof status === "string") {
    return status.toUpperCase() === "ACTIVE";
  }
  if (typeof status === "number") {
    return status === 0; // ACTIVE = 0 in enum
  }
  return false;
}

export default function CourtTypePanel() {
  const [courtTypes, setCourtTypes] = useState<CourtType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourtType, setEditingCourtType] = useState<CourtType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { toast, show: showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllCourtTypes();
      setCourtTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : "Không tải được danh sách");
      setCourtTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    try {
      await deleteCourtType(id);
      setCourtTypes((prev) => prev.filter((t) => t.id !== id));
      setDeletingId(null);
      showToast("success", "Đã xóa loại sân thành công!");
    } catch (err) {
      showToast("error", err instanceof AuthApiError ? err.message : "Xóa thất bại");
    }
  }

  return (
    <div className="space-y-6 animate-slide-up w-full">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-8 text-white shadow-xl shadow-slate-900/10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-[60px]" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-violet-500/10 blur-[50px]" />

        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center w-full">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-300">
              <Grid3x3 className="h-3.5 w-3.5" /> Quản trị
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-white">
              Quản lý{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                Loại sân
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-md">
              Tạo và quản lý các loại sân cầu lông. Loại sân sẽ được sử dụng khi tạo sân tại các chi nhánh.
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
              <Grid3x3 className="relative h-10 w-10 text-indigo-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Action Bar */}
      <Flex justify="between" align="center" wrap="wrap">
        <Flex align="center" spacing="sm">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">
            Danh sách loại sân
          </h2>
          <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
            {courtTypes.length} loại
          </span>
        </Flex>

        <Flex align="center" spacing="sm">
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            disabled={loading}
            leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            Làm mới
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 shadow-sm"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Tạo loại sân
          </Button>
        </Flex>
      </Flex>

      {/* Loading */}
      {loading && (
        <Stack align="center" justify="center" className="py-16 rounded-2xl border border-slate-100 bg-white" spacing="md">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-semibold text-slate-500">Đang tải...</p>
        </Stack>
      )}

      {/* Error */}
      {!loading && error && (
        <Alert variant="error" title="Không thể tải dữ liệu">
          <p className="mb-3">{error}</p>
          <Button variant="danger" size="sm" onClick={load} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Thử lại
          </Button>
        </Alert>
      )}

      {/* Empty */}
      {!loading && !error && courtTypes.length === 0 && (
        <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white px-8 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 mb-4">
            <Grid3x3 className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Chưa có loại sân nào</h3>
          <p className="text-sm text-slate-600 mb-4">Tạo loại sân đầu tiên để bắt đầu.</p>
          <Button
            variant="primary"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-xl text-white hover:-translate-y-1"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Tạo loại sân mới
          </Button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && courtTypes.length > 0 && (
        <div className="overflow-hidden rounded-2xl border-2 border-slate-100 bg-white shadow-xl shadow-slate-200/50">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-slate-50 to-indigo-50/50 border-b-2 border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Tên loại sân
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Mô tả
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-600 text-center">
                  Chi nhánh
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-600 text-center">
                  Số sân
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-600 text-center">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-600 text-center">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courtTypes.map((courtType, index) => {
                const active = isActive(courtType.status);
                return (
                  <tr
                    key={courtType.id}
                    className="group transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-violet-50/50 animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
                          <Grid3x3 className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{courtType.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                      <div className="truncate">
                        {courtType.description || <span className="text-slate-400 italic">Không có mô tả</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 border border-indigo-100">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="font-bold text-indigo-700">{courtType.activeBranchCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 border border-emerald-100">
                        <Grid3x3 className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="font-bold text-emerald-700">{courtType.courtCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={active ? "success" : "neutral"} size="sm" icon={active ? <CheckCircle2 /> : <XCircle />}>
                        {active ? "Hoạt động" : "Đã xóa"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingCourtType(courtType)}
                          className="bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-200 hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-300"
                          leftIcon={<Edit3 className="h-3.5 w-3.5" />}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="dangerSoft"
                          onClick={() => setDeletingId(courtType.id)}
                          leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                        >
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast */}
      {toast.visible && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <div
            className={`flex items-start gap-3 rounded-xl border-2 px-5 py-4 shadow-2xl backdrop-blur-sm ${toast.tone === "success"
              ? "border-emerald-200 bg-emerald-50/95"
              : "border-red-200 bg-red-50/95"
              }`}
          >
            {toast.tone === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-red-600" />
            )}
            <p className={`text-sm font-bold ${toast.tone === "success" ? "text-emerald-900" : "text-red-900"}`}>
              {toast.message}
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateCourtTypeModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(created) => {
            setCourtTypes((prev) => [...prev, created]);
            setShowCreateModal(false);
            showToast("success", `Đã tạo loại sân "${created.name}" thành công!`);
          }}
        />
      )}

      {editingCourtType && (
        <EditCourtTypeModal
          courtType={editingCourtType}
          onClose={() => setEditingCourtType(null)}
          onSaved={(updated) => {
            setCourtTypes((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            setEditingCourtType(null);
            showToast("success", `Đã cập nhật loại sân "${updated.name}" thành công!`);
          }}
        />
      )}

      {deletingId && (
        <DeleteCourtTypeDialog
          courtType={courtTypes.find((t) => t.id === deletingId)!}
          onClose={() => setDeletingId(null)}
          onConfirm={() => handleDelete(deletingId)}
        />
      )}
    </div>
  );
}
