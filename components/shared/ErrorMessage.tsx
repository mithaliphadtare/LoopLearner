"use client";

import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

/** Friendly, calm error banner with clear recovery action. */
export function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
}: ErrorMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3.5 p-6 sm:p-8 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-center max-w-lg mx-auto shadow-xs"
    >
      <div className="w-11 h-11 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
        <AlertCircle size={22} strokeWidth={2.25} />
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          {title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="mt-1 inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-800 
                     rounded-xl border border-slate-200 text-sm font-medium
                     hover:bg-slate-50 transition-colors shadow-xs active:scale-98 cursor-pointer"
        >
          <RefreshCw size={14} className="text-slate-500" />
          Try again
        </button>
      )}
    </motion.div>
  );
}
