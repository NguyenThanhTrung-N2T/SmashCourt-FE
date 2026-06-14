/**
 * Avatar Uploader Component
 * 
 * Circular avatar with hover upload functionality.
 */

"use client";

import { useRef, useState, useCallback } from "react";
import { User, Camera, Spinner, Warning } from "@phosphor-icons/react";
import { useImageUpload } from "@/src/shared/hooks/useImageUpload";
import { cn } from "@/src/shared/utils/cn";

interface AvatarUploaderProps {
  currentAvatarUrl?: string | null;
  userName: string;
  onUploadSuccess: (url: string) => void;
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
  xl: "h-40 w-40",
};

const iconSizes = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-20 w-20",
};

const cameraIconSizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-7 w-7",
};

export function AvatarUploader({
  currentAvatarUrl,
  userName,
  onUploadSuccess,
  size = "md",
  editable = true,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showError, setShowError] = useState(false);

  const {
    preview,
    uploading,
    error: uploadError,
    handleFile,
  } = useImageUpload({
    folder: "avatars",
    onSuccess: (url) => {
      onUploadSuccess(url);
      setShowError(false);
    },
    onError: () => {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    },
  });

  const displaySrc = preview ?? currentAvatarUrl ?? null;

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await handleFile(file);
      }
      e.target.value = "";
    },
    [handleFile],
  );

  const handleClick = useCallback(() => {
    if (editable && !uploading) {
      inputRef.current?.click();
    }
  }, [editable, uploading]);

  return (
    <div className="relative inline-block">
      {/* Avatar Container */}
      <div
        className={cn(
          "relative rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg",
          sizeClasses[size],
          editable && !uploading && "cursor-pointer group",
        )}
        onClick={handleClick}
      >
        {/* Avatar Image or Placeholder */}
        {displaySrc ? (
          <img
            src={displaySrc}
            alt={userName}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-300",
              uploading && "opacity-50",
            )}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <User className={cn("text-white", iconSizes[size])} weight="bold" />
          </div>
        )}

        {/* Upload Overlay (on hover) */}
        {editable && !uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex flex-col items-center gap-1 text-white">
              <Camera className={cameraIconSizes[size]} weight="fill" />
              <span className="text-xs font-bold">Đổi ảnh</span>
            </div>
          </div>
        )}

        {/* Uploading Overlay */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="flex flex-col items-center gap-2 text-white">
              <Spinner className={cameraIconSizes[size]} weight="bold" />
              <span className="text-xs font-bold">Đang tải...</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={handleInputChange}
        aria-label="Upload avatar"
      />

      {/* Error Tooltip */}
      {showError && uploadError && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-red-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 whitespace-nowrap">
            <Warning className="h-4 w-4 shrink-0" weight="fill" />
            <span>{uploadError}</span>
          </div>
          {/* Arrow */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45" />
        </div>
      )}
    </div>
  );
}
