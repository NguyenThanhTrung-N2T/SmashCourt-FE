type AuthSessionKeys = {
  email: string;
  tempToken: string;
  resetToken: string;
  accessToken: string;
  registerFlashMessage: string;
  postVerifyLoginHint: string;
};

const KEYS: AuthSessionKeys = {
  email: "auth.email",
  tempToken: "auth.tempToken",
  resetToken: "auth.resetToken",
  accessToken: "auth.accessToken",
  registerFlashMessage: "auth.registerFlashMessage",
  postVerifyLoginHint: "auth.postVerifyLoginHint",
};

function ensureBrowser() {
  if (typeof window === "undefined") {
    throw new Error("sessionStore can only be used in the browser.");
  }
  if (!window.sessionStorage) {
    throw new Error("sessionStorage is not available in this environment.");
  }
}

function getItem(key: string) {
  ensureBrowser();
  return window.sessionStorage.getItem(key);
}

function setItem(key: string, value: string) {
  ensureBrowser();
  window.sessionStorage.setItem(key, value);
}

function removeItem(key: string) {
  ensureBrowser();
  window.sessionStorage.removeItem(key);
}

export function setEmail(email: string) {
  setItem(KEYS.email, email);
}

export function getEmail() {
  return getItem(KEYS.email);
}

export function clearEmail() {
  removeItem(KEYS.email);
}

export function setTempToken(tempToken: string) {
  setItem(KEYS.tempToken, tempToken);
}

export function getTempToken() {
  return getItem(KEYS.tempToken);
}

export function clearTempToken() {
  removeItem(KEYS.tempToken);
}

export function setResetToken(resetToken: string) {
  setItem(KEYS.resetToken, resetToken);
}

export function getResetToken() {
  return getItem(KEYS.resetToken);
}

export function clearResetToken() {
  removeItem(KEYS.resetToken);
}

export function setAccessToken(accessToken: string) {
  setItem(KEYS.accessToken, accessToken);
}

export function getAccessToken() {
  return getItem(KEYS.accessToken);
}

export function clearAccessToken() {
  removeItem(KEYS.accessToken);
}

/** Thông báo từ API sau đăng ký (OTP đã gửi) — hiển thị ở bước verify-email rồi xóa. */
export function setRegisterFlashMessage(message: string) {
  setItem(KEYS.registerFlashMessage, message);
}

export function consumeRegisterFlashMessage(): string | null {
  const v = getItem(KEYS.registerFlashMessage);
  if (v) removeItem(KEYS.registerFlashMessage);
  return v;
}

/** Sau xác thực email thành công — hiển thị gợi ý ngắn ở trang đăng nhập (consume một lần). */
export function setPostVerifyLoginHint(message: string) {
  setItem(KEYS.postVerifyLoginHint, message);
}

export function consumePostVerifyLoginHint(): string | null {
  const v = getItem(KEYS.postVerifyLoginHint);
  if (v) removeItem(KEYS.postVerifyLoginHint);
  return v;
}

export function clearAuthSession() {
  // Xóa tất cả các key trong một chỗ để dễ dàng xóa.
  clearEmail();
  clearTempToken();
  clearResetToken();
  clearAccessToken();
  removeItem(KEYS.registerFlashMessage);
  removeItem(KEYS.postVerifyLoginHint);
}
