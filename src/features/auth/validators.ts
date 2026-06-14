export const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/;

export function isValidPassword(password: string) {
  return passwordRegex.test(password);
}

export const otpRegex = /^\d{6}$/;

export function isValidOtp(otpCode: string) {
  return otpRegex.test(otpCode);
}

export function normalizeOtp(otpCode: string) {
  return otpCode.replace(/\D/g, "").slice(0, 6);
}
