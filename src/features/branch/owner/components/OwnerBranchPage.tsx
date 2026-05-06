"use client";

import { useState, useEffect, useCallback } from 'react';
import { Info, UserCircle, Users, CourtBasketball, Plus } from '@phosphor-icons/react';
import { BranchInfoTab } from './tabs/BranchInfoTab';
import { BranchManagerTab } from './tabs/BranchManagerTab';
import { BranchStaffTab } from './tabs/BranchStaffTab';
import { BranchCourtTypesTab } from './tabs/BranchCourtTypesTab';
import { AddBranchModal } from './dialogs/AddBranchModal';
import { BranchPageLoading } from './states/BranchPageLoading';
import { BranchEmptyState } from './states/BranchEmptyState';
import type { BranchDto, CreateBranchDto } from '@/src/features/branch/types/branch.types';
import { fetchBranches, createBranch } from '@/src/api/branch.api';
import { handleApiError } from '../utils/error-handling';
import { useToast } from '@/src/shared/hooks/useToast';
import { PageHeader } from '@/src/shared/components/layout/PageHeader';
import { BranchSelector } from '@/src/shared/components/layout/BranchSelector';
import { BranchTabNav } from './layout/BranchTabNav';
import { Button } from '@/src/shared/components/ui/Button';
import { Toast } from '@/src/shared/components/ui/Toast';

type TabId = 'info' | 'manager' | 'staff' | 'courts';

const TABS = [
    { id: 'info' as TabId, label: 'Thông tin chi nhánh', icon: Info },
    { id: 'manager' as TabId, label: 'Quản lý chi nhánh', icon: UserCircle },
    { id: 'staff' as TabId, label: 'Nhân viên', icon: Users },
    { id: 'courts' as TabId, label: 'Loại sân', icon: CourtBasketball },
];

export function OwnerBranchPage() {
    const [branches, setBranches] = useState<BranchDto[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabId>('info');
    const [showAddModal, setShowAddModal] = useState(false);
    const { toast, show: showToast } = useToast();

    const loadBranches = useCallback(async () => {
        try {
            const data = await fetchBranches(1, 50);
            setBranches(data.items);
            setSelectedBranchId((prev) => {
                if (prev && data.items.some((b) => b.id === prev)) return prev;
                return data.items[0]?.id ?? '';
            });
        } catch (err) {
            showToast('error', handleApiError(err));
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadBranches();
    }, [loadBranches]);

    const handleCreateBranch = async (data: CreateBranchDto) => {
        try {
            await createBranch(data);
            showToast('success', 'Tạo chi nhánh thành công');
            setShowAddModal(false);
            await loadBranches();
        } catch (err) {
            showToast('error', handleApiError(err));
            throw err;
        }
    };

    if (loading) {
        return <BranchPageLoading />;
    }

    const addBranchButton = (
        <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            Thêm chi nhánh
        </Button>
    );

    return (
        <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
            <PageHeader
                title="Quản lý chi nhánh"
                description="Quản lý thông tin, nhân viên và cấu hình chi nhánh"
                action={addBranchButton}
            />

            {branches.length === 0 ? (
                <BranchEmptyState action={addBranchButton} />
            ) : (
                <>
                    <BranchSelector
                        branches={branches}
                        selectedBranchId={selectedBranchId}
                        onBranchChange={setSelectedBranchId}
                    />

                    <BranchTabNav
                        tabs={TABS}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    <div className="min-h-[400px]">
                        {activeTab === 'info' && <BranchInfoTab branchId={selectedBranchId} />}
                        {activeTab === 'manager' && <BranchManagerTab branchId={selectedBranchId} onToast={showToast} />}
                        {activeTab === 'staff' && <BranchStaffTab branchId={selectedBranchId} onToast={showToast} />}
                        {activeTab === 'courts' && <BranchCourtTypesTab branchId={selectedBranchId} onToast={showToast} />}
                    </div>
                </>
            )}

            {showAddModal && (
                <AddBranchModal
                    onClose={() => setShowAddModal(false)}
                    onSave={handleCreateBranch}
                />
            )}

            <Toast toast={toast} />
        </div>
    );
}
