/**
 * Staff User Types
 * 
 * Type definitions for staff user management
 */
export enum UserRole {
  CUSTOMER = 0,
  STAFF = 1,
  BRANCH_MANAGER = 2,
  OWNER = 3
}

export enum UserStatus {
  ACTIVE = 0,
  SUSPENDED = 1,
  LOCKED = 2
}

export enum UserBranchRole {
  MANAGER = 0,
  STAFF = 1
}
export type StaffUserRole = 'OWNER' | 'BRANCH_MANAGER' | 'STAFF' | 'CUSTOMER';

export type StaffUserStatus = 'ACTIVE' | 'LOCKED' | 'INACTIVE';

export interface StaffUserBranch {
  id: string;
  name: string;
  role: StaffUserRole;
}

export interface StaffUserLockInfo {
  reason: string;
  lockedAt: string;
  lockedByName: string;
  lockedBy: string;
}

export interface StaffUserSummary {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: StaffUserRole;
  status: StaffUserStatus;
  createdAt: string;
  currentBranch?: StaffUserBranch | null;
}

export interface StaffUserDetail extends StaffUserSummary {
  isEmailVerified: boolean;
  mustChangePassword: boolean;
  updatedAt: string;
  lockInfo?: StaffUserLockInfo | null;
}

export interface StaffUserQueryParams {
  searchTerm?: string;
  role?: StaffUserRole;
  status?: StaffUserStatus;
  branchId?: string;
  sortBy?: 'createdAt' | 'fullName' | 'email';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface CreateStaffUserRequest {
  email: string;
  fullName: string;
  phone?: string;
  requestedRole: UserRole;
  branchId?: string; // Optional: BRANCH_MANAGER can omit (auto-assigned), OWNER must provide
  temporaryPassword?: string;
}

export interface UpdateStaffUserRequest {
  fullName: string;
  phone?: string;
  avatarUrl?: string;
}

export interface LockUserRequest {
  reason: string;
}

export interface ResetPasswordRequest {
  newPassword?: string;
}

export interface UpdateUserBranchRequest {
  newBranchId: string;
}
