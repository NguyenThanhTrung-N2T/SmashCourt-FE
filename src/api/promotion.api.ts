import { authProtectedFetch } from "@/src/api/auth.api";
import type { PaginatedData } from "@/src/shared/types/api.types";

import type {
  Promotion,
  SavePromotionRequest,
} from "@/src/shared/types/promotion.types";

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /api/promotions
 * Lấy danh sách tất cả khuyến mãi (không bao gồm DELETED)
 */
export async function fetchAllPromotions(page = 1, pageSize = 10): Promise<PaginatedData<Promotion>> {
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
