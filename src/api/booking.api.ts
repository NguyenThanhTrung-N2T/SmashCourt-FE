/**
 * Booking API
 * 
 * API endpoints for booking operations.
 */

import { authProtectedFetch, authFetch } from "./core";
import { getAuthUser } from "../features/auth/session/sessionStore";
import type { PaginatedData } from "../shared/types/api.types";
import type {
  CreateOnlineBookingDto,
  OnlineBookingResponseDto,
  BookingDto,
  BookingListQuery,
  CancellationInfoDto,
} from "../features/booking/types/booking.types";

// ============================================================================
// Customer Booking APIs
// ============================================================================

/**
 * Create an online booking (Customer or Guest)
 */
export async function createOnlineBooking(
  dto: CreateOnlineBookingDto
): Promise<OnlineBookingResponseDto> {
  const user = getAuthUser();
  const fetchFn = user ? authProtectedFetch : authFetch;

  const response = await fetchFn<OnlineBookingResponseDto>(
    "/api/bookings/online",
    {
      method: "POST",
      body: dto,
    }
  );
  if (!response.data) throw new Error("Failed to create booking");
  return response.data;
}

/**
 * Get booking history for logged-in customer
 */
export async function fetchCustomerBookings(
  query: BookingListQuery = {}
): Promise<PaginatedData<BookingDto>> {
  const params = new URLSearchParams({
    page: (query.page || 1).toString(),
    pageSize: (query.pageSize || 12).toString(),
  });

  if (query.status !== undefined) params.append("status", query.status.toString());
  if (query.date) params.append("date", query.date);

  const response = await authProtectedFetch<PaginatedData<BookingDto>>(
    `/api/me/bookings?${params}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to fetch bookings");
  return response.data;
}

/**
 * Get a specific booking for logged-in customer
 */
export async function fetchCustomerBookingById(id: string): Promise<BookingDto> {
  const response = await authProtectedFetch<BookingDto>(
    `/api/me/bookings/${id}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to fetch booking details");
  return response.data;
}

/**
 * Get cancellation info via token (Public)
 */
export async function fetchCancellationInfo(token: string): Promise<CancellationInfoDto> {
  const response = await authFetch<CancellationInfoDto>(
    `/api/bookings/cancel/${token}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to fetch cancellation info");
  return response.data;
}

/**
 * Cancel booking via token (Public)
 */
export async function cancelBookingByToken(token: string): Promise<void> {
  await authFetch<null>(`/api/bookings/cancel/${token}`, {
    method: "POST",
  });
}

/**
 * Cancel booking by ID (Authenticated Customer)
 */
export async function cancelCustomerBooking(bookingId: string): Promise<void> {
  await authProtectedFetch<null>(`/api/me/bookings/${bookingId}/cancel`, {
    method: "POST",
  });
}
