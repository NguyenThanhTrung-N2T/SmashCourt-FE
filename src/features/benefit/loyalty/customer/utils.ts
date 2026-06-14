/**
 * Loyalty Utilities
 * 
 * Helper functions for loyalty data formatting and display.
 */

/**
 * Format points with Vietnamese number formatting
 * @example formatPoints(12500) => "12.500"
 */
export function formatPoints(points: number): string {
  return new Intl.NumberFormat("vi-VN").format(points);
}

/**
 * Format discount rate for display
 * @example formatDiscountRate(5.5) => "5.5%"
 */
export function formatDiscountRate(rate: number): string {
  return `${rate}%`;
}

/**
 * Get transaction type label in Vietnamese
 */
export function getTransactionTypeLabel(type: "EARN" | "DEDUCT"): string {
  return type === "EARN" ? "Tích điểm" : "Trừ điểm";
}
