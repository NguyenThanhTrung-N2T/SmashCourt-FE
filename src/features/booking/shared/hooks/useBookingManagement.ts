/**
 * Booking Management Hook
 * 
 * Main hook for managing bookings with filtering, pagination, and actions.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/src/shared/hooks/useToast';
import {
  fetchAllBookings,
  fetchBookingDashboardSummary,
  fetchBookingDetailsById,
  checkInBooking,
  checkoutBooking,
  completePaymentBooking,
  cancelBookingByStaff,
  confirmBookingRefund,
  fetchBookingById
} from '@/src/api/booking.api';
import type {
  BookingDto,
  BookingListQuery,
  BookingDashboardSummaryDto,
} from '@/src/features/booking/shared/types/booking.types';
import type { PaginatedData } from '@/src/shared/types/api.types';
import type { BookingTableFilters } from '../types/filter.types';
import { DEFAULT_TABLE_FILTERS } from '../types/filter.types';

export function useBookingManagement(initialBranchId?: string, enabled = true) {
  const { toast, show: showToast } = useToast();
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
  const selectedBookingRef = useRef<BookingDto | null>(null);
  useEffect(() => {
    selectedBookingRef.current = selectedBooking;
  }, [selectedBooking]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Table-specific filters
  const [tableFilters, setTableFilters] = useState<BookingTableFilters>({
    ...DEFAULT_TABLE_FILTERS,
  });

  // Shared branch filter
  const [branchId, setBranchId] = useState<string | undefined>(initialBranchId);

  // Load bookings
  const loadBookings = useCallback(async (signal?: AbortSignal) => {
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
  }, [tableFilters, branchId, showToast]);

  // Add a ref so patchBooking can read current items without a stale closure
  const bookingsRef = useRef(bookings);
  useEffect(() => {
    bookingsRef.current = bookings;
  }, [bookings]);

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
  const patchBooking = useCallback(async (bookingId: string) => {
    const isInCurrentPage = bookingsRef.current.items.some((b) => b.id === bookingId);

    if (!isInCurrentPage) {
      // New booking (or on a different page) — reload the list and summary
      await Promise.all([loadBookings(), loadSummary()]);
      return;
    }

    try {
      const updated = await fetchBookingById(bookingId);
      setBookings((prev) => {
        const idx = prev.items.findIndex((b) => b.id === bookingId);
        if (idx === -1) return prev;
        const newItems = [...prev.items];
        newItems[idx] = updated;
        return { ...prev, items: newItems };
      });
      if (selectedBookingRef.current?.id === bookingId) {
        setSelectedBooking(updated);
      }
    } catch (error) {
      console.error('[patchBooking] error:', error);
    }
  }, [loadBookings, loadSummary]); // add these two deps

  useEffect(() => {
    if (!enabled) return; // ← only gate here

    const controller = new AbortController();
    loadBookings(controller.signal);

    return () => controller.abort(); // cancel if deps change before it finishes
  }, [loadBookings, enabled]);



  // Update table filters (resets pagination)
  const updateTableFilters = useCallback((newFilters: Partial<BookingTableFilters>) => {
    setTableFilters((prev) => {
      const hasPageChange = Object.prototype.hasOwnProperty.call(newFilters, 'page');

      return {
        ...prev,
        ...newFilters,
        page: hasPageChange ? newFilters.page ?? prev.page : 1,
      };
    });
  }, []);

  // Update branch filter (shared across tabs)
  const updateBranchId = useCallback((newBranchId?: string) => {
    setBranchId(newBranchId);
  }, []);

  // Open booking detail
  const openBookingDetail = useCallback(async (bookingId: string) => {
    try {
      const booking = await fetchBookingDetailsById(bookingId);
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
      showToast('success', 'Check-in thành công');
      await loadBookings();
      await loadSummary();
      if (selectedBooking?.id === bookingId) {
        await openBookingDetail(bookingId);
      }
    } catch (error) {
      showToast('error', 'Check-in thất bại');
      console.error('Check-in error:', error);
    }
  }, [loadBookings, loadSummary, selectedBooking, openBookingDetail, showToast]);

  // Checkout action
  const handleCheckout = useCallback(async (bookingId: string) => {
    try {
      await checkoutBooking(bookingId);
      showToast('success', 'Checkout thành công');
      await loadBookings();
      await loadSummary();
      if (selectedBooking?.id === bookingId) {
        await openBookingDetail(bookingId);
      }
    } catch (error) {
      showToast('error', 'Checkout thất bại');
      console.error('Checkout error:', error);
    }
  }, [loadBookings, loadSummary, selectedBooking, openBookingDetail, showToast]);

  // Cancel action
  const handleCancel = useCallback(async (bookingId: string) => {
    try {
      await cancelBookingByStaff(bookingId);
      showToast('success', 'Hủy đơn đặt thành công');
      await loadBookings();
      await loadSummary();
      if (selectedBooking?.id === bookingId) {
        await openBookingDetail(bookingId);
      }
    } catch (error) {
      showToast('error', 'Hủy đơn đặt thất bại');
      console.error('Cancel error:', error);
    }
  }, [loadBookings, loadSummary, selectedBooking, openBookingDetail, showToast]);

  // Confirm refund action
  const handleConfirmRefund = useCallback(async (bookingId: string) => {
    try {
      await confirmBookingRefund(bookingId);
      showToast('success', 'Xác nhận hoàn tiền thành công');
      await loadBookings();
      await loadSummary();
      if (selectedBooking?.id === bookingId) {
        await openBookingDetail(bookingId);
      }
    } catch (error) {
      showToast('error', 'Xác nhận hoàn tiền thất bại');
      console.error('Confirm refund error:', error);
    }
  }, [loadBookings, loadSummary, selectedBooking, openBookingDetail, showToast]);

  // Complete payment action
  const handleCompletePayment = useCallback(async (bookingId: string) => {
    try {
      await completePaymentBooking(bookingId);
      showToast('success', 'Thanh toán thành công');
      await loadBookings();
      await loadSummary();
      if (selectedBooking?.id === bookingId) {
        await openBookingDetail(bookingId);
      }
    } catch (error) {
      showToast('error', 'Thanh toán thất bại');
      console.error('Complete payment error:', error);
    }
  }, [loadBookings, loadSummary, selectedBooking, openBookingDetail, showToast]);

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
    handleCompletePayment,
    handleCancel,
    handleConfirmRefund,
    refresh: loadBookings,
    toast,
    showToast,
    patchBooking,
  };
}
