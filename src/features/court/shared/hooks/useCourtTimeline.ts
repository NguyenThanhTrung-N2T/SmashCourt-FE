import { useState, useCallback, useEffect } from 'react';
import { fetchCourtManagementTimeline } from '@/src/api/court.api';
import type { CourtManagementTimelineDto } from '@/src/features/court/shared/types/court.types';

export function useCourtTimeline(date: string, typeId?: string, enabled = true) {
    const [data, setData] = useState<CourtManagementTimelineDto | null>(null);
    const [loading, setLoading] = useState(false);

    const loadTimeline = useCallback(async () => {
        if (!enabled) return;   // ← guard
        try {
            const result = await fetchCourtManagementTimeline({ date, typeId });
            setData(result);
        } catch (err) {
            console.error('Failed to load timeline', err);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [date, typeId, enabled]);

    useEffect(() => {
        if (!enabled) return;
        setLoading(true); // Only here — date/type changes show skeleton, realtime refresh() calls don't
        loadTimeline();
    }, [loadTimeline, enabled]);

    return { data, loading, refresh: loadTimeline };
}