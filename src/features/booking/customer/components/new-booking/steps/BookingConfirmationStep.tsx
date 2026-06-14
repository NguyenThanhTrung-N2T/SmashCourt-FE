/**
 * Booking Confirmation Step Component
 * 
 * Displays booking summary and guest information form for final confirmation.
 */

"use client";

import { User, Phone, EnvelopeSimple, NotePencil, CheckCircle, Warning, Info } from "@phosphor-icons/react";
import { Alert } from "@/src/shared/components/ui/Alert";
import { LoyaltyInfoCard } from "../LoyaltyInfoCard";
import { PromotionSelector } from "../PromotionSelector";
import type { BranchBasicDto } from "@/src/features/branch/shared/types/branch.types";
import type { CourtDto } from "@/src/features/court/shared/types/court.types";
import type { TimeGridSlotDto } from "@/src/features/timeslot/types";
import type { MyLoyaltyDto } from "@/src/features/benefit/loyalty/shared/types/loyalty.types";
import type { ApplicablePromotion } from "@/src/features/benefit/promotion/shared/types/promotion.types";
import type { BookingCourtType } from "@/src/features/booking/customer/hooks/useBookingForm";

interface BookingConfirmationStepProps {
  branch: BranchBasicDto;
  courtType: BookingCourtType;
  courts: CourtDto[];
  date: string;
  slots: TimeGridSlotDto[];
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  bookingNote: string;
  onGuestNameChange: (value: string) => void;
  onGuestPhoneChange: (value: string) => void;
  onGuestEmailChange: (value: string) => void;
  onBookingNoteChange: (value: string) => void;
  isLoggedIn: boolean;
  preFilledFields: {
    name: boolean;
    phone: boolean;
    email: boolean;
  };
  validationErrors: {
    name: string;
    phone: string;
    email: string;
  };
  totalAmount: number;
  // Loyalty & Promotion props
  loyaltyInfo: MyLoyaltyDto | null;
  isLoadingLoyalty: boolean;
  availablePromotions: ApplicablePromotion[];
  isLoadingPromotions: boolean;
  promotionsError: string | null;
  selectedPromotionId: string | null;
  onSelectPromotion: (promotionId: string | null) => void;
  loyaltyDiscount: number;
  promotionDiscount: number;
  finalAmount: number;
}

