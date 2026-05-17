/**
 * Booking Confirmation Step Component
 * 
 * Displays booking summary and guest information form for final confirmation.
 */

"use client";

import { Alert } from "@/src/shared/components/ui/Alert";
import { LoyaltyInfoCard } from "../LoyaltyInfoCard";
import { PromotionSelector } from "../PromotionSelector";
import type { BranchDto } from "@/src/features/branch/types/branch.types";
import type { CourtDto } from "@/src/features/court/types/court.types";
import type { TimeGridSlotDto } from "@/src/features/timeslot/types";
import type { MyLoyaltyDto } from "@/src/shared/types/loyalty.types";
import type { ApplicablePromotion } from "@/src/shared/types/promotion.types";
import type { BookingCourtType } from "@/src/features/booking/customer/hooks/useBookingForm";

interface BookingConfirmationStepProps {
  branch: BranchDto;
  courtType: BookingCourtType;
  court: CourtDto;
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
  court,
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

  const inputCls = (hasError?: boolean, isReadOnly?: boolean) =>
    `w-full rounded-xl border ${
      hasError ? "border-red-500/40 bg-red-500/10" : "border-border bg-surface-2"
    } px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted ${
      isReadOnly ? "cursor-not-allowed opacity-70" : "hover:border-primary focus:border-primary focus:bg-surface-1 focus:ring-2 focus:ring-primary/20"
    }`;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Xác nhận thông tin</h2>
        <p className="mt-1 text-sm text-muted">
          {isLoggedIn 
            ? "Thông tin của bạn đã được tự động điền. Vui lòng kiểm tra lại trước khi xác nhận."
            : "Vui lòng nhập thông tin liên hệ và kiểm tra lại thông tin đặt sân"}
        </p>
      </div>

      {/* Guest Information Form */}
      <div className="rounded-xl border border-border bg-surface-2 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Thông tin liên hệ
          </h3>
          {isLoggedIn && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              Đã đăng nhập
            </span>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
              Họ và tên *
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => onGuestNameChange(e.target.value)}
              placeholder="Nguyễn Văn A"
              className={inputCls(!!validationErrors.name, isNameReadOnly)}
              readOnly={isNameReadOnly}
              required
            />
            {isNameReadOnly && (
              <p className="mt-1 text-xs text-muted">
                Thông tin từ tài khoản của bạn
              </p>
            )}
            {validationErrors.name && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
              Số điện thoại *
            </label>
            <input
              type="tel"
              value={guestPhone}
              onChange={(e) => onGuestPhoneChange(e.target.value)}
              placeholder="0901234567"
              className={inputCls(!!validationErrors.phone, isPhoneReadOnly)}
              readOnly={isPhoneReadOnly}
              required
            />
            {isPhoneReadOnly && (
              <p className="mt-1 text-xs text-muted">
                Thông tin từ tài khoản của bạn
              </p>
            )}
            {validationErrors.phone && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.phone}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
              Email *
            </label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => onGuestEmailChange(e.target.value)}
              placeholder="example@email.com"
              className={inputCls(!!validationErrors.email, isEmailReadOnly)}
              readOnly={isEmailReadOnly}
              required
            />
            {isEmailReadOnly && (
              <p className="mt-1 text-xs text-muted">
                Thông tin từ tài khoản của bạn
              </p>
            )}
            {validationErrors.email && (
              <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={bookingNote}
              onChange={(e) => onBookingNoteChange(e.target.value)}
              placeholder="Nhập ghi chú cho đặt sân..."
              rows={3}
              className={`${inputCls()} resize-none`}
            />
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
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
            Sân
          </h3>
          <p className="text-lg font-bold text-foreground">{court.name}</p>
          <p className="mt-1 text-sm text-muted">Loại sân: {courtType.name}</p>
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
