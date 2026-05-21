// ============================================================================
// Enums
// ============================================================================

export enum CustomerStatus {
  ACTIVE = 0,
  LOCKED = 1
}

export enum LoyaltyTransactionType {
  EARNED = 0,
  REDEEMED = 1,
  ADJUSTED = 2
}

export enum BookingStatus {
  PENDING = 0,
  CONFIRMED = 1,
  COMPLETED = 2,
  CANCELLED = 3
}

// ============================================================================
// Customer List & Detail Types
// ============================================================================

export interface CustomerListDto {
  id: string;
  fullName: string;
  phone?: string;
  email?: string; // OWNER only
  loyaltyTier: string;
  totalPoints?: number; // OWNER only
  totalCompletedBookings: number;
  status: string; // "ACTIVE" | "LOCKED"
  createdAt: string;
}

export interface CustomerDetailDto {
  id: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  email?: string; // OWNER only
  registrationMethod?: string; // OWNER only
  loyaltyTier: string;
  totalPoints?: number; // OWNER only
  pointsToNextTier?: number; // OWNER only
  currentDiscount: number;
  status: string; // "ACTIVE" | "LOCKED"
  lockInfo?: LockInfoDto;
  createdAt: string;
  statistics: CustomerStatisticsDto;
}

export interface LockInfoDto {
  reason?: string;
  lockedAt?: string;
  lockedBy?: string;
  lockedByName?: string;
}

export interface CustomerStatisticsDto {
  totalCompletedBookings: number;
  totalRevenue?: number; // OWNER only
  mostBookedBranch?: string; // OWNER only
  mostBookedTimeSlot?: string; // OWNER only
  lastBookingDate?: string;
}

export interface CustomerSearchDto {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
}

// ============================================================================
// Customer Bookings Types
// ============================================================================

export interface CustomerBookingDto {
  bookingId: string;
  branchName: string;
  bookingDate: string; // DateOnly
  courtNames: string;
  startTime: string; // TimeOnly
  endTime: string; // TimeOnly
  totalAmount: number;
  status: string;
  createdAt: string;
}

// ============================================================================
// Loyalty Transaction Types
// ============================================================================

export interface LoyaltyTransactionDto {
  transactionId: string;
  bookingId?: string;
  points: number;
  totalPointsAfter: number;
  type: string; // "EARNED" | "REDEEMED" | "ADJUSTED"
  note?: string;
  createdAt: string;
}

// ============================================================================
// Lock/Unlock Types
// ============================================================================

export interface LockCustomerDto {
  reason: string;
}

// ============================================================================
// Query Types
// ============================================================================

export interface CustomerListQuery {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  loyaltyTier?: string;
  loyaltyTierId?: string;
  status?: string; // "ACTIVE" | "LOCKED"
  branchId?: string;
  sortBy?: 'fullname' | 'createdat';
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerSearchQuery {
  searchTerm?: string;
  limit?: number;
}

export interface CustomerBookingQuery {
  page?: number;
  pageSize?: number;
  branchId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export interface LoyaltyTransactionQuery {
  page?: number;
  pageSize?: number;
  fromDate?: string;
  toDate?: string;
}

