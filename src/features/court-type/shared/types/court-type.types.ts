export interface CourtType {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
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
