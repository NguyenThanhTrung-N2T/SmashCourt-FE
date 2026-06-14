/**
 * Upload API
 *
 * Wrappers for POST /api/uploads/image, POST /api/uploads/raw,
 * and DELETE /api/uploads/{publicId}.
 *
 * NOTE: We cannot use authProtectedFetch here because it JSON-stringifies
 * the body and hard-codes Content-Type: application/json.
 * FormData uploads need the browser to set the multipart boundary itself.
 * We replicate the token-refresh logic manually.
 */

import {
  getAccessToken,
  getAuthUser,
  setAccessToken,
  clearAuthSession,
} from "@/src/features/auth/session/sessionStore";
import { toUrl } from "./core/apiClient";
import { AuthApiError, buildExpiredSessionError } from "./core/apiError";
import {
  parsePayload,
  normalizeSuccessPayload,
  extractErrorCode,
  extractValidationErrors,
  resolveAuthErrorMessage,
} from "./core/apiParser";
import type { ApiErrorPayload, AuthApiSuccess } from "@/src/shared/types/api.types";
import type { UploadResultDto } from "@/src/shared/types/upload.types";

// ─── Internal helpers ─────────────────────────────────────────────────────────

let _refreshPromise: Promise<string> | null = null;

async function _refreshToken(): Promise<string> {
  if (!_refreshPromise) {
    _refreshPromise = fetch(toUrl("/api/auth/refresh"), {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        const payload = await parsePayload<{ accessToken: string }>(res);
        if (!res.ok || !payload?.accessToken) {
          clearAuthSession();
          throw buildExpiredSessionError();
        }
        setAccessToken(payload.accessToken);
        return payload.accessToken;
      })
      .finally(() => {
        _refreshPromise = null;
      });
  }
  return _refreshPromise;
}

async function _fetchWithToken<T>(
  path: string,
  method: "POST" | "DELETE",
  accessToken: string,
  body?: FormData | undefined,
  query?: string,
): Promise<AuthApiSuccess<T>> {
  const url = toUrl(path) + (query ? `?${query}` : "");
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${accessToken}` },
    body,
    credentials: "include",
  });

  const payload = await parsePayload<ApiErrorPayload & T>(res);

  if (!res.ok) {
    throw new AuthApiError(
      resolveAuthErrorMessage(res.status, payload as ApiErrorPayload | null),
      {
        status: res.status,
        code: extractErrorCode(payload as ApiErrorPayload | null),
        errors: extractValidationErrors(payload as ApiErrorPayload | null),
        payload: payload as ApiErrorPayload | null,
      },
    );
  }

  return normalizeSuccessPayload(payload as T | null);
}

async function _authedUploadFetch<T>(
  path: string,
  method: "POST" | "DELETE",
  body?: FormData,
  query?: string,
): Promise<AuthApiSuccess<T>> {
  let token = getAccessToken();

  if (!token) {
    if (!getAuthUser()) throw buildExpiredSessionError();
    try {
      token = await _refreshToken();
    } catch {
      throw buildExpiredSessionError();
    }
  }

  try {
    return await _fetchWithToken<T>(path, method, token, body, query);
  } catch (err) {
    if (!(err instanceof AuthApiError) || err.status !== 401) throw err;

    try {
      const refreshed = await _refreshToken();
      return await _fetchWithToken<T>(path, method, refreshed, body, query);
    } catch (refreshErr) {
      clearAuthSession();
      throw refreshErr instanceof AuthApiError
        ? refreshErr
        : buildExpiredSessionError();
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Upload an image file to Cloudinary.
 * Allowed: JPEG, PNG, WEBP, GIF — max 10 MB.
 *
 * @param file   The File object to upload
 * @param folder Optional Cloudinary folder (e.g. "branches", "avatars")
 */
export async function uploadImage(
  file: File,
  folder?: string,
): Promise<UploadResultDto> {
  const form = new FormData();
  form.append("file", file);
  if (folder) form.append("folder", folder);

  const response = await _authedUploadFetch<UploadResultDto>(
    "/api/uploads/image",
    "POST",
    form,
  );

  if (!response.data) throw new Error("Upload failed: no data returned");
  return response.data;
}

/**
 * Upload a raw document (PDF, Word) to Cloudinary.
 * Max 20 MB.
 *
 * @param file   The File object to upload
 * @param folder Optional Cloudinary folder
 */
export async function uploadRaw(
  file: File,
  folder?: string,
): Promise<UploadResultDto> {
  const form = new FormData();
  form.append("file", file);
  if (folder) form.append("folder", folder);

  const response = await _authedUploadFetch<UploadResultDto>(
    "/api/uploads/raw",
    "POST",
    form,
  );

  if (!response.data) throw new Error("Upload failed: no data returned");
  return response.data;
}

/**
 * Delete a previously uploaded file from Cloudinary.
 *
 * @param publicId     Cloudinary public_id from UploadResultDto
 * @param resourceType "image" | "video" | "raw" (default "image")
 */
export async function deleteUpload(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image",
): Promise<void> {
  await _authedUploadFetch<null>(
    `/api/uploads/${encodeURIComponent(publicId)}`,
    "DELETE",
    undefined,
    `resourceType=${resourceType}`,
  );
}
