import { Badge } from '@/src/shared/components/ui/Badge';
import { Button } from '@/src/shared/components/ui/Button';
import { ActionMenu } from '@/src/shared/components/ui/ActionMenu';
import { Pagination } from '@/src/shared/components/ui/Pagination';
import { TableSkeleton } from '@/src/shared/components/feedback/TableSkeleton';
import { EmptyState } from '@/src/shared/components/layout/EmptyState';
import {
  SignIn,
  SignOut,
  DotsThree,
  XCircle,
  CheckCircle,
  Receipt,
  MagnifyingGlass,
} from '@phosphor-icons/react';
import type { BookingDto } from '../../shared/types/booking.types';
import type { PaginatedData } from '@/src/shared/types/api.types';
import {
  getBookingStatusLabel,
  getBookingStatusVariant,
  getPaymentStatusLabel,
  getPaymentStatusVariant,
  formatCurrency,
  formatTime
} from '../utils/bookingStatus';
import { BookingStatus } from '../../shared/types/booking.types';
import { formatDate } from '@/src/shared/utils/date';
interface BookingTableViewProps {
  bookings: PaginatedData<BookingDto>;
  loading: boolean;
  onRowClick: (bookingId: string) => void;
  onCheckIn: (bookingId: string) => void;
  onCheckout: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
  onConfirmRefund: (bookingId: string) => void;
  onPageChange: (page: number) => void;
}

export function BookingTableView({
  bookings,
  loading,
  onRowClick,
  onCheckIn,
  onCheckout,
  onCancel,
  onConfirmRefund,
  onPageChange,
}: BookingTableViewProps) {
  if (loading) {
    return <TableSkeleton rows={10} columns={8} />;
  }

  if (bookings.items.length === 0) {
    return (
      <EmptyState
        icon={<MagnifyingGlass className="h-12 w-12 text-muted" />}
        title="Không có đơn đặt sân nào"
        description="Điều chỉnh bộ lọc để tìm kiếm đơn đặt."
      />
    );
  }

  const getBookingId = (booking: BookingDto) => {
    return booking.id || booking.bookingId || booking.bookingCode || '';
  };

  const getStatusValue = (status: any): number => {
    if (typeof status === 'number') return status;
    if (typeof status === 'string') {
      return BookingStatus[status as keyof typeof BookingStatus] ?? 0;
    }
    return 0;
  };

  const canCheckIn = (booking: BookingDto) => {
    const status = getStatusValue(booking.status);
    return status === BookingStatus.CONFIRMED || status === BookingStatus.PAID_ONLINE;
  };

  const canCheckout = (booking: BookingDto) => {
    const status = getStatusValue(booking.status);
    return status === BookingStatus.IN_PROGRESS;
  };

  const canCancel = (booking: BookingDto) => {
    const status = getStatusValue(booking.status);
    return status === BookingStatus.CONFIRMED ||
      status === BookingStatus.PAID_ONLINE ||
      status === BookingStatus.PENDING;
  };

  const canConfirmRefund = (booking: BookingDto) => {
    const status = getStatusValue(booking.status);
    return status === BookingStatus.CANCELLED_PENDING_REFUND;
  };

  return (
    <div className="space-y-4">
      <div className="bg-surface-1 border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider">
                  Mã đơn đặt
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider">
                  Sân
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider">
                  Ngày
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted uppercase tracking-wider">
                  Thanh toán
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold text-muted uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-muted uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.items.map((booking) => {
                const bookingId = getBookingId(booking);
                const startTime = booking.courts[0]?.startTime || '';
                const endTime = booking.courts[booking.courts.length - 1]?.endTime || booking.courts[0]?.endTime || '';

                return (
                  <tr
                    key={bookingId}
                    onClick={() => onRowClick(bookingId)}
                    className="hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-sm font-bold text-foreground">
                      {booking.bookingCode || bookingId.substring(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-bold text-foreground">
                        {booking.customerName || booking.guestName || 'Guest'}
                      </div>
                      <div className="text-xs text-muted">
                        {booking.customerPhone || booking.guestPhone || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {booking.courts.slice(0, 2).map((court, idx) => (
                          <Badge key={idx} size="sm" variant="neutral">
                            {court.courtName}
                          </Badge>
                        ))}
                        {booking.courts.length > 2 && (
                          <Badge size="sm" variant="neutral">
                            +{booking.courts.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {formatDate(booking.bookingDate)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {formatTime(startTime)} - {formatTime(endTime)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getBookingStatusVariant(booking.status)} size="sm">
                        {getBookingStatusLabel(booking.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {booking.invoice?.paymentStatus !== undefined && (
                        <Badge variant={getPaymentStatusVariant(booking.invoice.paymentStatus)} size="sm">
                          {getPaymentStatusLabel(booking.invoice.paymentStatus)}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-foreground">
                      {formatCurrency(booking.finalTotal || booking.invoice?.finalTotal || 0)}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        {canCheckIn(booking) && (
                          <div title="Xác nhận đến">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => onCheckIn(bookingId)}
                            >
                              <SignIn className="h-4 w-4" weight="bold" />
                            </Button>
                          </div>
                        )}
                        {canCheckout(booking) && (
                          <div title="Rời sân">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => onCheckout(bookingId)}
                            >
                              <SignOut className="h-4 w-4" weight="bold" />
                            </Button>
                          </div>
                        )}
                        <ActionMenu
                          trigger={
                            <Button size="sm" variant="ghost">
                              <DotsThree className="h-4 w-4" weight="bold" />
                            </Button>
                          }
                          items={[
                            {
                              label: 'Xem chi tiết',
                              icon: <Receipt className="h-4 w-4" />,
                              onClick: () => onRowClick(bookingId),
                            },
                            ...(canCancel(booking) ? [{
                              label: 'Hủy đơn',
                              icon: <XCircle className="h-4 w-4" />,
                              onClick: () => onCancel(bookingId),
                              variant: 'danger' as const,
                            }] : []),
                            ...(canConfirmRefund(booking) ? [{
                              label: 'Xác nhận hoàn tiền',
                              icon: <CheckCircle className="h-4 w-4" />,
                              onClick: () => onConfirmRefund(bookingId),
                            }] : []),
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {bookings.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={bookings.page}
            totalPages={bookings.totalPages}
            totalItems={bookings.totalItems}
            pageSize={bookings.pageSize}
            onPageChange={onPageChange}
            itemLabel="đơn"
          />
        </div>
      )}
    </div>
  );
}
