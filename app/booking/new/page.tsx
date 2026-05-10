/**
 * New Booking Page
 * 
 * Modern multi-step booking page with branch, court type, court, and time selection.
 */

"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { Alert } from "@/src/shared/components/ui/Alert";
import { BookingStepIndicator } from "@/src/features/booking/customer/components/BookingStepIndicator";
import { BranchSelectionStep } from "@/src/features/booking/customer/components/BranchSelectionStep";
import { CourtTypeSelectionStep } from "@/src/features/booking/customer/components/CourtTypeSelectionStep";
import { CourtAndTimeSelectionStep } from "@/src/features/booking/customer/components/CourtAndTimeSelectionStep";
import { createOnlineBooking } from "@/src/api/booking.api";
import { calculatePrice } from "@/src/api/pricing.api";
import { getAuthUser } from "@/src/features/auth/session/sessionStore";
import type { BranchDto } from "@/src/features/branch/types/branch.types";
import type { CourtType } from "@/src/shared/types/court-type.types";
import type { CourtDto } from "@/src/features/court/types/court.types";
import type { TimeGridSlotDto } from "@/src/features/timeslot/types";

const STEPS = [
  { number: 1, label: "Chi nhánh" },
  { number: 2, label: "Loại sân" },
  { number: 3, label: "Sân & Thời gian" },
  { number: 4, label: "Xác nhận" },
];

