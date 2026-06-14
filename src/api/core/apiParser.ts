/**
 * API Response parsing utilities
 * 
 * Functions for parsing and normalizing API responses.
 */

import type {
  ApiValidationErrors,
  ApiEnvelope,
  ApiErrorPayload,
  AuthApiSuccess,
} from "@/src/shared/types/api.types";

const GENERIC_CLIENT_ERROR_MESSAGE = "Yeu cau khong hop le. Vui long thu lai.";
const GENERIC_SERVER_ERROR_MESSAGE = "Da xay ra loi he thong, vui long thu lai sau.";

/**
 * Safely parse JSON response
 */
export async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.clone().json()) as T;
  } catch {
    return null;
  }
}

/**
 * Safely parse text response
 */
export async function parseTextSafe(res: Response): Promise<string | null> {
  try {
    const text = (await res.clone().text()).trim();
    return text || null;
  } catch {
    return null;
  }
}

/**
 * Check if text is HTML
 */
export function isHtmlLike(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return normalized.startsWith("<!doctype") || normalized.startsWith("<html");
}

/**
 * Type guard for object-like values
 */
export function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Type guard for API envelope responses
 */
export function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return (
    isObjectLike(value) &&
    ("success" in value ||
      "code" in value ||
      "data" in value ||
      "errors" in value)
  );
}

/**
 * Parse response payload (JSON or text)
 */
export async function parsePayload<T>(res: Response): Promise<T | null> {
  const jsonPayload = await parseJsonSafe<T>(res);
  if (jsonPayload) return jsonPayload;

  const textPayload = await parseTextSafe(res);
  if (!textPayload || isHtmlLike(textPayload)) {
    return null;
  }

  return { message: textPayload } as T;
}

/**
 * Convert value to trimmed string or null
 */
export function toTrimmedString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Extract validation errors from error payload
 */
export function extractValidationErrors(
  payload: ApiErrorPayload | null,
): ApiValidationErrors | null {
  if (!payload || !isObjectLike(payload.errors)) {
    return null;
  }

  const entries = Object.entries(payload.errors).flatMap(([field, messages]) => {
    if (!Array.isArray(messages)) {
      return [];
    }

    const normalizedMessages = messages
      .filter((message): message is string => typeof message === "string")
      .map((message) => message.trim())
      .filter(Boolean);

    return normalizedMessages.length > 0 ? [[field, normalizedMessages]] : [];
  });

  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

/**
 * Extract error code from payload
 * Checks both 'code' and 'errorCode' fields for backward compatibility
 */
export function extractErrorCode(payload: ApiErrorPayload | null): string | null {
  return toTrimmedString(payload?.code) ?? toTrimmedString(payload?.errorCode);
}

/**
 * Extract error message from payload
 */
export function extractErrorMessage(payload: ApiErrorPayload | null): string | null {
  if (!payload) return null;

  const validationMessage = extractFirstValidationMessage(
    extractValidationErrors(payload),
  );
  if (validationMessage) {
    return validationMessage;
  }

  const candidates = [
    payload.message,
    payload.detail,
    payload.error,
    payload.title,
  ];

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) return trimmed;
  }

  return null;
}

/**
 * Resolve appropriate error message based on status and payload
 */
export function resolveAuthErrorMessage(
  status: number,
  payload: ApiErrorPayload | null,
): string {
  if (status >= 500) {
    return GENERIC_SERVER_ERROR_MESSAGE;
  }

  return extractErrorMessage(payload) ?? GENERIC_CLIENT_ERROR_MESSAGE;
}

/**
 * Normalize success response payload
 */
export function normalizeSuccessPayload<T>(
  payload: T | ApiEnvelope<T> | null,
): AuthApiSuccess<T> {
  if (isApiEnvelope<T>(payload)) {
    return {
      success: typeof payload.success === "boolean" ? payload.success : null,
      code: toTrimmedString(payload.code),
      message: toTrimmedString(payload.message),
      data: (payload.data ?? null) as T | null,
      errors: extractValidationErrors(payload as ApiErrorPayload),
    };
  }

  return {
    success: null,
    code: null,
    message: null,
    data: payload,
    errors: null,
  };
}

/**
 * Require data from response or throw error
 */
export function requireData<T>(
  response: AuthApiSuccess<T>,
  fallbackMessage: string,
): T {
  if (response.data === null || response.data === undefined) {
    throw new Error(fallbackMessage);
  }

  return response.data;
}

/**
 * Add response metadata to data
 */
export function withResponseMeta<T extends object>(
  response: AuthApiSuccess<T>,
): T & { message?: string; code?: string } {
  const data = requireData(response, "Phan hoi API khong hop le. Vui long thu lai.");

  return {
    ...data,
    message: response.message ?? undefined,
    code: response.code ?? undefined,
  };
}

// Helper functions

function extractFirstValidationMessage(errors: ApiValidationErrors | null): string | null {
  if (!errors) return null;

  for (const messages of Object.values(errors)) {
    const firstMessage = messages.find((message) => message.trim());
    if (firstMessage) {
      return firstMessage.trim();
    }
  }

  return null;
}
