/**
 * PendingApprovalTable Component
 * 
 * Displays the list of pending approval bookings for Managers and Owners.
 * Features live countdowns to approvalExpiresAt, quick approve/reject dialog triggers,
 * and detailed customer/pricing/TADSS reason info.
 * Contract: DEPOSIT_APPROVAL_API.md §4.1, §5.4.
 */

"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Warning, User, Phone, MapPin } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Pagination } from "@/src/shared/components/ui/Pagination";
import { Spinner } from "@/src/shared/components/feedback/Spinner";
import { formatCurrency, parseBackendDateVN } from "@/src/shared/utils/date";
import type { PendingApprovalBookingDto } from "@/src/features/booking-approval/shared/types/booking-approval.types";

interface PendingApprovalTableProps {
  approvals: PendingApprovalBookingDto[];
  isLoading: boolean;
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onApproveClick: (booking: PendingApprovalBookingDto) => void;
  onRejectClick: (booking: PendingApprovalBookingDto) => void;
  showBranchColumn?: boolean;
}

function CountdownBadge({ expiresAt }: { expiresAt: string }) {
  const [seconds, setSeconds] = useState<number | null>(null);

  useEffect(() => {
    const target = parseBackendDateVN(expiresAt);
    if (!target) return;

    const update = () => {
      setSeconds(Math.floor((target.getTime() - Date.now()) / 1000));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (seconds === null) return <span>—</span>;

  if (seconds <= 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
        <Clock className="h-3.5 w-3.5" />
        Đang chờ xử lý...
      </span>
    );
  }

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const isUrgent = seconds < 300; // < 5 mins

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-xs font-bold ${
        isUrgent ? "text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full" : "text-muted"
      }`}
    >
      <Clock className="h-3.5 w-3.5" />
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

export function PendingApprovalTable({
  approvals,
  isLoading,
  totalItems,
  totalPages,
  page,
  pageSize,
  onPageChange,
  onApproveClick,
  onRejectClick,
  showBranchColumn = true,
}: PendingApprovalTableProps) {
  if (isLoading && approvals.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-border bg-surface-1 p-8">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-3" />
          <p className="text-sm text-muted">Đang tải danh sách đơn chờ duyệt...</p>
        </div>
      </div>
    );
  }

  if (approvals.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-border bg-surface-1 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
          <CheckCircle className="h-8 w-8" weight="fill" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Không có đơn chờ duyệt</h3>
        <p className="mt-1 text-sm text-muted max-w-sm">
          Tất cả các đơn đặt sân đã được xử lý hoặc được hệ thống tự động xác nhận.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2/60 border-b border-border text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="py-3 px-4">Mã đơn</th>
                <th className="py-3 px-4">Khách hàng</th>
                {showBranchColumn && <th className="py-3 px-4">Chi nhánh</th>}
                <th className="py-3 px-4">Lịch chơi</th>
                <th className="py-3 px-4 text-right">Tổng tiền</th>
                <th className="py-3 px-4">Lý do cần duyệt</th>
                <th className="py-3 px-4 text-center">Hạn duyệt</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {approvals.map((b) => (
                <tr key={b.bookingId} className="hover:bg-surface-2/40 transition-colors">
                  {/* Booking Code */}
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground whitespace-nowrap">
                    {b.bookingCode}
                  </td>

                  {/* Customer Info */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        <User className="h-3.5 w-3.5 text-muted" />
                        <span>{b.customerName}</span>
                        {b.loyaltyTierName && (
                          <Badge variant="info" size="sm">
                            {b.loyaltyTierName}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <Phone className="h-3 w-3" />
                        <span>{b.customerPhone}</span>
                      </div>
                    </div>
                  </td>

                  {/* Branch Name */}
                  {showBranchColumn && (
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-muted">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">{b.branchName}</span>
                      </span>
                    </td>
                  )}

                  {/* Schedule & Courts */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 whitespace-nowrap">
                      <p className="font-medium text-foreground">
                        {b.bookingDate} ({b.startTime.slice(0, 5)} - {b.endTime.slice(0, 5)})
                      </p>
                      <p className="text-xs text-muted">
                        {b.courts.map((c) => c.courtName).join(", ")}
                      </p>
                    </div>
                  </td>

                  {/* Total */}
                  <td className="py-3.5 px-4 text-right font-bold text-primary whitespace-nowrap">
                    {formatCurrency(b.finalTotal)}
                  </td>

                  {/* TADSS Approval Reasons */}
                  <td className="py-3.5 px-4 max-w-xs">
                    {b.approvalReasons && b.approvalReasons.length > 0 ? (
                      <div className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                        <Warning className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{b.approvalReasons.join("; ")}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">TADSS yêu cầu</span>
                    )}
                  </td>

                  {/* Expiration Countdown */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <CountdownBadge expiresAt={b.approvalExpiresAt} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<CheckCircle className="h-4 w-4" />}
                        onClick={() => onApproveClick(b)}
                      >
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="dangerSoft"
                        leftIcon={<XCircle className="h-4 w-4" />}
                        onClick={() => onRejectClick(b)}
                      >
                        Từ chối
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          itemLabel="đơn chờ duyệt"
        />
      )}
    </div>
  );
}

