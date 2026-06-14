"use client";

import { Modal, Button, Badge } from "@/src/shared/components/ui";
import { User, PencilSimple, LockKey, Calendar, EnvelopeSimple, Phone, MapPin } from "@phosphor-icons/react";
import type { StaffUserDetail, StaffUserStatus } from "@/src/features/staff/shared/types/user.type";
import { formatDate } from "@/src/shared/utils/date";

interface StaffDetailModalProps {
  staff: StaffUserDetail;
  onClose: () => void;
  onEdit: () => void;
}

export function StaffDetailModal({ staff, onClose, onEdit }: StaffDetailModalProps) {
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
      <Badge variant={variants[status]} size="md" dot>
        {labels[status]}
      </Badge>
    );
  };

  const getRoleLabel = (role: string) => {
    if (role === "STAFF") return "Nhân viên";
    if (role === "BRANCH_MANAGER") return "Quản lý chi nhánh";
    return role;
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Thông tin nhân viên"
      subtitle="Chi tiết"
      icon={<User className="h-5 w-5" />}
      maxWidth="xl"
    >
      <div className="p-6 space-y-6">
        {/* Header with avatar */}
        <div className="flex items-center gap-4 pb-6 border-b border-border">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-2xl">
            {staff.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-extrabold text-foreground">{staff.fullName}</h3>
            <p className="text-sm text-muted mt-1">{staff.email}</p>
          </div>
          {getStatusBadge(staff.status)}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted">
              <EnvelopeSimple className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wider">Email</p>
            </div>
            <p className="text-sm font-bold text-foreground">{staff.email}</p>
            {staff.isEmailVerified ? (
              <Badge variant="success" size="sm">Đã xác thực</Badge>
            ) : (
              <Badge variant="warning" size="sm">Chưa xác thực</Badge>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted">
              <Phone className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wider">Số điện thoại</p>
            </div>
            <p className="text-sm font-bold text-foreground">{staff.phone || "Chưa cập nhật"}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted">
              <MapPin className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wider">Chi nhánh</p>
            </div>
            <p className="text-sm font-bold text-foreground">
              {staff.currentBranch?.name || "Chưa có chi nhánh"}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted">
              <User className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wider">Vai trò</p>
            </div>
            <Badge variant="info" size="sm">
              {getRoleLabel(staff.role)}
            </Badge>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted">
              <Calendar className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wider">Ngày tạo</p>
            </div>
            <p className="text-sm text-foreground">{formatDate(staff.createdAt)}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted">
              <Calendar className="h-4 w-4" />
              <p className="text-xs font-bold uppercase tracking-wider">Cập nhật lần cuối</p>
            </div>
            <p className="text-sm text-foreground">{formatDate(staff.updatedAt)}</p>
          </div>
        </div>

        {/* Password Status */}
        {staff.mustChangePassword && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
            <div className="flex items-center gap-2 text-amber-600">
              <LockKey className="h-5 w-5" />
              <p className="text-sm font-bold">Yêu cầu đổi mật khẩu khi đăng nhập lần đầu</p>
            </div>
          </div>
        )}

        {/* Lock Info */}
        {staff.status === "LOCKED" && staff.lockInfo && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-red-600">
              <LockKey className="h-5 w-5" />
              <p className="text-sm font-bold">Tài khoản đã bị khóa</p>
            </div>
            <div className="space-y-1 pl-7">
              <p className="text-xs text-muted">Lý do:</p>
              <p className="text-sm text-foreground">{staff.lockInfo.reason}</p>
              <p className="text-xs text-muted mt-2">
                Khóa bởi: {staff.lockInfo.lockedByName} vào {formatDate(staff.lockInfo.lockedAt)}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Đóng
          </Button>
          <Button
            variant="primary"
            onClick={onEdit}
            leftIcon={<PencilSimple className="h-4 w-4" />}
            className="flex-1"
          >
            Chỉnh sửa
          </Button>
        </div>
      </div>
    </Modal>
  );
}
