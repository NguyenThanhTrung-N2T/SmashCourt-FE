/**
 * Booking Branch Selector
 * 
 * Branch selector with "All Branches" option for booking management.
 */

import { Storefront } from '@phosphor-icons/react';
import { IconContainer, Select } from '@/src/shared/components/ui';

interface Branch {
  id: string;
  name: string;
  status?: 0 | 1 | 2;
}

interface BookingBranchSelectorProps {
  branches: Branch[];
  selectedBranchId?: string;
  onBranchChange: (branchId?: string) => void;
  label?: string;
  placeholder?: string;
  showAllOption?: boolean;
  className?: string;
}

export function BookingBranchSelector({
  branches,
  selectedBranchId,
  onBranchChange,
  label = 'Branch',
  placeholder = '-- Chọn chi nhánh --',
  showAllOption = true,
  className = '',
}: BookingBranchSelectorProps) {
  const handleChange = (value: string) => {
    // If empty string or "all", pass undefined to show all branches
    if (value === '' || value === 'all') {
      onBranchChange(undefined);
    } else {
      onBranchChange(value);
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <IconContainer variant="secondary">
        <Storefront className="h-5 w-5 text-slate-500 dark:text-slate-400" />
      </IconContainer>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
          {label}
        </p>
        <div>
          <Select
            value={selectedBranchId || 'all'}
            onChange={handleChange}
            placeholder={placeholder}
          >
            {showAllOption && (
              <option value="all">Tất cả chi nhánh</option>
            )}
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name} {branch.status === 1 ? "(Suspended)" : ""}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
