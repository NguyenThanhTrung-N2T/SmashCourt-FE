/**
 * API Error handling
 * 
 * Centralized error class and error handling utilities for API requests.
 */

import type { ApiValidationErrors, ApiErrorPayload } from "@/src/shared/types/api.types";

/**
 * Custom error class for authentication API errors
 */
export class AuthApiError extends Error {
  status: number;
  code: string | null;
  errors: ApiValidationErrors | null;
  payload: ApiErrorPayload | null;

  constructor(
    message: string,
    options: {
      status: number;
      code?: string | null;
      errors?: ApiValidationErrors | null;
      payload: ApiErrorPayload | null;
    },
  ) {
    super(message);
    this.name = "AuthApiError";
    this.status = options.status;
    this.code = options.code ?? null;
    this.errors = options.errors ?? null;
    this.payload = options.payload;
  }
}

/**
 * Check if error has specific error code(s)
 */
export function hasAuthErrorCode(
  error: unknown,
  expectedCode: string | readonly string[],
): boolean {
  if (!(error instanceof AuthApiError) || !error.code) {
    return false;
  }

  const expectedCodes = Array.isArray(expectedCode)
    ? expectedCode
    : [expectedCode];

  return expectedCodes.some((code) => code === error.code);
}

/**
 * Get field-specific error message from validation errors
 */
export function getAuthFieldError(
  error: unknown,
  fieldNames: string | readonly string[],
): string | null {
  if (!(error instanceof AuthApiError)) {
    return null;
  }

  const fieldErrors = error.errors;
  if (!fieldErrors) {
    return null;
  }

  const normalizedFieldNames = new Set(
    (Array.isArray(fieldNames) ? fieldNames : [fieldNames]).map(normalizeFieldKey),
  );

  for (const [field, messages] of Object.entries(fieldErrors)) {
    const candidates = [field, field.split(".").at(-1) ?? field];
    const isMatch = candidates.some((candidate) =>
      normalizedFieldNames.has(normalizeFieldKey(candidate)),
    );

    if (!isMatch) {
      continue;
    }

    const firstMessage = messages.find((message) => message.trim());
    if (firstMessage) {
      return firstMessage.trim();
    }
  }

  return extractFirstValidationMessage(fieldErrors);
}

/**
 * Build error for expired session
 */
export function buildExpiredSessionError(): AuthApiError {
  return new AuthApiError(
    "Phien dang nhap da het han, vui long dang nhap lai.",
    {
      status: 401,
      payload: null,
    },
  );
}

// Helper functions

function normalizeFieldKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

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
