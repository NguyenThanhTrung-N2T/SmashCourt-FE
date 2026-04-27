"use client";

import { useState, useEffect } from "react";
import { BranchManagementView } from "@/src/modules/branch-management/components/BranchManagementView";
import { fetchBranches } from "@/src/api/branch.api";
import type { BranchDto } from "@/src/shared/types/branch.types";
import { Storefront, CaretDown } from "@phosphor-icons/react";

export default function BranchesPage() {
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadBranches = async () => {
    try {
      const data = await fetchBranches(1, 50);
      setBranches(data.items);
      if (data.items.length > 0 && !selectedBranchId) {
        setSelectedBranchId(data.items[0].id);
      }
    } catch (error) {
      console.error("Failed to load branches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B5E38]"></div>
        </div>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Storefront className="h-16 w-16 text-slate-300 mb-4" />
          <p className="text-lg font-bold text-slate-700">Chưa có chi nhánh</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Vui lòng tạo chi nhánh trước khi quản lý
          </p>
        </div>
      </div>
    );
  }

  if (!selectedBranchId) {
    return (
      <div className="space-y-6 animate-slide-up w-full px-8 pt-6 pb-10">
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <Storefront className="h-5 w-5 text-slate-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Chọn chi nhánh
            </p>
            <div className="relative mt-1">
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 pr-10 text-sm font-bold text-slate-700 outline-none transition-colors hover:border-[#1B5E38] focus:border-[#1B5E38] focus:bg-white focus:ring-2 focus:ring-[#1B5E38]/20"
              >
                <option value="" disabled>
                  -- Chọn chi nhánh --
                </option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.status === "SUSPENDED" ? "(Tạm khóa)" : ""}
                  </option>
                ))}
              </select>
              <CaretDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BranchManagementView 
      key={selectedBranchId} 
      branchId={selectedBranchId}
      branches={branches}
      selectedBranchId={selectedBranchId}
      onBranchChange={setSelectedBranchId}
      onBranchCreated={loadBranches}
    />
  );
}

