export const OtpType = {
  EMAIL_VERIFY: 0,
  FORGOT_PASSWORD: 1,
  TWO_FA: 2,
} as const;

export type OtpTypeValue = (typeof OtpType)[keyof typeof OtpType];

export type UserRole = "CUSTOMER" | "STAFF" | "BRANCH_MANAGER" | "OWNER";

const roleToRedirect: Record<UserRole, string> = {
  CUSTOMER: "/",
  STAFF: "/admin",
  BRANCH_MANAGER: "/admin",
  OWNER: "/admin",
};

export function getRedirectPathByRole(role: string | undefined | null) {
  if (!role) return "/";
  return (roleToRedirect as Record<string, string>)[role] ?? "/";
}
