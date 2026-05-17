/**
 * Custom hook for handling booking submission
 */

import { createOnlineBooking } from "@/src/api/booking.api";
import type { CourtDto } from "@/src/features/court/types/court.types";
import type { TimeGridSlotDto } from "@/src/features/timeslot/types";

interface UseBookingSubmitParams {
  selectedCourt: CourtDto | null;
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
}: UseBookingSubmitParams) {
  const handleSubmitBooking = async () => {
    if (!selectedCourt || selectedSlots.length === 0) return;

    // Validate guest information
    const validationError = validateGuestInfo(guestName, guestPhone, guestEmail);
    if (validationError) {
      setError(validationError);
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
        promotionId: selectedPromotionId || undefined,
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

  return {
    handleSubmitBooking,
  };
}
