import { authProtectedFetch } from "@/src/api/auth.api";

import type {
  CourtType,
  CreateCourtTypeRequest,
  UpdateCourtTypeRequest,
} from "@/src/shared/types/court-type.types";

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /api/court-types
 * Lấy danh sách loại sân đang ACTIVE (mọi user đã xác thực)
 */
export async function fetchAllCourtTypes(): Promise<CourtType[]> {
  const response = await authProtectedFetch<CourtType[]>(
    "/api/court-types",
    { method: "GET" },
  );
  
  // Ensure we always return an array
  const data = response.data;
  if (!data) return [];
  if (Array.isArray(data)) return data;
  
  // If data is an object with an array property, extract it
  if (typeof data === 'object' && 'items' in data) {
    const dataWithItems = data as { items: unknown };
    if (Array.isArray(dataWithItems.items)) {
      return dataWithItems.items as CourtType[];
    }
  }
  if (typeof data === 'object' && 'data' in data) {
    const dataWithData = data as { data: unknown };
    if (Array.isArray(dataWithData.data)) {
      return dataWithData.data as CourtType[];
    }
  }
  
  return [];
}

/**
 * GET /api/court-types/:id
 * Lấy chi tiết 1 loại sân (mọi user đã xác thực)
 */
export async function fetchCourtTypeById(id: string): Promise<CourtType> {
  const response = await authProtectedFetch<CourtType>(
    `/api/court-types/${id}`,
    { method: "GET" },
  );
  if (!response.data) {
    throw new Error("Không tìm thấy loại sân");
  }
  return response.data;
}

/**
 * POST /api/court-types
 * Tạo loại sân mới (chỉ OWNER)
 */
export async function createCourtType(
  dto: CreateCourtTypeRequest,
): Promise<CourtType> {
  const response = await authProtectedFetch<CourtType>(
    "/api/court-types",
    { method: "POST", body: dto },
  );
  if (!response.data) {
    throw new Error("Tạo loại sân thất bại");
  }
  return response.data;
}

/**
 * PUT /api/court-types/:id
 * Cập nhật loại sân (chỉ OWNER)
 */
export async function updateCourtType(
  id: string,
  dto: UpdateCourtTypeRequest,
): Promise<CourtType> {
  const response = await authProtectedFetch<CourtType>(
    `/api/court-types/${id}`,
    { method: "PUT", body: dto },
  );
  if (!response.data) {
    throw new Error("Cập nhật loại sân thất bại");
  }
  return response.data;
}

/**
 * DELETE /api/court-types/:id
 * Xóa mềm loại sân (chỉ OWNER)
 */
export async function deleteCourtType(id: string): Promise<void> {
  await authProtectedFetch<void>(`/api/court-types/${id}`, {
    method: "DELETE",
  });
}
