"use client";

import React, { useRef, useCallback, useState, useEffect } from "react";
import { Image as ImageIcon, UploadSimple, X, Warning, Spinner } from "@phosphor-icons/react";
import NextImage from "next/image";
import { cn } from "@/src/shared/utils/cn";
import { useImageUpload } from "@/src/shared/hooks/useImageUpload";

export interface ImageUploaderProps {
  /** Current image URL (from DB / parent form state) */
  value?: string;
  /** Called whenever a new URL becomes available after successful upload */
  onChange: (url: string) => void;
  /** Called when the user clears the image */
  onClear?: () => void;
  /** Cloudinary folder target */
  folder?: string;
  /** Field label shown above the picker */
  label?: string;
  /** Validation error from the parent form */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  className?: string;
  /** Called when the uploading state changes */
  onUploadingChange?: (uploading: boolean) => void;
}

export function ImageUploader({
  value,
  onChange,
  onClear,
  folder,
  label,
  error,
  required,
  className,
  onUploadingChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const {
    preview,
    uploading,
    error: uploadError,
    handleFile,
    clear,
  } = useImageUpload({
    folder,
    onSuccess: onChange,
  });

  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      clear();
      prevValueRef.current = value;
    }
  }, [value, clear]);

  useEffect(() => {
    if (onUploadingChange) {
      onUploadingChange(uploading);
    }
  }, [uploading, onUploadingChange]);

  // The effective preview: local blob while uploading, then the committed value
  const displaySrc = preview ?? value ?? null;
  const hasImage = Boolean(displaySrc);
  const effectiveError = error ?? uploadError ?? null;

  const pickFile = useCallback(
    async (file: File) => {
      await handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) pickFile(file);
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [pickFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) pickFile(file);
    },
    [pickFile],
  );

  const handleClear = useCallback(() => {
    clear();
    onClear?.();
    onChange("");
  }, [clear, onClear, onChange]);

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      {/* Label */}
      {label && (
        <label className="text-xs font-bold uppercase tracking-wider text-muted">
          {label}{" "}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {hasImage ? (
        /* ── Preview Card ── */
        <div className="relative group rounded-2xl overflow-hidden border-2 border-border bg-surface-2 aspect-video w-full">
          <NextImage
            src={displaySrc!}
            alt="Preview"
            fill
            className="object-cover transition-opacity duration-300"
            style={{ opacity: uploading ? 0.5 : 1 }}
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={displaySrc?.startsWith('blob:')}
          />

          {/* Upload spinner overlay */}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-2 text-white">
                <Spinner className="h-8 w-8 animate-spin" />
                <span className="text-xs font-semibold">Đang tải lên…</span>
              </div>
            </div>
          )}

          {/* Hover controls */}
          {!uploading && (
            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-2 rounded-full bg-white/20 border border-white/40 px-4 py-2 text-xs font-bold text-white hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                <UploadSimple className="h-4 w-4" />
                Đổi ảnh
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-2 rounded-full bg-red-500/60 border border-red-400/40 px-4 py-2 text-xs font-bold text-white hover:bg-red-500/80 transition-colors backdrop-blur-sm"
              >
                <X className="h-4 w-4" />
                Xóa
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ── Drop Zone ── */
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 py-10 px-6 select-none",
            dragOver
              ? "border-primary bg-primary/10 scale-[1.01]"
              : effectiveError
              ? "border-red-500/40 bg-red-500/5 hover:border-red-500/70"
              : "border-border bg-surface-2 hover:border-primary/50 hover:bg-surface-1",
          )}
        >
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
              dragOver ? "bg-primary/20" : "bg-surface-3",
            )}
          >
            <ImageIcon
              className={cn(
                "h-7 w-7 transition-colors",
                dragOver ? "text-primary" : "text-muted",
              )}
            />
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-foreground">
              {dragOver ? "Thả ảnh vào đây" : "Kéo thả ảnh vào đây"}
            </p>
            <p className="text-xs text-muted mt-0.5">
              hoặc{" "}
              <span className="text-primary font-semibold underline underline-offset-2">
                chọn từ máy tính
              </span>
            </p>
            <p className="text-xs text-muted mt-2">
              JPG, PNG, WEBP, GIF · Tối đa 10 MB
            </p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={handleInputChange}
        aria-hidden="true"
      />

      {/* Error message */}
      {effectiveError && (
        <div className="flex items-center gap-1.5 text-red-500 mt-0.5">
          <Warning className="h-3.5 w-3.5 shrink-0" />
          <p className="text-xs font-medium">{effectiveError}</p>
        </div>
      )}
    </div>
  );
}
