import type { BookingStatus, InvoicePaymentStatus } from './booking.types';

// ============================================================================
// Shared Filters (persist across all tabs)
// ============================================================================

export interface SharedFilters {
  branchId?: string;
}

// ============================================================================
// Table-Specific Filters
// ============================================================================

export interface BookingTableFilters {
  page: number;
  pageSize: number;
  status?: BookingStatus | string;
  paymentStatus?: InvoicePaymentStatus | string;
  courtId?: string;
  customerKeyword?: string;
  date?: string; // YYYY-MM-DD
  fromDate?: string; // YYYY-MM-DD
  toDate?: string; // YYYY-MM-DD
  sortBy?: 'createdAt' | 'bookingDate' | 'date' | 'status' | 'customerName' | 'customer' | 'finalTotal' | 'total';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Schedule-Specific Filters
// ============================================================================

export interface ScheduleFilters {
  date: string; // YYYY-MM-DD
}

// ============================================================================
// Calendar-Specific Filters
// ============================================================================

export interface CalendarFilters {
  year: number;
  month: number;
}

// ============================================================================
// Combined Filter State
// ============================================================================

export interface BookingFiltersState {
  shared: SharedFilters;
  table: BookingTableFilters;
  schedule: ScheduleFilters;
  calendar: CalendarFilters;
}

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_TABLE_FILTERS: BookingTableFilters = {
  page: 1,
  pageSize: 20,
  date: new Date().toISOString().split('T')[0], // Default to today
};

export const DEFAULT_SCHEDULE_FILTERS: ScheduleFilters = {
  date: new Date().toISOString().split('T')[0], // Default to today
};

export const DEFAULT_CALENDAR_FILTERS: CalendarFilters = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
};

export const DEFAULT_SHARED_FILTERS: SharedFilters = {};
