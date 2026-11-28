/**
 * Custom hook for handling booking submission
 */

import { useRouter } from "next/navigation";
import { createOnlineBooking } from "@/src/api/booking.api";
import { AuthApiError } from "@/src/api/core";
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
  onBookingRejected?: () => void;
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
  onBookingRejected,
}: UseBookingSubmitParams) {
  const router = useRouter();
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

      // Save booking response in sessionStorage for instant hydration on the result page
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("last_booking_result", JSON.stringify(booking));
        } catch {
          // Ignore storage quota / private mode errors
        }
      }

      // Navigate to the booking result page (C1 fix, contract §3.1)
      router.push(`/bookings/result?bookingId=${booking.bookingId}`);
    } catch (err) {
      setIsSubmitting(false);

      if (err instanceof AuthApiError) {
        if (err.code === "BOOKING_REJECTED") {
          const message =
            "Rất tiếc, đơn đặt sân này không được chấp nhận. Vui lòng chọn khung giờ khác hoặc liên hệ chi nhánh.";
          setError(message);
          showToast("error", message);
          onBookingRejected?.();
          return;
        }

        if (err.code === "CONFLICT") {
          const message = "Đơn đặt sân vừa được nhân viên xử lý, vui lòng xem lịch sử đặt sân.";
          setError(message);
          showToast("warning", message);
          router.push("/bookings");
          return;
        }

        if (err.status === 401 || err.status === 403) {
          showToast("error", "Vui lòng đăng nhập để thực hiện đặt sân.");
          router.push("/auth/login");
          return;
        }

        if (err.status === 429 || err.code === "OTP_LIMIT_EXCEEDED") {
          const message = "Bạn thao tác đặt sân quá nhanh, vui lòng đợi một lát rồi thử lại.";
          setError(message);
          showToast("warning", message);
          return;
        }

        if (err.code === "SLOT_UNAVAILABLE_NOTIFY_REGISTERED") {
          const message =
            err.message ||
            "Khung giờ này đã được đặt. Hệ thống đã đăng ký thông báo qua email nếu sân trống lại.";
          setError(message);
          showToast("info", message);
          return;
        }

        if (err.code === "VALIDATION_ERROR" && err.errors) {
          const firstFieldError =
            err.errors.Courts?.[0] ?? Object.values(err.errors).flat()[0];
          const message = firstFieldError || err.message || "Dữ liệu đầu vào không hợp lệ.";
          setError(message);
          showToast("error", message);
          return;
        }

        const message = err.message || "Yêu cầu không hợp lệ. Vui lòng thử lại.";
        setError(message);
        showToast("error", message);
        return;
      }

      const message = err instanceof Error ? err.message : "Không thể tạo đặt sân";
      setError(message);
      showToast("error", message);
    }
  };

  return {
    handleSubmitBooking,
  };
}
