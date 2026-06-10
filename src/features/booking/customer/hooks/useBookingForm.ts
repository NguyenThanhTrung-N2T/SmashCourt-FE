/**
 * Custom hook for managing booking form state and logic
 */

import { useState, useEffect } from "react";
import { getAuthUser } from "@/src/features/auth/session/sessionStore";
import type { BranchBasicDto } from "@/src/features/branch/shared/types/branch.types";
import type { CourtDto } from "@/src/features/court/shared/types/court.types";
import type { TimeGridSlotDto } from "@/src/features/timeslot/types";

// Simplified court type for booking flow
export interface BookingCourtType {
  id: string;
  name: string;
  description?: string;
}

export function useBookingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User state
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getAuthUser>>(null);
  const [preFilledFields, setPreFilledFields] = useState({
    name: false,
    phone: false,
    email: false,
  });

  // Step 1: Branch
  const [selectedBranch, setSelectedBranch] = useState<BranchBasicDto | null>(null);

  // Step 2: Court Type
  const [selectedCourtType, setSelectedCourtType] = useState<BookingCourtType | null>(null);

  // Step 3: Court & Time
  const [selectedCourts, setSelectedCourts] = useState<CourtDto[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSlots, setSelectedSlots] = useState<TimeGridSlotDto[]>([]);

  // Step 4: Guest Information
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [bookingNote, setBookingNote] = useState("");

  // Promotion selection
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    phone: "",
    email: "",
  });

  // Initialize user data
  useEffect(() => {
    const user = getAuthUser();
    if (!user) return;

    const timer = setTimeout(() => {
      setCurrentUser(user);

      const hasName = !!(user.fullName && user.fullName.trim());
      const hasPhone = !!(user.phone && user.phone.trim());
      const hasEmail = !!(user.email && user.email.trim());

      setGuestName(user.fullName || "");
      setGuestPhone(user.phone || "");
      setGuestEmail(user.email || "");

      setPreFilledFields({
        name: hasName,
        phone: hasPhone,
        email: hasEmail,
      });
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Handlers
  const handleBranchSelect = (branch: BranchBasicDto) => {
    setSelectedBranch(branch);
    setSelectedCourtType(null);
    setSelectedCourts([]);
    setSelectedSlots([]);
  };

  const handleCourtTypeSelect = (courtType: BookingCourtType) => {
    setSelectedCourtType(courtType);
    setSelectedCourts([]);
    setSelectedSlots([]);
  };
  /**
   * Called when a drag gesture starts on a court track (after move threshold).
   * - Dragging on an already-selected court: keeps the full selection, clears slots for re-drag.
   * - Dragging on a new court: resets selection to just this court.
   */
  const handleCourtDragStart = (court: CourtDto) => {
    setSelectedCourts((prev) => {
      const alreadySelected = prev.some((c) => c.id === court.id);
      return alreadySelected ? prev : [court];
    });
  };

  /**
   * Called when a court track is clicked (no drag movement).
   * Toggles the court in/out of the selection.
   * Adding a court only works when a time range is already set.
   */
  const handleCourtToggle = (court: CourtDto) => {
    const isSelected = selectedCourts.some((c) => c.id === court.id);
    if (isSelected) {
      const next = selectedCourts.filter((c) => c.id !== court.id);
      setSelectedCourts(next);
      if (next.length === 0) setSelectedSlots([]);
    } else if (selectedSlots.length > 0) {
      setSelectedCourts((prev) => [...prev, court]);
    }
    // If no time range yet, click does nothing — user must drag first
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlots([]);
    setSelectedCourts([]);
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
        return selectedCourts.length > 0 && selectedSlots.length > 0;
      default:
        return false;
    }
  };

  return {
    // State
    currentStep,
    isSubmitting,
    error,
    currentUser,
    preFilledFields,
    selectedBranch,
    selectedCourtType,
    selectedCourts,
    selectedDate,
    selectedSlots,
    guestName,
    guestPhone,
    guestEmail,
    bookingNote,
    validationErrors,
    selectedPromotionId,

    // Setters
    setIsSubmitting,
    setError,
    setSelectedSlots,
    setGuestName,
    setGuestPhone,
    setGuestEmail,
    setBookingNote,
    setValidationErrors,
    setSelectedPromotionId,

    // Handlers
    handleBranchSelect,
    handleCourtTypeSelect,
    handleCourtDragStart,
    handleCourtToggle,
    handleDateChange,
    handleNext,
    handleBack,
    canProceedFromStep,
  };
}
