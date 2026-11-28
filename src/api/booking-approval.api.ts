/**
 * Booking Approval API
 * 
 * Endpoints for branch managers and owners to review, approve, and reject bookings (Phase 6, contract §4).
 */

import { authProtectedFetch } from "./core";
import type { PaginatedData } from "@/src/shared/types/api.types";
import type {
  PendingApprovalBookingDto,
  ApproveBookingRequest,
  RejectBookingRequest,
  BookingApprovalResultDto,
} from "@/src/features/booking-approval/shared/types/booking-approval.types";

/** GET /api/bookings/pending-approval — Fetch pending approval queue */
export async function fetchPendingApprovals(
  params?: { branchId?: string; page?: number; pageSize?: number }
): Promise<PaginatedData<PendingApprovalBookingDto>> {
  const searchParams = new URLSearchParams();
  if (params?.branchId) searchParams.set("branchId", params.branchId);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));

  const query = searchParams.toString();
  const url = `/api/bookings/pending-approval${query ? `?${query}` : ""}`;

  const response = await authProtectedFetch<PaginatedData<PendingApprovalBookingDto>>(url, {
    method: "GET",
  });
  if (!response.data) throw new Error("Failed to fetch pending approvals");
  return response.data;
}

/** POST /api/bookings/:bookingId/approve — Approve a pending booking */
export async function approveBooking(
  bookingId: string,
  body: ApproveBookingRequest
): Promise<BookingApprovalResultDto> {
  const response = await authProtectedFetch<BookingApprovalResultDto>(
    `/api/bookings/${bookingId}/approve`,
    {
      method: "POST",
      body,
    }
  );
  if (!response.data) throw new Error("Failed to approve booking");
  return response.data;
}

/** POST /api/bookings/:bookingId/reject — Reject a pending booking */
export async function rejectBooking(
  bookingId: string,
  body: RejectBookingRequest
): Promise<BookingApprovalResultDto> {
  const response = await authProtectedFetch<BookingApprovalResultDto>(
    `/api/bookings/${bookingId}/reject`,
    {
      method: "POST",
      body,
    }
  );
  if (!response.data) throw new Error("Failed to reject booking");
  return response.data;
}

