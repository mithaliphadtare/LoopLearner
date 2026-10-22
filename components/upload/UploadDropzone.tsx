"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileText, AlertCircle } from "lucide-react";
import { validateFile, fileToBase64 } from "@/lib/utils";

interface UploadDropzoneProps {
  onImageSelected: (
    dataUrl: string,
    fileName: string,
    fileType?: string,
    fileSize?: number
  ) => void;
  disabled?: boolean;
}

export function UploadDropzone({ onImageSelected, disabled }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setValidationError(null);
    const validation = validateFile(file);
    if (!validation.valid) {
      setValidationError(validation.error);
      return;
    }

    try {
      const dataUrl = await fileToBase64(file);
      onImageSelected(dataUrl, file.name, file.type, file.size);
    } catch {
      setValidationError("Failed to read file. Please try another file.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };

  const handleTriggerPicker = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-2.5">
          What are you studying?
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto">
          Upload a PDF, textbook page, handwritten note, or study diagram.
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleTriggerPicker}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleTriggerPicker();
          }
        }}
        aria-label="Upload study material"
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-10 sm:p-14 text-center
          transition-all duration-200 outline-hidden
          focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
          ${isDragging
            ? "border-indigo-600 bg-indigo-50/50 scale-[1.01]"
            : "border-slate-300 bg-white hover:border-slate-400 hover:bg-stone-50/60 shadow-xs"
          }
          ${disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={disabled}
        />

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
            <UploadCloud size={30} strokeWidth={2} />
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">
            Drop your study material here
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            or <span className="text-indigo-600 font-medium hover:underline">click to browse</span>
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-medium">
            <FileText size={13} />
            <span>PDF, JPG, PNG or WEBP (up to 20MB)</span>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center gap-2.5 text-xs text-rose-700">
          <AlertCircle size={16} className="shrink-0 text-rose-600" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
