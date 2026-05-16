"use client";

import { useState } from "react";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Button } from "@/src/shared/components/ui/Button";
import { ConfirmationDialog } from "@/src/shared/components/ui/ConfirmationDialog";
import { Pagination } from "@/src/shared/components/ui/Pagination";
import { ActionMenu } from "@/src/shared/components/ui/ActionMenu";
import {
  Eye,
  PencilSimple,
  LockKey,
  LockKeyOpen,
  UserMinus,
  UserPlus,
} from "@phosphor-icons/react";
import type { StaffUserSummary, StaffUserStatus } from "@/src/features/staff/types/user.type";
import type { PaginatedData } from "@/src/shared/types/api.types";
import {
  lockUser,
  unlockUser,
  deactivateUser,
  activateUser,
  resetUserPassword,
} from "@/src/api/user-management.api";

interface StaffTableProps {
  data: PaginatedData<StaffUserSummary>;
  page: number;
  onPageChange: (page: number) => void;
  onViewDetail: (userId: string) => void;
  onEdit: (userId: string) => void;
  onActionSuccess: (message: string) => void;
  onActionError: (message: string) => void;
}

type ActionDialog =
  | { type: "lock"; userId: string }
  | { type: "unlock"; userId: string }
  | { type: "deactivate"; userId: string }
  | { type: "activate"; userId: string }
  | { type: "resetPassword"; userId: string }
  | null;

