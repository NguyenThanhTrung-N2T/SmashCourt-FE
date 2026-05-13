import { authProtectedFetch } from "@/src/api/auth.api";
import type { PaginatedData } from "@/src/shared/types/api.types";

import type {
  Promotion,
  SavePromotionRequest,
} from "@/src/shared/types/promotion.types";
import { DiscountType } from "@/src/shared/types/promotion.types";

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /api/promotions
 * Lấy danh sách tất cả khuyến mãi (không bao gồm DELETED)
 */
export async function fetchAllPromotions(page = 1, pageSize = 12): Promise<PaginatedData<Promotion>> {
  const response = await authProtectedFetch<PaginatedData<Promotion>>(
    `/api/promotions?page=${page}&pageSize=${pageSize}`,
    { method: "GET" },
  );
  if (!response.data) {
    return {
      items: [],
      page,
      pageSize,
      totalItems: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    };
  }
  return response.data;
}

/**
 * GET /api/promotions/active
 * Lấy danh sách khuyến mãi đang hoạt động (ACTIVE)
 */
export async function fetchActivePromotions(): Promise<Promotion[]> {
  const response = await authProtectedFetch<Promotion[]>(
    `/api/promotions/active`,
    { method: "GET" },
  );
  if (!response.data) {
    return [];
  }
  return response.data;
}

/**
 * GET /api/promotions/:id
 * Lấy chi tiết 1 khuyến mãi
 */
export async function fetchPromotionById(
  id: string,
): Promise<Promotion> {
  const response = await authProtectedFetch<Promotion>(
    `/api/promotions/${id}`,
    { method: "GET" },
  );
  if (!response.data) {
    throw new Error("Không tìm thấy khuyến mãi");
  }
  return response.data;
}

/**
 * POST /api/promotions
 * Tạo khuyến mãi mới (chỉ OWNER)
 */
export async function createPromotion(
  dto: SavePromotionRequest,
): Promise<Promotion> {
  const response = await authProtectedFetch<Promotion>(
    "/api/promotions",
    { method: "POST", body: dto },
  );
  if (!response.data) {
    throw new Error("Không thể tạo khuyến mãi");
  }
  return response.data;
}

/**
 * PUT /api/promotions/:id
 * Cập nhật khuyến mãi (chỉ OWNER)
 */
export async function updatePromotion(
  id: string,
  dto: SavePromotionRequest,
): Promise<Promotion> {
  const response = await authProtectedFetch<Promotion>(
    `/api/promotions/${id}`,
    { method: "PUT", body: dto },
  );
  if (!response.data) {
    throw new Error("Cập nhật khuyến mãi thất bại");
  }
  return response.data;
}

/**
 * DELETE /api/promotions/:id
 * Xóa mềm khuyến mãi (chỉ OWNER) → chuyển trạng thái DELETED
 */
export async function deletePromotion(id: string): Promise<void> {
  await authProtectedFetch<null>(`/api/promotions/${id}`, {
    method: "DELETE",
  });
}

/**
 * Helper function to calculate discount amount
 * @param promotion - The promotion object
 * @param bookingAmount - The original booking amount
 * @returns The discount amount
 */
export function calculateDiscountAmount(
  promotion: Promotion,
  bookingAmount: number,
): number {
  let discountAmount = 0;

  if (promotion.discountType === DiscountType.PERCENT) {
    discountAmount = (bookingAmount * promotion.discountValue) / 100;

    // Apply max discount cap if specified
    if (promotion.maxDiscountAmount && discountAmount > promotion.maxDiscountAmount) {
      discountAmount = promotion.maxDiscountAmount;
    }
  } else if (promotion.discountType === DiscountType.FIXED) {
    discountAmount = promotion.discountValue;

    // Cannot exceed booking amount
    if (discountAmount > bookingAmount) {
      discountAmount = bookingAmount;
    }
  }

  return Math.round(discountAmount);
}

/**
 * Helper function to format discount display
 * @param promotion - The promotion object
 * @returns Formatted discount string
 */
export function formatDiscountDisplay(promotion: Promotion): string {
  if (promotion.discountType === DiscountType.PERCENT) {
    let display = `${promotion.discountValue}%`;
    if (promotion.maxDiscountAmount) {
      display += ` (tối đa ${promotion.maxDiscountAmount.toLocaleString("vi-VN")} VNĐ)`;
    }
    return display;
  } else {
    return `${promotion.discountValue.toLocaleString("vi-VN")} VNĐ`;
  }
}

// Legacy function name for backward compatibility
export const fetchActivePromotion = fetchActivePromotions;
