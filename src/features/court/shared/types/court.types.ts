/**
 * Court Types
 * 
 * Type definitions for court-related entities and DTOs.
 */

// ============================================================================
// Enums
// ============================================================================

export enum CourtStatus {
  AVAILABLE = 0,
  LOCKED = 1,
  IN_USE = 3,
  SUSPENDED = 4,
  INACTIVE = 5,
}

// ============================================================================
// DTOs
// ============================================================================

export interface CourtDto {
  id: string;
  branchId: string;
  courtTypeId: string;
  courtTypeName: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  status: CourtStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourtDto {
  name: string;
  description?: string;
  avatarUrl?: string;
  courtTypeId: string;
}

export interface UpdateCourtDto {
  name: string;
  description?: string;
  avatarUrl?: string;
  courtTypeId: string;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface CourtListQuery {
  status?: CourtStatus;
  courtTypeId?: string;
}
