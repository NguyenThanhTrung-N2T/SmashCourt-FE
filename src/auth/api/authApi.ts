type ApiErrorPayload = {
  message?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function assertApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_BASE_URL. Vui lòng đặt nó trong môi trường của bạn.",
    );
  }
}

function toUrl(path: string) {
  assertApiBaseUrl();
  // Đảm bảo chúng ta không kết thúc với double slashes.
  const base = API_BASE_URL!.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function authFetch<T>(
  path: string,
  options: {
    method: "GET" | "POST";
    body?: unknown;
  },
): Promise<T> {
  const url = toUrl(path);

  const res = await fetch(url, {
    method: options.method,
    headers:
      options.method === "POST"
        ? {
            "Content-Type": "application/json",
          }
        : undefined,
    body:
      options.method === "POST" && options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,
    credentials: "include",
  });

  const payload = await parseJsonSafe<ApiErrorPayload & T>(res);

  if (!res.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? (payload as ApiErrorPayload).message
        : undefined;
    throw new Error(message || `Yêu cầu thất bại với trạng thái ${res.status}`);
  }

  return payload as T;
}

// Auth endpoints
export type AuthRegisterBody = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
};

export type AuthVerifyEmailBody = {
  email: string;
  otpCode: string; // 6 chữ số
};

export type AuthResendOtpBody = {
  email: string;
  type: number; // mapping số (xem constants.ts)
};

export type AuthLoginBody = {
  email: string;
  password: string;
};

export type AuthLogin2faBody = {
  tempToken: string;
  otpCode: string;
};

export type AuthForgotPasswordBody = {
  email: string;
};

export type AuthForgotPasswordVerifyOtpBody = {
  email: string;
  otpCode: string;
};

export type AuthForgotPasswordResetBody = {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
};

export async function authRegister(body: AuthRegisterBody) {
  return authFetch<{ message?: string }>(`/api/auth/register`, {
    method: "POST",
    body,
  });
}

export async function authVerifyEmail(body: AuthVerifyEmailBody) {
  return authFetch<{ status?: string; message?: string }>(
    `/api/auth/verify-email`,
    { method: "POST", body },
  );
}

export async function authResendOtp(body: AuthResendOtpBody) {
  return authFetch<{ message?: string }>(`/api/auth/resend-otp`, {
    method: "POST",
    body,
  });
}

export async function authLogin(body: AuthLoginBody) {
  return authFetch<{
    status: string;
    tempToken?: string;
    accessToken?: string;
    user?: { role: string; [k: string]: unknown };
    message?: string;
  }>(`/api/auth/login`, { method: "POST", body });
}

export async function authLogin2fa(body: AuthLogin2faBody) {
  return authFetch<{
    status: string;
    accessToken?: string;
    user?: { role: string; [k: string]: unknown };
    message?: string;
  }>(`/api/auth/login/2fa`, { method: "POST", body });
}

export async function authForgotPassword(body: AuthForgotPasswordBody) {
  return authFetch<{ message?: string }>(`/api/auth/forgot-password`, {
    method: "POST",
    body,
  });
}

export async function authForgotPasswordVerifyOtp(
  body: AuthForgotPasswordVerifyOtpBody,
) {
  return authFetch<{ message?: string; resetToken?: string }>(
    `/api/auth/forgot-password/verify-otp`,
    { method: "POST", body },
  );
}

export async function authForgotPasswordReset(
  body: AuthForgotPasswordResetBody,
) {
  return authFetch<{ message?: string; status?: string }>(
    `/api/auth/forgot-password/reset`,
    { method: "POST", body },
  );
}

export async function authGoogleUrl() {
  return authFetch<{ url: string }>(`/api/auth/google/url`, {
    method: "GET",
  });
}

export type AuthGoogleCallbackBody = {
  code: string;
  state: string;
};

export async function authGoogleCallback(body: AuthGoogleCallbackBody) {
  return authFetch<{
    status: string;
    accessToken?: string;
    user?: { role: string; [k: string]: unknown };
    message?: string;
  }>(`/api/auth/google/callback`, { method: "POST", body });
}
