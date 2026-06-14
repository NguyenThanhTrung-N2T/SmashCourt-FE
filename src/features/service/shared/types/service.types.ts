export enum ServiceStatus {
  ACTIVE = 0,
  DELETED = 1,
}

export enum BranchServiceStatus {
  ENABLED = 0,
  DISABLED = 1,
}

export interface Service {
  id: string; // Guid
  name: string;
  description: string | null;
  unit: string;
  defaultPrice: number;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
  serviceDisplayUrl?: string;
}

export interface SaveServiceRequest {
  name: string;
  description?: string | null;
  unit: string;
  defaultPrice: number;
  serviceDisplayUrl?: string;
}
export interface BranchService {
  id: string;
  serviceId: string;
  serviceName: string;
  description?: string;
  unit: string;
  defaultPrice: number;
  effectivePrice: number;
  serviceDisplayUrl?: string;
  status: BranchServiceStatus;
  createdAt: string;
  updatedAt: string;
}
export interface AddServiceToBranchRequest {
  serviceId: string;
  price: number;
}
export interface UpdateBranchServicePriceRequest {
  price: number;
}
