import { authProtectedFetch } from "@/src/auth/api/authApi";
import {
  sortCancelPolicies,
  type CancelPolicyDto,
  type CancelPolicyMutationDto,
} from "@/src/common/cancellationPolicy";

type ApiEnvelope<T> = {
  message?: string | null;
  detail?: string | null;
  error?: string | null;
  title?: string | null;
  data?: T | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function resolveApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_API_BASE_URL. Vui lòng cấu hình biến môi trường trước khi gọi API.",
    );
  }

  return API_BASE_URL.replace(/\/$/, "");
}

function toUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${resolveApiBaseUrl()}${normalizedPath}`;
}

function resolveApiMessage(payload: ApiEnvelope<unknown> | null) {
  if (!payload) {
    return null;
  }

  const candidates = [
    payload.message,
    payload.detail,
    payload.error,
    payload.title,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return null;
}

async function parseJsonSafe<T>(response: Response) {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchCancelPolicies() {
  const response = await fetch(toUrl("/api/cancel-policies"), {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const payload = await parseJsonSafe<ApiEnvelope<CancelPolicyDto[]> | CancelPolicyDto[]>(
    response,
  );

  if (!response.ok) {
    throw new Error(
      resolveApiMessage(
        Array.isArray(payload) ? null : ((payload ?? null) as ApiEnvelope<unknown> | null),
      ) ?? "Không thể tải chính sách hủy từ hệ thống.",
    );
  }

  const policies = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  return sortCancelPolicies(policies);
}

export async function createCancelPolicy(dto: CancelPolicyMutationDto) {
  const response = await authProtectedFetch<CancelPolicyDto>("/api/cancel-policies", {
    method: "POST",
    body: dto,
  });

  if (!response.data) {
    throw new Error("Không thể tạo mốc chính sách hủy.");
  }

  return response.data;
}

export async function updateCancelPolicy(
  id: string,
  dto: CancelPolicyMutationDto,
) {
  const response = await authProtectedFetch<CancelPolicyDto>(
    `/api/cancel-policies/${id}`,
    {
      method: "PUT",
      body: dto,
    },
  );

  if (!response.data) {
    throw new Error("Không thể cập nhật mốc chính sách hủy.");
  }

  return response.data;
}

export async function deleteCancelPolicy(id: string) {
  await authProtectedFetch<null>(`/api/cancel-policies/${id}`, {
    method: "DELETE",
  });
}
