import { authProtectedFetch } from "./auth.api";
import type { PaginatedData } from "../shared/types/api.types";
import type {
  CreateBranchDto,
  UpdateBranchDto,
  BranchDto,
  AddCourtTypeToBranchDto,
  BranchCourtTypeDto,
  AddServiceToBranchDto,
  UpdateBranchServiceDto,
  BranchServiceDto,
} from "../shared/types/branch.types";
import type {
  BranchManagerDto,
  AssignManagerDto,
  RemoveManagerDto,
  BranchStaffDto,
  AddStaffDto,
  RemoveStaffDto,
  StaffFilterQuery,
  BulkStaffOperationDto,
  BulkStaffOperationResultDto,
  UserSearchResultDto,
  UserSearchQuery,
  UserBranchAssignmentDto,
} from "../shared/types/branch.types";

// ============================================================================
// 1. Branch CRUD Endpoints
// ============================================================================

export async function fetchBranches(page = 1, pageSize = 10): Promise<PaginatedData<BranchDto>> {
  const response = await authProtectedFetch<PaginatedData<BranchDto>>(
    `/api/branches?Page=${page}&PageSize=${pageSize}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to fetch branches");
  return response.data;
}

export async function fetchBranchById(id: string): Promise<BranchDto> {
  const response = await authProtectedFetch<BranchDto>(
    `/api/branches/${id}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to fetch branch details");
  return response.data;
}

export async function createBranch(dto: CreateBranchDto): Promise<BranchDto> {
  const response = await authProtectedFetch<BranchDto>(
    "/api/branches",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: dto,
    }
  );
  if (!response.data) throw new Error("Failed to create branch");
  return response.data;
}

export async function updateBranch(id: string, dto: UpdateBranchDto): Promise<BranchDto> {
  const response = await authProtectedFetch<BranchDto>(
    `/api/branches/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: dto,
    }
  );
  if (!response.data) throw new Error("Failed to update branch");
  return response.data;
}

export async function suspendBranch(id: string): Promise<void> {
  await authProtectedFetch<null>(
    `/api/branches/${id}/suspend`,
    { method: "POST" }
  );
}

export async function activateBranch(id: string): Promise<void> {
  await authProtectedFetch<null>(
    `/api/branches/${id}/activate`,
    { method: "POST" }
  );
}

export async function deleteBranch(id: string): Promise<void> {
  await authProtectedFetch<null>(
    `/api/branches/${id}`,
    { method: "DELETE" }
  );
}

// ============================================================================
// 2. Branch Court Types Endpoints
// ============================================================================

export async function fetchBranchCourtTypes(branchId: string): Promise<BranchCourtTypeDto[]> {
  const response = await authProtectedFetch<BranchCourtTypeDto[]>(
    `/api/branches/${branchId}/court-types`,
    { method: "GET" }
  );
  return response.data || [];
}

export async function addCourtTypeToBranch(branchId: string, dto: AddCourtTypeToBranchDto): Promise<void> {
  await authProtectedFetch<null>(
    `/api/branches/${branchId}/court-types`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: dto,
    }
  );
}

export async function removeCourtTypeFromBranch(branchId: string, courtTypeId: string): Promise<void> {
  await authProtectedFetch<null>(
    `/api/branches/${branchId}/court-types/${courtTypeId}`,
    { method: "DELETE" }
  );
}

// ============================================================================
// 3. Branch Services Endpoints
// ============================================================================

export async function fetchBranchServices(branchId: string): Promise<BranchServiceDto[]> {
  const response = await authProtectedFetch<BranchServiceDto[]>(
    `/api/branches/${branchId}/services`,
    { method: "GET" }
  );
  return response.data || [];
}

export async function addServiceToBranch(branchId: string, dto: AddServiceToBranchDto): Promise<void> {
  await authProtectedFetch<null>(
    `/api/branches/${branchId}/services`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: dto,
    }
  );
}

export async function updateBranchServicePrice(
  branchId: string,
  serviceId: string,
  dto: UpdateBranchServiceDto
): Promise<void> {
  await authProtectedFetch<null>(
    `/api/branches/${branchId}/services/${serviceId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: dto,
    }
  );
}

