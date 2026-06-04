"use client";

import { useCustomerBase } from "../shared/hooks/useCustomerBase";
import { CustomerTable } from "../shared/components/CustomerTable";
import { CustomerFilters } from "../shared/components/CustomerFilters";
import {
    CustomerEmptyState,
    CustomerErrorState,
    CustomerPageLoading
} from "../shared/states";
import { Pagination } from "@/src/shared/components/ui/Pagination";
import { Users } from "@phosphor-icons/react";

export function StaffCustomersPage() {
    const {
        customers,
        initialLoading,
        tableLoading,
        error,
        filters,
        pagination,
        handleFiltersChange,
        handlePageChange,
        refreshCustomers,
    } = useCustomerBase("staff");

    if (initialLoading) {
        return <CustomerPageLoading />;
    }

    if (error) {
        return <CustomerErrorState message={error} onRetry={refreshCustomers} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Users weight="bold" className="h-6 w-6" />
                        </div>
                        Quản lý khách hàng
                    </h1>
                    <p className="mt-1 text-muted">
                        Xem danh sách và tìm kiếm thông tin khách hàng
                    </p>
                </div>
            </div>

            {/* Filters */}
            <CustomerFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
            />

            {/* Table or Empty State */}
            {customers.length > 0 ? (
                <div className="space-y-4">
                    <div className={tableLoading ? "opacity-50 pointer-events-none transition-opacity" : ""}>
                        <CustomerTable
                            customers={customers}
                            onViewDetails={() => { }} // No actions
                            isOwner={false}
                        />
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center pt-4">
                            <Pagination
                                currentPage={filters.page || 1}
                                totalPages={pagination.totalPages}
                                totalItems={pagination.totalItems}
                                pageSize={filters.pageSize || 20}
                                onPageChange={handlePageChange}
                                itemLabel="khách hàng"
                            />
                        </div>
                    )}
                </div>
            ) : (
                <CustomerEmptyState />
            )}
        </div>
    );
}
