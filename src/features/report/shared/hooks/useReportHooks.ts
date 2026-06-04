import { useState, useEffect, useCallback } from 'react';
import {
    ReportFilterDto,
    RevenueReportDto,
    BookingReportDto,
    CourtUtilizationReportDto,
    CustomerStatisticsReportDto,
    TopSpendersReportDto,
    ServicePerformanceReportDto,
    PromotionEffectivenessReportDto
} from '../report.types';
import * as reportApi from '@/src/api/report.api';

interface UseReportResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

function useGenericReport<T>(
    fetchFn: (filter: ReportFilterDto) => Promise<T>,
    filter: ReportFilterDto
): UseReportResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFn(filter);
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch report data');
        } finally {
            setLoading(false);
        }
    }, [fetchFn, filter.fromDate, filter.toDate, filter.branchId, filter.groupBy]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

export function useRevenueReport(filter: ReportFilterDto) {
    return useGenericReport<RevenueReportDto>(reportApi.fetchRevenueReport, filter);
}

export function useBookingReport(filter: ReportFilterDto) {
    return useGenericReport<BookingReportDto>(reportApi.fetchBookingReport, filter);
}

export function useCourtUtilizationReport(filter: ReportFilterDto) {
    return useGenericReport<CourtUtilizationReportDto>(reportApi.fetchCourtUtilizationReport, filter);
}

export function useCustomerStatisticsReport(filter: ReportFilterDto) {
    return useGenericReport<CustomerStatisticsReportDto>(reportApi.fetchCustomerStatisticsReport, filter);
}

export function useTopSpendersReport(filter: ReportFilterDto & { page?: number; pageSize?: number }) {
    const [data, setData] = useState<TopSpendersReportDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await reportApi.fetchTopSpendersReport(filter);
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch report data');
        } finally {
            setLoading(false);
        }
    }, [filter.fromDate, filter.toDate, filter.branchId, filter.groupBy, filter.page, filter.pageSize]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

export function useServicePerformanceReport(filter: ReportFilterDto) {
    return useGenericReport<ServicePerformanceReportDto>(reportApi.fetchServicePerformanceReport, filter);
}

export function usePromotionEffectivenessReport(filter: ReportFilterDto) {
    return useGenericReport<PromotionEffectivenessReportDto>(reportApi.fetchPromotionEffectivenessReport, filter);
}
