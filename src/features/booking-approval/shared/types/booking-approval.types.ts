import type { DepositSource } from "@/src/features/booking/shared/types/booking.types";

// ─────────────────────────────────────────────
// Pending Approval Queue (contract §4.1)
// ─────────────────────────────────────────────

export interface PendingApprovalBookingDto {
  bookingId: string;
  bookingCode: string;
  branchId: string;
  branchName: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  isGuest: boolean;
  loyaltyTierName: string | null;
  bookingDate: string; // "yyyy-MM-dd" (DateOnly)
  startTime: string; // "HH:mm:ss"
  endTime: string; // "HH:mm:ss"
  courts: { courtId: string; courtName: string }[];
  finalTotal: number;
  approvalReasonCode: string;
  approvalReasons: string[];
  approvalExpiresAt: string; // "dd/MM/yyyy HH:mm:ss" VN time
  createdAt: string; // "dd/MM/yyyy HH:mm:ss" VN time
  note: string | null;
}

// ─────────────────────────────────────────────
// Approve / Reject Requests (contract §4.2, §4.3)
// ─────────────────────────────────────────────

export interface ApproveBookingRequest {
  depositRate: number; // 0…1, max 4 decimal places
  reason: string; // 5–500 code points
}

export interface RejectBookingRequest {
  reason: string; // 5–500 code points
}

// ─────────────────────────────────────────────
// Approval Result (contract §4.2 response)
// ─────────────────────────────────────────────

export interface BookingApprovalResultDto {
  bookingId: string;
  bookingCode: string;
  approvalResult: "APPROVED" | "REJECTED";
  status: string;
  finalTotal: number;
  depositRate: number | null;
  depositAmount: number | null;
  remainingAmount: number | null;
  depositSource: DepositSource | null;
  expiresAt: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
}

// ─────────────────────────────────────────────
// SignalR Event Payloads (contract §6)
// Timestamps are ISO 8601 UTC ("...Z") — use new Date() to parse
// ─────────────────────────────────────────────

export interface BookingPendingApprovalEvent {
  bookingId: string;
  bookingCode: string;
  branchId: string;
  branchName: string;
  customerName: string;
  courtIds: string[];
  status: string; // "PENDING_APPROVAL"
  approvalExpiresAt: string | null; // ISO UTC
  message: string;
  timestamp: string; // ISO UTC
}

export interface BookingApprovalResolvedEvent {
  bookingId: string;
  bookingCode: string;
  branchId: string;
  approvalResult: "APPROVED" | "REJECTED";
  status: string; // "PENDING" or "CANCELLED"
  message: string;
  timestamp: string;
}

export interface PendingApprovalQueueChangedEvent {
  branchId: string;
  bookingId: string;
  change: "ADDED" | "REMOVED";
  reason: "NEW" | "APPROVED" | "REJECTED" | "EXPIRED" | "CANCELLED";
  timestamp: string;
}

