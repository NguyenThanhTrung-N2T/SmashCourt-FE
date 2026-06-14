import { BranchServiceStatus } from "../../shared/types/service.types";

export function isEnabled(status: BranchServiceStatus): boolean {
    return status === BranchServiceStatus.ENABLED;
}

export function formatCurrency(value: number): string {
    return value.toLocaleString("vi-VN");
}