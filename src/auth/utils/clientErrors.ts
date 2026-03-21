/** FE hien thi loi nghiep vu an toan tu BE (4xx), con loi he thong (5xx) chi hien thi message chung. */

export const AUTH_GENERIC = {
  verifyFailed: "Không thể xác thực. Vui lòng kiểm tra mã và thử lại.",
  resendFailed: "Không thể gửi lại mã. Vui lòng thử lại sau.",
  /** Sau khi API gửi lại OTP thành công */
  resendOtpSuccess:
    "Đã gửi lại mã xác thực. Vui lòng kiểm tra email của bạn.",
  sessionInvalid: "Phiên không hợp lệ. Vui lòng thực hiện lại từ đầu.",
  twoFaFailed: "Không thể xác thực. Vui lòng thử lại.",
} as const;

export function logAuthClientError(scope: string, err: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[auth:${scope}]`, err);
  }
}

/** Hiển thị gọn: nguy•••@domain.com */
export function formatEmailShort(email: string) {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return trimmed;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const head = local.slice(0, 2);
  return `${head}•••@${domain}`;
}
