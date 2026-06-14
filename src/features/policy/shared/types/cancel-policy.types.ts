export type CancellationPolicyTone = "emerald" | "amber" | "rose" | "slate";

export interface CancelPolicy {
  id: string;
  hoursBefore: number;
  refundPercent: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveCancelPolicyRequest {
  hoursBefore: number;
  refundPercent: number;
  description?: string | null;
}
