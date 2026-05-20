/**
 * Booking Management Hook
 * 
 * Main hook for managing bookings with filtering, pagination, and actions.
 */

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/src/shared/hooks/useToast';
import {
  fetchAllBookings,
  fetchBookingDashboardSummary,
  fetchBookingById,
  checkInBooking,
  checkoutBooking,
  cancelBookingByStaff,
  confirmBookingRefund,
} from '@/src/api/booking.api';
import type {
  BookingDto,
  BookingListQuery,
  BookingDashboardSummaryDto,
} from '../../shared/types/booking.types';
import type { PaginatedData } from '@/src/shared/types/api.types';
import type { BookingTableFilters } from '../../shared/types/filter.types';
import { DEFAULT_TABLE_FILTERS } from '../../shared/types/filter.types';

export function useBookingManagement(initialBranchId?: string, enabled = true) {
  const { show: showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<PaginatedData<BookingDto>>({
    items: [],
    totalItems: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [summary, setSummary] = useState<BookingDashboardSummaryDto | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingDto | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Table-specific filters
  const [tableFilters, setTableFilters] = useState<BookingTableFilters>({
    ...DEFAULT_TABLE_FILTERS,
  });

  // Shared branch filter
  const [branchId, setBranchId] = useState<string | undefined>(initialBranchId);

  // Load bookings
  const loadBookings = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    try {
      // Combine shared and table filters for API call
      const apiFilters: BookingListQuery = {
        ...tableFilters,
        branchId,
      };
      const data = await fetchAllBookings(apiFilters);
      setBookings(data);
    } catch (error) {
      showToast('error', 'Failed to load bookings');
      console.error('Load bookings error:', error);
    } finally {
      setLoading(false);
    }
  }, [tableFilters, branchId, showToast, enabled]);

  // Load dashboard summary
  const loadSummary = useCallback(async () => {
    try {
      const data = await fetchBookingDashboardSummary({
        branchId,
      });
      setSummary(data);
    } catch (error) {
      console.error('Load summary error:', error);
    }
  }, [branchId]);

  // Update table filters (resets pagination)
  const updateTableFilters = useCallback((newFilters: Partial<BookingTableFilters>) => {
    setTableFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  // Update branch filter (shared across tabs)
  const updateBranchId = useCallback((newBranchId?: string) => {
    setBranchId(newBranchId);
  }, []);

  // Open booking detail
  const openBookingDetail = useCallback(async (bookingId: string) => {
    try {
      const booking = await fetchBookingById(bookingId);
      setSelectedBooking(booking);
      setDrawerOpen(true);
    } catch (error) {
      showToast('error', 'Failed to load booking details');
      console.error('Load booking detail error:', error);
    }
  }, [showToast]);

  // Close drawer
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedBooking(null);
  }, []);

  // Check-in action
  const handleCheckIn = useCallback(async (bookingId: string) => {
    try {
      await checkInBooking(bookingId);
      showToast('success', 'Booking checked in successfully');
      await loadBookings();
      await loadSummary();
      if (selectedBooking?.id === bookingId || selectedBooking?.bookingId === bookingId) {
        await openBookingDetail(bookingId);
      }
    } catch (error) {
      showToast('error', 'Failed to check in booking');
      console.error('Check-in error:', error);
    }
  }, [loadBookings, loadSummary, selectedBooking, openBookingDetail, showToast]);

  // Checkout action
  const handleCheckout = useCallback(async (bookingId: string) => {
    try {
      await checkoutBooking(bookingId);
      showToast('success', 'Booking checked out successfully');
      await loadBookings();
      await loadSummary();
      if (selectedBooking?.id === bookingId || selectedBooking?.bookingId === bookingId) {
        await openBookingDetail(bookingId);
      }
    } catch (error) {
      showToast('error', 'Failed to checkout booking');
      console.error('Checkout error:', error);
    }
  }, [loadBookings, loadSummary, selectedBooking, openBookingDetail, showToast]);

  // Cancel action
  const handleCancel = useCallback(async (bookingId: string) => {
    try {
      await cancelBookingByStaff(bookingId);
      showToast('success', 'Booking cancelled successfully');
      await loadBookings();
      await loadSummary();
      if (selectedBooking?.id === bookingId || selectedBooking?.bookingId === bookingId) {
        await openBookingDetail(bookingId);
      }
    } catch (error) {
      showToast('error', 'Failed to cancel booking');
      console.error('Cancel error:', error);
    }
  }, [loadBookings, loadSummary, selectedBooking, openBookingDetail, showToast]);

  // Confirm refund action
  const handleConfirmRefund = useCallback(async (bookingId: string) => {
    try {
      await confirmBookingRefund(bookingId);
      showToast('success', 'Refund confirmed successfully');
      await loadBookings();
      await loadSummary();
      if (selectedBooking?.id === bookingId || selectedBooking?.bookingId === bookingId) {
        await openBookingDetail(bookingId);
      }
    } catch (error) {
      showToast('error', 'Failed to confirm refund');
      console.error('Confirm refund error:', error);
    }
  }, [loadBookings, loadSummary, selectedBooking, openBookingDetail, showToast]);

  // Load on mount and filter changes (only if enabled)
  useEffect(() => {
    if (enabled) {
      loadBookings();
    }
  }, [loadBookings, enabled]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return {
    bookings,
    summary,
    loading,
    tableFilters,
    branchId,
    updateTableFilters,
    updateBranchId,
    selectedBooking,
    drawerOpen,
    openBookingDetail,
    closeDrawer,
    handleCheckIn,
    handleCheckout,
    handleCancel,
    handleConfirmRefund,
    refresh: loadBookings,
  };
}
