export enum ServiceStatus {
  ACTIVE = 0,
  DELETED = 1,
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
