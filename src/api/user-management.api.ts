/**
 * User Management API
 * 
 * API endpoints for managing users (STAFF and BRANCH_MANAGER)
 */

import { authProtectedFetch } from "./core";
import type { PaginatedData } from "@/src/shared/types/api.types";
import type {
  StaffUserSummary,
  StaffUserDetail,
  StaffUserQueryParams,
  CreateStaffUserRequest,
  UpdateStaffUserRequest,
  LockUserRequest,
  ResetPasswordRequest,
  UpdateUserBranchRequest,
} from "@/src/features/staff/shared/types/user.type";

/**
 * Get paginated list of users with filtering and sorting
 */
export async function fetchUsers(params?: StaffUserQueryParams) {
  const searchParams = new URLSearchParams();

  if (params?.searchTerm) searchParams.append('searchTerm', params.searchTerm);
  if (params?.role) searchParams.append('role', params.role);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.branchId) searchParams.append('branchId', params.branchId);
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  const queryString = searchParams.toString();
  const path = `/api/users${queryString ? `?${queryString}` : ''}`;

  const response = await authProtectedFetch<PaginatedData<StaffUserSummary>>(path, {
    method: 'GET',
  });

  return response.data;
}

/**
 * Get detailed information about a specific user
 */
export async function fetchUserById(userId: string) {
  const response = await authProtectedFetch<StaffUserDetail>(`/api/users/${userId}`, {
    method: 'GET',
  });

  return response.data;
}

/**
 * Create a new user (STAFF or BRANCH_MANAGER)
 */
export async function createUser(data: CreateStaffUserRequest) {
  const response = await authProtectedFetch<StaffUserDetail>('/api/users', {
    method: 'POST',
    body: data,
  });

  return response.data;
}

/**
 * Update user information (name, phone, avatar)
 */
export async function updateUser(userId: string, data: UpdateStaffUserRequest) {
  const response = await authProtectedFetch<StaffUserDetail>(`/api/users/${userId}`, {
    method: 'PUT',
    body: data,
  });

  return response.data;
}

/**
 * Lock a user account
 */
export async function lockUser(userId: string, data: LockUserRequest) {
  const response = await authProtectedFetch<null>(`/api/users/${userId}/lock`, {
    method: 'POST',
    body: data,
  });

  return response;
}

/**
 * Unlock a user account
 */
export async function unlockUser(userId: string) {
  const response = await authProtectedFetch<null>(`/api/users/${userId}/unlock`, {
    method: 'POST',
  });

  return response;
}

/**
 * Deactivate a user (mark as INACTIVE)
 */
export async function deactivateUser(userId: string) {
  const response = await authProtectedFetch<null>(`/api/users/${userId}/deactivate`, {
    method: 'POST',
  });

  return response;
}

/**
 * Activate a user (reactivate from INACTIVE to ACTIVE)
 */
export async function activateUser(userId: string) {
  const response = await authProtectedFetch<null>(`/api/users/${userId}/activate`, {
    method: 'POST',
  });

  return response;
}

/**
 * Update user's branch (OWNER only)
 */
export async function updateUserBranch(userId: string, data: UpdateUserBranchRequest) {
  const response = await authProtectedFetch<null>(`/api/users/${userId}/branch`, {
    method: 'PUT',
    body: data,
  });

  return response;
}

/**
 * Reset user's password
 */
export async function resetUserPassword(userId: string, data?: ResetPasswordRequest) {
  const response = await authProtectedFetch<string>(`/api/users/${userId}/reset-password`, {
    method: 'POST',
    body: data || {},
  });

  return response;
}
