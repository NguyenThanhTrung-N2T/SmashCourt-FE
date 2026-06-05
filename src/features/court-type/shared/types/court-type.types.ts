// Global court type
export enum CourtTypeStatus {
  ACTIVE = 0,
  INACTIVE = 1,
}

export interface CourtType {
  id: string;
  name: string;
  description: string | null;
  status: CourtTypeStatus;
  createdAt: string;
  updatedAt: string;
  activeBranchCount: number;
  courtCount: number;
}

export interface CreateCourtTypeRequest {
  name: string;
  description?: string;
}

export interface UpdateCourtTypeRequest {
  name: string;
  description?: string;
}

// Branch court type
export interface BranchCourtTypeDto {
  id: string; // UUID
  courtTypeId: string; // UUID
  courtTypeName: string;
  courtTypeDescription?: string;
  isActive: boolean;
  createdAt: string; // DateTime
  courtCount: number;
}

export interface AddCourtTypeToBranchDto {
  courtTypeId: string; // UUID
}