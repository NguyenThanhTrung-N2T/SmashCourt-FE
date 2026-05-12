/**
 * Booking Detail Page
 * 
 * Page for viewing and managing a specific booking.
 */

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, MapPin, CreditCard, Info } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { Alert } from "@/src/shared/components/ui/Alert";
import { getBookingById } from "@/src/api/booking.api";
import type { BookingDto } from "@/src/features/booking/types/booking.types";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      try {
        setLoading(true);
        setError(null);
        const data = await getBookingById(bookingId);
        setBooking(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải thông tin đặt sân");
      } finally {
        setLoading(false);
      }
    }

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-0 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm font-semibold text-muted">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-surface-0 p-6">
        <div className="mx-auto max-w-4xl">
          <Button
            variant="secondary"
            onClick={() => router.push("/bookings")}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="mb-6"
          >
            Quay lại
          </Button>
          <Alert variant="error" title="Lỗi">
            {error || "Không tìm thấy thông tin đặt sân"}
          </Alert>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => time.substring(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Đã xác nhận";
      case "PENDING":
        return "Chờ xác nhận";
      case "CANCELLED":
        return "Đã hủy";
      case "COMPLETED":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => router.push("/bookings")}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Quay lại
          </Button>
          <span
            className={`rounded-full border px-4 py-2 text-sm font-bold ${getStatusColor(
              booking.status
            )}`}
          >
            {getStatusLabel(booking.status)}
          </span>
        </div>

        {/* Booking Info */}
        <div className="space-y-6">
          {/* Main Info Card */}
          <div className="rounded-2xl border border-border bg-surface-1 p-6">
            <h1 className="mb-4 text-2xl font-bold text-foreground">
              Chi tiết đặt sân #{booking.id}
            </h1>

            <div className="space-y-4">
              {/* Branch */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-muted">Chi nhánh</p>
                  <p className="text-base font-semibold text-foreground">
                    {booking.branchName || "N/A"}
                  </p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-muted">Ngày đặt</p>
                  <p className="text-base font-semibold text-foreground">
                    {formatDate(booking.bookingDate)}
                  </p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-muted">Thời gian</p>
                  <p className="text-base font-semibold text-foreground">
                    {booking.courts && booking.courts.length > 0
                      ? `${formatTime(booking.courts[0].startTime)} - ${formatTime(
                          booking.courts[0].endTime
                        )}`
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Courts */}
              {booking.courts && booking.courts.length > 0 && (
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-muted">Sân</p>
                    <div className="mt-1 space-y-1">
                      {booking.courts.map((court, idx) => (
                        <p key={idx} className="text-base font-semibold text-foreground">
                          {court.courtName || `Sân ${idx + 1}`}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Total Amount */}
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-muted">Tổng tiền</p>
                  <p className="text-xl font-bold text-primary">
                    {booking.totalAmount?.toLocaleString("vi-VN") || "0"} đ
                  </p>
                </div>
              </div>

              {/* Note */}
              {booking.note && (
                <div className="rounded-xl border border-border bg-surface-2 p-4">
                  <p className="text-sm font-bold text-muted mb-2">Ghi chú</p>
                  <p className="text-sm text-foreground">{booking.note}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {booking.status === "CONFIRMED" && (
            <div className="rounded-2xl border border-border bg-surface-1 p-6">
              <h2 className="mb-4 text-lg font-bold text-foreground">Thao tác</h2>
              <div className="flex gap-3">
                <Button variant="error" className="flex-1">
                  Hủy đặt sân
                </Button>
                <Button variant="secondary" className="flex-1">
                  Liên hệ hỗ trợ
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
