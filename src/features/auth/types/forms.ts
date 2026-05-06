/**
 * Type definitions for authentication forms
 * 
 * Provides proper TypeScript types for form events and handlers,
 * replacing deprecated FormEvent type.
 */

import type { FormEvent as ReactFormEvent, ChangeEvent } from "react";

/**
 * Form submission event type
 * Use this instead of deprecated FormEvent
 */
export type AuthFormEvent = ReactFormEvent<HTMLFormElement>;

/**
 * Input change event type
 */
export type AuthInputEvent = ChangeEvent<HTMLInputElement>;

/**
 * Form submission handler type
 */
export type AuthFormSubmitHandler = (event: AuthFormEvent) => void | Promise<void>;

/**
 * Input change handler type
 */
export type AuthInputChangeHandler = (event: AuthInputEvent) => void;

/**
 * Generic form values type
 */
export interface AuthFormValues {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Form validation errors type
 */
export interface AuthFormErrors {
  [key: string]: string | undefined;
}

/**
 * Form field configuration
 */
export interface AuthFormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "tel" | "number";
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Login form values
 */
export interface LoginFormValues {
  email: string;
  password: string;
}

/**
 * Register form values
 */
export interface RegisterFormValues {
  email: string;
  fullName: string;
  phone?: string;
  password: string;
}

/**
 * Verify email form values
 */
export interface VerifyEmailFormValues {
  email: string;
  otpCode: string;
}

/**
 * 2FA form values
 */
export interface TwoFactorFormValues {
  tempToken: string;
  otpCode: string;
}

/**
 * Forgot password form values
 */
export interface ForgotPasswordFormValues {
  email: string;
}

/**
 * Verify OTP form values
 */
export interface VerifyOtpFormValues {
  email: string;
  otpCode: string;
}

/**
 * Reset password form values
 */
export interface ResetPasswordFormValues {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}