export async function removeServiceFromBranch(branchId: string, serviceId: string): Promise<void> {
  await authProtectedFetch<null>(
    `/api/branches/${branchId}/services/${serviceId}`,
    { method: "DELETE" }
  );
}

// ============================================================================
// 4. Branch Manager Endpoints
// ============================================================================

export async function getCurrentManager(branchId: string): Promise<BranchManagerDto | null> {
  const response = await authProtectedFetch<BranchManagerDto | null>(
    `/api/branches/${branchId}/manager`,
    { method: "GET" }
  );
  return response.data || null;
}

export async function assignManager(branchId: string, dto: AssignManagerDto): Promise<BranchManagerDto> {
  const response = await authProtectedFetch<BranchManagerDto>(
    `/api/branches/${branchId}/manager`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: dto,
    }
  );
  if (!response.data) throw new Error("Failed to assign manager");
  return response.data;
}

export async function removeManager(branchId: string, dto: RemoveManagerDto): Promise<void> {
  await authProtectedFetch<null>(
    `/api/branches/${branchId}/manager`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: dto,
    }
  );
}

// ============================================================================
// 5. Branch Staff Endpoints
// ============================================================================

export async function getBranchStaff(
  branchId: string,
  query: StaffFilterQuery = {}
): Promise<PaginatedData<BranchStaffDto>> {
  const params = new URLSearchParams({
    page: (query.page || 1).toString(),
    pageSize: (query.pageSize || 10).toString()
  });

  if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
  if (query.role !== undefined) params.append('role', query.role.toString());
  if (query.searchTerm) params.append('searchTerm', query.searchTerm);

  const response = await authProtectedFetch<PaginatedData<BranchStaffDto>>(
    `/api/branches/${branchId}/staff?${params}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to get staff");
  return response.data;
}

export async function addStaff(branchId: string, dto: AddStaffDto): Promise<BranchStaffDto> {
  const response = await authProtectedFetch<BranchStaffDto>(
    `/api/branches/${branchId}/staff`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: dto,
    }
  );
  if (!response.data) throw new Error("Failed to add staff");
  return response.data;
}

export async function removeStaff(branchId: string, userId: string, dto: RemoveStaffDto): Promise<void> {
  await authProtectedFetch<null>(
    `/api/branches/${branchId}/staff/${userId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: dto,
    }
  );
}

export async function bulkStaffOperation(
  branchId: string,
  dto: BulkStaffOperationDto
): Promise<BulkStaffOperationResultDto> {
  const response = await authProtectedFetch<BulkStaffOperationResultDto>(
    `/api/branches/${branchId}/staff/bulk`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: dto,
    }
  );
  if (!response.data) throw new Error("Failed to perform bulk operation");
  return response.data;
}

// ============================================================================
// 6. User Search Endpoints
// ============================================================================

export async function searchUsers(query: UserSearchQuery = {}): Promise<PaginatedData<UserSearchResultDto>> {
  const params = new URLSearchParams({
    page: (query.page || 1).toString(),
    pageSize: (query.pageSize || 10).toString()
  });

  if (query.searchTerm) params.append('searchTerm', query.searchTerm);
  if (query.role !== undefined) params.append('role', query.role.toString());
  if (query.status !== undefined) params.append('status', query.status.toString());
  if (query.excludeAssignedToBranch !== undefined) {
    params.append('excludeAssignedToBranch', query.excludeAssignedToBranch.toString());
  }
  if (query.excludeBranchId) params.append('excludeBranchId', query.excludeBranchId);
  if (query.eligibleForManager !== undefined) {
    params.append('eligibleForManager', query.eligibleForManager.toString());
  }
  if (query.eligibleForStaff !== undefined) {
    params.append('eligibleForStaff', query.eligibleForStaff.toString());
  }

  const response = await authProtectedFetch<PaginatedData<UserSearchResultDto>>(
    `/api/branches/users/search?${params}`,
    { method: "GET" }
  );
  if (!response.data) throw new Error("Failed to search users");
  return response.data;
}

export async function getUserAssignments(userId: string): Promise<UserBranchAssignmentDto[]> {
  const response = await authProtectedFetch<UserBranchAssignmentDto[]>(
    `/api/branches/users/${userId}/assignments`,
    { method: "GET" }
  );
  return response.data || [];
}
