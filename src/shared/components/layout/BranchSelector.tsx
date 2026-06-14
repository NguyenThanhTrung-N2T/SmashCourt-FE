import { Select } from '../ui/Select';

interface Branch {
  id: string;
  name: string;
  status?: 0 | 1 | 2;
}

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranchId: string;
  onBranchChange: (branchId: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  showCard?: boolean;
}

export function BranchSelector({
  branches,
  selectedBranchId,
  onBranchChange,
  label = 'Chi nhánh đang quản lý',
  placeholder = '-- Chọn chi nhánh --',
  className = '',
  showCard = true,
}: BranchSelectorProps) {
  const cardClasses = showCard
    ? 'bg-surface-1 p-4 rounded-2xl border border-border shadow-sm'
    : '';

  return (
    <div className={`flex items-center gap-3 ${cardClasses} ${className}`}>

      <div className="flex-1">
        <p className="text-xs font-bold text-muted uppercase tracking-wide">
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
                {branch.name} {branch.status === 1 ? "(Tạm khóa)" : ""}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
