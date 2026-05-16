/**
 * Profile Header Component
 * 
 * Displays user avatar, name, email, and basic info.
 */

"use client";

import { Envelope, Phone, ShieldCheck } from "@phosphor-icons/react";
import { AvatarUploader } from "./AvatarUploader";
import type { UserProfile } from "@/src/shared/types/profile.types";

interface ProfileHeaderProps {
  profile: UserProfile;
  onAvatarUpdate: (url: string) => void;
}

export function ProfileHeader({ profile, onAvatarUpdate }: ProfileHeaderProps) {
  const roleLabels: Record<string, string> = {
    CUSTOMER: "Khách hàng",
    STAFF: "Nhân viên",
    BRANCH_MANAGER: "Quản lý chi nhánh",
    ADMIN: "Quản trị viên",
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: "Hoạt động", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
    INACTIVE: { label: "Không hoạt động", color: "text-slate-600 bg-slate-50 dark:bg-slate-900/20" },
    SUSPENDED: { label: "Tạm khóa", color: "text-red-600 bg-red-50 dark:bg-red-900/20" },
  };

  const status = statusLabels[profile.status] || statusLabels.ACTIVE;

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50/30 to-slate-50 dark:from-slate-900 dark:via-emerald-900/10 dark:to-slate-900 border-b border-border">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar with Upload */}
          <div className="relative">
            <AvatarUploader
              currentAvatarUrl={profile.avatarUrl}
              userName={profile.fullName}
              onUploadSuccess={onAvatarUpdate}
              size="lg"
              editable={true}
            />
            {profile.is2faEnabled && (
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-2 border-white dark:border-slate-800 shadow-md">
                <ShieldCheck className="h-4 w-4 text-white" weight="fill" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{profile.fullName}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                <span className="text-sm font-semibold text-muted">
                  {roleLabels[profile.role] || profile.role}
                </span>
                <span className="text-muted">•</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 text-sm text-muted">
              <div className="flex items-center gap-2">
                <Envelope className="h-4 w-4" />
                <span>{profile.email}</span>
              </div>
              {profile.phone && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{profile.phone}</span>
                  </div>
                </>
              )}
            </div>

            {/* Branch Info for Staff/Manager */}
            {profile.branch && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold">
                <span>Chi nhánh: {profile.branch.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
