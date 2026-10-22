"use client";

import Image from "next/image";
import { ArrowRight, RefreshCw, FileText, CheckCircle2 } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface ImagePreviewProps {
  imageSrc: string;
  fileName: string | null;
  fileSize?: number | null;
  fileType?: string | null;
  onAnalyze: () => void;
  onReset: () => void;
  isAnalyzing?: boolean;
}

export function ImagePreview({
  imageSrc,
  fileName,
  fileSize,
  fileType,
  onAnalyze,
  onReset,
  isAnalyzing = false,
}: ImagePreviewProps) {
  const isPdf =
    fileType === "application/pdf" ||
    imageSrc.startsWith("data:application/pdf") ||
    Boolean(fileName?.toLowerCase().endsWith(".pdf"));

  const displaySize = formatFileSize(fileSize);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Uploaded Material Preview (Image or PDF) */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
          {isPdf ? (
            <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-200/70 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-3 shadow-xs">
                <FileText size={32} strokeWidth={2} />
              </div>

              <div className="max-w-md w-full px-2">
                <h3
                  className="text-base font-semibold text-slate-900 truncate mb-1.5"
                  title={fileName || "document.pdf"}
                >
                  {fileName || "Study Material.pdf"}
                </h3>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="px-2 py-0.5 rounded-md bg-rose-100/70 text-rose-700 font-medium text-[11px]">
                    PDF Document
                  </span>
                  {displaySize && (
                    <>
                      <span>&bull;</span>
                      <span className="font-mono text-slate-600">{displaySize}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-slate-200/60 text-xs text-slate-500 shadow-2xs">
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span>Document loaded and ready for analysis</span>
              </div>
            </div>
          ) : (
            <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60">
              <Image
                src={imageSrc}
                alt="Uploaded study material preview"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}

          {fileName && (
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="flex items-center gap-1.5 truncate max-w-xs font-mono">
                <FileText size={13} className="shrink-0 text-slate-400" />
                <span className="truncate">{fileName}</span>
                {displaySize && (
                  <span className="text-slate-400 font-sans">({displaySize})</span>
                )}
              </span>
              <span className="text-emerald-600 font-medium">Ready</span>
            </div>
          )}
        </div>

        {/* Right Column: Action / Status Panel */}
        <div className="md:col-span-5 flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Study material ready
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
              Ready for AI analysis
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              LearnLoop will inspect your {isPdf ? "document" : "image"} to identify the underlying topic, core principles, and key technical concepts to construct your learning path.
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white
                           rounded-xl text-base font-semibold hover:bg-indigo-700 
                           transition-all shadow-sm hover:shadow-md active:scale-98 cursor-pointer
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                <span>Analyze Material</span>
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                onClick={onReset}
                disabled={isAnalyzing}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent text-slate-600 
                           rounded-xl text-sm font-medium hover:bg-slate-100 hover:text-slate-900 
                           transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className="text-slate-400" />
                <span>{isPdf ? "Choose another file" : "Choose another image"}</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/60 bg-stone-50/80 p-4 text-xs text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700">Privacy & Focus:</span> Your material is analyzed on demand by the configured Gemma model and remains local to your active learning session.
          </div>
        </div>
      </div>
    </div>
  );
}
