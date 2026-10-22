"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain } from "lucide-react";

interface TeachingLoadingIndicatorProps {
  concept?: string;
}

export function TeachingLoadingIndicator({ concept }: TeachingLoadingIndicatorProps) {
  return (
    <div className="w-full max-w-md mx-auto py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs"
      >
        {/* Animated AI / Loop Pulse Icon */}
        <div className="relative mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
            className="w-20 h-20 rounded-full border-2 border-dashed border-indigo-200 flex items-center justify-center"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Brain size={22} className="animate-pulse" />
            </div>
          </div>
        </div>

        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-xl font-bold tracking-tight text-slate-900 mb-2"
        >
          Building your personalized explanation...
        </motion.h3>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col gap-1 text-xs sm:text-sm text-slate-500 max-w-xs"
        >
          <span>Using what you got right...</span>
          {concept && (
            <span className="font-semibold text-indigo-600 mt-1">
              Focusing on: {concept}
            </span>
          )}
        </motion.div>

        {/* Subtle Progress Bar */}
        <div className="w-44 h-1 bg-slate-100 rounded-full mt-6 overflow-hidden">
          <motion.div
            className="h-full bg-indigo-600 rounded-full"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.4,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="mt-6 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <Sparkles size={12} className="text-indigo-500" />
          <span>Adaptive micro-lesson</span>
        </div>
      </motion.div>
    </div>
  );
}
