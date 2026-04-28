/**
 * API Client
 * 
 * Core HTTP client for making API requests with authentication support.
 */

import {
  clearAuthSession,
  getAccessToken,
  getAuthUser,
  setAccessToken,
} from "@/src/modules/auth/session/sessionStore";

import type { AuthApiSuccess } from "@/src/shared/types/api.types";
import type { ApiErrorPayload } from "@/src/shared/types/api.types";

import { AuthApiError, buildExpiredSessionError } from "./apiError";
import {
  parsePayload,
  normalizeSuccessPayload,
  extractErrorCode,
  extractValidationErrors,
  resolveAuthErrorMessage,
} from "./apiParser";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

let refreshPromise: Promise<string> | null = null;

/**
 * Assert API base URL is configured
 */
function assertApiBaseUrl(): void {
  if (!API_BASE_URL) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_BASE_URL. Vui long dat no trong moi truong cua ban.",
    );
  }
}

/**
 * Build full URL from path
 */
export function toUrl(path: string): string {
  assertApiBaseUrl();
  const base = API_BASE_URL!.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Make authenticated API request
 */
export async function authFetch<T>(
  path: string,
  options: {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    headers?: HeadersInit;
  },
): Promise<AuthApiSuccess<T>> {
  const url = toUrl(path);
  const headers = new Headers(options.headers);

  if (options.method !== "GET" && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    method: options.method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  const payload = await parsePayload<ApiErrorPayload & T>(res);
  const normalizedErrorPayload = payload as ApiErrorPayload | null;

  if (!res.ok) {
    throw new AuthApiError(
      resolveAuthErrorMessage(res.status, normalizedErrorPayload),
      {
        status: res.status,
        code: extractErrorCode(normalizedErrorPayload),
        errors: extractValidationErrors(normalizedErrorPayload),
        payload: normalizedErrorPayload,
      },
    );
  }

  return normalizeSuccessPayload(payload as T | null);
}

/**
 * Refresh access token
 */
async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = authFetch<{ accessToken: string }>("/api/auth/refresh", {
      method: "POST",
    })
      .then((response) => {
        const accessToken = response.data?.accessToken;
        if (!accessToken) {
          throw new Error("No access token in refresh response");
        }
        setAccessToken(accessToken);
        return accessToken;
      })
      .catch((err) => {
        clearAuthSession();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

/**
 * Make protected API request with automatic token refresh
 */
export async function authProtectedFetch<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    headers?: HeadersInit;
  } = {},
): Promise<AuthApiSuccess<T>> {
  const request = (accessToken: string) =>
    authFetch<T>(path, {
      method: options.method ?? "GET",
      body: options.body,
      headers: (() => {
        const headers = new Headers(options.headers);
        headers.set("Authorization", `Bearer ${accessToken}`);
        return headers;
      })(),
    });

  let currentAccessToken = getAccessToken();

  if (!currentAccessToken) {
    const user = getAuthUser();
    if (!user) {
      throw buildExpiredSessionError();
    }

    try {
      currentAccessToken = await refreshAccessToken();
    } catch (err) {
      if (err instanceof AuthApiError) {
        throw err;
      }
      throw buildExpiredSessionError();
    }
  }

  try {
    return await request(currentAccessToken);
  } catch (err) {
    if (!(err instanceof AuthApiError) || err.status !== 401) {
      throw err;
    }

    try {
      const refreshedAccessToken = await refreshAccessToken();
      return await request(refreshedAccessToken);
    } catch (refreshErr) {
      clearAuthSession();
      if (refreshErr instanceof AuthApiError) {
        throw refreshErr;
      }

      throw buildExpiredSessionError();
    }
  }
}