export function StaffTable({
  data,
  page,
  onPageChange,
  onViewDetail,
  onEdit,
  onActionSuccess,
  onActionError,
}: StaffTableProps) {
  const [actionDialog, setActionDialog] = useState<ActionDialog>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const getStatusBadge = (status: StaffUserStatus) => {
    const variants: Record<StaffUserStatus, "success" | "error" | "neutral"> = {
      ACTIVE: "success",
      LOCKED: "error",
      INACTIVE: "neutral",
    };

    const labels: Record<StaffUserStatus, string> = {
      ACTIVE: "Hoạt động",
      LOCKED: "Đã khóa",
      INACTIVE: "Không hoạt động",
    };

    return (
      <Badge variant={variants[status]} size="sm" dot>
        {labels[status]}
      </Badge>
    );
  };

  const handleAction = async (reason?: string) => {
    if (!actionDialog) return;

    setActionLoading(true);
    try {
      switch (actionDialog.type) {
        case "lock":
          if (!reason) {
            onActionError("Vui lòng nhập lý do khóa");
            return;
          }
          await lockUser(actionDialog.userId, { reason });
          onActionSuccess("Khóa nhân viên thành công");
          break;

        case "unlock":
          await unlockUser(actionDialog.userId);
          onActionSuccess("Mở khóa nhân viên thành công");
          break;

        case "deactivate":
          await deactivateUser(actionDialog.userId);
          onActionSuccess("Vô hiệu hóa nhân viên thành công");
          break;

        case "activate":
          await activateUser(actionDialog.userId);
          onActionSuccess("Kích hoạt nhân viên thành công");
          break;

        case "resetPassword":
          await resetUserPassword(actionDialog.userId);
          onActionSuccess("Mật khẩu đã được reset và gửi qua email");
          break;
      }

      setActionDialog(null);
    } catch (err) {
      onActionError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-1">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                  Nhân viên
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                  Số điện thoại
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((staff) => (
                <tr key={staff.id} className="hover:bg-surface-2/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {staff.avatarUrl ? (
                        <img
                          src={staff.avatarUrl}
                          alt={staff.fullName}
                          className="h-10 w-10 rounded-full object-cover border-2 border-border shadow-sm"
                          onError={(e) => {
                            // Replace with fallback on error
                            const target = e.currentTarget;
                            const parent = target.parentElement;
                            if (parent) {
                              const fallback = document.createElement('div');
                              fallback.className = 'flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0';
                              fallback.textContent = staff.fullName.charAt(0).toUpperCase();
                              parent.replaceChild(fallback, target);
                            }
                          }}
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                          {staff.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-foreground">{staff.fullName}</p>
                        <p className="text-xs text-muted">ID: {staff.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground">{staff.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground">{staff.phone || "—"}</p>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(staff.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail(staff.id)}
                        leftIcon={<Eye className="h-4 w-4" />}
                      >
                        Xem
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(staff.id)}
                        leftIcon={<PencilSimple className="h-4 w-4" />}
                      >
                        Sửa
                      </Button>
                      <ActionMenu
                        items={[
                          {
                            label: "Reset mật khẩu",
                            icon: <LockKey className="h-4 w-4" />,
                            onClick: () => setActionDialog({ type: "resetPassword", userId: staff.id }),
                          },
                          {
                            label: staff.status === "LOCKED" ? "Mở khóa" : "Khóa",
                            icon: staff.status === "LOCKED" ? <LockKeyOpen className="h-4 w-4" /> : <LockKey className="h-4 w-4" />,
                            onClick: () => setActionDialog({ 
                              type: staff.status === "LOCKED" ? "unlock" : "lock", 
                              userId: staff.id 
                            }),
                            variant: staff.status === "LOCKED" ? "success" : "danger",
                          },
                          {
                            label: staff.status === "INACTIVE" ? "Kích hoạt" : "Vô hiệu hóa",
                            icon: staff.status === "INACTIVE" ? <UserPlus className="h-4 w-4" /> : <UserMinus className="h-4 w-4" />,
                            onClick: () => setActionDialog({ 
                              type: staff.status === "INACTIVE" ? "activate" : "deactivate", 
                              userId: staff.id 
                            }),
                            variant: staff.status === "INACTIVE" ? "success" : "danger",
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={data.page}
        totalPages={data.totalPages}
        totalItems={data.totalItems}
        pageSize={data.pageSize}
        onPageChange={onPageChange}
        itemLabel="nhân viên"
      />

      {/* Action Dialogs */}
      {actionDialog?.type === "lock" && (
        <ConfirmationDialog
          title="Khóa nhân viên"
          message="Bạn có chắc chắn muốn khóa nhân viên này? Họ sẽ không thể đăng nhập vào hệ thống."
          confirmText={actionLoading ? "Đang xử lý..." : "Khóa"}
          cancelText="Hủy"
          variant="danger"
          showReasonInput
          reasonLabel="Lý do khóa *"
          reasonPlaceholder="Nhập lý do khóa nhân viên..."
          onConfirm={handleAction}
          onCancel={() => setActionDialog(null)}
        />
      )}

      {actionDialog?.type === "unlock" && (
        <ConfirmationDialog
          title="Mở khóa nhân viên"
          message="Bạn có chắc chắn muốn mở khóa nhân viên này? Họ sẽ có thể đăng nhập lại vào hệ thống."
          confirmText={actionLoading ? "Đang xử lý..." : "Mở khóa"}
          cancelText="Hủy"
          variant="info"
          onConfirm={handleAction}
          onCancel={() => setActionDialog(null)}
        />
      )}

      {actionDialog?.type === "deactivate" && (
        <ConfirmationDialog
          title="Vô hiệu hóa nhân viên"
          message="Bạn có chắc chắn muốn vô hiệu hóa nhân viên này? Họ sẽ được đánh dấu là không hoạt động."
          confirmText={actionLoading ? "Đang xử lý..." : "Vô hiệu hóa"}
          cancelText="Hủy"
          variant="warning"
          onConfirm={handleAction}
          onCancel={() => setActionDialog(null)}
        />
      )}

      {actionDialog?.type === "activate" && (
        <ConfirmationDialog
          title="Kích hoạt nhân viên"
          message="Bạn có chắc chắn muốn kích hoạt lại nhân viên này?"
          confirmText={actionLoading ? "Đang xử lý..." : "Kích hoạt"}
          cancelText="Hủy"
          variant="info"
          onConfirm={handleAction}
          onCancel={() => setActionDialog(null)}
        />
      )}

      {actionDialog?.type === "resetPassword" && (
        <ConfirmationDialog
          title="Reset mật khẩu"
          message="Bạn có chắc chắn muốn reset mật khẩu cho nhân viên này? Mật khẩu mới sẽ được gửi qua email."
          confirmText={actionLoading ? "Đang xử lý..." : "Reset"}
          cancelText="Hủy"
          variant="warning"
          onConfirm={handleAction}
          onCancel={() => setActionDialog(null)}
        />
      )}
    </div>
  );
}
