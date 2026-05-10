/**
 * BranchSelector Component
 * 
 * Component for selecting a branch.
 */

"use client";

import { MapPin } from "@phosphor-icons/react";
import { Select } from "@/src/shared/components/ui/Select";
import { Spinner } from "@/src/shared/components/feedback/Spinner";
import { Alert } from "@/src/shared/components/ui/Alert";
import { useBranches } from "../hooks/useBranches";

interface BranchSelectorProps {
  value: string;
  onChange: (branchId: string, branchName: string) => void;
  label?: string;
}

export function BranchSelector({ value, onChange, label = "Chi nhánh" }: BranchSelectorProps) {
  const { branches, isLoading, error } = useBranches();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Spinner size="sm" />
        <span className="text-sm text-muted">Đang tải chi nhánh...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Lỗi">
        {error}
      </Alert>
    );
  }

  const handleChange = (branchId: string) => {
    const branch = branches.find((b) => b.id === branchId);
    if (branch) {
      onChange(branchId, branch.name);
    }
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-muted">
        <MapPin className="inline h-3.5 w-3.5 mr-1" />
        {label}
      </label>
      <Select value={value} onChange={handleChange}>
        <option value="">Chọn chi nhánh</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name} - {branch.address}
          </option>
        ))}
      </Select>
    </div>
  );
}
