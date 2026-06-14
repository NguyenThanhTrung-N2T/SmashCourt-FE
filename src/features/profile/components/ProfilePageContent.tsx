/**
 * Profile Page Content Component
 * 
 * Main profile page with tabs for different sections.
 */

"use client";

import { useState, useCallback } from "react";
import { useMyProfile, useUpdateProfile } from "@/src/features/profile/hooks";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabNav, type ProfileTabId } from "./ProfileTabNav";
import { ProfileInfoTab } from "./tabs/ProfileInfoTab";
import { ChangePasswordTab } from "./tabs/ChangePasswordTab";
import { SessionManagementTab } from "./tabs/SessionManagementTab";
import { Toast, Button } from "@/src/shared/components/ui";
import { useToast } from "@/src/shared/hooks/useToast";
import { User, Lock, Devices, Warning } from "@phosphor-icons/react";

const TABS = [
  { id: "info" as ProfileTabId, label: "Thông tin cá nhân", icon: User },
  { id: "password" as ProfileTabId, label: "Đổi mật khẩu", icon: Lock },
  { id: "sessions" as ProfileTabId, label: "Quản lý thiết bị", icon: Devices },
];

export function ProfilePageContent() {
  const { data: profile, isLoading, error, refetch } = useMyProfile();
  const { updateProfile } = useUpdateProfile();
  const { toast, show } = useToast();
  const [activeTab, setActiveTab] = useState<ProfileTabId>("info");

  // Handle avatar upload from header
  const handleAvatarUpdate = useCallback(async (url: string) => {
    if (!profile) return;

    await updateProfile({
      fullName: profile.fullName,
      phone: profile.phone || "",
      avatarUrl: url,
    });

    // Refresh profile to show new avatar
    refetch();
  }, [profile, updateProfile, refetch]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-sm font-semibold text-muted">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 bg-surface-1 border border-red-500/30 rounded-xl text-center space-y-4">
          <Warning className="h-12 w-12 text-red-500 mx-auto" weight="fill" />
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">Không thể tải thông tin</h2>
            <p className="text-sm text-muted">
              {error || "Đã xảy ra lỗi khi tải thông tin profile. Vui lòng thử lại sau."}
            </p>
          </div>
          <Button onClick={refetch} variant="primary">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast toast={toast} />
      <div className="min-h-screen bg-background">
        {/* Profile Header */}
        <ProfileHeader profile={profile} onAvatarUpdate={handleAvatarUpdate} />

        {/* Tab Navigation */}
        <div className="sticky top-0 z-10 bg-surface-1 shadow-sm">
          <div className="container max-w-6xl mx-auto">
            <ProfileTabNav
              tabs={TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="container max-w-6xl mx-auto px-4 py-8">
          {activeTab === "info" && (
            <ProfileInfoTab profile={profile} onUpdate={refetch} showToast={show} />
          )}
          {activeTab === "password" && (
            <ChangePasswordTab profile={profile} showToast={show} />
          )}
          {activeTab === "sessions" && (
            <SessionManagementTab showToast={show} />
          )}
        </div>
      </div>
    </>
  );
}
