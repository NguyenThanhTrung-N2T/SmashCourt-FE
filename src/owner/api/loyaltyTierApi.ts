import { authProtectedFetch } from "@/src/auth/api/authApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LoyaltyTierDto = {
  id: string;
  name: string;
  minPoints: number;
  discountRate: number;
};

export type UpdateLoyaltyTierDto = {
  minPoints: number;
  discountRate: number;
};

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /api/loyalty-tiers
 * Lấy danh sách tất cả hạng thành viên (mọi user đã xác thực)
 */
export async function fetchAllLoyaltyTiers(): Promise<LoyaltyTierDto[]> {
  const response = await authProtectedFetch<LoyaltyTierDto[]>(
    "/api/loyalty-tiers",
    { method: "GET" },
  );
  return (response.data ?? []) as LoyaltyTierDto[];
}

/**
 * GET /api/loyalty-tiers/:id
 * Lấy chi tiết 1 hạng thành viên (mọi user đã xác thực)
 */
export async function fetchLoyaltyTierById(
  id: string,
): Promise<LoyaltyTierDto> {
  const response = await authProtectedFetch<LoyaltyTierDto>(
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
  dto: UpdateLoyaltyTierDto,
): Promise<LoyaltyTierDto> {
  const response = await authProtectedFetch<LoyaltyTierDto>(
    `/api/loyalty-tiers/${id}`,
    { method: "PUT", body: dto },
  );
  if (!response.data) {
    throw new Error("Cập nhật thất bại");
  }
  return response.data;
}
