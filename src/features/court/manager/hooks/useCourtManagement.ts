"use client";

/**
 * useCourtManagement Hook
 *
 * Manages court management dashboard state: data fetching, filtering,
 * court mutations (suspend/activate/delete), and drawer state.
 * Supports split API (Stats + Paginated Courts) and Date scoping.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
    fetchCourtManagementStats,
    fetchCourtManagementCourts,
    suspendCourt,
    activateCourt,
    deleteCourt,
} from "@/src/api/court.api";
import { useToast } from "@/src/shared/hooks/useToast";
import { useDebounce } from "@/src/shared/hooks/useDebounceSearch";
import type {
    CourtManagementCardDto,
    CourtManagementDashboardStats,
    PagedResult,
} from "@/src/features/court/shared/types/court.types";

export function useCourtManagement() {
    const [stats, setStats] = useState<CourtManagementDashboardStats | null>(null);
    const [courtsPaged, setCourtsPaged] = useState<PagedResult<CourtManagementCardDto> | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingCourts, setLoadingCourts] = useState(true);

    // Filters & Pagination
    const [date, setDateState] = useState<string>(new Date().toISOString().split("T")[0]);
    const [search, setSearchState] = useState("");
    const [typeId, setTypeIdState] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 12;

    const { debouncedValue: debouncedSearch } = useDebounce(search, 300);

    const setDate = useCallback((nextDate: string) => {
        setDateState(nextDate);
        setPage(1);
    }, []);

    const setSearch = useCallback((nextSearch: string) => {
        setSearchState(nextSearch);
        setPage(1);
    }, []);

    const setTypeId = useCallback((nextTypeId: string) => {
        setTypeIdState(nextTypeId);
        setPage(1);
    }, []);

    // Drawer & Modals
    const [drawerCourtId, setDrawerCourtId] = useState<string | null>(null);
    const drawerOpen = drawerCourtId !== null;

    const [bookingDetailId, setBookingDetailId] = useState<string | null>(null);
    const [newBookingData, setNewBookingData] = useState<{ courtId: string; courtName: string; startTime: string } | null>(null);

    // Confirm dialog
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", onConfirm: () => { } });

    const { toast, show: showToast } = useToast();

    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // ── Data Fetching ───────────────────────────────────────────────────────────
    const loadStats = useCallback(async (isPolling = false) => {
        if (!isPolling) setLoadingStats(true);
        try {
            const data = await fetchCourtManagementStats({ date });
            if (isMounted.current) setStats(data);
        } catch {
            if (isMounted.current && !isPolling) showToast("error", "Không thể tải thống kê sân");
        } finally {
            if (isMounted.current) setLoadingStats(false);
        }
    }, [date, showToast]);

    const loadCourts = useCallback(async () => {
        setLoadingCourts(true);
        try {
            const data = await fetchCourtManagementCourts({
                date,
                search: debouncedSearch || undefined,
                typeId: typeId || undefined,
                page,
                pageSize,
            });
            if (isMounted.current) setCourtsPaged(data);
        } catch {
            if (isMounted.current) showToast("error", "Không thể tải danh sách sân");
        } finally {
            if (isMounted.current) setLoadingCourts(false);
        }
    }, [date, debouncedSearch, typeId, page, showToast]);

    // Initial load and filter/page change
    useEffect(() => {
        loadStats();
    }, [loadStats]);

    useEffect(() => {
        loadCourts();
    }, [loadCourts]);

    // Polling for stats every 30s only if date is today
    useEffect(() => {
        const isToday = date === new Date().toISOString().split("T")[0];
        if (!isToday) return;

        const interval = setInterval(() => {
            loadStats(true);
        }, 30000);

        return () => clearInterval(interval);
    }, [date, loadStats]);

    const refresh = useCallback(() => {
        loadStats();
        loadCourts();
    }, [loadStats, loadCourts]);

    // ── Mutations ──────────────────────────────────────────────────────────────

    const handleSuspend = useCallback((courtId: string, courtName: string) => {
        setConfirmDialog({
            isOpen: true,
            title: "Tạm ngưng sân",
            message: `Bạn có chắc muốn tạm ngưng "${courtName}"?`,
            onConfirm: async () => {
                setConfirmDialog((p) => ({ ...p, isOpen: false }));
                try {
                    await suspendCourt(courtId);
                    showToast("success", "Đã tạm ngưng sân");
                    refresh();
                } catch {
                    showToast("error", "Không thể tạm ngưng sân");
                }
            },
        });
    }, [refresh, showToast]);

    const handleActivate = useCallback((courtId: string, courtName: string) => {
        setConfirmDialog({
            isOpen: true,
            title: "Kích hoạt sân",
            message: `Bạn có chắc muốn kích hoạt "${courtName}"?`,
            onConfirm: async () => {
                setConfirmDialog((p) => ({ ...p, isOpen: false }));
                try {
                    await activateCourt(courtId);
                    showToast("success", "Đã kích hoạt sân");
                    refresh();
                } catch {
                    showToast("error", "Không thể kích hoạt sân");
                }
            },
        });
    }, [refresh, showToast]);

    const handleDelete = useCallback((courtId: string, courtName: string) => {
        setConfirmDialog({
            isOpen: true,
            title: "Xóa sân",
            message: `Bạn có chắc muốn xóa "${courtName}"? Hành động này không thể hoàn tác.`,
            onConfirm: async () => {
                setConfirmDialog((p) => ({ ...p, isOpen: false }));
                try {
                    await deleteCourt(courtId);
                    showToast("success", "Đã xóa sân");
                    refresh();
                } catch {
                    showToast("error", "Không thể xóa sân");
                }
            },
        });
    }, [refresh, showToast]);

    const closeConfirmDialog = useCallback(() => {
        setConfirmDialog((p) => ({ ...p, isOpen: false }));
    }, []);

    // ── Drawer ─────────────────────────────────────────────────────────────────

    const openDrawer = useCallback((courtId: string) => {
        setDrawerCourtId(courtId);
    }, []);

    const closeDrawer = useCallback(() => {
        setDrawerCourtId(null);
    }, []);

    return {
        // Data
        stats,
        courtsPaged,
        loading: loadingStats || loadingCourts,
        loadingStats,
        loadingCourts,
        // State
        date,
        setDate,
        search,
        setSearch,
        typeId,
        setTypeId,
        page,
        setPage,
        refresh,
        // Mutations
        handleSuspend,
        handleActivate,
        handleDelete,
        // Confirm dialog
        confirmDialog,
        setConfirmDialog,
        closeConfirmDialog,
        // Drawer
        drawerOpen,
        drawerCourtId,
        openDrawer,
        closeDrawer,
        // Booking Modals
        bookingDetailId,
        setBookingDetailId,
        // Toast
        toast,
        showToast,
    };
}
