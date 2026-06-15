/**
 * Booking Schedule Hook
 * 
 * Hook for managing schedule view data.
 */

import { useState, useCallback, useEffect } from 'react';
import { fetchBookingSchedule } from '@/src/api/booking.api';
import type { BookingScheduleCourtDto } from '../types/booking.types';
import type { ScheduleFilters } from '../types/filter.types';
import { DEFAULT_SCHEDULE_FILTERS } from '../types/filter.types';

export function useBookingSchedule(branchId?: string, enabled = true) {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<BookingScheduleCourtDto[]>([]);
  const [scheduleFilters, setScheduleFilters] = useState<ScheduleFilters>(DEFAULT_SCHEDULE_FILTERS);

  const loadSchedule = useCallback(async () => {
    // Don't fetch if not enabled or no branch is selected
    if (!enabled || !branchId || !scheduleFilters.date) {
      setSchedule([]);
      return;
    }

    try {
      const data = await fetchBookingSchedule({
        date: scheduleFilters.date,
        branchId,
      });
      setSchedule(data);
    } catch (error) {
      console.error('Load schedule error:', error);
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  }, [scheduleFilters.date, branchId, enabled]);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true); // Only here — month/year/branch changes show skeleton, direct refresh() calls don't
    loadSchedule();
  }, [loadSchedule, enabled]);

  const setSelectedDate = useCallback((date: string) => {
    setScheduleFilters({ date });
  }, []);

  const goToPreviousDay = useCallback(() => {
    const date = new Date(scheduleFilters.date);
    date.setDate(date.getDate() - 1);
    setScheduleFilters({ date: date.toISOString().split('T')[0] });
  }, [scheduleFilters.date]);

  const goToNextDay = useCallback(() => {
    const date = new Date(scheduleFilters.date);
    date.setDate(date.getDate() + 1);
    setScheduleFilters({ date: date.toISOString().split('T')[0] });
  }, [scheduleFilters.date]);

  return {
    schedule,
    loading,
    selectedDate: scheduleFilters.date,
    setSelectedDate,
    goToPreviousDay,
    goToNextDay,
    refresh: loadSchedule,
    hasBranch: !!branchId,
  };
}
