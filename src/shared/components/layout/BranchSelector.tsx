import { Storefront } from '@phosphor-icons/react';
import { IconContainer } from '../ui/IconContainer';
import { Select } from '../ui/Select';

interface Branch {
  id: string;
  name: string;
  status?: string;
}

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranchId: string;
  onBranchChange: (branchId: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function BranchSelector({
  branches,
  selectedBranchId,
  onBranchChange,
  label = 'Chi nhánh đang quản lý',
  placeholder = '-- Chọn chi nhánh --',
  className = '',
}: BranchSelectorProps) {
  return (
    <div className={`flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm ${className}`}>
      <IconContainer variant="secondary">
        <Storefront className="h-5 w-5 text-slate-500" />
      </IconContainer>
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <div className="mt-1">
          <Select
            value={selectedBranchId}
            onChange={onBranchChange}
            placeholder={placeholder}
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name} {branch.status === "SUSPENDED" ? "(Tạm khóa)" : ""}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
