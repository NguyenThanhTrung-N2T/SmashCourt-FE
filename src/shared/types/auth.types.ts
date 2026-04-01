export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface VerifyEmailRequest {
  email: string;
  otpCode: string;
}

export interface ResendOtpRequest {
  email: string;
  type: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: string;
  status: string;
}

export interface Login2faRequest {
  tempToken: string;
  otpCode: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyForgotPasswordOtpRequest {
  email: string;
  otpCode: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface GoogleCallbackRequest {
  code: string;
  state: string;
}
