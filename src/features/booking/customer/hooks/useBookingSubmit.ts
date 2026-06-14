/**
 * Custom hook for handling booking submission
 */

import { createOnlineBooking } from "@/src/api/booking.api";
import { useGlobalToast } from "@/src/shared/hooks/useGlobalToast";
import type { CourtDto } from "@/src/features/court/shared/types/court.types";
import type { TimeGridSlotDto } from "@/src/features/timeslot/types";

interface UseBookingSubmitParams {
  selectedCourts: CourtDto[];
  selectedSlots: TimeGridSlotDto[];
  selectedDate: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  bookingNote: string;
  selectedPromotionId: string | null;
  setIsSubmitting: (value: boolean) => void;
  setError: (value: string | null) => void;
  validateGuestInfo: (name: string, phone: string, email: string) => string | null;
}

export function useBookingSubmit({
  selectedCourts,
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
}: UseBookingSubmitParams) {
  const { showToast } = useGlobalToast();

  const handleSubmitBooking = async () => {
    if (selectedCourts.length === 0 || selectedSlots.length === 0) return;

    // Validate guest information
    const validationError = validateGuestInfo(guestName, guestPhone, guestEmail);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const startTime = selectedSlots[0].startTime;
      const endTime = selectedSlots[selectedSlots.length - 1].endTime;

      const booking = await createOnlineBooking({
        // All courts share the same time range in one transaction
        courts: selectedCourts.map((court) => ({ courtId: court.id, startTime, endTime })),
        bookingDate: new Date(selectedDate).toISOString(),
        promotionId: selectedPromotionId || undefined,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim(),
        note: bookingNote.trim() || undefined,
      });

      // Redirect to payment
      window.location.href = booking.paymentUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể tạo đặt sân";
      setError(message);
      showToast("error", message);
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmitBooking,
  };
}
