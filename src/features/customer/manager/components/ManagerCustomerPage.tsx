"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader } from '@/src/shared/components/layout/PageHeader';
import { Toast } from '@/src/shared/components/ui/Toast';
import { useToast } from '@/src/shared/hooks/useToast';
import { CustomerFilters } from '../../shared/components/CustomerFilters';
import { CustomerTable } from '../../shared/components/CustomerTable';
import { CustomerPagination } from '../../shared/components/CustomerPagination';
import { CustomerPageLoading } from '../../shared/components/states/CustomerPageLoading';
import { CustomerTableLoading } from '../../shared/components/states/CustomerTableLoading';
import { CustomerEmptyState } from '../../shared/components/states/CustomerEmptyState';
import { CustomerErrorState } from '../../shared/components/states/CustomerErrorState';
import { fetchCustomers } from '@/src/api/customer.api';
import { handleApiError } from '../../shared/utils/error-handling';
import type { CustomerListDto, CustomerListQuery } from '../../types/customer.types';
import { useRouter } from 'next/navigation';

export function ManagerCustomerPage() {
    const router = useRouter();
    const { toast, show: showToast } = useToast();
    const isFirstLoad = useRef(true);
    const [customers, setCustomers] = useState<CustomerListDto[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<CustomerListQuery>({
        page: 1,
        pageSize: 20,
        sortBy: 'createdat',
        sortOrder: 'desc',
    });
    const [pagination, setPagination] = useState({
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
    });

    const loadCustomers = useCallback(async (queryFilters: CustomerListQuery, isInitial = false) => {
        // Only show full page loading on initial load
        if (isInitial) {
            setInitialLoading(true);
        } else {
            setTableLoading(true);
        }
        setError(null);
        try {
            const data = await fetchCustomers(queryFilters);
            setCustomers(data.items);
            setPagination({
                totalItems: data.totalItems,
                totalPages: data.totalPages,
                hasNext: data.hasNext,
                hasPrev: data.hasPrev,
            });
        } catch (err) {
            const errorMessage = handleApiError(err);
            setError(errorMessage);
            showToast('error', errorMessage);
        } finally {
            setInitialLoading(false);
            setTableLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (isFirstLoad.current) {
            loadCustomers(filters, true);
            isFirstLoad.current = false;
        } else {
            loadCustomers(filters, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handleFiltersChange = (newFilters: CustomerListQuery) => {
        setFilters(newFilters);
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handleViewDetails = (customerId: string) => {
        router.push(`/manager/customers/${customerId}`);
    };

    if (initialLoading && customers.length === 0) {
        return <CustomerPageLoading />;
    }

    if (error && customers.length === 0) {
        return (
            <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
                <PageHeader
                    title="Quản lý khách hàng"
                    description="Xem thông tin khách hàng"
                />
                <CustomerErrorState message={error} onRetry={() => loadCustomers(filters)} />
                <Toast toast={toast} />
            </div>
        );
    }

    const hasFilters = !!(filters.searchTerm || filters.status);

    return (
        <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
            <PageHeader
                title="Quản lý khách hàng"
                description="Xem thông tin khách hàng"
            />

            <CustomerFilters filters={filters} onFiltersChange={handleFiltersChange} />

            {tableLoading ? (
                <CustomerTableLoading isOwner={false} rowCount={filters.pageSize || 20} />
            ) : customers.length === 0 ? (
                <CustomerEmptyState hasFilters={hasFilters} />
            ) : (
                <>
                    <CustomerTable
                        customers={customers}
                        onViewDetails={handleViewDetails}
                        isOwner={false}
                    />

                    {pagination.totalPages > 1 && (
                        <CustomerPagination
                            currentPage={filters.page || 1}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.totalItems}
                            pageSize={filters.pageSize || 20}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            )}

            <Toast toast={toast} />
        </div>
    );
}
