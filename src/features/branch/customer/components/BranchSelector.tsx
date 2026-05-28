"use client";

import { MapPin } from "@phosphor-icons/react";
import { Select, Alert } from "@/src/shared/components/ui";
import { Spinner } from "@/src/shared/components/feedback/Spinner";
import { useBranches } from "../hooks/useBranches";

interface BranchSelectorProps {
  value: string;
  onChange: (branchId: string, branchName: string) => void;
  label?: string;
  hideLabel?: boolean;
  className?: string;
}

export function BranchSelector({
  value,
  onChange,
  label = "Chi nhánh",
  hideLabel = false,
  className = ""
}: BranchSelectorProps) {
  const { branches, isLoading, error } = useBranches();

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Spinner size="sm" />
        <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return null; // Silently fail or handled by parent
  }

  const handleChange = (branchId: string) => {
    const branch = branches.find((b) => b.id === branchId);
    if (branch) {
      onChange(branchId, branch.name);
    } else {
      onChange("", "");
    }
  };

  return (
    <div className={`w-full flex flex-col gap-1.5 ${!hideLabel ? '' : 'relative'}`}>
      {!hideLabel && (
        <label className="text-xs font-bold uppercase tracking-wider text-muted">
          <MapPin className="inline h-3.5 w-3.5 mr-1" />
          {label}
        </label>
      )}
      <div className="relative group">
        <MapPin
          className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10 transition-colors duration-200 ${hideLabel ? 'text-muted-foreground/60 group-focus-within:text-primary' : 'hidden'}`}
        />
        <Select
          value={value}
          onChange={handleChange}
          className={`${hideLabel ? 'pl-9 pr-9 !text-[11px] !font-bold !uppercase !tracking-wider' : ''} ${className}`}
        >
          <option value="">{hideLabel ? 'Tất cả chi nhánh' : 'Chọn chi nhánh'}</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
