/**
 * Booking API
 * 
 * API endpoints for booking operations.
 */

import { authProtectedFetch, authFetch } from "./core";
import { getAuthUser } from "../features/auth/session/sessionStore";
import type { PaginatedData } from "../shared/types/api.types";
import type {
  AddBookingServiceDto,
  BookingCalendarHeatmapDto,
  BookingCalendarHeatmapQuery,
  BookingDashboardSummaryDto,
  BookingDashboardSummaryQuery,
  CreateOnlineBookingDto,
  CreateWalkInBookingDto,
  OnlineBookingResponseDto,
  BookingDto,
  BookingListQuery,
  BookingScheduleCourtDto,
  BookingScheduleQuery,
  CancellationInfoDto,
} from "../features/booking/types/booking.types";

function appendBookingListParams(params: URLSearchParams, query: BookingListQuery): void {
  if (query.status !== undefined) params.append("status", query.status.toString());
  if (query.paymentStatus !== undefined) params.append("paymentStatus", query.paymentStatus.toString());
  if (query.branchId) params.append("branchId", query.branchId);
  if (query.courtId) params.append("courtId", query.courtId);
  if (query.date) params.append("date", query.date);
  if (query.fromDate) params.append("fromDate", query.fromDate);
  if (query.toDate) params.append("toDate", query.toDate);
  if (query.customerKeyword) params.append("customerKeyword", query.customerKeyword);
  if (query.sortBy) params.append("sortBy", query.sortBy);
  if (query.sortOrder) params.append("sortOrder", query.sortOrder);
}

// ============================================================================
// Staff / Management Booking APIs
// ============================================================================

/**
 * Get paginated booking list for staff/manager/owner.
 */
export async function fetchAllBookings(
  query: BookingListQuery = {}
): Promise<PaginatedData<BookingDto>> {
  const params = new URLSearchParams({
    page: (query.page || 1).toString(),
    pageSize: (query.pageSize || 10).toString(),
  });

  appendBookingListParams(params, query);

  const response = await authProtectedFetch<PaginatedData<BookingDto>>(
    `/api/bookings?${params}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to fetch bookings");
  return response.data;
}

export const getAllBookings = fetchAllBookings;

/**
 * Get court schedule/occupancy for a play date.
 */
export async function fetchBookingSchedule(
  query: BookingScheduleQuery
): Promise<BookingScheduleCourtDto[]> {
  const params = new URLSearchParams({ date: query.date });
  if (query.branchId) params.append("branchId", query.branchId);

  const response = await authProtectedFetch<BookingScheduleCourtDto[]>(
    `/api/bookings/schedule?${params}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to fetch booking schedule");
  return response.data;
}

/**
 * Get management dashboard booking summary.
 */
export async function fetchBookingDashboardSummary(
  query: BookingDashboardSummaryQuery = {}
): Promise<BookingDashboardSummaryDto> {
  const params = new URLSearchParams();
  if (query.branchId) params.append("branchId", query.branchId);

  const queryString = params.toString();
  const response = await authProtectedFetch<BookingDashboardSummaryDto>(
    `/api/bookings/dashboard-summary${queryString ? `?${queryString}` : ""}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to fetch booking dashboard summary");
  return response.data;
}

/**
 * Get monthly booking calendar heatmap data.
 */
export async function fetchBookingCalendarHeatmap(
  query: BookingCalendarHeatmapQuery = {}
): Promise<BookingCalendarHeatmapDto[]> {
  const params = new URLSearchParams();
  if (query.year !== undefined) params.append("year", query.year.toString());
  if (query.month !== undefined) params.append("month", query.month.toString());
  if (query.branchId) params.append("branchId", query.branchId);

  const queryString = params.toString();
  const response = await authProtectedFetch<BookingCalendarHeatmapDto[]>(
    `/api/bookings/calendar-heatmap${queryString ? `?${queryString}` : ""}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to fetch booking calendar heatmap");
  return response.data;
}

/**
 * Get management booking detail.
 */
export async function fetchBookingById(id: string): Promise<BookingDto> {
  const response = await authProtectedFetch<BookingDto>(
    `/api/bookings/${id}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to fetch booking details");
  return response.data;
}

/**
 * Create a walk-in booking at the counter.
 */
export async function createWalkInBooking(
  dto: CreateWalkInBookingDto
): Promise<BookingDto> {
  const response = await authProtectedFetch<BookingDto>(
    "/api/bookings/walk-in",
    {
      method: "POST",
      body: dto,
    }
  );
  if (!response.data) throw new Error("Failed to create walk-in booking");
  return response.data;
}

/**
 * Cancel a booking by staff.
 */
export async function cancelBookingByStaff(id: string): Promise<void> {
  await authProtectedFetch<null>(`/api/bookings/${id}/cancel`, {
    method: "POST",
  });
}

/**
 * Confirm pending refund after cancellation.
 */
export async function confirmBookingRefund(id: string): Promise<void> {
  await authProtectedFetch<null>(`/api/bookings/${id}/confirm-refund`, {
    method: "POST",
  });
}

/**
 * Check in a booking.
 */
export async function checkInBooking(id: string): Promise<void> {
  await authProtectedFetch<null>(`/api/bookings/${id}/check-in`, {
    method: "POST",
  });
}

/**
 * Check out a booking.
 */
export async function checkoutBooking(id: string): Promise<void> {
  await authProtectedFetch<null>(`/api/bookings/${id}/checkout`, {
    method: "POST",
  });
}

/**
 * Add service usage to a booking.
 */
export async function addServiceToBooking(
  id: string,
  dto: AddBookingServiceDto
): Promise<BookingDto> {
  const response = await authProtectedFetch<BookingDto>(
    `/api/bookings/${id}/services`,
    {
      method: "POST",
      body: dto,
    }
  );
  if (!response.data) throw new Error("Failed to add service to booking");
  return response.data;
}

/**
 * Remove service usage from a booking.
 */
export async function removeServiceFromBooking(
  id: string,
  serviceId: string
): Promise<BookingDto> {
  const response = await authProtectedFetch<BookingDto>(
    `/api/bookings/${id}/services/${serviceId}`,
    { method: "DELETE" }
  );
  if (!response.data) throw new Error("Failed to remove service from booking");
  return response.data;
}

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
  if (query.branchId) params.append("branchId", query.branchId);
  if (query.date) params.append("date", query.date);
  if (query.search) params.append("search", query.search);

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