export default function NewBookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user if logged in
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getAuthUser>>(null);

  useEffect(() => {
    const user = getAuthUser();
    setCurrentUser(user);
    
    // Pre-fill guest information if user is logged in
    if (user) {
      setGuestName(user.fullName || "");
      setGuestPhone(user.phone || "");
      setGuestEmail(user.email || "");
    }
  }, []);

  // Step 1: Branch
  const [selectedBranch, setSelectedBranch] = useState<BranchDto | null>(null);

  // Step 2: Court Type
  const [selectedCourtType, setSelectedCourtType] = useState<CourtType | null>(null);

  // Step 3: Court & Time
  const [selectedCourt, setSelectedCourt] = useState<CourtDto | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSlots, setSelectedSlots] = useState<TimeGridSlotDto[]>([]);

  // Step 4: Guest Information (pre-filled if logged in)
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [bookingNote, setBookingNote] = useState("");

  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchPrice() {
      if (!selectedBranch || !selectedCourt || !selectedDate || selectedSlots.length === 0) {
        if (isMounted) setTotalAmount(0);
        return;
      }
      try {
        if (isMounted) setIsCalculatingPrice(true);
        const sortedSlots = [...selectedSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
        const startTime = sortedSlots[0].startTime;
        let endTime = sortedSlots[sortedSlots.length - 1].endTime;
        if (endTime === "00:00:00") {
          endTime = "24:00:00"; // Handle midnight slot for C# TimeSpan
        }

        const result = await calculatePrice(selectedBranch.id, {
          courtId: selectedCourt.id,
          bookingDate: new Date(selectedDate).toISOString(),
          startTime,
          endTime,
        });
        if (result && isMounted) {
          setTotalAmount(result.courtFee);
        }
      } catch (err) {
        console.error("Failed to calculate price:", err);
      } finally {
        if (isMounted) setIsCalculatingPrice(false);
      }
    }
    
    const timeoutId = setTimeout(fetchPrice, 300);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [selectedBranch, selectedCourt, selectedDate, selectedSlots]);

  const handleBranchSelect = (branch: BranchDto) => {
    setSelectedBranch(branch);
    // Reset subsequent selections
    setSelectedCourtType(null);
    setSelectedCourt(null);
    setSelectedSlots([]);
  };

  const handleCourtTypeSelect = (courtType: CourtType) => {
    setSelectedCourtType(courtType);
    // Reset subsequent selections
    setSelectedCourt(null);
    setSelectedSlots([]);
  };

  const handleCourtSelect = (court: CourtDto) => {
    if (selectedCourt?.id !== court.id) {
      setSelectedCourt(court);
      // Clear slots when changing court
      setSelectedSlots([]);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlots([]);
  };

  const handleNext = () => {
    setError(null);
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return selectedBranch !== null;
      case 2:
        return selectedCourtType !== null;
      case 3:
        return selectedCourt !== null && selectedSlots.length > 0;
      default:
        return false;
    }
  };

  const handleSubmitBooking = async () => {
    if (!selectedCourt || selectedSlots.length === 0) return;

    // Validate guest information
    if (!guestName.trim() || !guestPhone.trim() || !guestEmail.trim()) {
      setError("Vui lòng nhập đầy đủ họ tên, số điện thoại và email");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const booking = await createOnlineBooking({
        courts: [
          {
            courtId: selectedCourt.id,
            startTime: selectedSlots[0].startTime,
            endTime: selectedSlots[selectedSlots.length - 1].endTime,
          },
        ],
        bookingDate: new Date(selectedDate).toISOString(),
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim(),
        note: bookingNote.trim() || undefined,
      });

      // Redirect to payment
      window.location.href = booking.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tạo đặt sân");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Đặt sân mới</h1>
          <p className="mt-2 text-sm text-muted">
            Chọn chi nhánh, loại sân, sân và thời gian để đặt sân
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 rounded-2xl border border-border bg-surface-1 p-6">
          <BookingStepIndicator currentStep={currentStep} steps={STEPS} />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <Alert variant="error" title="Lỗi">
              {error}
            </Alert>
          </div>
        )}

        {/* Step Content */}
        <div className="mb-8 rounded-2xl border border-border bg-surface-1 p-6">
          {currentStep === 1 && (
            <BranchSelectionStep
              selectedBranchId={selectedBranch?.id || null}
              onSelectBranch={handleBranchSelect}
            />
          )}

          {currentStep === 2 && (
            <CourtTypeSelectionStep
              selectedCourtTypeId={selectedCourtType?.id || null}
              onSelectCourtType={handleCourtTypeSelect}
            />
          )}

          {currentStep === 3 && selectedBranch && selectedCourtType && (
            <CourtAndTimeSelectionStep
              branchId={selectedBranch.id}
              courtTypeId={selectedCourtType.id}
              selectedCourtId={selectedCourt?.id || null}
              selectedDate={selectedDate}
              selectedSlots={selectedSlots}
              onSelectCourt={handleCourtSelect}
              onDateChange={handleDateChange}
              onSlotsChange={setSelectedSlots}
              totalAmount={totalAmount}
              isCalculatingPrice={isCalculatingPrice}
            />
          )}

          {currentStep === 4 && (
            <BookingConfirmation
              branch={selectedBranch!}
              courtType={selectedCourtType!}
              court={selectedCourt!}
              date={selectedDate}
              slots={selectedSlots}
              guestName={guestName}
              guestPhone={guestPhone}
              guestEmail={guestEmail}
              bookingNote={bookingNote}
              onGuestNameChange={setGuestName}
              onGuestPhoneChange={setGuestPhone}
              onGuestEmailChange={setGuestEmail}
              onBookingNoteChange={setBookingNote}
              isLoggedIn={currentUser !== null}
              totalAmount={totalAmount}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Quay lại
          </Button>

          {currentStep < 4 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceedFromStep(currentStep)}
              className="ml-auto"
            >
              Tiếp tục
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmitBooking}
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className="ml-auto"
              leftIcon={<CheckCircle className="h-5 w-5" />}
            >
              Xác nhận đặt sân
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface BookingConfirmationProps {
  branch: BranchDto;
  courtType: CourtType;
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
  totalAmount: number;
}

function BookingConfirmation({
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
  totalAmount,
}: BookingConfirmationProps) {
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
              className={inputCls(false, isLoggedIn)}
              readOnly={isLoggedIn}
              required
            />
            {isLoggedIn && (
              <p className="mt-1 text-xs text-muted">
                Thông tin từ tài khoản của bạn
              </p>
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
              className={inputCls(false, isLoggedIn)}
              readOnly={isLoggedIn}
              required
            />
            {isLoggedIn && (
              <p className="mt-1 text-xs text-muted">
                Thông tin từ tài khoản của bạn
              </p>
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
              className={inputCls(false, isLoggedIn)}
              readOnly={isLoggedIn}
              required
            />
            {isLoggedIn && (
              <p className="mt-1 text-xs text-muted">
                Thông tin từ tài khoản của bạn
              </p>
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
            {slots.length} khung giờ)
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

      <Alert variant="info" title="Lưu ý">
        Sau khi xác nhận, bạn sẽ được chuyển đến trang thanh toán. Vui lòng hoàn tất thanh toán
        trong vòng 15 phút để giữ chỗ.
      </Alert>
    </div>
  );
}
