export type ApiValidationErrors = Record<string, string[]>;

export type ApiEnvelope<T> = {
  success?: boolean;
  code?: string;
  message?: string | null;
  detail?: string | null;
  error?: string | null;
  title?: string | null;
  data?: T | null;
  errors?: ApiValidationErrors | null;
};

export type ApiErrorPayload = ApiEnvelope<unknown>;

export type AuthApiSuccess<T> = {
  success: boolean | null;
  code: string | null;
  message: string | null;
  data: T | null;
  errors: ApiValidationErrors | null;
};
