/**
 * Court Status Utilities
 * 
 * Helper functions for court status display and logic.
 */

import { CourtStatus } from "../../shared/types/court.types";

export interface StatusConfig {
  label: string;
  variant: "success" | "warning" | "error" | "info" | "neutral";
  icon?: string;
}

export function getCourtStatusConfig(status: CourtStatus): StatusConfig {
  switch (status) {
    case CourtStatus.AVAILABLE:
      return { label: "Có sẵn", variant: "success", icon: "✓" };
    case CourtStatus.IN_USE:
      return { label: "Đang sử dụng", variant: "info", icon: "⏱" };
    case CourtStatus.LOCKED:
      return { label: "Đã khóa", variant: "error", icon: "🔒" };
    case CourtStatus.SUSPENDED:
      return { label: "Tạm ngưng", variant: "warning", icon: "⏸" };
    case CourtStatus.INACTIVE:
      return { label: "Đã xóa", variant: "neutral", icon: "🗑" };
    default:
      return { label: "Không xác định", variant: "neutral" };
  }
}

export function isCourtAvailable(status: CourtStatus): boolean {
  return status === CourtStatus.AVAILABLE;
}

export function canBookCourt(status: CourtStatus): boolean {
  return status === CourtStatus.AVAILABLE;
}
