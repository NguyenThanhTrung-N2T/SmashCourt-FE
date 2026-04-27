// ============================================================================
// Enums
// ============================================================================

export enum BranchStatus {
  ACTIVE = 0,
  SUSPENDED = 1
}

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

export enum BulkOperationType {
  ADD_STAFF = 0,
  REMOVE_STAFF = 1,
  CHANGE_ROLE = 2
}

// ============================================================================
// 1. Branch CRUD Types
// ============================================================================

export interface CreateBranchDto {
  name: string;
  address: string;
  phone?: string;
  avatarUrl?: string;
  latitude?: number;
  longitude?: number;
  openTime: string; // TimeOnly (e.g. "05:00:00")
  closeTime: string; // TimeOnly (e.g. "23:00:00")
  managerId: string; // UUID
}

export interface UpdateBranchDto {
  name: string;
  address: string;
  phone?: string;
  avatarUrl?: string;
  latitude?: number;
  longitude?: number;
  openTime: string; // TimeOnly
  closeTime: string; // TimeOnly
}

export interface BranchDto {
  id: string; // UUID
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  avatarUrl?: string;
  openTime: string; // TimeOnly
  closeTime: string; // TimeOnly
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  createdAt: string; // DateTime
  updatedAt: string; // DateTime
  managerName?: string;
  managerId?: string; // UUID
}

// ============================================================================
// 2. Branch Court Types
// ============================================================================

export interface AddCourtTypeToBranchDto {
  courtTypeId: string; // UUID
}

export interface BranchCourtTypeDto {
  id: string; // UUID
  courtTypeId: string; // UUID
  courtTypeName: string;
  courtTypeDescription?: string;
  isActive: boolean;
  createdAt: string; // DateTime
}

// ============================================================================
// 3. Branch Services
// ============================================================================

export interface AddServiceToBranchDto {
  serviceId: string; // UUID
  price?: number; // Optional, >= 1
}

export interface UpdateBranchServiceDto {
  price: number; // Required, >= 1
}

export interface BranchServiceDto {
  id: string; // UUID
  serviceId: string; // UUID
  serviceName: string;
  description?: string;
  unit: string;
  defaultPrice: number; // System default price
  effectivePrice: number; // Actual applied price at branch
  status: "ACTIVE" | "INACTIVE";
  createdAt: string; // DateTime
  updatedAt: string; // DateTime
}

// ============================================================================
// 4. Branch Manager Types
// ============================================================================

export interface BranchManagerDto {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  assignedAt: string;
  assignedByName?: string;
  assignedByUserId?: string;
}

export interface AssignManagerDto {
  userId: string;
  reason?: string;
  notes?: string;
}

export interface RemoveManagerDto {
  reason?: string;
  notes?: string;
}

// ============================================================================
// 5. Branch Staff Types
// ============================================================================

export interface BranchStaffDto {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: UserBranchRole;
  isActive: boolean;
  assignedAt: string;
  endedAt?: string;
  assignedByName?: string;
}

export interface AddStaffDto {
  userId: string;
  role: UserBranchRole;
  reason?: string;
  notes?: string;
}

export interface RemoveStaffDto {
  reason?: string;
  notes?: string;
}

export interface StaffFilterQuery extends PaginationQuery {
  isActive?: boolean;
  role?: UserBranchRole;
  searchTerm?: string;
}

export interface BulkStaffOperationDto {
  operation: BulkOperationType;
  userIds: string[];
  newRole?: UserBranchRole;
  reason?: string;
  notes?: string;
}

export interface BulkStaffOperationResultDto {
  successCount: number;
  failureCount: number;
  errors: BulkOperationError[];
}

export interface BulkOperationError {
  userId: string;
  userName: string;
  errorMessage: string;
}

// ============================================================================
// 6. User Search Types
// ============================================================================

export interface UserSearchResultDto {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  currentRole: UserRole;
  status: UserStatus;
  currentAssignments: UserBranchSummaryDto[];
  isEligibleForManager: boolean;
  isEligibleForStaff: boolean;
}

export interface UserBranchSummaryDto {
  branchId: string;
  branchName: string;
  role: UserBranchRole;
  isActive: boolean;
}

export interface UserSearchQuery extends PaginationQuery {
  searchTerm?: string;
  role?: UserRole;
  status?: UserStatus;
  excludeAssignedToBranch?: boolean;
  excludeBranchId?: string;
  eligibleForManager?: boolean;
  eligibleForStaff?: boolean;
}

export interface UserBranchAssignmentDto {
  branchId: string;
  branchName: string;
  branchAddress: string;
  role: UserBranchRole;
  isActive: boolean;
  assignedAt: string;
  endedAt?: string;
}

// ============================================================================
// 7. Shared Types
// ============================================================================

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}
