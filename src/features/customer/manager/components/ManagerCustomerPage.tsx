"use client";

import { PageHeader } from '@/src/shared/components/layout/PageHeader';
import { Toast, Pagination } from '@/src/shared/components/ui';
import { CustomerFilters } from '@/src/features/customer/shared/components/CustomerFilters';
import { CustomerTable } from '@/src/features/customer/shared/components/CustomerTable';
import { CustomerPageLoading, CustomerTableLoading, CustomerEmptyState, CustomerErrorState } from '@/src/features/customer/shared/states';
import { useManagerCustomer } from '@/src/features/customer/manager/hooks/useManagerCustomer';

export function ManagerCustomerPage() {
    const {
        toast,
        customers,
        initialLoading,
        tableLoading,
        error,
        filters,
        pagination,
        loadCustomers,
        handleFiltersChange,
        handlePageChange,
        handleViewDetails,
    } = useManagerCustomer();

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

                    <Pagination
                        currentPage={filters.page || 1}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalItems}
                        pageSize={filters.pageSize || 20}
                        onPageChange={handlePageChange}
                        itemLabel="khách hàng"
                    />
                </>
            )}

            <Toast toast={toast} />
        </div>
    );
}
