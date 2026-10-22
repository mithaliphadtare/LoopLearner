/**
 * Utility functions shared across the application.
 */

/** Combines class names, filtering out falsy values. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Converts a File to a base64-encoded data URL string. */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Extracts the raw base64 data from a data URL (removes the prefix). */
export function extractBase64Data(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(",");
  return commaIndex !== -1 ? dataUrl.slice(commaIndex + 1) : dataUrl;
}

/** Returns the MIME type from a data URL. */
export function getMimeType(dataUrl: string): string {
  const match = dataUrl.match(/^data:(.+?);/);
  return match ? match[1] : "application/pdf";
}

/** List of accepted image MIME types for upload. */
export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
] as const;

/** List of all accepted MIME types for upload (PDF + images). */
export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  ...ACCEPTED_IMAGE_TYPES,
] as const;

/** Maximum file size in bytes (20 MB). */
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

/** Formats byte size into human readable string (e.g. "245 KB", "1.4 MB"). */
export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Validates that a file is an accepted type (PDF or image) and within size limits. */
export function validateFile(
  file: File
): { valid: true } | { valid: false; error: string } {
  const isAccepted = (ACCEPTED_FILE_TYPES as readonly string[]).includes(file.type);
  if (!isAccepted) {
    return {
      valid: false,
      error: "Please upload a PDF, PNG, JPG, JPEG, or WEBP file.",
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File must be smaller than 20 MB.",
    };
  }
  return { valid: true };
}

/** Validates that a file is an accepted image type and within size limits. Maintained for backwards compatibility. */
export function validateImageFile(
  file: File
): { valid: true } | { valid: false; error: string } {
  return validateFile(file);
}
