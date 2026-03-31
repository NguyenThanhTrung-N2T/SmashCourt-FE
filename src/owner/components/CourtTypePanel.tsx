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
  X,
  XCircle,
} from "lucide-react";
import {
  fetchAllCourtTypes,
  createCourtType,
  updateCourtType,
  deleteCourtType,
  type CourtTypeDto,
  type CreateCourtTypeDto,
  type UpdateCourtTypeDto,
} from "@/src/owner/api/courtTypeApi";
import { AuthApiError } from "@/src/auth/api/authApi";

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

// Toast hook
function useToast() {
  const [toast, setToast] = useState<{
    visible: boolean;
    tone: "success" | "error";
    message: string;
  }>({ visible: false, tone: "success", message: "" });

  const show = useCallback((tone: "success" | "error", message: string) => {
    setToast({ visible: true, tone, message });
    setTimeout(() => setToast((p) => ({ ...p, visible: false })), 3500);
  }, []);

  return { toast, show };
}

export default function CourtTypePanel() {
  const [courtTypes, setCourtTypes] = useState<CourtTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourtType, setEditingCourtType] = useState<CourtTypeDto | null>(null);
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
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="rounded-[2rem] border border-white/40 bg-white/80 px-8 py-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-700 w-fit">
              <Grid3x3 className="h-3 w-3" />
              Court Type
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-800 bg-clip-text text-transparent">
              Quản lý Loại sân
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500 max-w-2xl">
              Tạo và quản lý các loại sân cầu lông. Loại sân sẽ được sử dụng khi tạo sân tại các chi nhánh.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              disabled={loading}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Tạo loại sân
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-16 rounded-2xl border border-slate-100 bg-white">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-semibold text-slate-500">Đang tải...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 px-6 py-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-red-900">Không thể tải dữ liệu</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={load}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-700 active:scale-95"
              >
                <RefreshCw className="h-4 w-4" />
                Thử lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && courtTypes.length === 0 && (
        <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white px-8 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 mb-4">
            <Grid3x3 className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Chưa có loại sân nào</h3>
          <p className="text-sm text-slate-600 mb-4">Tạo loại sân đầu tiên để bắt đầu.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Tạo loại sân mới
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && courtTypes.length > 0 && (
        <div className="overflow-hidden rounded-2xl border-2 border-slate-100 bg-white shadow-xl shadow-slate-200/50">
          <div className="bg-gradient-to-r from-slate-50 via-indigo-50 to-violet-50 px-6 py-4 border-b-2 border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg">
                  <Grid3x3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Danh sách loại sân</p>
                  <p className="text-xs text-slate-500">Tổng số: <span className="font-bold text-indigo-600">{courtTypes.length}</span> loại</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">
                    {courtTypes.filter(ct => isActive(ct.status)).length} hoạt động
                  </span>
                </div>
              </div>
            </div>
          </div>
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
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${
                          active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm shadow-emerald-100"
                            : "border-slate-300 bg-slate-100 text-slate-600"
                        }`}
                      >
                        {active ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Hoạt động
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            Đã xóa
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingCourtType(courtType)}
                          className="flex items-center gap-1.5 rounded-lg border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-2 text-xs font-bold text-indigo-700 transition-all hover:from-indigo-100 hover:to-violet-100 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Sửa
                        </button>
                        <button
                          onClick={() => setDeletingId(courtType.id)}
                          className="flex items-center gap-1.5 rounded-lg border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50 px-3 py-2 text-xs font-bold text-red-700 transition-all hover:from-red-100 hover:to-pink-100 hover:border-red-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Xóa
                        </button>
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
            className={`flex items-start gap-3 rounded-xl border-2 px-5 py-4 shadow-2xl backdrop-blur-sm ${
              toast.tone === "success"
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
        <CreateModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(created) => {
            setCourtTypes((prev) => [...prev, created]);
            setShowCreateModal(false);
            showToast("success", `Đã tạo loại sân "${created.name}" thành công!`);
          }}
        />
      )}

      {editingCourtType && (
        <EditModal
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
        <DeleteDialog
          courtType={courtTypes.find((t) => t.id === deletingId)!}
          onClose={() => setDeletingId(null)}
          onConfirm={() => handleDelete(deletingId)}
        />
      )}
    </div>
  );
}

// Create Modal
function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: CourtTypeDto) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Tên loại sân không được để trống");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const dto: CreateCourtTypeDto = { name: name.trim(), ...(description.trim() && { description: description.trim() }) };
      const created = await createCourtType(dto);
      onCreated(created);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : "Tạo thất bại");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg animate-slide-up rounded-2xl border-2 border-white/40 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">Tạo mới</p>
              <p className="text-lg font-bold text-white">Loại sân</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30 active:scale-95">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Tên loại sân <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:bg-white"
              placeholder="Ví dụ: Sân đơn, Sân đôi..."
              maxLength={255}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mô tả (tùy chọn)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-100 focus:bg-white resize-none"
              placeholder="Mô tả chi tiết..."
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {saving ? "Đang tạo..." : "Tạo loại sân"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Modal
function EditModal({ courtType, onClose, onSaved }: { courtType: CourtTypeDto; onClose: () => void; onSaved: (c: CourtTypeDto) => void }) {
  const [name, setName] = useState(courtType.name);
  const [description, setDescription] = useState(courtType.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Tên loại sân không được để trống");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const dto: UpdateCourtTypeDto = { name: name.trim(), ...(description.trim() && { description: description.trim() }) };
      const updated = await updateCourtType(courtType.id, dto);
      onSaved(updated);
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg animate-slide-up rounded-2xl border-2 border-white/40 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">Chỉnh sửa</p>
              <p className="text-lg font-bold text-white">{courtType.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30 active:scale-95">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Tên loại sân <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 focus:bg-white"
              maxLength={255}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mô tả (tùy chọn)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-100 focus:bg-white resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit3 className="h-4 w-4" />}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Dialog
function DeleteDialog({ courtType, onClose, onConfirm }: { courtType: CourtTypeDto; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md animate-slide-up rounded-2xl border-2 border-white/40 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-red-500 to-pink-500 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">Xác nhận xóa</p>
              <p className="text-lg font-bold text-white">Loại sân</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30 active:scale-95">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-6">
          <div className="mb-5 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900 mb-1">Bạn có chắc muốn xóa loại sân này?</p>
                <p className="text-sm text-amber-800">
                  Loại sân <span className="font-bold">&quot;{courtType.name}&quot;</span> sẽ bị ẩn khỏi hệ thống.
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
              Xác nhận xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
