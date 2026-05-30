/**
 * Court Types
 *
 * Type definitions for court-related entities and DTOs.
 */

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================================================
// Enums
// ============================================================================

/** Domain state of a court (persisted). */
export enum CourtStatus {
  AVAILABLE = 0,
  LOCKED = 1,
  IN_USE = 3,
  SUSPENDED = 4,
  INACTIVE = 5,
}

/** Real-time operational status derived per card in the management dashboard. */
export enum CourtOperationalStatus {
  READY = 0,
  BOOKED = 1,
  PLAYING = 2,
  SUSPENDED = 3,
}

/** Status of a single merged timeline range slot. */
export enum CourtTimelineSlotStatus {
  AVAILABLE = 0,
  BOOKED = 1,
  PLAYING = 2,
}

// ============================================================================
// DTOs
// ============================================================================

export interface CourtDto {
  id: string;
  branchId: string;
  courtTypeId: string;
  courtTypeName: string;
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
  status: CourtStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourtDto {
  name: string;
  description?: string;
  avatarUrl?: string;
  courtTypeId: string;
}

export interface UpdateCourtDto {
  name: string;
  description?: string;
  avatarUrl?: string;
  courtTypeId: string;
}

// ============================================================================
// Management Dashboard DTOs
// ============================================================================

export interface CourtTimelineSlotDto {
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  status: CourtTimelineSlotStatus;
}

export interface CourtManagementCardDto {
  id: string;
  name: string;
  typeName: string;
  operationalStatus: CourtOperationalStatus;
  bookingsCount: number;
  basePrice: number;
  scheduleTimeline: CourtTimelineSlotDto[];
}

export interface CourtManagementDashboardStats {
  total: number;
  ready: number;
  booked: number;
  playing: number;
  suspended: number;
}

export interface CourtManagementDashboardDto {
  stats: CourtManagementDashboardStats;
  courts: CourtManagementCardDto[];
}

export interface CourtTimelineDetailSlotDto {
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  status: CourtTimelineSlotStatus;
  bookingId: string | null;
  playerName: string | null;
  bookingStatus: string | null;
}

export interface CourtManagementTimelineDto {
  operatingHours: {
    open: string;
    close: string;
  };
  courts: {
    id: string;
    name: string;
    typeName: string;
    slots: CourtTimelineDetailSlotDto[];
  }[];
}

export interface UpcomingBookingDto {
  bookingId: string;
  timeRange: string; // "HH:mm - HH:mm"
  playerName: string;
  status: string;       // e.g. "CONFIRMED"
  statusShort: string;  // e.g. "Đã XN"
}

export interface CurrentPlayerDto {
  name: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface CourtPricesDto {
  normalPrice: number;
  peakPrice: number;
}

export interface CourtManagementDetailDto {
  id: string;
  name: string;
  branchName: string;
  operationalStatus: CourtOperationalStatus;
  typeName: string;
  prices: CourtPricesDto;
  currentPlayer: CurrentPlayerDto | null;
  bookingsCount: number;
  upcomingBookings: UpcomingBookingDto[];
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface CourtListQuery {
  branchId?: string;
  typeId?: string;
}

export interface CourtManagementDashboardQuery {
  branchId?: string;
  date?: string; // yyyy-MM-dd
  search?: string;
  typeId?: string;
  page?: number;
  pageSize?: number;
}
