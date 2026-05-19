/**
 * Booking Calendar Hook
 * 
 * Hook for managing calendar heatmap view data.
 */

import { useState, useCallback, useEffect } from 'react';
import { fetchBookingCalendarHeatmap } from '@/src/api/booking.api';
import type { BookingCalendarHeatmapDto } from '../../types/booking.types';
import type { CalendarFilters } from '../../types/filter.types';
import { DEFAULT_CALENDAR_FILTERS } from '../../types/filter.types';

export function useBookingCalendar(branchId?: string, enabled = true) {
  const [loading, setLoading] = useState(false);
  const [heatmapData, setHeatmapData] = useState<BookingCalendarHeatmapDto[]>([]);
  const [calendarFilters, setCalendarFilters] = useState<CalendarFilters>(DEFAULT_CALENDAR_FILTERS);

  const loadHeatmap = useCallback(async () => {
    if (!enabled) return;
    
    setLoading(true);
    try {
      const data = await fetchBookingCalendarHeatmap({
        year: calendarFilters.year,
        month: calendarFilters.month,
        branchId,
      });
      setHeatmapData(data);
    } catch (error) {
      console.error('Load heatmap error:', error);
      setHeatmapData([]);
    } finally {
      setLoading(false);
    }
  }, [calendarFilters.year, calendarFilters.month, branchId, enabled]);

  useEffect(() => {
    if (enabled) {
      loadHeatmap();
    }
  }, [loadHeatmap, enabled]);

  const goToPreviousMonth = useCallback(() => {
    setCalendarFilters((prev) => {
      if (prev.month === 1) {
        return { year: prev.year - 1, month: 12 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCalendarFilters((prev) => {
      if (prev.month === 12) {
        return { year: prev.year + 1, month: 1 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  }, []);

  const setSelectedYear = useCallback((year: number) => {
    setCalendarFilters((prev) => ({ ...prev, year }));
  }, []);

  const setSelectedMonth = useCallback((month: number) => {
    setCalendarFilters((prev) => ({ ...prev, month }));
  }, []);

  return {
    heatmapData,
    loading,
    selectedYear: calendarFilters.year,
    selectedMonth: calendarFilters.month,
    setSelectedYear,
    setSelectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    refresh: loadHeatmap,
  };
}
