/**
 * Upload Types
 *
 * Mirrors SmashCourt_BE.DTOs.Upload.UploadResultDto
 */

export interface UploadResultDto {
  /** Cloudinary public URL — store this in the DB / display in UI */
  url: string;
  /** Cloudinary public_id — use for transforms / deletion */
  publicId: string;
  /** "image" | "video" | "raw" */
  resourceType: string;
  /** File extension: png, jpg, pdf, … */
  format: string;
  /** File size in bytes */
  bytes: number;
}