export function BookingConfirmationStep({
  branch,
  courtType,
  courts,
  date,
  slots,
  guestName,
  guestPhone,
  guestEmail,
  bookingNote,
  onGuestNameChange,
  onGuestPhoneChange,
  onGuestEmailChange,
  onBookingNoteChange,
  isLoggedIn,
  preFilledFields,
  validationErrors,
  totalAmount,
  loyaltyInfo,
  isLoadingLoyalty,
  availablePromotions,
  isLoadingPromotions,
  promotionsError,
  selectedPromotionId,
  onSelectPromotion,
  loyaltyDiscount,
  promotionDiscount,
  finalAmount,
}: BookingConfirmationStepProps) {
  const isNameReadOnly = preFilledFields.name;
  const isPhoneReadOnly = preFilledFields.phone;
  const isEmailReadOnly = preFilledFields.email;

  const formatTime = (time: string) => time.substring(0, 5);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const inputWrapperCls = (hasError?: boolean, isReadOnly?: boolean, hasValue?: boolean) =>
    `relative flex items-center rounded-xl border transition-all duration-200 ${hasError
      ? "border-red-500/50 bg-red-500/5 ring-2 ring-red-500/10"
      : isReadOnly
        ? "border-border bg-surface-2 opacity-80"
        : hasValue
          ? "border-primary/50 bg-surface-1 shadow-sm ring-1 ring-primary/10"
          : "border-border bg-surface-2 hover:border-primary/40 focus-within:border-primary focus-within:bg-surface-1 focus-within:ring-2 focus-within:ring-primary/20"
    }`;

  const inputElementCls = (isReadOnly?: boolean) =>
    `w-full bg-transparent px-4 py-3.5 pl-11 text-sm font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted/60 ${isReadOnly ? "cursor-not-allowed" : ""
    }`;
  const courtsByType = Object.entries(
    courts.reduce<Record<string, CourtDto[]>>((acc, court) => {
      (acc[court.courtTypeName] ??= []).push(court);
      return acc;
    }, {})
  );
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Xác nhận thông tin</h2>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted">
          <Info className="h-4 w-4 text-primary" weight="fill" />
          <p>
            {isLoggedIn
              ? "Thông tin của bạn đã được tự động điền. Vui lòng kiểm tra lại trước khi xác nhận."
              : "Vui lòng nhập thông tin liên hệ và kiểm tra lại thông tin đặt sân"}
          </p>
        </div>
      </div>

      {/* Guest Information Form */}
      <div className="rounded-2xl border border-border bg-surface-1 p-6 md:p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-primary" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
              Thông tin khách hàng
            </h3>
          </div>
          {isLoggedIn && (
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-tight text-primary">
              <CheckCircle className="h-3.5 w-3.5" weight="fill" />
              Đã đăng nhập
            </div>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Họ và tên
              <span className="text-red-500">*</span>
            </label>
            <div className={inputWrapperCls(!!validationErrors.name, isNameReadOnly, !!guestName)}>
              <User className={`absolute left-4 h-5 w-5 ${guestName ? "text-primary" : "text-muted"}`} weight={guestName ? "bold" : "regular"} />
              <input
                type="text"
                value={guestName}
                onChange={(e) => onGuestNameChange(e.target.value)}
                placeholder="Nhập họ và tên..."
                className={inputElementCls(isNameReadOnly)}
                readOnly={isNameReadOnly}
                required
              />
            </div>
            {isNameReadOnly && (
              <p className="flex items-center gap-1 text-[10px] italic text-muted">
                <CheckCircle className="h-3 w-3 text-primary" weight="fill" />
                Lấy từ tài khoản người dùng
              </p>
            )}
            {validationErrors.name && (
              <p className="flex items-center gap-1 text-xs font-medium text-red-500">
                <Warning className="h-3.5 w-3.5" />
                {validationErrors.name}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Số điện thoại
              <span className="text-red-500">*</span>
            </label>
            <div className={inputWrapperCls(!!validationErrors.phone, isPhoneReadOnly, !!guestPhone)}>
              <Phone className={`absolute left-4 h-5 w-5 ${guestPhone ? "text-primary" : "text-muted"}`} weight={guestPhone ? "bold" : "regular"} />
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => onGuestPhoneChange(e.target.value)}
                placeholder="Ví dụ: 0901234567"
                className={inputElementCls(isPhoneReadOnly)}
                readOnly={isPhoneReadOnly}
                required
              />
            </div>
            {isPhoneReadOnly && (
              <p className="flex items-center gap-1 text-[10px] italic text-muted">
                <CheckCircle className="h-3 w-3 text-primary" weight="fill" />
                Lấy từ tài khoản người dùng
              </p>
            )}
            {validationErrors.phone && (
              <p className="flex items-center gap-1 text-xs font-medium text-red-500">
                <Warning className="h-3.5 w-3.5" />
                {validationErrors.phone}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="sm:col-span-2 space-y-2">
            <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Địa chỉ Email
              <span className="text-red-500">*</span>
            </label>
            <div className={inputWrapperCls(!!validationErrors.email, isEmailReadOnly, !!guestEmail)}>
              <EnvelopeSimple className={`absolute left-4 h-5 w-5 ${guestEmail ? "text-primary" : "text-muted"}`} weight={guestEmail ? "bold" : "regular"} />
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => onGuestEmailChange(e.target.value)}
                placeholder="example@email.com"
                className={inputElementCls(isEmailReadOnly)}
                readOnly={isEmailReadOnly}
                required
              />
            </div>
            {isEmailReadOnly && (
              <p className="flex items-center gap-1 text-[10px] italic text-muted">
                <CheckCircle className="h-3 w-3 text-primary" weight="fill" />
                Lấy từ tài khoản người dùng
              </p>
            )}
            {validationErrors.email && (
              <p className="flex items-center gap-1 text-xs font-medium text-red-500">
                <Warning className="h-3.5 w-3.5" />
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Note Field */}
          <div className="sm:col-span-2 space-y-2">
            <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Ghi chú cho sân
              <span className="text-muted/50 font-normal">(Tùy chọn)</span>
            </label>
            <div className={inputWrapperCls(false, false, !!bookingNote)}>
              <NotePencil className={`absolute left-4 top-3.5 h-5 w-5 ${bookingNote ? "text-primary" : "text-muted"}`} weight={bookingNote ? "bold" : "regular"} />
              <textarea
                value={bookingNote}
                onChange={(e) => onBookingNoteChange(e.target.value)}
                placeholder="Bạn có yêu cầu gì thêm không? Ví dụ: Mượn vợt, mua nước..."
                rows={3}
                className="w-full bg-transparent px-4 py-3.5 pl-11 text-sm font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted/60 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="space-y-4">
        {/* Branch Info */}
        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
            Chi nhánh
          </h3>
          <p className="text-lg font-bold text-foreground">{branch.name}</p>
          <p className="mt-1 text-sm text-muted">{branch.address}</p>
        </div>

        {/* Court Info */}
        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
            {courts.length > 1 ? `Sân (${courts.length})` : "Sân"}
          </h3>

          <div className={courtsByType.length > 1 ? "divide-y divide-border" : ""}>
            {courtsByType.map(([typeName, typeCourts]) => (
              <div
                key={typeName}
                className={courtsByType.length > 1 ? "py-2.5 first:pt-0 last:pb-0" : ""}
              >
                {/* Only show type label as a sub-header when there are multiple types */}
                {courtsByType.length > 1 && (
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted/70">
                    {typeName}
                  </p>
                )}
                <p className="text-lg font-bold text-foreground">
                  {typeCourts.map((c) => c.name).join(", ")}
                </p>
                {/* Single type: show inline like before */}
                {courtsByType.length === 1 && (
                  <p className="mt-1 text-sm text-muted">Loại sân: {typeName}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Date & Time Info */}
        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
            Ngày & Giờ
          </h3>
          <p className="text-lg font-bold text-foreground">{formatDate(date)}</p>
          <p className="mt-1 text-sm text-muted">
            {formatTime(slots[0].startTime)} - {formatTime(slots[slots.length - 1].endTime)} (
            {slots.length} slot)
          </p>
        </div>

        {/* Total Price */}
        <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4">
          <span className="font-bold text-foreground">Tổng tiền thanh toán</span>
          <span className="text-2xl font-bold text-primary">
            {totalAmount.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {/* Loyalty & Promotions Section */}
      {isLoggedIn && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Ưu đãi & Giảm giá</h3>

          {/* Loyalty Info */}
          {isLoadingLoyalty && (
            <div className="rounded-xl border border-border bg-surface-2 p-4 text-sm text-muted">
              Đang tải thông tin hạng thành viên...
            </div>
          )}

          {!isLoadingLoyalty && loyaltyInfo && (
            <LoyaltyInfoCard
              loyaltyInfo={loyaltyInfo}
              loyaltyDiscount={loyaltyDiscount}
            />
          )}

          {/* Promotion Selector */}
          <div className="rounded-xl border border-border bg-surface-2 p-4">
            <PromotionSelector
              promotions={availablePromotions}
              isLoading={isLoadingPromotions}
              error={promotionsError}
              selectedPromotionId={selectedPromotionId}
              onSelectPromotion={onSelectPromotion}
              promotionDiscount={promotionDiscount}
            />
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 rounded-xl border border-border bg-surface-2 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
          Chi tiết thanh toán
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Tiền sân</span>
            <span className="font-medium text-foreground">
              {totalAmount.toLocaleString("vi-VN")} đ
            </span>
          </div>

          {loyaltyDiscount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Giảm giá hạng thành viên</span>
              <span className="font-medium text-green-600">
                -{loyaltyDiscount.toLocaleString("vi-VN")} đ
              </span>
            </div>
          )}

          {promotionDiscount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Giảm giá khuyến mãi</span>
              <span className="font-medium text-green-600">
                -{promotionDiscount.toLocaleString("vi-VN")} đ
              </span>
            </div>
          )}

          <div className="border-t border-border pt-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">Tổng thanh toán</span>
              <span className="text-2xl font-bold text-primary">
                {finalAmount.toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>
        </div>
      </div>

      <Alert variant="info" title="Lưu ý">
        Sau khi xác nhận, bạn sẽ được chuyển đến trang thanh toán. Vui lòng hoàn tất thanh toán
        trong vòng 10 phút để giữ chỗ.
      </Alert>
    </div>
  );
}
