/**
 * Profile Management Types
 */

export interface LoyaltyInfo {
  tierName: string;
  discountRate: number;
  currentPoints: number;
  nextTierPoints: number | null;
  nextTierName: string | null;
  progressPercentage: number;
  pointsToNextTier: number | null;
}

export interface BranchInfo {
  id: string;
  name: string;
  role: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  status: string;
  is2faEnabled: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  loyalty?: LoyaltyInfo;
  branch?: BranchInfo;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string
}

export interface UserSession {
  id: string;
  deviceName: string;
  ipAddress: string;
  location: string | null;
  lastUsedAt: string;
  createdAt: string;
  isCurrent: boolean;
}
