"use client";

import { useState, useCallback, useRef } from "react";
import { uploadImage } from "@/src/api/upload.api";

export interface UseImageUploadOptions {
  /** Cloudinary folder name (e.g. "branches", "avatars") */
  folder?: string;
  /** Called when upload completes and a URL is available */
  onSuccess?: (url: string) => void;
  /** Called on any upload error */
  onError?: (message: string) => void;
}

export interface UseImageUploadReturn {
  /** Local preview URL (createObjectURL) or null */
  preview: string | null;
  /** True while the upload request is in-flight */
  uploading: boolean;
  /** Error message from the last failed upload */
  error: string | null;
  /** The file currently staged for upload */
  stagedFile: File | null;
  /**
   * Stage a file for preview and immediately upload it.
   * Returns the Cloudinary URL on success.
   */
  handleFile: (file: File) => Promise<string | null>;
  /** Clear preview, error, and staged file */
  clear: () => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export function useImageUpload(
  options: UseImageUploadOptions = {},
): UseImageUploadReturn {
  const { folder, onSuccess, onError } = options;

  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const prevPreviewRef = useRef<string | null>(null);

  const revokePrev = useCallback(() => {
    if (prevPreviewRef.current) {
      URL.revokeObjectURL(prevPreviewRef.current);
      prevPreviewRef.current = null;
    }
  }, []);

  const handleFile = useCallback(
    async (file: File): Promise<string | null> => {
      // Client-side validation
      if (!ALLOWED_TYPES.includes(file.type)) {
        const msg = "Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF.";
        setError(msg);
        onError?.(msg);
        return null;
      }
      if (file.size > MAX_BYTES) {
        const msg = "Ảnh không được vượt quá 10 MB.";
        setError(msg);
        onError?.(msg);
        return null;
      }

      // Show local preview immediately
      revokePrev();
      const objectUrl = URL.createObjectURL(file);
      prevPreviewRef.current = objectUrl;
      setPreview(objectUrl);
      setStagedFile(file);
      setError(null);
      setUploading(true);

      try {
        const result = await uploadImage(file, folder);
        onSuccess?.(result.url);
        return result.url;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Upload ảnh thất bại.";
        setError(msg);
        onError?.(msg);
        // Keep the preview so the user can retry without re-selecting
        return null;
      } finally {
        setUploading(false);
      }
    },
    [folder, onSuccess, onError, revokePrev],
  );

  const clear = useCallback(() => {
    revokePrev();
    setPreview(null);
    setStagedFile(null);
    setError(null);
  }, [revokePrev]);

  return { preview, uploading, error, stagedFile, handleFile, clear };
}
