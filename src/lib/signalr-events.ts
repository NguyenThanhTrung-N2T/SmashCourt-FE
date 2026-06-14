/**
 * SignalR Event Names Constants
 * Đồng bộ với Backend: SmashCourt-BE/Common/Constants/SignalREvents.cs
 */
export const SignalREvents = {
  // Booking Events
  BOOKING_CREATED: "BookingCreated",
  BOOKING_UPDATED: "BookingUpdated",
  BOOKING_CHECKED_IN: "BookingCheckedIn",
  BOOKING_CHECKED_OUT: "BookingCheckedOut",
  BOOKING_CANCELLED: "BookingCancelled",
  BOOKING_COMPLETED: "BookingCompleted",
  BOOKING_EXPIRED: "BookingExpired",
  BOOKING_NO_SHOW: "BookingNoShow",
  
  // Payment Events
  PAYMENT_SUCCESS: "PaymentSuccess",
  PAYMENT_FAILED: "PaymentFailed",
} as const;

export type SignalREventName = typeof SignalREvents[keyof typeof SignalREvents];
