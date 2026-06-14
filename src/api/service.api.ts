import { authProtectedFetch } from "@/src/api/auth.api";
import type { PaginatedData } from "@/src/shared/types/api.types";

import type {
  Service,
  SaveServiceRequest,
  BranchService,
  AddServiceToBranchRequest,
  UpdateBranchServicePriceRequest
} from "@/src/features/service/shared/types/service.types";
import { buildQuery } from "@/src/api/helpers/helpers";
// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /api/services
 * Lấy danh sách tất cả dịch vụ
 */
export async function fetchAllServices(page = 1, pageSize = 50): Promise<PaginatedData<Service>> {
  const response = await authProtectedFetch<PaginatedData<Service>>(
    `/api/services?page=${page}&pageSize=${pageSize}`,
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
 * GET /api/services/:id
 * Lấy chi tiết 1 dịch vụ
 */
export async function fetchServiceById(
  id: string,
): Promise<Service> {
  const response = await authProtectedFetch<Service>(
    `/api/services/${id}`,
    { method: "GET" },
  );
  if (!response.data) {
    throw new Error("Không tìm thấy dịch vụ");
  }
  return response.data;
}

/**
 * POST /api/services
 * Tạo dịch vụ mới
 */
export async function createService(
  dto: SaveServiceRequest,
): Promise<Service> {
  const response = await authProtectedFetch<Service>(
    "/api/services",
    { method: "POST", body: dto },
  );
  if (!response.data) {
    throw new Error("Không thể tạo dịch vụ");
  }
  return response.data;
}

/**
 * PUT /api/services/:id
 * Cập nhật dịch vụ
 */
export async function updateService(
  id: string,
  dto: SaveServiceRequest,
): Promise<Service> {
  const response = await authProtectedFetch<Service>(
    `/api/services/${id}`,
    { method: "PUT", body: dto },
  );
  if (!response.data) {
    throw new Error("Cập nhật dịch vụ thất bại");
  }
  return response.data;
}

/**
 * DELETE /api/services/:id
 * Xóa mềm dịch vụ
 */
export async function deleteService(id: string): Promise<void> {
  await authProtectedFetch<null>(`/api/services/${id}`, {
    method: "DELETE",
  });
}

export async function getBranchServices(branchId?: string, page = 1, pageSize = 50): Promise<PaginatedData<BranchService>> {
  const response = await authProtectedFetch<PaginatedData<BranchService>>(
    `/api/services/branch/` + buildQuery({ branchId, page: page.toString(), pageSize: pageSize.toString() }),
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

export async function addServiceToBranch(dto: AddServiceToBranchRequest, branchId?: string): Promise<BranchService> {
  const response = await authProtectedFetch<BranchService>(
    `/api/services/branch` + buildQuery({ branchId }),
    { method: "POST", body: { serviceId: dto.serviceId, price: dto.price } }
  );
  if (!response.data) {
    throw new Error("Không thể thêm dịch vụ vào chi nhánh");
  }
  return response.data;
}
export async function updateServicePriceInBranch(serviceId: string, dto: UpdateBranchServicePriceRequest, branchId?: string): Promise<BranchService> {
  const response = await authProtectedFetch<BranchService>(
    `/api/services/branch/${serviceId}` + buildQuery({ branchId }),
    { method: "PUT", body: { price: dto.price } }
  );
  if (!response.data) {
    throw new Error("Không thể cập nhật giá dịch vụ trong chi nhánh");
  }
  return response.data;
}
export async function disableBranchService(serviceId: string, branchId?: string): Promise<void> {
  await authProtectedFetch<null>(
    `/api/services/branch/${serviceId}` + buildQuery({ branchId }),
    { method: "DELETE" }
  );
}