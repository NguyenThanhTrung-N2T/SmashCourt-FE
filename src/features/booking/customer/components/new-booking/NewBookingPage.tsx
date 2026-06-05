"use client";

import { useEffect } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, Warning } from "@phosphor-icons/react";
import { Button } from "@/src/shared/components/ui/Button";
import { Alert } from "@/src/shared/components/ui/Alert";
import {
  BookingStepIndicator,
  BranchSelectionStep,
  CourtTypeSelectionStep,
  CourtAndTimeSelectionStep,
  BookingConfirmationStep,
} from "@/src/features/booking/customer/components";
import {
  useBookingForm,
  useBookingValidation,
  usePriceCalculation,
  useBookingSubmit,
  useLoyaltyAndPromotions,
  useDiscountCalculation,
} from "@/src/features/booking/customer/hooks";

const STEPS = [
  { number: 1, label: "Chi nhánh" },
  { number: 2, label: "Loại sân" },
  { number: 3, label: "Sân & Thời gian" },
  { number: 4, label: "Xác nhận" },
];

export function NewBookingPage() {
  const {
    currentStep,
    isSubmitting,
    error,
    currentUser,
    preFilledFields,
    selectedBranch,
    selectedCourtType,
    selectedCourt,
    selectedDate,
    selectedSlots,
    guestName,
    guestPhone,
    guestEmail,
    bookingNote,
    validationErrors,
    selectedPromotionId,
    setIsSubmitting,
    setError,
    setSelectedSlots,
    setGuestName,
    setGuestPhone,
    setGuestEmail,
    setBookingNote,
    setValidationErrors,
    setSelectedPromotionId,
    handleBranchSelect,
    handleCourtTypeSelect,
    handleCourtSelect,
    handleDateChange,
    handleNext,
    handleBack,
    canProceedFromStep,
  } = useBookingForm();

  const { validatePhone, validateEmail, validateGuestInfo } = useBookingValidation();

  const { totalAmount, isCalculatingPrice } = usePriceCalculation({
    selectedBranch,
    selectedCourt,
    selectedDate,
    selectedSlots,
  });

  const {
    loyaltyInfo,
    availablePromotions,
    isLoadingLoyalty,
    isLoadingPromotions,
    promotionsError,
  } = useLoyaltyAndPromotions({
    isLoggedIn: currentUser !== null,
    selectedBranch,
    selectedCourt,
    selectedDate,
    selectedSlots,
    totalAmount,
  });

  const selectedPromotion = availablePromotions.find(
    (p) => p.id === selectedPromotionId
  ) || null;

  const { loyaltyDiscount, promotionDiscount, finalAmount } = useDiscountCalculation({
    courtFee: totalAmount,
    loyaltyInfo,
    selectedPromotion,
  });

  useEffect(() => {
    if (
      selectedPromotionId &&
      !isLoadingPromotions &&
      !availablePromotions.some((promotion) => promotion.id === selectedPromotionId)
    ) {
      setSelectedPromotionId(null);
    }
  }, [availablePromotions, isLoadingPromotions, selectedPromotionId, setSelectedPromotionId]);

  const { handleSubmitBooking } = useBookingSubmit({
    selectedCourt,
    selectedSlots,
    selectedDate,
    guestName,
    guestPhone,
    guestEmail,
    bookingNote,
    selectedPromotionId,
    setIsSubmitting,
    setError,
    validateGuestInfo,
  });

  const handleGuestNameChange = (value: string) => {
    setGuestName(value);
    setValidationErrors(prev => ({ ...prev, name: "" }));
  };

  const handleGuestPhoneChange = (value: string) => {
    setGuestPhone(value);
    const error = validatePhone(value);
    setValidationErrors(prev => ({ ...prev, phone: error }));
  };

  const handleGuestEmailChange = (value: string) => {
    setGuestEmail(value);
    const error = validateEmail(value);
    setValidationErrors(prev => ({ ...prev, email: error }));
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

          {currentStep === 2 && selectedBranch && (
            <CourtTypeSelectionStep
              branchId={selectedBranch.id}
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
            <BookingConfirmationStep
              branch={selectedBranch!}
              courtType={selectedCourtType!}
              court={selectedCourt!}
              date={selectedDate}
              slots={selectedSlots}
              guestName={guestName}
              guestPhone={guestPhone}
              guestEmail={guestEmail}
              bookingNote={bookingNote}
              onGuestNameChange={handleGuestNameChange}
              onGuestPhoneChange={handleGuestPhoneChange}
              onGuestEmailChange={handleGuestEmailChange}
              onBookingNoteChange={setBookingNote}
              isLoggedIn={currentUser !== null}
              preFilledFields={preFilledFields}
              validationErrors={validationErrors}
              totalAmount={totalAmount}
              loyaltyInfo={loyaltyInfo}
              isLoadingLoyalty={isLoadingLoyalty}
              availablePromotions={availablePromotions}
              isLoadingPromotions={isLoadingPromotions}
              promotionsError={promotionsError}
              selectedPromotionId={selectedPromotionId}
              onSelectPromotion={setSelectedPromotionId}
              loyaltyDiscount={loyaltyDiscount}
              promotionDiscount={promotionDiscount}
              finalAmount={finalAmount}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col space-y-4 pt-6">
          {currentStep === 4 && (
            <div className="flex flex-col space-y-3 font-medium">
              {(!guestName.trim() || !guestPhone.trim() || !guestEmail.trim()) && (
                <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-4 py-3 text-sm text-orange-600 border border-orange-500/20">
                  <Warning className="h-5 w-5 shrink-0" weight="fill" />
                  <span>Vui lòng điền đầy đủ các thông tin bắt buộc (Họ tên, SĐT, Email)</span>
                </div>
              )}
              {(!!validationErrors.phone || !!validationErrors.email) && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600 border border-red-500/20">
                  <Warning className="h-5 w-5 shrink-0" weight="fill" />
                  <span>Thông tin liên hệ không hợp lệ. Vui lòng kiểm tra lại.</span>
                </div>
              )}
            </div>
          )}

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
                disabled={
                  isSubmitting ||
                  !guestName.trim() ||
                  !guestPhone.trim() ||
                  !guestEmail.trim() ||
                  !!validationErrors.phone ||
                  !!validationErrors.email
                }
                isLoading={isSubmitting}
                className="ml-auto px-8"
                leftIcon={<CheckCircle className="h-5 w-5" weight="bold" />}
              >
                Xác nhận đặt sân
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
