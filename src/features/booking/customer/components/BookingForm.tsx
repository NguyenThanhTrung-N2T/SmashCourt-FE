/**
 * BookingForm Component
 * 
 * Form for creating an online booking with customer information.
 */

"use client";

import { useState } from "react";
import { User, Phone, EnvelopeSimple, Note } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Textarea } from "@/src/shared/components/ui/Textarea";
import { Alert } from "@/src/shared/components/ui/Alert";
import { useCreateBooking } from "../hooks/useCreateBooking";
import { formatCurrency, formatDate, formatTime } from "../utils/bookingStatus";
import type { CourtSlotDto } from "../../types/booking.types";

interface BookingFormProps {
  selectedCourts: Array<CourtSlotDto & { courtName: string; price: number }>;
  bookingDate: string; // ISO 8601
  branchName: string;
  totalAmount: number;
  onSuccess?: (paymentUrl: string) => void;
  onCancel?: () => void;
}

export function BookingForm({
  selectedCourts,
  bookingDate,
  branchName,
  totalAmount,
  onSuccess,
  onCancel,
}: BookingFormProps) {
  const { createBooking, isLoading, error, clearError } = useCreateBooking();

  const [formData, setFormData] = useState({
    guestName: "",
    guestPhone: "",
    guestEmail: "",
    note: "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    clearError();
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.guestName.trim()) {
      errors.guestName = "Vui lòng nhập họ tên";
    }

    if (!formData.guestPhone.trim()) {
      errors.guestPhone = "Vui lòng nhập số điện thoại";
    } else if (!/^0\d{9}$/.test(formData.guestPhone)) {
      errors.guestPhone = "Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)";
    }

    if (formData.guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail)) {
      errors.guestEmail = "Email không hợp lệ";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await createBooking({
      courts: selectedCourts.map((court) => ({
        courtId: court.courtId,
        startTime: court.startTime,
        endTime: court.endTime,
      })),
      bookingDate,
      guestName: formData.guestName,
      guestPhone: formData.guestPhone,
      guestEmail: formData.guestEmail || undefined,
      note: formData.note || undefined,
    });

    if (result) {
      onSuccess?.(result.paymentUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Booking Summary */}
      <div className="rounded-lg bg-surface-2 p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
          Thông tin đặt sân
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Chi nhánh</span>
            <span className="font-semibold text-foreground">{branchName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Ngày đặt</span>
            <span className="font-semibold text-foreground">
              {formatDate(bookingDate)}
            </span>
          </div>
          <div className="border-t border-border pt-2">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
              Sân đã chọn
            </p>
            {selectedCourts.map((court, index) => (
              <div key={index} className="mb-1 flex justify-between">
                <span className="text-muted">
                  {court.courtName} ({formatTime(court.startTime)} -{" "}
                  {formatTime(court.endTime)})
                </span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(court.price)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-2">
            <div className="flex justify-between">
              <span className="font-bold text-foreground">Tổng tiền</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" title="Lỗi">
          {error}
        </Alert>
      )}

      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
          Thông tin khách hàng
        </h3>

        <Input
          label="Họ và tên"
          placeholder="Nguyễn Văn A"
          value={formData.guestName}
          onChange={(e) => handleChange("guestName", e.target.value)}
          leftIcon={<User className="h-4 w-4" />}
          error={validationErrors.guestName}
          required
        />

        <Input
          label="Số điện thoại"
          placeholder="0901234567"
          value={formData.guestPhone}
          onChange={(e) => handleChange("guestPhone", e.target.value)}
          leftIcon={<Phone className="h-4 w-4" />}
          error={validationErrors.guestPhone}
          required
        />

        <Input
          label="Email"
          type="email"
          placeholder="email@example.com"
          value={formData.guestEmail}
          onChange={(e) => handleChange("guestEmail", e.target.value)}
          leftIcon={<EnvelopeSimple className="h-4 w-4" />}
          error={validationErrors.guestEmail}
        />

        <Textarea
          label="Ghi chú"
          placeholder="Ghi chú thêm (nếu có)"
          value={formData.note}
          onChange={(e) => handleChange("note", e.target.value)}
          rows={3}
        />
      </div>

      {/* Info Alert */}
      <Alert variant="info" title="Lưu ý">
        Sau khi đặt sân, bạn sẽ được chuyển đến trang thanh toán VNPay. Vui lòng
        hoàn tất thanh toán trong vòng 10 phút.
      </Alert>

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            Hủy
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          isLoading={isLoading}
        >
          Đặt sân và thanh toán
        </Button>
      </div>
    </form>
  );
}
