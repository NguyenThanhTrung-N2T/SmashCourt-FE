"use client";

import { useState } from 'react';
import { Info, UserCircle, Users, CourtBasketball, Plus, CheckCircle, Warning } from '@phosphor-icons/react';
import { BranchInfoTab } from './tabs/BranchInfoTab';
import { BranchManagerTab } from './tabs/BranchManagerTab';
import { BranchStaffTab } from './tabs/BranchStaffTab';
import { BranchCourtTypesTab } from './tabs/BranchCourtTypesTab';
import { AddBranchModal } from './modals/AddBranchModal';
import type { BranchDto, CreateBranchDto } from '@/src/shared/types/branch.types';
import { createBranch } from '@/src/api/branch.api';
import { handleApiError } from '../utils/error-handling';
import { useToast } from '@/src/shared/hooks/useToast';
import { PageHeader } from '@/src/shared/components/layout/PageHeader';
import { BranchSelector } from '@/src/shared/components/layout/BranchSelector';
import { Button } from '@/src/shared/components/ui/Button';

type TabId = 'info' | 'manager' | 'staff' | 'courts';

interface BranchManagementViewProps {
  branchId: string;
  branches: BranchDto[];
  selectedBranchId: string;
  onBranchChange: (branchId: string) => void;
  onBranchCreated?: () => void;
}

export function BranchManagementView({ 
  branchId, 
  branches, 
  selectedBranchId, 
  onBranchChange,
  onBranchCreated
}: BranchManagementViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast, show: showToast } = useToast();

  const tabs = [
    { id: 'info' as TabId, label: 'Thông tin chi nhánh', icon: Info },
    { id: 'manager' as TabId, label: 'Quản lý chi nhánh', icon: UserCircle },
    { id: 'staff' as TabId, label: 'Nhân viên', icon: Users },
    { id: 'courts' as TabId, label: 'Loại sân', icon: CourtBasketball },
  ];

  const handleAddBranch = () => {
    setShowAddModal(true);
  };

  const handleCreateBranch = async (data: CreateBranchDto) => {
    try {
      await createBranch(data);
      showToast('success', 'Tạo chi nhánh thành công');
      setShowAddModal(false);
      onBranchCreated?.();
    } catch (err) {
      const message = handleApiError(err);
      showToast('error', message);
      throw err; // Re-throw to let modal handle loading state
    }
  };

  return (
    <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
      {/* Page Header */}
      <PageHeader
        title="Quản lý chi nhánh"
        description="Quản lý thông tin, nhân viên và cấu hình chi nhánh"
        action={
          <Button onClick={handleAddBranch}>
            <Plus className="h-4 w-4" />
            Thêm chi nhánh
          </Button>
        }
      />

      {/* Branch Selector */}
      <BranchSelector
        branches={branches}
        selectedBranchId={selectedBranchId}
        onBranchChange={onBranchChange}
      />

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#1B5E38] text-[#1B5E38]'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'info' && <BranchInfoTab branchId={branchId} />}
        {activeTab === 'manager' && <BranchManagerTab branchId={branchId} />}
        {activeTab === 'staff' && <BranchStaffTab branchId={branchId} />}
        {activeTab === 'courts' && <BranchCourtTypesTab branchId={branchId} />}
      </div>

      {/* Add Branch Modal */}
      {showAddModal && (
        <AddBranchModal
          onClose={() => setShowAddModal(false)}
          onSave={handleCreateBranch}
        />
      )}

      {/* Toast Notification */}
      <div
        className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${
          toast.visible
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-5 py-4 shadow-2xl ${
            toast.tone === "success" ? "border-emerald-300" : "border-red-300"
          }`}
        >
          {toast.tone === "success" ? (
            <CheckCircle className="h-6 w-6 text-emerald-500" />
          ) : (
            <Warning className="h-6 w-6 text-red-500" />
          )}
          <p className={`font-bold ${toast.tone === "success" ? "text-emerald-800" : "text-red-800"}`}>
            {toast.message}
          </p>
        </div>
      </div>
    </div>
  );
}
