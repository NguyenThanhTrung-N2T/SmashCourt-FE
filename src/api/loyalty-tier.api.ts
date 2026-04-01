import { authProtectedFetch } from "@/src/api/auth.api";

import type {
  LoyaltyTier,
  UpdateLoyaltyTierRequest,
} from "@/src/shared/types/loyalty-tier.types";

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /api/loyalty-tiers
 * Lấy danh sách tất cả hạng thành viên (mọi user đã xác thực)
 */
export async function fetchAllLoyaltyTiers(): Promise<LoyaltyTier[]> {
  const response = await authProtectedFetch<LoyaltyTier[]>(
    "/api/loyalty-tiers",
    { method: "GET" },
  );
  return (response.data ?? []) as LoyaltyTier[];
}

/**
 * GET /api/loyalty-tiers/:id
 * Lấy chi tiết 1 hạng thành viên (mọi user đã xác thực)
 */
export async function fetchLoyaltyTierById(
  id: string,
): Promise<LoyaltyTier> {
  const response = await authProtectedFetch<LoyaltyTier>(
    `/api/loyalty-tiers/${id}`,
    { method: "GET" },
  );
  if (!response.data) {
    throw new Error("Không tìm thấy hạng thành viên");
  }
  return response.data;
}

/**
 * PUT /api/loyalty-tiers/:id
 * Cập nhật hạng thành viên (chỉ OWNER)
 */
export async function updateLoyaltyTier(
  id: string,
  dto: UpdateLoyaltyTierRequest,
): Promise<LoyaltyTier> {
  const response = await authProtectedFetch<LoyaltyTier>(
    `/api/loyalty-tiers/${id}`,
    { method: "PUT", body: dto },
  );
  if (!response.data) {
    throw new Error("Cập nhật thất bại");
  }
  return response.data;
}
