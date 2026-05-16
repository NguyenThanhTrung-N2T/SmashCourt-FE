"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader } from '@/src/shared/components/layout/PageHeader';
import { Toast } from '@/src/shared/components/ui/Toast';
import { useToast } from '@/src/shared/hooks/useToast';
import { CustomerFilters } from '../../shared/components/CustomerFilters';
import { CustomerTable } from '../../shared/components/CustomerTable';
import { CustomerPagination } from '../../shared/components/CustomerPagination';
import {
    CustomerPageLoading,
    CustomerTableLoading,
    CustomerEmptyState,
    CustomerErrorState
} from '../../shared/components/states';
import { LockCustomerModal } from './dialogs/LockCustomerModal';
import { UnlockCustomerModal } from './dialogs/UnlockCustomerModal';
import { fetchCustomers, lockCustomer, unlockCustomer } from '@/src/api/customer.api';
import { fetchBranches } from '@/src/api/branch.api';
import { fetchAllLoyaltyTiers } from '@/src/api/loyalty-tier.api';
import { handleApiError } from '../../shared/utils/error-handling';
import type { CustomerListDto, CustomerListQuery } from '../../types/customer.types';
import { useRouter } from 'next/navigation';

export function OwnerCustomerPage() {
    const router = useRouter();
    const { toast, show: showToast } = useToast();
    const isFirstLoad = useRef(true);
    const [customers, setCustomers] = useState<CustomerListDto[]>([]);
    const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
    const [loyaltyTiers, setLoyaltyTiers] = useState<Array<{ id: string; name: string }>>([]);
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

    // Lock/Unlock modals
    const [lockModal, setLockModal] = useState<{ customerId: string; customerName: string } | null>(null);
    const [unlockModal, setUnlockModal] = useState<{ customerId: string; customerName: string; lockReason?: string } | null>(null);

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

    // Load branches and loyalty tiers on mount
    useEffect(() => {
        const loadFilterData = async () => {
            try {
                const [branchesData, tiersData] = await Promise.all([
                    fetchBranches(1, 50), // Get first 50 branches
                    fetchAllLoyaltyTiers()
                ]);
                
                setBranches(branchesData.items.map(b => ({ id: b.id, name: b.name })));
                setLoyaltyTiers(tiersData.map(t => ({ id: t.id, name: t.name })));
            } catch (err) {
                console.error('Failed to load filter data:', err);
                // Don't show error toast for filter data, just log it
            }
        };

        loadFilterData();
    }, []);

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
        router.push(`/owner/customers/${customerId}`);
    };

    const handleLockCustomer = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            setLockModal({ customerId, customerName: customer.fullName });
        }
    };

    const handleUnlockCustomer = (customerId: string) => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            setUnlockModal({
                customerId,
                customerName: customer.fullName,
                lockReason: undefined, // We don't have lock reason in list view
            });
        }
    };

    const confirmLockCustomer = async (data: { reason: string }) => {
        if (!lockModal) return;

        try {
            await lockCustomer(lockModal.customerId, data);
            showToast('success', 'Đã khóa tài khoản khách hàng');
            setLockModal(null);
            await loadCustomers(filters);
        } catch (err) {
            showToast('error', handleApiError(err));
            throw err;
        }
    };

    const confirmUnlockCustomer = async () => {
        if (!unlockModal) return;

        try {
            await unlockCustomer(unlockModal.customerId);
            showToast('success', 'Đã mở khóa tài khoản khách hàng');
            setUnlockModal(null);
            await loadCustomers(filters);
        } catch (err) {
            showToast('error', handleApiError(err));
            throw err;
        }
    };

    if (initialLoading && customers.length === 0) {
        return <CustomerPageLoading />;
    }

    if (error && customers.length === 0) {
        return (
            <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
                <PageHeader
                    title="Quản lý khách hàng"
                    description="Xem và quản lý thông tin khách hàng"
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
                description="Xem và quản lý thông tin khách hàng"
            />

            <CustomerFilters 
                filters={filters} 
                onFiltersChange={handleFiltersChange}
                branches={branches}
                loyaltyTiers={loyaltyTiers}
            />

            {tableLoading ? (
                <CustomerTableLoading isOwner={true} rowCount={filters.pageSize || 20} />
            ) : customers.length === 0 ? (
                <CustomerEmptyState hasFilters={hasFilters} />
            ) : (
                <>
                    <CustomerTable
                        customers={customers}
                        onViewDetails={handleViewDetails}
                        onLockCustomer={handleLockCustomer}
                        onUnlockCustomer={handleUnlockCustomer}
                        isOwner={true}
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

            {lockModal && (
                <LockCustomerModal
                    customerName={lockModal.customerName}
                    onClose={() => setLockModal(null)}
                    onConfirm={confirmLockCustomer}
                />
            )}

            {unlockModal && (
                <UnlockCustomerModal
                    customerName={unlockModal.customerName}
                    lockReason={unlockModal.lockReason}
                    onClose={() => setUnlockModal(null)}
                    onConfirm={confirmUnlockCustomer}
                />
            )}

            <Toast toast={toast} />
        </div>
    );
}
